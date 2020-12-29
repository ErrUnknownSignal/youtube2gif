import {Injectable} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {VideoEntity} from "../youtube/entity/Video.entity";
import {LessThan, Repository} from "typeorm";
import {DOWNLOAD_PATH} from "../main";
import * as fs from "fs";
import {join} from 'path';


@Injectable()
export class GarbageCollect {

    constructor(private videoRepository: Repository<VideoEntity>) {
    }

    @Cron('10 * * * *')
    async clearOldImg(): Promise<void> {
        const date = new Date(Date.now() - 30 * 60 * 1000);
        const videos = await this.videoRepository.find({where: {removed: false, date: LessThan(date)}, order: {id: 'ASC'}, take: 128})
        if (!videos) {
            return;
        }
        const removed = [];
        for (const v of videos) {
            //TODO if file not exists
            fs.unlinkSync(join(DOWNLOAD_PATH, v.path));
            removed.push(v);
        }
        if (removed.length) {
            await this.videoRepository.delete(removed);
        }
    }
}