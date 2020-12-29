import {Body, Controller, Post, Req} from "@nestjs/common";
import {ConvertRangeDto} from "../dto/ConvertRangeDto";
import {ConvertTimeDto} from "../dto/ConvertTimeDto";
import { Request } from 'express';
import {YoutubeService} from "../service/impl/youtube.service";
import {RequestResult} from "../vo/RequestResult";


@Controller('api')
export class ApiController {

    constructor(private youtubeService: YoutubeService) {}

    @Post('gif')
    async gif(@Req() req: Request, @Body() gifDto: ConvertRangeDto): Promise<RequestResult> {
        return new RequestResult(await this.youtubeService.gif(gifDto));
    }

    @Post('image')
    async image(@Req() req: Request, @Body() imageDto: ConvertTimeDto): Promise<RequestResult> {
        return new RequestResult(await this.youtubeService.image(imageDto));
    }

    @Post('mp3')
    async mp3(@Req() req: Request, @Body() mp3Dto: ConvertRangeDto): Promise<RequestResult> {
        return new RequestResult(await this.youtubeService.mp3(mp3Dto));
    }
}