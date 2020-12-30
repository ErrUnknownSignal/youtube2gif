import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConvertTime} from '../vo/convert-time';
import {Observable} from 'rxjs';
import {RequestResult} from '../vo/request-result';
import {ConvertRange} from '../vo/convert-range';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  convertGif(convertRange: ConvertRange): Observable<RequestResult> {
    return this.http.post<RequestResult>('/api/gif', convertRange);
  }

  convertImage(convertTime: ConvertTime): Observable<RequestResult> {
    return this.http.post<RequestResult>('/api/image', convertTime);
  }

  convertMp3(convertRange: ConvertRange): Observable<RequestResult> {
    return this.http.post<RequestResult>('/api/mp3', convertRange);
  }
}
