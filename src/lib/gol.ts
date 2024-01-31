import { markRaw, type Ref } from "vue";
import { SimpleGolImpl } from "./simple";

export enum PixelType {
    Dead,
    Npc,
    Player,
}

export interface GameOfLifeImplementation {
    setCheckCallback(a: () => boolean): void;

	getCell(x: number, y: number): PixelType;
	setCell(x: number, y: number, value: PixelType): void;

	tick(timesteps: number): void;

	readonly minX: number;
	readonly maxX: number;
	readonly minY: number;
	readonly maxY: number;

	useUpdated(callback: (interruped: boolean) => void): void;
}

export const makeGolImpl = () => markRaw(new SimpleGolImpl());
