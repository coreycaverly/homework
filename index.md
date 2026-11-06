---
title: Homework Helper
layout: default
---

<p class="hub-intro">Pick an area.</p>

<nav class="areas">
{% for g in site.data.subjects %}
  {%- assign n = g.subjects | size -%}
  {%- if n > 1 -%}{%- assign href = g.slug | append: '/' -%}{%- else -%}{%- assign href = g.subjects[0].slug | append: '/' -%}{%- endif -%}
  <a class="area-btn" href="{{ href | relative_url }}">
    <span class="area-emoji" aria-hidden="true">{{ g.emoji }}</span>
    <span class="area-name">{{ g.area }}</span>
    <span class="area-count">{{ n }} subject{% if n > 1 %}s{% endif %}</span>
  </a>
{% endfor %}
</nav>

<style>
  .hub-intro { max-width: 560px; margin: 1.25rem auto 0; color: #4a5578; }
  .areas { max-width: 560px; margin: 1.25rem auto 0; display: flex; flex-direction: column; gap: 12px; }
  .area-btn {
    display: flex; align-items: center; gap: 16px; min-height: 76px; padding: 20px 22px;
    border-radius: 16px; background: #fff; border: 1px solid rgba(20,30,60,.12);
    box-shadow: 0 1px 3px rgba(20,30,60,.06); text-decoration: none; color: #16233b;
    transition: transform .12s, border-color .12s;
  }
  .area-btn:hover { transform: translateY(-2px); border-color: #0d9488; }
  .area-emoji { font-size: 1.9rem; line-height: 1; }
  .area-name { font-size: 1.35rem; font-weight: 700; flex: 1; }
  .area-count { color: #8b93b0; font-size: .85rem; white-space: nowrap; }
</style>
