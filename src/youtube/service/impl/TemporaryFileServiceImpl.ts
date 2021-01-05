import {TemporaryFileService} from "../TemporaryFileService";
import {join} from "path";
import * as crypto from 'crypto';
import {Injectable} from "@nestjs/common";
import {DOWNLOAD_PATH} from "../../../main";


@Injectable()
export class TemporaryFileServiceImpl implements TemporaryFileService {

    createTemporaryFile(extension: string): string[] {
        const file = crypto.randomBytes(16).toString('hex') + '.' + extension;
        return [join(DOWNLOAD_PATH, file), DOWNLOAD_PATH, file];
    }
}