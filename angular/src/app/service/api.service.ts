import {Injectable, NgZone} from '@angular/core';
import {ConvertTime} from '../vo/convert-time';
import {Observable} from 'rxjs';
import {ConvertRange} from '../vo/convert-range';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private zone: NgZone) { }

  convertGif(convertRange: ConvertRange): Observable<string> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(`api/gif-stream?v=${convertRange.v}&start=${convertRange.start}&time=${convertRange.time}&quality=${convertRange.quality}`);
      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          console.log(event);
          subscriber.next(event.toString());
        });
      };
      eventSource.onerror = (error) => {
        this.zone.run(() => {
          console.error(error);
          subscriber.error(error);
        });
      };
    });
  }

  convertImage(convertTime: ConvertTime): Observable<string> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(`api/image-stream?v=${convertTime.v}&time=${convertTime.time}&quality=${convertTime.quality}`);
      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          console.log(event);
          subscriber.next(event.toString());
        });
      };
      eventSource.onerror = (error) => {
        this.zone.run(() => {
          console.error(error);
          subscriber.error(error);
        });
      };
    });
  }

  convertMp3(convertRange: ConvertRange): Observable<string> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(`api/mp3-stream?v=${convertRange.v}&start=${convertRange.start}&time=${convertRange.time}&quality=${convertRange.quality}`);
      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          console.log(event);
          subscriber.next(event.toString());
        });
      };
      eventSource.onerror = (error) => {
        this.zone.run(() => {
          console.error(error);
          subscriber.error(error);
        });
      };
    });
  }
}
