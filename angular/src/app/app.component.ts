import {AfterViewInit, Component, NgZone, OnDestroy, Renderer2} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  private player: any;
  private intVal: any;
  private lastCurrentTime: number;

  url: string;
  wrongUrl = false;
  showTips = false;
  useCurrentTime = false;

  startMin = 0;
  startSec = 0;
  startMil = 0;
  duration = 0;
  durationMill = 0;

  constructor(private ngZone: NgZone, private renderer: Renderer2) {
  }

  loadUrl(): void {
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

    if (v) {
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
          // origin: location.host,
          start: t,
          rel: 0
        },
        events: {
          onStateChange: this.onPlayerStateChange.bind(this)
        }
      });
    } else {
      this.wrongUrl = true;
    }
  }

  preview(): void {
    //TODO
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
