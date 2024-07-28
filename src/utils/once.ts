import {rc2} from "node-forge";

export class Once {
    private done = false;
    public time: number;

    public check(time: number, condition: () => boolean, target: () => void) {
        if (!this.done && condition()) {
            this.time = time;
            target();
            this.done = true;
        }
    }

    public isDone() {
        return this.done;
    }

    public after(time: number, delta: number, target: () => void) {
        if (this.done && time > this.time + delta) {
            target();
        }
    }
}