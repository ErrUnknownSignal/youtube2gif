import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {ApiController} from "./controller/api.controller";
import {YoutubeService} from "./service/impl/youtube.service";
import {TemporaryFileServiceImpl} from "./service/impl/TemporaryFileServiceImpl";
import {YoutubeAnalyticsService} from "./service/impl/YoutubeAnalyticsService";
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoEntity} from "./entity/Video.entity";


@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([VideoEntity])
    ],
    controllers: [ApiController],
    providers: [YoutubeAnalyticsService, YoutubeService, {provide: 'TemporaryFileService', useClass: TemporaryFileServiceImpl}],
})
export class YoutubeModule {

}