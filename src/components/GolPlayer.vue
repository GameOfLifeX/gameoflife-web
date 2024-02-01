<template>
  <div class="overlap-grid">
    <img src="../assets/Background.jpg" class="w-100 h-100"/>
    <GolCanvas :impl="impl.impl" @clicked="clicked" :highlightedZones="highlightedZones" />
    <div style="display: flex; flex-direction: row; gap: 1rem; justify-self: start; align-self: start;" class="p-2">
      <button class="btn btn-secondary" type="button" data-bs-target="#global-sidebar" aria-controls="global-sidebar" data-bs-toggle="offcanvas">
        <i class="bi bi-list"></i>
      </button>
      <button class="btn btn-secondary" @click="slowDown">
        Slow Down
      </button>
      <button class="btn btn-secondary" @click="pausePlay" :disabled="props.impl.gameover">
        Pause / Play
      </button>
      <button class="btn btn-secondary" @click="speedUp">
        Speed Up
      </button>
      <div>Lives: {{ props.impl.lives }}</div>
      <div>Pixels: {{ props.impl.availablePixels }}</div>


      <!--<button class="btn btn-secondary" @click="placeNpc">
        Place Npc
      </button>
      <button class="btn btn-secondary" @click="placePlayer">
        Place Player
      </button>-->
    </div>
  </div>
</template>
<style>
 .overlap-grid {
     display: grid;
     grid-template-columns: 1fr;
     grid-template-rows: 1fr;
 }
 .overlap-grid > * {
     grid-area: 1 / 1;
 }
</style>
<script setup lang="ts">
import { PixelType, type GameOfLifeImplementation } from "@/lib/gol";
import GolCanvas from "./GolCanvas.vue";
import { GameState } from "@/lib/gamestate";
import { computed, ref, watch } from "vue";

const props = defineProps<{
    impl: GameState,
}>();

const currentPixelType = ref(PixelType.Player);

function clicked(point: { x: number, y: number }) {
    props.impl.placePixel(point.x,point.y);
}

function placeNpc() {
    currentPixelType.value = PixelType.Npc;
}

function placePlayer() {
    currentPixelType.value = PixelType.Player;
}

const maxUpdateFrequency = 20;
// ticksPerSecond.
const speed = ref(1);
const paused = ref(false);

const actualSpeed = computed(() => props.impl.gameover || paused.value ? 0 : speed.value);

watch(actualSpeed, (speed, _, onCleanup) => {
    if (speed <= 0) {
        return;
    }

    const gameOfLifeTicksPerVisibleTick = Math.max(Math.floor(speed / maxUpdateFrequency), 1);

    const interval = 1 / (speed / gameOfLifeTicksPerVisibleTick);

    console.log("interval =", interval, "gameOfLifeTicksPerVisibleTick =", gameOfLifeTicksPerVisibleTick, "speed =", speed);

    const token = setInterval(() => {
        props.impl.impl.tick(gameOfLifeTicksPerVisibleTick);
    }, interval * 1000);

    onCleanup(() => clearInterval(token));
}, {
    immediate: true,
});

function slowDown() {
    speed.value = speed.value / 2;
}

function pausePlay() {
    if (!props.impl.gameover) {
        paused.value = !paused.value;
    }
}

function speedUp() {
    speed.value = speed.value * 2;
}

props.impl.impl.useUpdated(a => {
    paused.value ||= a;
});

const highlightedZones = computed(() => {
    return props.impl.captureZones.map(zone => ({
        x1: zone.x1,
        y1: zone.y1,
        x2: zone.x2,
        y2: zone.y2,
        color: "#ff0000",
    }));
});




</script>
