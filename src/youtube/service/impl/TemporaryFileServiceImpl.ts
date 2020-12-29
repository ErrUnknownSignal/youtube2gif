import {TemporaryFileService} from "../TemporaryFileService";
import {join} from "path";
import * as crypto from 'crypto';
import {Injectable} from "@nestjs/common";


@Injectable()
export class TemporaryFileServiceImpl implements TemporaryFileService {

    private readonly PATH = join(__dirname, '..', '..', '..', 'public', 'download');

    createTemporaryFile(extension: string): string {
        return join(this.PATH, crypto.randomBytes(16).toString('hex') + '.' + extension);
    }
}