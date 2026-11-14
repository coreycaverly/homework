# Writing-feedback worker (runs on Dune)

Gives the learner coaching on his writing using a **local Ollama model**. It never
exposes anything: the site writes a request into Firestore, this worker (running on
Dune) picks it up, runs the model on `localhost`, and writes the coaching back. The
browser only ever talks to Firestore over HTTPS.

```
site → Firestore  feedbackRequests/{id}  (status: pending)
                        ↑ worker watches, claims, runs Ollama, writes response
site ← Firestore  feedbackRequests/{id}  (status: done, response: "...")
```

## One-time setup on Dune

1. **Node 18+** and **Ollama** running (it already is).
2. **Service-account key:** Firebase console → Project settings → **Service accounts**
   → **Generate new private key**. Save the JSON here as `service-account.json`
   (it's gitignored — never commit it). It grants full DB access, so keep it private.
3. Install deps:
   ```sh
   cd tools/feedback-worker
   npm install
   ```
4. (Optional) copy `.env.example` → `.env` and tweak the model, or just use defaults.

## Run it

```sh
# defaults: model qwen3.6:35b-mlx, ollama http://127.0.0.1:11434
node worker.js

# or pick a model inline:
OLLAMA_MODEL=qwen2.5:32b node worker.js
```

You'll see `watching feedbackRequests …`. When the learner clicks **Get feedback** on
the site, a line prints and the coaching appears back on his screen in a few seconds.

## Keep it running (launchd)

Since Dune is always on, run the worker under **launchd** so it restarts on boot/crash.
Create `~/Library/LaunchAgents/net.caverly.feedback-worker.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>net.caverly.feedback-worker</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string><string>node</string>
    <string>/Users/corey/repos/homework/tools/feedback-worker/worker.js</string>
  </array>
  <key>WorkingDirectory</key><string>/Users/corey/repos/homework/tools/feedback-worker</string>
  <key>EnvironmentVariables</key>
  <dict><key>OLLAMA_MODEL</key><string>qwen3.6:35b-mlx</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/feedback-worker.log</string>
  <key>StandardErrorPath</key><string>/tmp/feedback-worker.err</string>
</dict></plist>
```

```sh
launchctl load ~/Library/LaunchAgents/net.caverly.feedback-worker.plist
```

(Adjust the node path if you use nvm: `which node` and hardcode it in ProgramArguments.)

## Notes
- **Model:** set `OLLAMA_MODEL`. 35b-mlx is best quality but slower; `qwen3:4b-instruct`
  is snappy if you want faster feedback.
- **Security:** the worker makes only outbound connections. The service-account key is
  the one secret — it stays on Dune. Firestore rules stop students from reading each
  other's requests or forging responses.
- **Privacy:** the site deletes each request after the learner reads the coaching, so
  his writing doesn't pile up in Firestore. Optionally add a Firestore TTL policy on an
  `expiresAt` field for belt-and-suspenders cleanup.
- **If Dune/Ollama is down:** requests just sit as `pending` and the site shows a
  "coach is offline, try later" message after a timeout. Nothing breaks.
