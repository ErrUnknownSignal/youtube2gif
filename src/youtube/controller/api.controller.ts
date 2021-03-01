import {Controller, Get, Query, Req, Res} from "@nestjs/common";
import {ConvertRangeDto} from "../dto/ConvertRangeDto";
import {ConvertTimeDto} from "../dto/ConvertTimeDto";
import {Request, Response} from 'express';
import {YoutubeService} from "../service/impl/youtube.service";


@Controller('api')
export class ApiController {

    constructor(private youtubeService: YoutubeService) {}


    @Get('gif-stream')
    gifStream(@Req() req: Request, @Res() res: Response, @Query() gifDto: ConvertRangeDto) {
        gifDto = Object.assign(new ConvertRangeDto(), gifDto);
        const readable = this.youtubeService.gifStream(gifDto);
        readable.attachHttpEvent(req, res);
    }

    @Get('image-stream')
    imageStream(@Req() req: Request, @Res() res: Response, @Query() imageDto: ConvertTimeDto) {
        imageDto = Object.assign(new ConvertTimeDto(), imageDto);
        const readable = this.youtubeService.imageStream(imageDto);
        readable.attachHttpEvent(req, res);
    }

    @Get('mp3-stream')
    mp3Stream(@Req() req: Request, @Res() res: Response, @Query() mp3Dto: ConvertRangeDto) {
        mp3Dto = Object.assign(new ConvertRangeDto(), mp3Dto);
        const readable = this.youtubeService.mp3Stream(mp3Dto);
        readable.attachHttpEvent(req, res);
    }

    @Get('test-stream')
    testStream(@Req() req: Request, @Res() res: Response) {
        let reqClosed = false;
        req.on('close', () => {
            reqClosed = true;
        });
        let first = true;
        let cnt = 0;
        const interval = setInterval(() => {
            if (reqClosed) {
                res.end();
                return;
            }
            if (first) {
                res.writeHead(200, {'Content-Type': 'text/event-stream', 'Expires': '-1'});
                first = false;
            }
            res.write(`data: ${cnt++}\n\n`);
            if (cnt > 100) {
                clearInterval(interval);
                res.end();
            }
        }, 100);
    }
}