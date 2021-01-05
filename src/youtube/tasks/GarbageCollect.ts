import {Injectable} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {DOWNLOAD_PATH} from "../../main";
import * as fs from "fs";
import {join} from 'path';
import {ConvertHistoryService} from "../service/impl/ConvertHistoryService";


@Injectable()
export class GarbageCollect {

    constructor(private convertHistoryService: ConvertHistoryService) {
    }

    @Cron('0 */10 * * * *')
    async clearOldImg(): Promise<void> {
        console.log('gc img', new Date());
        const videos = await this.convertHistoryService.getNotRemovedOldImage();
        if (!videos || !videos.length) {
            return;
        }
        const ids = [];
        for (const v of videos) {
            fs.unlinkSync(join(DOWNLOAD_PATH, v.path));
            ids.push(v.id);
        }
        await this.convertHistoryService.setRemoveImage(ids);
    }
}