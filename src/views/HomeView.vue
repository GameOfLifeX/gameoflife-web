<script setup lang="ts">
import GolPlayer from '@/components/GolPlayer.vue';
import { makeGolImpl } from '@/lib/gol';

const impl = makeGolImpl();
// Glider
/*impl.setCell(0,-1,true);
impl.setCell(-1,0,true);
impl.setCell(1,-1,true);
impl.setCell(1,0,true);
impl.setCell(1,1,true);*/
// Blinker
impl.setCell(0,-1, true);
impl.setCell(0, 0, true);
impl.setCell(0, 1, true);
</script>

<template>
  <main>
    <GolPlayer style="height: 200px;" :impl="impl" />
  </main>
</template>
