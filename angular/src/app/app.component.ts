import {AfterViewInit, Component, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiService} from './service/api.service';
import {ConvertRange} from './vo/convert-range';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  private player: any;
  private intVal: any;
  private lastCurrentTime: number;

  mp3Mode = false;

  url: string;
  wrongUrl = false;
  showTips = false;
  useCurrentTime = false;

  v;
  filePath;

  videoQualities = VideoQuality;
  videoQuality = VideoQuality.SMALL;

  audioQualities = AudioQuality;
  audioQuality = AudioQuality.HIGH;

  startMin = 0;
  startSec = 0.0;
  duration = 0.0;

  constructor(private ngZone: NgZone,
              private renderer: Renderer2,
              private http: HttpClient,
              private api: ApiService) {
    if (/youtube2mp3/i.test(location.pathname)) {
      this.mp3Mode = true;
    }
    // this.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }

  private clearVideo(): void {
    this.player = undefined;
    this.filePath = undefined;
  }

  downloadFile(): void {
    this.http.get(this.filePath, { responseType: 'blob'}).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `${this.player.getVideoData().title}.gif`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  loadUrl(): void {
    if (!this.url) {
      return;
    }
    const val = this.url.trim();
    let v, t;
    let match;
    if (/youtube\.com\/watch\?v=((\w|-)+)/.test(val)) {
      match = val.match(/youtube\.com\/watch\?v=((\w|-)+)/);
    } else if (/youtu\.be\/((\w|-)+)/.test(val)) {
      match = val.match(/youtu\.be\/((\w|-)+)/);
    }
    if (match && match[1]) {
      v = match[1];
    }
    match = val.match(/[?&]t=([^&]+).*$/);
    if (match && match[1]) {
      t = parseInt(match[1], 10);
    } else {
      t = 0;
    }

    if (!v) {
      this.wrongUrl = true;
      return
    }
    this.v = v;
    this.clearVideo();

    this.wrongUrl = false;

    const youtubeFrameElement = this.renderer.createElement('div');
    this.renderer.setProperty(youtubeFrameElement, 'id', 'youtube-frame');
    this.renderer.appendChild(this.renderer.selectRootElement('.youtube-frame'), youtubeFrameElement);

    this.player = new YT.Player('youtube-frame', {
      width: '480',
      height: '320',
      videoId: v,
      playerVars: {
        enablejsapi: 1,
        start: t,
        rel: 0
      },
      events: {
        // onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this)
      }
    });
  }

  preview(): void {
    if (!this.v) {
      return;
    }
    const convertRange = new ConvertRange();

    convertRange.v = this.v;
    convertRange.start = (this.startMin * 60) + this.startSec;
    convertRange.time = this.duration;

    this.api.convertGif(convertRange).subscribe(value => {
      this.filePath = `static/download/${value.file}`;

      const previewElement = this.renderer.selectRootElement('#previewImage');
      this.renderer.setProperty(previewElement, 'src', this.filePath);
    });
  }

  hasPlayer(): boolean {
    return this.player;
  }

  ngAfterViewInit(): void {
    this.intVal = setInterval(() => {
      if (this.player && this.player.getCurrentTime && this.lastCurrentTime !== this.player.getCurrentTime()) {
        this.lastCurrentTime = this.player.getCurrentTime();
        if (this.useCurrentTime) {
          this.startMin = Math.floor(this.lastCurrentTime / 60);
          this.startSec = Number((this.lastCurrentTime % 60).toFixed(1));
        }
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.intVal) {
      clearInterval(this.intVal);
    }
  }

  private onPlayerStateChange(e: any): void {
    this.ngZone.run(() => {
      console.log('state', e);
      if (e.data === YT.PlayerState.PLAYING) {
        this.showTips = true;
      } else {

      }
    });
  }
}

enum VideoQuality {
  SMALL,  //320x240
  MEDIUM, //640x360
  LARGE,  //853x480
  HD, //1280x720
  FHD //1920x1080
}

enum AudioQuality {
  LOW,
  HIGH
}
