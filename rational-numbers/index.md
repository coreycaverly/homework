---
title: Rational Numbers
layout: default
slug: rational-numbers
---
{%- assign me = nil -%}
{%- for g in site.data.subjects -%}{%- for s in g.lessons -%}{%- if s.slug == page.slug -%}{%- assign me = s -%}{%- endif -%}{%- endfor -%}{%- endfor -%}

<p class="subj-blurb">{{ me.blurb }}</p>

<div class="launch">
  <a class="launch-btn" href="guide.html">
    <span class="launch-emoji" aria-hidden="true">📘</span>
    <span class="launch-text"><b>Study guide</b><small>Learn the rules</small></span>
  </a>
  {% if me.quiz %}<a class="launch-btn" href="quiz.html">
    <span class="launch-emoji" aria-hidden="true">🎯</span>
    <span class="launch-text"><b>Quiz</b><small data-quiz-status>Practice &amp; check</small></span>
  </a>{% endif %}
</div>

<p class="subj-meta">Added {{ me.added | date: "%B %-d, %Y" }}{% unless me.quiz %} · guide only (quiz coming){% endunless %}</p>

<style>
  .subj-blurb{max-width:560px;margin:1.25rem auto 0;color:#4a5578;font-size:1.1rem;line-height:1.5}
  .launch{max-width:560px;margin:1.5rem auto 0;display:flex;flex-wrap:wrap;gap:14px}
  .launch-btn{flex:1 1 220px;display:flex;align-items:center;gap:14px;padding:22px 20px;border-radius:16px;background:#fff;border:1px solid rgba(20,30,60,.12);box-shadow:0 1px 3px rgba(20,30,60,.06);text-decoration:none;color:#16233b;min-height:92px;transition:transform .12s,border-color .12s}
  .launch-btn:hover{transform:translateY(-2px);border-color:#0d9488}
  .launch-emoji{font-size:2rem;line-height:1}
  .launch-text{display:flex;flex-direction:column;gap:2px}
  .launch-text b{font-size:1.2rem}
  .launch-text small{color:#8b93b0;font-weight:400}
  .launch-text small.is-done{color:#0d9488;font-weight:600}
  .subj-meta{max-width:560px;margin:1.5rem auto 0;color:#8b93b0;font-size:.85rem}
</style>

<script>
(function(){
  var el=document.querySelector('[data-quiz-status]'); if(!el)return;
  try{ var done=localStorage.getItem('hw-done-{{ page.slug }}');
    if(done){el.textContent='✓ Done '+done;el.classList.add('is-done');} }catch(e){}
})();
</script>
