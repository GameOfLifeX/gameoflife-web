<template>
  <div class="overlap-grid">
    <GolCanvas :impl="impl" @clicked="clicked" style="" />
    <div style="display: flex; flex-direction: row; gap: 1rem; justify-self: start; align-self: start;">
      <button @click="slowDown">
        Slow Down
      </button>
      <button @click="pausePlay">
        Pause / Play
      </button>
      <button @click="speedUp">
        Speed Up
      </button>
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
import type { GameOfLifeImplementation } from "@/lib/gol";
import GolCanvas from "./GolCanvas.vue";
import { computed, ref, watch } from "vue";

const props = defineProps<{
    impl: GameOfLifeImplementation,
}>();

function clicked(point: { x: number, y: number }) {
    props.impl.setCell(point.x, point.y, !props.impl.getCell(point.x, point.y));
}

const maxUpdateFrequency = 20;
// ticksPerSecond.
const speed = ref(1);
const paused = ref(false);

const actualSpeed = computed(() => paused.value ? 0 : speed.value);

watch(actualSpeed, (speed, _, onCleanup) => {
    if (speed <= 0) {
        return;
    }

    const gameOfLifeTicksPerVisibleTick = Math.max(Math.floor(speed / maxUpdateFrequency), 1);

    const interval = 1 / (speed / gameOfLifeTicksPerVisibleTick);

    console.log("interval =", interval, "gameOfLifeTicksPerVisibleTick =", gameOfLifeTicksPerVisibleTick, "speed =", speed);

    const token = setInterval(() => {
        props.impl.tick(gameOfLifeTicksPerVisibleTick);
    }, interval * 1000);

    onCleanup(() => clearInterval(token));
}, {
    immediate: true,
});

function slowDown() {
    speed.value = speed.value / 2;
}

function pausePlay() {
    paused.value = !paused.value;
}

function speedUp() {
    speed.value = speed.value * 2;
}





</script>
