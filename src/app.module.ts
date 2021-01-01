import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoEntity} from "./youtube/entity/Video.entity";
import {YoutubeModule} from "./youtube/YoutubeModule";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from 'path'

@Module({
  imports: [
      ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public'),
          serveRoot: '/static'
      }),
      ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public', 'assets'),
          serveRoot: '/assets'
      }),
      ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'views'),
          renderPath: /^\/(youtube2gif|youtube2image|youtube2mp3)\/?$/i
      }),
      TypeOrmModule.forRoot({
        type: 'mariadb',
        host:  process.env.DB_HOST || 'localhost',
        port: 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PWD,
        database: process.env.DB_NAME || 'youtube',
        entities: [VideoEntity],
        synchronize: true
      }),
      YoutubeModule
  ]
})
export class AppModule {}
