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
                res.writeHead(200, {'Content-Type': 'text/plain'});
                first = false;
            }
            res.write(chunk.toString());
            // res.flush();
        });
        this.on('error', (e) => {
            if (first) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                first = false;
            }
            res.write(e.message);
        });
        this.on('close', () => {
            res.end();
        });
    }
}