import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  constructor(private httpClient: HttpClient) { }

  makeImage(): string {
    return 'TODO';
  }

  makeGif(): string {
    return 'TODO';
  }
}
