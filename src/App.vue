<script setup lang="ts">
import GolPlayer from "@/components/GolPlayer.vue";
import { PixelType, makeGolImpl } from "@/lib/gol";
import { computed, ref, watch } from "vue";
import { useAsyncState } from "@vueuse/core";
import { levels, loadLevel } from "./lib/levels";

const levelIndex = ref(+(window.localStorage.getItem("level") ?? "0"));

const currentLevel = computed(() => levels[levelIndex.value]);
const loadedLevel = useAsyncState(() => loadLevel(currentLevel.value), null, {
    shallow: false,
});
watch(currentLevel, () => loadedLevel.execute());

watch(() => loadedLevel.state.value?.isWon ?? false, (a) => {
    if (a) {
        if (levelIndex.value < levels.length){
            levelIndex.value++;
        }
    }
});

watch(levelIndex, i => window.localStorage.setItem("level", ""+i));
</script>

<template>
  <div class="main-div">
    <GolPlayer class="w-100 h-100" :impl="loadedLevel.state.value" v-if="loadedLevel.isReady && loadedLevel.state.value != null" />
    <div class="w-100 h-100">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
  <div
    class="offcanvas offcanvas-start"
    data-bs-scroll="true"
    data-bs-backdrop="false"
    tabindex="-1"
    id="global-sidebar"
    aria-labelledby="global-sidebar-label"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="global-sidebar-label">
        Noel's Game of Live
      </h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <p>Noel's Game of Life ist ein zellularer Automat, der den Regeln von Conway's Game of Life folgt, bei dem sich die Zellen auf einem Gitter über Generationen hinweg auf der Grundlage ihrer Nachbarzellen entwickeln.
         Noels Version führt jedoch zusätzliche Elemente und Mechanismen ein, um eine einzigartige Wendung zu schaffen, die die Komplexität und Dynamik dieser fesselnden Simulation erhöht.</p>
      <h2 id="spiel-inhalt">Spiel Inhalt</h2>
      <p>Regeln:</p>
      <ul>
        <li>
          <p>
            Jede Zelle mit einem oder keinem Nachbarn stirbt, als ob sie einsam
            wäre.
          </p>
        </li>
        <li>
          <p>
            Jede Zelle mit vier oder mehr Nachbarn stirbt, als ob sie
            überbevölkert wäre.
          </p>
        </li>
        <li><p>Jede Zelle mit zwei oder drei Nachbarn überlebt.</p></li>
        <li>
          <p>
            Für einen leeren oder unbewohnten Raum: Jede Zelle mit drei Nachbarn
            wird bevölkert.
          </p>
        </li>
      </ul>
      <section>
        <h2>Levels</h2>
        <ul>
          <li v-for="(level, index) in levels" :key="index" :class="index === levelIndex ? 'fw-bold' : ''">
            Level {{ index }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.main-div {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
}
</style>
