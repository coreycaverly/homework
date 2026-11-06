---
title: Homework Helper
layout: default
---

<p class="hub-intro">Pick a subject. One short session beats one long one. A check means the quiz is done.</p>

<nav class="hub">
{% for group in site.data.subjects %}
  <section class="area">
    <h2 class="area-h">{{ group.emoji }} {{ group.area }}</h2>
    <ul class="subj-list">
    {% for s in group.subjects %}
      <li class="subj">
        <a class="subj-link" href="{{ s.slug | append: '/' | relative_url }}">
          <span class="subj-emoji" aria-hidden="true">{{ s.emoji }}</span>
          <span class="subj-name">{{ s.name }}</span>
        </a>
        <span class="subj-date">added {{ s.added | date: "%b&nbsp;%-d" }}</span>
        <label class="subj-check"><input type="checkbox" data-quiz="{{ s.slug }}"><span>quiz done</span></label>
      </li>
    {% endfor %}
    </ul>
  </section>
{% endfor %}
</nav>

<style>
  .hub-intro { max-width: 640px; margin: 1.25rem auto 0; color: #4a5578; }
  .hub { max-width: 640px; margin: 1.25rem auto 0; display: flex; flex-direction: column; gap: 1.75rem; }
  .hub .area { margin: 0; }
  .hub .area-h {
    margin: 0 0 .4rem; padding: 0; border: 0;
    font-size: .8rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #7a85a6;
  }
  .hub .subj-list { list-style: none; margin: 0; padding: 0; }
  .hub .subj {
    display: flex; align-items: center; flex-wrap: wrap; gap: .25rem .75rem;
    min-height: 56px; padding: .35rem .25rem; border-bottom: 1px solid rgba(20,30,60,.08);
  }
  .hub .subj-link {
    display: flex; align-items: center; gap: .6rem; flex: 1 1 auto;
    text-decoration: none; color: #16233b; font-weight: 600; font-size: 1.15rem;
    padding: .55rem .5rem; margin: -.55rem -.5rem; border-radius: 10px; min-height: 44px;
  }
  .hub .subj-link:hover { background: rgba(20,30,60,.05); }
  .hub .subj-emoji { font-size: 1.3rem; }
  .hub .subj-date { color: #8b93b0; font-size: .82rem; white-space: nowrap; }
  .hub .subj-check {
    display: inline-flex; align-items: center; gap: .35rem; cursor: pointer;
    color: #8b93b0; font-size: .82rem; white-space: nowrap; min-height: 44px; padding: 0 .25rem;
  }
  .hub .subj-check input { width: 20px; height: 20px; accent-color: #0d9488; cursor: pointer; }
  .hub .subj.is-done .subj-check { color: #0d9488; font-weight: 600; }
  .hub .subj.is-done .subj-link::after { content: "✓"; color: #0d9488; font-weight: 700; margin-left: .15rem; }
  @media (max-width: 460px) {
    .hub .subj-date { order: 3; margin-left: 2.1rem; }
    .hub .subj-check { order: 4; margin-left: auto; }
  }
</style>

{% raw %}
<script>
(function () {
  function key(s){ return 'hw-done-' + s; }
  function get(s){ try { return localStorage.getItem(key(s)); } catch (e) { return null; } }
  function set(s, v){ try { v ? localStorage.setItem(key(s), v) : localStorage.removeItem(key(s)); } catch (e) {} }
  document.querySelectorAll('.subj-check input[data-quiz]').forEach(function (box) {
    var slug = box.getAttribute('data-quiz');
    var row = box.closest('.subj');
    function paint(done){ box.checked = !!done; if (row) row.classList.toggle('is-done', !!done); }
    paint(get(slug));
    box.addEventListener('change', function () {
      var v = box.checked ? new Date().toISOString().slice(0, 10) : null;
      set(slug, v); paint(v);
    });
  });
})();
</script>
{% endraw %}
