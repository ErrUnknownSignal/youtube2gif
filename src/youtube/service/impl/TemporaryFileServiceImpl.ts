import {TemporaryFileService} from "../TemporaryFileService";
import {join} from "path";
import * as crypto from 'crypto';
import {Injectable} from "@nestjs/common";
import {DOWNLOAD_PATH} from "../../../main";


@Injectable()
export class TemporaryFileServiceImpl implements TemporaryFileService {

    getBasePath(): string {
        return DOWNLOAD_PATH;
    }

    createTemporaryFile(extension: string): string {
        return join(DOWNLOAD_PATH, crypto.randomBytes(16).toString('hex') + '.' + extension);
    }
}