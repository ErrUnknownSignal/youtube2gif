import {QueueController} from "../QueueController";
import {QueueWorkerService} from "./QueueWorkerService";


//TODO implement this
export class QueueWorkerControlCommand implements QueueController {

    constructor(private readonly worker: QueueWorkerService) {
    }

    pause(): void {
        this.worker.destroyConsumer();
    }

    resume(): void {
        this.worker.setConsumer().catch(e => {
            throw e;
        });
    }
}