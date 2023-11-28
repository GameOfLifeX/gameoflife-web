<template>
  <div>
    <div style="overflow: hidden; touch-action: manipulation; width: 100%; height: 100%;" ref="canvasWrapperRef">
      <div style="width: 0px; height: 0px;">
        <canvas ref="canvasRef" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { GameOfLifeImplementation } from '@/lib/gol';
import { twoFingers } from '@/lib/zoom';
import { ref, triggerRef, watch } from 'vue';

const props = defineProps<{
    impl: GameOfLifeImplementation,
}>();

const aliveColor = "#FFFFFF";
const deadColor = "#FFFFFF";

const context = ref<CanvasRenderingContext2D | null>(null);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWrapperRef = ref<HTMLDivElement | null>(null);

let transform = ref(new DOMMatrix());
let baseTransform = new DOMMatrix();

function draw(ctx: CanvasRenderingContext2D): void {

    const transformValue = transform.value;
    const impl = props.impl;

    const width = ctx.canvas.width;
    const height = ctx.canvas.width;

    // Prepare the context.
    ctx.reset();
    ctx.clearRect(0,0,width,height);

    const inverse = transformValue.inverse();
    const cornerPoint1 = inverse.transformPoint(new DOMPoint(0, 0));
    const cornerPoint2 = inverse.transformPoint(new DOMPoint(0, height));
    const cornerPoint3 = inverse.transformPoint(new DOMPoint(width, 0));
    const cornerPoint4 = inverse.transformPoint(new DOMPoint(width, height));

    // The drawn bounding box in the game space (integer).
    const minX = Math.floor(Math.min(cornerPoint1.x, cornerPoint2.x, cornerPoint3.x, cornerPoint4.x));
    const maxX = Math.ceil (Math.max(cornerPoint1.x, cornerPoint2.x, cornerPoint3.x, cornerPoint4.x));
    const minY = Math.floor(Math.min(cornerPoint1.y, cornerPoint2.y, cornerPoint3.y, cornerPoint4.y));
    const maxY = Math.ceil (Math.max(cornerPoint1.y, cornerPoint2.y, cornerPoint3.y, cornerPoint4.y));

    const filledMinX = Math.max(impl.minX, minX);
    const filledMinY = Math.max(impl.minY, minY);
    const filledMaxX = Math.min(impl.maxX, maxX);
    const filledMaxY = Math.min(impl.maxY, maxY);

    ctx.transform(transformValue.a,transformValue.b,transformValue.c,transformValue.d,transformValue.e,transformValue.f);

    ctx.save();
    for (let x = filledMinX; x <= filledMaxX; x++) {
        for (let y = filledMinY; y <= filledMaxY; y++) {
            ctx.fillStyle = impl.getCell(x,y) ? aliveColor : deadColor;

            ctx.fillRect(x,y,1,1);
        }
    }
    ctx.restore();

    ctx.save()

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.1;

    for (let x = minX; x <= maxX; x++) {
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
    }

    for (let y = minY; y <= maxY; y++) {
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
    }
    ctx.stroke();

    ctx.restore()
}

let rafId: number | null = null;
function requestDraw() {
    if (rafId == null) {
        requestAnimationFrame(() => {
            if (context.value != null) {
                draw(context.value);
            }
            rafId = null;
        });

    }

    draw
}

watch([transform], () => requestDraw());

props.impl.useUpdated(() => requestDraw());



let resizeObserver = new ResizeObserver(() => {
    if (canvasRef.value != null && canvasWrapperRef.value != null) {
        const a = canvasWrapperRef.value.getBoundingClientRect();
        const scaledWidth = Math.ceil(a.width * window.devicePixelRatio);
        const scaledHeight = Math.ceil(a.height * window.devicePixelRatio);
        canvasRef.value.width = scaledWidth;
        canvasRef.value.height = scaledHeight;
        canvasRef.value.style.width = (scaledWidth / window.devicePixelRatio).toString() + "px";
        canvasRef.value.style.height = (scaledHeight / window.devicePixelRatio).toString() + "px";
    }
});


watch([canvasRef, canvasWrapperRef], ([canvasRef, canvasWrapperRef], _, onCleanup) => {
	if (canvasRef != null && canvasWrapperRef != null) {
        const stop = twoFingers(canvasWrapperRef, {
            onGestureEnd: () => baseTransform = transform.value,
            onGestureStart: () => baseTransform = transform.value,
            onGestureChange: (gesture) => {
                transform.value = baseTransform
                    .translate(-gesture.origin.x, -gesture.origin.y)
                    .scale(gesture.scale)
                    .rotate(gesture.rotation)
                    .translate(gesture.translation.x, gesture.translation.y)
                    .translate(gesture.origin.x, gesture.origin.y);
            },
        });

        context.value = canvasRef.getContext("2d");
		resizeObserver.observe(canvasWrapperRef);

		onCleanup(() => {
            resizeObserver.disconnect();
            stop();
        });
	} else {
        context.value = null;
    }
});
</script>
