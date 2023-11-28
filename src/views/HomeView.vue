<script setup lang="ts">
import GolCanvas from '@/components/GolCanvas.vue';
import { makeGolImpl } from '@/lib/gol';

const impl = makeGolImpl();
</script>

<template>
  <main>
    <GolCanvas style="height: 200px;" :impl="impl" />
  </main>
</template>
