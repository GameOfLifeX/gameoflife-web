import { type Zone, GameState } from "./gamestate";
import { PixelType } from "./gol";
import level1Url from "./levels/level1.png";
import level2Url from "./levels/level2.png";

export interface Level {
    zones: Zone[];
    initialState: /* image url */ string;
    initialPixels: number;
    lives: number;
    centerX: number;
    centerY: number;
}

async function extractAlivePixels(imgUrl: string): Promise<[number, number][]> {
    const a = new Image();
    a.src = imgUrl;
    await a.decode();
    const b = new OffscreenCanvas(a.naturalWidth, a.naturalHeight);
    const c = b.getContext("2d")!;
    c.drawImage(a, 0, 0);
    const d = c.getImageData(0,0,a.naturalWidth, a.naturalHeight);
    let ret: [number,number][] = [];
    for (let x = 0; x < d.width; x++) {
        for (let y = 0; y < d.height; y++) {
            const redIndex = y * (d.width * 4) + x * 4;
            const red = d.data[redIndex];
            const green = d.data[redIndex + 1];
            const blue = d.data[redIndex + 2];
            const alpha = d.data[redIndex + 3];

            if (red < 100 && green < 100 && blue < 100 && alpha > 100) {
                ret.push([x,y]);
            }
        }
    }
    return ret;
}

export async function loadLevel(l: Level): Promise<GameState> {
    const alivePixels = await extractAlivePixels(l.initialState);
    const s = new GameState();
    s.availablePixels = l.initialPixels;
    s.recoveryPixels = l.initialPixels;
    s.captureZones = l.zones;
    s.lives = l.lives;
    for (const [x,y] of alivePixels) {
        s.impl.setCell(x - l.centerX,y - l.centerY,PixelType.Npc);
    }
    return s;
}

export const levels: Level[] = [
    {
        centerX: 50,
        centerY: 50,
        initialPixels: 5,
        lives: 3,
        initialState: level1Url,
        zones: [{
            requiredPlayerPixels: 5,
            captureAction: a => a.win(),
            x1: 53 - 50,
            y1: 52 - 50,
            x2: 66 - 50,
            y2: 69 - 50,
        }],
    },
    {
        centerX: 50,
        centerY: 50,
        initialPixels: 5,
        lives: 3,
        initialState: level1Url,
        zones: [{
            requiredPlayerPixels: 5,
            captureAction: a => a.win(),
            x1: 53 - 50,
            y1: 52 - 50,
            x2: 66 - 50,
            y2: 69 - 50,
        }],
    },
    {
    centerX: 64,
    centerY: 64,
    initialPixels: 14,
    lives: 5,
    initialState: level2Url,
    zones: [{
        requiredPlayerPixels: 5,
        captureAction: a => a.win(),
        x1: 94 - 64,
        y1: 27 - 64,
        x2: 109 - 64,
        y2: 42 - 64,
    }],
    },
];
