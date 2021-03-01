import {Readable} from "stream";
import {Request, Response} from "express";

export class ConvertingStream extends Readable {

    _read(size: number): void {
        //empty function
    }

    public attachHttpEvent(req: Request, res: Response) {
        req.on('close', () => {
            if (!this.destroyed) {
                this.destroy(new Error('lost connection'));
            }
        });
        let first = true;
        this.on('data', (chunk) => {
            if (first) {
                res.writeHead(200, {'Content-Type': 'text/event-stream', 'Expires': '-1'});
                first = false;
            }
            res.write('data: ' + chunk.toString() + '\n\n');
            // res.flush();
        });
        this.on('error', (e) => {
            if (first) {
                res.writeHead(500, {'Content-Type': 'text/event-stream', 'Expires': '-1'});
                first = false;
            }
            res.write('event: error\n');
            res.write('data: ' + e.message + '\n\n');
        });
        this.on('close', () => {
            res.end();
        });
    }
}