import {Body, Controller, Post, Req, Res} from "@nestjs/common";
import {ConvertRangeDto} from "../dto/ConvertRangeDto";
import {ConvertTimeDto} from "../dto/ConvertTimeDto";
import { Request, Response } from 'express';
import {YoutubeService} from "../service/impl/youtube.service";
import {RequestResult} from "../vo/RequestResult";


@Controller('api')
export class ApiController {

    constructor(private youtubeService: YoutubeService) {}

    @Post('gif')
    async gif(@Body() gifDto: ConvertRangeDto): Promise<RequestResult> {
        return new RequestResult(await this.youtubeService.gif(gifDto));
    }

    @Post('gif-stream')
    gifStream(@Req() req: Request, @Res() res: Response, @Body() gifDto: ConvertRangeDto) {
        const readable = this.youtubeService.gifStream(gifDto);
        readable.attachHttpEvent(req, res);
    }

    @Post('image')
    async image(@Body() imageDto: ConvertTimeDto): Promise<RequestResult> {
        return new RequestResult(await this.youtubeService.image(imageDto));
    }

    @Post('image-stream')
    imageStream(@Req() req: Request, @Res() res: Response, @Body() imageDto: ConvertTimeDto) {
        const readable = this.youtubeService.imageStream(imageDto);
        readable.attachHttpEvent(req, res);
    }

    @Post('mp3')
    async mp3(@Body() mp3Dto: ConvertRangeDto): Promise<RequestResult> {
        return new RequestResult(await this.youtubeService.mp3(mp3Dto));
    }

    @Post('mp3-stream')
    mp3Stream(@Req() req: Request, @Res() res: Response, @Body() mp3Dto: ConvertRangeDto) {
        const readable = this.youtubeService.mp3Stream(mp3Dto);
        readable.attachHttpEvent(req, res);
    }
}