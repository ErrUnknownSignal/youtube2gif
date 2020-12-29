import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {ApiController} from "./controller/api.controller";
import {YoutubeService} from "./service/impl/youtube.service";
import {TemporaryFileServiceImpl} from "./service/impl/TemporaryFileServiceImpl";


@Module({
    imports: [
        CqrsModule
    ],
    controllers: [ApiController],
    providers: [YoutubeService, {provide: 'TemporaryFileService', useClass: TemporaryFileServiceImpl}],
})
export class YoutubeModule {

}