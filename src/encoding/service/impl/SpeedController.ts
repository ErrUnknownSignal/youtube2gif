import {QueueController} from "../QueueController";

//TODO attach queue system
export class SpeedController {
    private interval: any;
    private readonly controllers: QueueController[] = [];

    constructor(private readonly measure: () => Promise<number>,
                private readonly safe = 70,
                private readonly redZone = 90,
                private readonly throttle = 3000) {
        this.setInterval();
    }

    private setInterval() {
        let lastDownTime = 0;
        let running = true;
        this.interval = setInterval(async () => {
            const load = await this.measure();
            if (load > this.redZone) {
                running = false;
                lastDownTime = Date.now();
                for (const c of this.controllers) {
                    c.pause();
                }

            } else if (load <= this.safe && !running && Date.now() - lastDownTime> this.throttle) {
                running = true;
                for (const c of this.controllers) {
                    c.resume();
                }
            }
        }, 1000);
    }

    public addController(c: QueueController) {
        if (this.controllers.indexOf(c) !== -1) {
            throw new Error('duplicate controller');
        }
        this.controllers.push(c);
    }

    public removeController(c: QueueController) {
        const idx = this.controllers.indexOf(c);
        if (idx !== -1) {
            this.controllers.splice(idx, 1);
        }
    }

    public destroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}