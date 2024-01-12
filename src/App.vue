<script setup lang="ts">
import GolPlayer from '@/components/GolPlayer.vue';
import { PixelType, makeGolImpl } from '@/lib/gol';

const impl = makeGolImpl();
// Glider
/*impl.setCell(0,-1,true);
impl.setCell(-1,0,true);
impl.setCell(1,-1,true);
impl.setCell(1,0,true);
impl.setCell(1,1,true);*/
// Blinker
impl.setCell(0,-1, PixelType.Npc);
impl.setCell(0, 0, PixelType.Npc);
impl.setCell(0, 1, PixelType.Npc);
</script>

<template>
  <div class="main-div">
    <GolPlayer class="w-100 h-100" :impl="impl" />
  </div>
  <div class="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="global-sidebar" aria-labelledby="global-sidebar-label">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="global-sidebar-label">Offcanvas with body scrolling</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <p>Try scrolling the rest of the page to see this option in action.</p>
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
