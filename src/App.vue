<script setup lang="ts">
import GolPlayer from "@/components/GolPlayer.vue";
import { PixelType, makeGolImpl } from "@/lib/gol";
import { computed, ref, watch } from "vue";
import { useAsyncState } from "@vueuse/core";
import { levels, loadLevel } from "./lib/levels";
import { Modal } from "bootstrap";

const levelIndex = ref(+(window.localStorage.getItem("level") ?? "0"));

const currentLevel = computed(() => levels[levelIndex.value]);
const loadedLevel = useAsyncState(() => loadLevel(currentLevel.value), null, {
    shallow: false,
});
watch(currentLevel, () => loadedLevel.execute());

const isLastLevel = computed(() => levelIndex.value >= (levels.length - 1));

watch(() => loadedLevel.state.value?.isWon ?? false, (a) => {
    if (a) {
        Modal.getOrCreateInstance(modalElement.value!).show();
    }
});

watch(levelIndex, i => window.localStorage.setItem("level", ""+i));

const modalElement = ref<HTMLElement | null>(null);

function goToNext() {
    levelIndex.value = (levelIndex.value + 1) % levels.length;
}

function reset() {
    loadedLevel.execute();
}
</script>

<template>
  <div class="main-div">
    <GolPlayer class="w-100 h-100" :impl="loadedLevel.state.value" v-if="loadedLevel.isReady && loadedLevel.state.value != null" @reset="reset" />
    <div class="w-100 h-100">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" ref="modalElement" >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Victory!!!!</h1>
        </div>
        <div class="modal-body">
          <template v-if="isLastLevel">
            You have won the game.
          </template>
          <template v-else>
            You have won this level.
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="goToNext">
            <template v-if="isLastLevel">
              Restart the game at the first level
            </template>
            <template v-else>
              Go to the next level
            </template>
          </button>
        </div>
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
            Level {{ index + 1 }}
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
