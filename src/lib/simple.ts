import { onUnmounted } from "vue";
import type { GameOfLifeImplementation } from "./gol";

export class SimpleGolImpl implements GameOfLifeImplementation {
	private _minX: number = 0;
	private _maxX: number = 0;
	private _minY: number = 0;
	private _maxY: number = 0;
	private field: Map<bigint, boolean> = new Map();
	private updatedCallbacks: Set<() => void> = new Set();
	public constructor() {
	}
	private mapCoordinate(x: number, y: number): bigint {
		return (BigInt((x | 0) >>> 0) << 32n) | BigInt((y | 0) >>> 0)
	}
	private getX(a: bigint): number {
		return Number(a >> 32n) | 0;
	}
	private getY(a: bigint): number {
		return Number(a & ((1n << 32n) - 1n)) | 0;
	}
	getCell(x: number, y: number): boolean {
		return this.field.get(this.mapCoordinate(x,y)) ?? false;
	}
	setCell(x: number, y: number, value: boolean, insideTick?: boolean): void {
		if (value) {
			this._minX = Math.min(x, this._minX);
			this._maxX = Math.max(x, this._maxX);
			this._minY = Math.min(y, this._minY);
			this._maxY = Math.max(y, this._maxY);
			this.field.set(this.mapCoordinate(x,y), true);
		} else {
			if (x > this._minX
				&& x < this._maxX
				&& y > this._minY
				&& y < this._maxY) {
				// No min/max update.
			} else {
				if (this._minX !== this._maxX && this._minY !== this._maxX) {
					if (x === this._minX
					|| x === this._maxX) {
						let hasAny = false;
						for (let checkY = this._minY; checkY <= this._maxY; checkY++) {
							hasAny ||= checkY !== y && this.getCell(x, checkY);
						}
						if (!hasAny) {
							if (x === this._minX) {
								this._minX++;
							} else {
								this._maxX--;
							}
						}
					}

					if (y === this._minY
					|| y === this._maxY) {
						let hasAny = false;
						for (let checkX = this._minX; checkX <= this._maxX; checkX++) {
							hasAny ||= checkX !== x && this.getCell(checkX, y);
						}
						if (!hasAny) {
							if (y === this._minY) {
								this._minY++;
							} else {
								this._maxY--;
							}
						}
					}
				}
			}
			this.field.delete(this.mapCoordinate(x,y));
		}
        console.log("minX =", this._minX, "maxX =", this._maxX, "minY =", this._minY, "maxY =", this._maxY);
        console.log("x =", x, "y =", y, "value =", value);

		if (insideTick === true) {
			this.hasUpdated();
		}
	}
	tick(timesteps: number): void {
        const start = performance.now();
		for (let i = 0; i < timesteps; i++) {
			let delayed: (() => void)[] = [];
			for (let x = this._minX - 1; x <= (this._maxX + 1); x++) {
				for (let y = this._minY - 1; y <= (this._maxY + 1); y++) {
					let liveNeighbors = 0;
					for (let xOffset = -1; xOffset <= 1; xOffset++) {
						for (let yOffset = -1; yOffset <= 1; yOffset++) {
							if (xOffset === 0 && yOffset === 0) {
								continue;
							}

							if (this.getCell(x + xOffset, y + yOffset)) {
								liveNeighbors++;
							}
						}
					}

                    const isAlive = this.getCell(x, y);

                    console.log("x =", x, "y =", y, "isAlive =", isAlive, "liveNeighbors =", liveNeighbors);


                    const xCopy = x;
                    const yCopy = y;
					if (isAlive) {
						if (liveNeighbors < 2
							|| liveNeighbors > 3) {
                            console.log("Scheduling killing cell. xCopy =", xCopy, "yCopy =", yCopy);
							delayed.push(() => this.setCell(xCopy,yCopy,false));
						}
					} else{
						if (liveNeighbors === 3) {
                            console.log("Scheduling resurrecting cell. xCopy =", xCopy, "yCopy =", yCopy);
							delayed.push(() => this.setCell(xCopy,yCopy,true));
						}
					}
				}
			}
			for (const i of delayed) {
				i();
			}
		}
        const end = performance.now();
        const diff = end - start;
        console.log(`tick performance = ${diff}`);


		this.hasUpdated();
	}
	public get minX() {
		return this._minX;
	}
	public get maxX() {
		return this._maxX;
	}
	public get minY() {
		return this._minY;
	}
	public get maxY() {
		return this._maxY;
	}
	public useUpdated(callback: () => void) {
		this.updatedCallbacks.add(callback);
		onUnmounted(() => this.updatedCallbacks.delete(callback));
	}

	private hasUpdated() {
		for (const callback of this.updatedCallbacks) {
			callback();
		}
	}
}
