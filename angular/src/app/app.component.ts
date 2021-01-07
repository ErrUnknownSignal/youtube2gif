import {AfterViewInit, Component, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiService} from './service/api.service';
import {ConvertRange} from './vo/convert-range';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

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
  pngMode = false;

  url: string;
  showTips = false;
  useCurrentTime = false;

  v: string;
  filePath: string;

  videoQualities = VideoQuality;
  audioQualities = AudioQuality;

  formUrl = new FormControl('', [
    Validators.required,
    //https://gist.github.com/afeld/1254889
    Validators.pattern(/(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/)
  ]);
  formTime = new FormGroup({
    currentTime: new FormControl(false),
    startMin: new FormControl(0),
    startSec: new FormControl(0.0),
    duration: new FormControl(3.0),
    videoQuality: new FormControl(VideoQuality.SMALL),
    audioQuality: new FormControl(AudioQuality.LOW)
  });

  constructor(private ngZone: NgZone,
              private renderer: Renderer2,
              private http: HttpClient,
              private api: ApiService,
              private fb: FormBuilder) {
    if (/youtube2mp3/i.test(location.pathname)) {
      this.mp3Mode = true;
    } else if (/youtube2png/i.test(location.pathname)) {
      this.pngMode = true;
    }
    // this.formUrl.setValue('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    this.formTime.valueChanges.subscribe((data) => {
      if (this.useCurrentTime !== data.currentTime) {
        this.useCurrentTime = data.currentTime; //TODO fix
      }
    });
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
    if (!this.formUrl.value) {
      return;
    }
    const val = this.formUrl.value.trim();
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
      return
    }
    this.v = v;
    this.clearVideo();

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
    const val = this.formTime.value;
    const convertRange = new ConvertRange();
    convertRange.v = this.v;
    if (val.currentTime) {
      convertRange.start = this.player.getCurrentTime();
    } else {
      convertRange.start = (Number(val.startMin) * 60) + Number(val.startSec);
    }
    convertRange.time = Number(val.duration);
    convertRange.quality = this.mp3Mode? val.audioQuality : val.videoQuality;

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
          this.formTime.controls.startMin.setValue(Math.floor(this.lastCurrentTime / 60));
          this.formTime.controls.startSec.setValue(Number((this.lastCurrentTime % 60).toFixed(1)));
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
