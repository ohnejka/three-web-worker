import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceDetectorService } from './device-detector-service';
import { GyroService, IOrientation } from './gyro.service';
import { Observable, Subscription, timer } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  // @ViewChild('canvas') public canvas: HTMLCanvasElement;

  public alpha = 0;
  public beta = 0;
  public gamma = 0;
  public message = ``;

  public isIOS = false;
  public overlayClicked = false;

  public orientation: Observable<IOrientation>;

  constructor(
    private deviceService: DeviceDetectorService,
    private gyro: GyroService) { }

  ngOnInit(): void {

    if (!this.deviceService.isMobile()) {
      console.log('not mobile')
      // return;
    }

    this.isIOS = this.deviceService.isIOS();

    if (!this.isIOS) {
      this.message = 'android no need to check';
      this.orientation = this.gyro.listen({ isIos: false }, AppComponent);

      this.pullGyroValues();
    }

    // тестирование метода close()
    timer(5000).subscribe(() => {
      this.gyro.close(AppComponent);
    })
  }

  public requestListenIOS() {
    this.orientation = this.gyro.listen({ isIos: true }, AppComponent);
    this.pullGyroValues();

    this.message = 'checked!'
    this.overlayClicked = true;
  }

  private pullGyroValues(): void {
    this.orientation.subscribe(
      ori => {
        this.alpha = ori.alpha;
        this.beta = ori.beta;
        this.gamma = ori.gamma;
      }
    )
  }

  ngOnDestroy(): void {
    this.gyro.close(AppComponent);
  }

}
