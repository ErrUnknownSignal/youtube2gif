import {Injectable, Logger} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {DOWNLOAD_PATH} from "../../main";
import * as fs from "fs";
import {join} from 'path';
import {ConvertHistoryService} from "../service/impl/ConvertHistoryService";


@Injectable()
export class GarbageCollect {

    private readonly logger = new Logger(GarbageCollect.name);

    constructor(private convertHistoryService: ConvertHistoryService) {
    }

    @Cron('0 */10 * * * *')
    async clearOldImg(): Promise<void> {
        this.logger.debug('gc img ' + new Date());
        //TODO transaction
        const date = Date.now() - 30 * 60 * 1000;
        const dirents = await fs.promises.readdir(DOWNLOAD_PATH, {withFileTypes: true});
        if (!dirents) {
            return;
        }
        const remove = [];
        for (const f of dirents) {
            if (f.isFile() && f.name.indexOf('.') !== 0) {
                const stat = await fs.promises.stat(join(DOWNLOAD_PATH, f.name));
                if (stat.atime.getTime() < date) {
                    remove.push(f.name);
                }
            }
        }
        await this.convertHistoryService.setRemoveFile(remove);
        for (const l of remove) {
            await fs.promises.unlink(join(DOWNLOAD_PATH, l));
        }
    }
}