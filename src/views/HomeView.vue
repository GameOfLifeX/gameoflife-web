<script setup lang="ts">
import GolCanvas from '@/components/GolCanvas.vue';
import { makeGolImpl } from '@/lib/gol';
import { onUnmounted } from 'vue';

const impl = makeGolImpl();
// Glider
/*impl.setCell(0,-1,true);
impl.setCell(-1,0,true);
impl.setCell(1,-1,true);
impl.setCell(1,0,true);
impl.setCell(1,1,true);*/
// Blinker
impl.setCell(0,-1, true);
impl.setCell(0,0 , true);
impl.setCell(0,1 , true);

const interval = setInterval(() => impl.tick(1), 500);
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <main>
    <GolCanvas style="height: 200px;" :impl="impl" />
  </main>
</template>
