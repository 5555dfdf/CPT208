<script setup>
import { computed, inject, ref } from "vue";

const { collectibles } = inject("museum");
const activeThemeKey = ref("");

const THEME_CONFIG = [
  { key: "sculpture", label: "Sculpture Classics", icon: "S" },
  { key: "ceramics", label: "Ceramic Legacy", icon: "C" },
  { key: "bronze", label: "Bronze Civilization", icon: "B" },
  { key: "metalwork", label: "Precious Metal Craft", icon: "M" },
  { key: "ritual", label: "Ritual & Mask", icon: "R" },
  { key: "mesopotamia", label: "Mesopotamian Stories", icon: "E" },
];

const THEME_BY_ID = {
  "bronze-ding": "sculpture",
  "jade-bi": "sculpture",
  "porcelain-vase": "ceramics",
  "bronze-bull-head": "bronze",
  "silver-gilt-bowl": "metalwork",
  "gelede-helmet-mask": "ritual",
  "urn-ingirsu": "mesopotamia",
};

function getThemeKey(item) {
  return THEME_BY_ID[item.id] || "sculpture";
}

const themeProgressList = computed(() =>
  THEME_CONFIG.map((theme) => {
    const items = collectibles.value.filter((c) => getThemeKey(c) === theme.key);
    const total = items.length;
    const unlocked = items.filter((c) => c.unlocked).length;
    const pct = total ? Math.round((unlocked / total) * 100) : 0;
    return { ...theme, items, total, unlocked, pct };
  }).filter((theme) => theme.total > 0),
);

function toggleTheme(key) {
  activeThemeKey.value = activeThemeKey.value === key ? "" : key;
}
</script>

<template>
  <div class="page">
    <div class="stats-grid">
      <article v-for="theme in themeProgressList" :key="theme.key" class="stats-card">
        <button
          type="button"
          class="stats"
          :class="{ active: activeThemeKey === theme.key }"
          @click="toggleTheme(theme.key)"
        >
          <div class="stat-block">
            <span class="stat-label">{{ theme.label }}</span>
          </div>
          <div class="progress-ring" aria-hidden="true">
            <svg class="ring-svg" viewBox="0 0 40 40">
              <circle class="ring-track" cx="20" cy="20" r="15" />
              <circle
                class="ring-progress"
                cx="20"
                cy="20"
                r="15"
                :style="{ strokeDashoffset: `${94.25 * (1 - theme.pct / 100)}` }"
              />
            </svg>
          </div>
          <span class="stat-pct">{{ theme.pct }}%</span>
        </button>

        <section v-show="activeThemeKey === theme.key" class="theme-inline">
          <ul class="list">
            <li
              v-for="c in theme.items"
              :key="c.id"
              class="item"
              :class="{ locked: !c.unlocked }"
            >
              <div class="meta">
                <span class="name">{{ c.unlocked ? c.name : "Locked" }}</span>
                <span class="hall">{{ c.hallName }}</span>
                <p v-if="c.unlocked" class="snippet">{{ c.story.slice(0, 72) }}...</p>
                <p v-else class="snippet muted">Scan this artifact to unlock its story.</p>
              </div>
            </li>
          </ul>
        </section>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stats-card {
  background: var(--mq-bg-elevated);
  border-radius: var(--mq-radius);
  border: 1px solid var(--mq-border);
  overflow: hidden;
}

.stats {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.stats.active {
  border-color: rgba(185, 138, 61, 0.5);
  box-shadow: 0 0 0 1px rgba(185, 138, 61, 0.25) inset;
}

.stat-block {
  display: flex;
  flex-direction: column;
  min-width: 132px;
}

.stat-label {
  font-size: 0.95rem;
  font-family: inherit;
  font-weight: 500;
  font-style: normal;
  letter-spacing: normal;
  color: #5b5246;
  line-height: 1.4;
}

.progress-ring {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  width: 40px;
  height: 40px;
  transform: rotate(-90deg);
}

.ring-track,
.ring-progress {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
}

.ring-track {
  stroke: var(--mq-surface);
}

.ring-progress {
  stroke: var(--mq-accent);
  stroke-dasharray: 94.25;
  transition: stroke-dashoffset 0.35s ease;
}

.stat-pct {
  min-width: 38px;
  text-align: right;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--mq-text-muted);
}

.theme-inline {
  padding: 0 12px 12px;
}

.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.item {
  display: block;
  padding: 12px 2px;
  border-bottom: 1px solid var(--mq-border);
}

.item:last-child {
  border-bottom: 0;
}

.item.locked {
  opacity: 0.74;
}

.meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 620;
  font-size: 1rem;
}

.hall {
  font-size: 0.78rem;
  color: var(--mq-accent);
}

.snippet {
  font-size: 0.82rem;
  color: var(--mq-text-muted);
  line-height: 1.45;
  margin-top: 4px;
}

.snippet.muted {
  font-style: italic;
}
</style>
