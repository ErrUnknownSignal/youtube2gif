import {Body, Controller, Post, Req} from "@nestjs/common";
import {GifDto} from "../dto/GifDto";
import {ImageDto} from "../dto/ImageDto";
import { Request } from 'express';
import {YoutubeService} from "../service/impl/youtube.service";


@Controller('api')
export class ApiController {

    constructor(private youtubeService: YoutubeService) {}

    @Post('gif')
    async gif(@Req() req: Request, @Body() gifDto: GifDto): Promise<string> {
        return await this.youtubeService.gif(gifDto);
    }

    @Post('image')
    async image(@Req() req: Request, @Body() imageDto: ImageDto): Promise<string> {
        return await this.youtubeService.image(imageDto);
    }
}