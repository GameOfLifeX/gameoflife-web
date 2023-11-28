import { markRaw, type Ref } from "vue";
import { SimpleGolImpl } from "./simple";

export interface GameOfLifeImplementation {
	getCell(x: number, y: number): boolean;
	setCell(x: number, y: number, value: boolean): void;

	tick(timesteps: number): void;

	readonly minX: number;
	readonly maxX: number;
	readonly minY: number;
	readonly maxY: number;

	useUpdated(callback: () => void): void;
}

export const makeGolImpl = () => markRaw(new SimpleGolImpl());
