---
title: Math
layout: default
area: math
---
{%- assign me = nil -%}
{%- for g in site.data.subjects -%}{%- if g.slug == page.area -%}{%- assign me = g -%}{%- endif -%}{%- endfor -%}

<p class="hub-intro">Pick a lesson. A check means the quiz is done.</p>

<nav class="hub">
  <ul class="subj-list">
  {% for s in me.lessons %}
    <li class="subj"{% if s.locked %} data-locked{% endif %}>
      <a class="subj-link" href="{{ s.slug | append: '/' | relative_url }}">
        <span class="subj-emoji" aria-hidden="true">{{ s.emoji }}</span>
        <span class="subj-name">{{ s.name }}{% if s.locked %} <span class="lock-badge">🔒 parents</span>{% endif %}</span>
      </a>
      <span class="subj-date">added {{ s.added | date: "%b&nbsp;%-d" }}</span>
      {% if s.quiz %}<label class="subj-check"><input type="checkbox" data-quiz="{{ s.slug }}"><span>quiz done</span></label>{% else %}<span class="subj-check guide-only">guide</span>{% endif %}
    </li>
  {% endfor %}
  </ul>
</nav>

<style>
  .hub-intro { max-width: 560px; margin: 1.25rem auto 0; color: #4a5578; }
  .hub { max-width: 560px; margin: 1.25rem auto 0; }
  .hub .subj-list { list-style: none; margin: 0; padding: 0; }
  .hub .subj { display: flex; align-items: center; flex-wrap: wrap; gap: .25rem .75rem; min-height: 56px; padding: .35rem .25rem; border-bottom: 1px solid rgba(20,30,60,.08); }
  .hub .subj-link { display: flex; align-items: center; gap: .6rem; flex: 1 1 10rem; min-width: 0; text-decoration: none; color: #16233b; font-weight: 600; font-size: 1.1rem; line-height: 1.25; padding: .55rem .5rem; margin: -.55rem -.5rem; border-radius: 10px; min-height: 44px; }
  .hub .subj-name { overflow-wrap: anywhere; }
  .hub .subj-link:hover { background: rgba(20,30,60,.05); }
  .hub .subj-emoji { font-size: 1.3rem; }
  .hub .subj-date { color: #8b93b0; font-size: .82rem; white-space: nowrap; }
  .hub .subj-check { display: inline-flex; align-items: center; gap: .35rem; cursor: pointer; color: #8b93b0; font-size: .82rem; white-space: nowrap; min-height: 44px; padding: 0 .25rem; }
  .hub .subj-check.guide-only { cursor: default; opacity: .6; }
  .hub .subj-check input { width: 20px; height: 20px; accent-color: #0d9488; cursor: pointer; }
  .hub .subj.is-done .subj-check { color: #0d9488; font-weight: 600; }
  .hub .subj.is-done .subj-link::after { content: "✓"; color: #0d9488; font-weight: 700; margin-left: .15rem; }
  @media (max-width: 460px) { .hub .subj-date { order: 3; margin-left: 2.1rem; } .hub .subj-check { order: 4; margin-left: auto; } }
</style>

{% raw %}
<script>
(function () {
  function key(s){ return 'hw-done-' + s; }
  function get(s){ try { return localStorage.getItem(key(s)); } catch (e) { return null; } }
  function set(s, v){ try { v ? localStorage.setItem(key(s), v) : localStorage.removeItem(key(s)); } catch (e) {} }
  document.querySelectorAll('.subj-check input[data-quiz]').forEach(function (box) {
    var slug = box.getAttribute('data-quiz'); var row = box.closest('.subj');
    function paint(done){ box.checked = !!done; if (row) row.classList.toggle('is-done', !!done); }
    paint(get(slug));
    box.addEventListener('change', function () { var v = box.checked ? new Date().toISOString().slice(0,10) : null; set(slug, v); paint(v); });
  });
})();
</script>
{% endraw %}
