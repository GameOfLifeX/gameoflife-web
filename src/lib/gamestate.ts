import { reactive } from "vue";
import { type GameOfLifeImplementation, PixelType, makeGolImpl } from "./gol";

export interface Zone {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    requiredPlayerPixels: number;
    captureAction: (state: GameState) => void;
}

export class GameState {
    public isWon: boolean = false;
    public lives: number = 0;
    public availablePixels: number = 0;
    public recoveryPixels: number = 0;
    public impl: GameOfLifeImplementation = makeGolImpl();
    public captureZones: Zone[] = [];

    public constructor() {
        const r = reactive(this);

        const impl = r.impl;

        impl.setCheckCallback(() => {
            const capturedZones: Zone[] = [];
            for (const zone of r.captureZones) {
                let numPlayerPixels = 0;
                for (let x = zone.x1; x <= zone.x2; x++) {
                    for (let y = zone.y1; y <= zone.y2; y++) {
                        if (impl.getCell(x,y) === PixelType.Player) {
                            console.log("Found player pixel in zone", zone, x, y);
                            numPlayerPixels++;
                        }
                    }
                }
                if (numPlayerPixels >= zone.requiredPlayerPixels) {
                    console.log("Caputed zone", zone);
                    capturedZones.push(zone);
                }
            }
            for (const zone of capturedZones) {
                zone.captureAction(r);
            }

            if (capturedZones.length > 0) {
                return true;
            }

            let anyPlayer = false;
            for (let x = impl.minX; x <= impl.maxX; x++) {
                for (let y = impl.minY; y <= impl.maxY; y++) {
                    if (impl.getCell(x,y) === PixelType.Player) {
                        anyPlayer = true;
                    }
                }
            }

            if (!anyPlayer && r.availablePixels <= 0) {
                r.lives--;
                r.availablePixels = r.recoveryPixels;
                return true;
            }

            return false;
        });
    }

    public placePixel(x: number, y: number): boolean {
        if (this.availablePixels <= 0 || this.gameover) {
            return false;
        }
        this.availablePixels--;
        const currState = this.impl.getCell(x,y);
        if (currState == PixelType.Dead) {
            this.impl.setCell(x,y,PixelType.Player);
        } else {
            this.impl.setCell(x,y,PixelType.Dead);
        }
        return true;
    }

    public get gameover() {
        return this.lives <= 0 || this.isWon;
    }

    public win(): void {
        this.isWon = true;
    }
}
