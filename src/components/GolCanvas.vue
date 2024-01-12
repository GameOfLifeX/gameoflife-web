<template>
  <div>
    <div style="overflow: hidden; touch-action: none; width: 100%; height: 100%;" ref="canvasWrapperRef">
      <div style="width: 0px; height: 0px;">
        <canvas ref="canvasRef" @click="onClick" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PixelType, type GameOfLifeImplementation } from '@/lib/gol';
import { twoFingers } from '@/lib/zoom';
import { ref, watch } from 'vue';

const props = defineProps<{
    impl: GameOfLifeImplementation,
}>();

const emit = defineEmits<{
    (e: "clicked", point: { x: number, y: number }): void;
}>();

const context = ref<CanvasRenderingContext2D | null>(null);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWrapperRef = ref<HTMLDivElement | null>(null);

let transform = ref(new DOMMatrix());

const pixelTypeColors: Record<PixelType, string> = {
    [PixelType.Dead]: "#FFFFFF",
    [PixelType.Npc]: "#000000",
    [PixelType.Player]: "#FF0000",
};

function draw(ctx: CanvasRenderingContext2D): void {

    const transformValue = transform.value;
    const impl = props.impl;

    const width = ctx.canvas.width;
    const height = ctx.canvas.width;

    // Prepare the context.
    // No reset because webkit/safari doesn't properly support it.
    // ctx.reset();
    ctx.clearRect(0,0,width,height);
    ctx.save();
    ctx.save();
    ctx.fillStyle = pixelTypeColors[PixelType.Dead];
    ctx.fillRect(0,0,width,height);
    ctx.restore();

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
            const pixelType = impl.getCell(x, y);
            if (pixelType != PixelType.Dead) {
                ctx.fillStyle = pixelTypeColors[pixelType];
                ctx.fillRect(x,y,1,1);
            }
        }
    }
    ctx.restore();

    ctx.save()

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.1;

    ctx.beginPath();
    for (let x = minX; x <= maxX; x++) {
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
    }

    for (let y = minY; y <= maxY; y++) {
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
    }
    ctx.stroke();
    ctx.beginPath();

    ctx.restore();
    ctx.restore();
}

function drawNow() {
    if (context.value != null) {
        draw(context.value);
    }
}

let rafId: number | null = null;
function requestDraw() {
    if (rafId == null) {
        requestAnimationFrame(() => {
            drawNow();
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
        drawNow();
    }
});


let baseTransform = new DOMMatrix();
watch([canvasRef, canvasWrapperRef], ([canvasRef, canvasWrapperRef], _, onCleanup) => {
	if (canvasRef != null && canvasWrapperRef != null) {
        const stop = twoFingers(canvasWrapperRef, {
            onGestureEnd: () => baseTransform = transform.value,
            onGestureStart: () => baseTransform = transform.value,
            onGestureChange: (gesture) => {
                const boundingRect = canvasRef.getBoundingClientRect();
                const originX  = (gesture.origin.x - boundingRect.x) * window.devicePixelRatio;
                const originY  = (gesture.origin.y - boundingRect.y) * window.devicePixelRatio;
                console.log("originX =", originX, "originY =", originY);
                transform.value = new DOMMatrix()
                    .translate(originX, originY)
                    .translate(gesture.translation.x * window.devicePixelRatio, gesture.translation.y * window.devicePixelRatio)
                    .rotate(gesture.rotation)
                    .scale(gesture.scale)
                    .translate(-originX, -originY)
                    .multiply(baseTransform);
            },
        });

        context.value = canvasRef.getContext("2d");
		resizeObserver.observe(canvasWrapperRef);

        requestDraw();

		onCleanup(() => {
            resizeObserver.disconnect();
            stop();
        });
	} else {
        context.value = null;
    }
});

function onClick(a: MouseEvent) {
    if (canvasRef.value == null) {
        return;
    }
    const rect = canvasRef.value.getBoundingClientRect();

    const inverse = transform.value.inverse();
    const point = inverse.transformPoint(new DOMPoint(
        (a.clientX - rect.x) * window.devicePixelRatio,
        (a.clientY - rect.y) * window.devicePixelRatio,
    ));
    const gameX = Math.floor(point.x);
    const gameY = Math.floor(point.y);
    emit('clicked', {
        x: gameX,
        y: gameY
    });
}
</script>
