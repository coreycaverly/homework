#!/usr/bin/env node
/*
 * Homework Helper — writing-feedback worker (runs on "Dune").
 *
 * Watches Firestore for pending feedback requests, runs a local Ollama model,
 * and writes the coaching back. Nothing inbound is exposed: this process only
 * makes OUTBOUND connections to Firestore and to Ollama on localhost.
 *
 * Setup: see README.md. Needs Node 18+ (for global fetch), firebase-admin, a
 * service-account key, and Ollama running locally.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// ---- config (env with sensible defaults) ----
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, "service-account.json");
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_MODEL || "qwen3.6:35b-mlx";
const GEN_TIMEOUT_MS = Number(process.env.GEN_TIMEOUT_MS || 180000);
const MAX_INPUT = Number(process.env.MAX_INPUT_CHARS || 4000);

if (!fs.existsSync(KEY_PATH)) {
  console.error(`[worker] service account key not found at ${KEY_PATH}`);
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS or place service-account.json here.");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(KEY_PATH)) });
const db = admin.firestore();
const COL = db.collection("feedbackRequests");

// ---- coaching prompts (kid-appropriate; coach, don't rewrite) ----
const COACH_RULES =
  "You are a warm, encouraging writing coach for an 11-year-old student. " +
  "Coach — do NOT rewrite their work for them and do NOT hand them a finished version. " +
  "Point things out and show them WHERE, so they can fix it themselves. " +
  "Use simple words a 6th grader understands. Keep it under 170 words. " +
  "Format: start with ONE specific thing they did well, then 2 to 4 short, friendly, " +
  "specific suggestions as a dash list, then ONE encouraging closing sentence. " +
  "ALWAYS include at least one grammar/mechanics fix when you spot one — a missing " +
  "capital letter at the start of a sentence, a missing period or comma, a run-on, or a " +
  "mixed-up word like there/their/to/too — and quote the exact spot in \"quotes\" so they " +
  "can find it. Do not list every tiny error; pick the one or two that matter most. " +
  "Never be harsh; never say 'wrong'.";

function buildPrompt(kind, input) {
  let focus;
  if (kind === "paraphrase") {
    focus =
      "The student is practicing PARAPHRASING (putting a text in their own words). " +
      "Focus your suggestions on: using more of their own words / synonyms instead of copying key words; " +
      "changing the ORDER of the ideas (not the original with a few words swapped); keeping the same meaning; " +
      "and writing complete sentences (no fragments or run-ons).";
  } else {
    focus =
      "The student is writing a PARAGRAPH (topic sentence, 3 pieces of evidence, conclusion). " +
      "Focus your suggestions on: ELABORATION — after each piece of evidence, explaining the 'so what / why it matters'; " +
      "adding TRANSITIONS between points (First, Next, Finally, In conclusion); restating the question in the topic sentence; " +
      "and complete sentences.";
  }
  return `${COACH_RULES}\n\n${focus}\n\nHere is what the student wrote:\n"""\n${input}\n"""\n\nYour feedback:`;
}

// ---- Ollama call ----
async function runModel(prompt) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), GEN_TIMEOUT_MS);
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, stream: false }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const out = (data.response || "").trim();
    if (!out) throw new Error("Ollama returned an empty response");
    return out;
  } finally {
    clearTimeout(t);
  }
}

// ---- claim + process one request (sequential queue) ----
let busy = Promise.resolve();
const seen = new Set();

function enqueue(doc) {
  if (seen.has(doc.id)) return;
  seen.add(doc.id);
  busy = busy.then(() => handleRequest(doc.ref)).catch((e) => console.error("[worker]", e));
}

async function handleRequest(ref) {
  // Claim atomically: only proceed if still pending.
  const claimed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const d = snap.data();
    if (d.status !== "pending") return null;
    tx.update(ref, { status: "processing", startedAt: admin.firestore.FieldValue.serverTimestamp() });
    return d;
  });
  if (!claimed) return;

  const id = ref.id;
  try {
    const input = String(claimed.input || "").slice(0, MAX_INPUT).trim();
    if (!input) throw new Error("empty input");
    console.log(`[worker] ${id} (${claimed.kind || "paragraph"}) → ${MODEL}`);
    const started = Date.now();
    const response = await runModel(buildPrompt(claimed.kind, input));
    console.log(`[worker] ${id} done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    await ref.update({
      status: "done",
      response,
      model: MODEL,
      finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error(`[worker] ${id} error:`, e.message);
    await ref.update({
      status: "error",
      error: "The coach couldn't finish this one. Try again.",
      finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(() => {});
  } finally {
    seen.delete(id);
  }
}

// ---- watch for pending requests ----
console.log(`[worker] watching feedbackRequests · model=${MODEL} · ollama=${OLLAMA_URL}`);
COL.where("status", "==", "pending").onSnapshot(
  (snap) => {
    snap.docChanges().forEach((c) => {
      if (c.type === "added" || c.type === "modified") enqueue(c.doc);
    });
  },
  (err) => console.error("[worker] snapshot error:", err.message)
);

process.on("SIGINT", () => { console.log("\n[worker] bye"); process.exit(0); });
