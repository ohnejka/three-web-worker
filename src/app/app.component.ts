import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceDetectorService } from './device-detector-service';
import { GyroService, IOrientation } from './gyro.service';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  // @ViewChild('canvas') public canvas: HTMLCanvasElement;

  public alpha = 0;
  public beta = 0;
  public gamma = 0;
  public message = ``;

  public isIOS = false;
  public overlayClicked = false;

  public orientation: Observable<IOrientation>;
  private subscription: Subscription;

  constructor(
    deviceService: DeviceDetectorService,
    private gyro: GyroService) {

    if (!deviceService.isMobile()) {
      console.log('not mobile')
      // return;
    }

    this.isIOS = deviceService.isIOS();

    if (!this.isIOS) {
      this.message = 'android no need to check';
      this.orientation = this.gyro.listen({ isIos: false });
      this.pullGyroValues();
    }
  }

  public requestListenIOS() {
    this.orientation = this.gyro.listen({ isIos: true });
    this.pullGyroValues();

    this.message = 'checked!'
    this.overlayClicked = true;
  }

  private pullGyroValues(): void {
    this.subscription = this.orientation.subscribe(
      ori => {
        this.alpha = ori.alpha;
        this.beta = ori.beta;
        this.gamma = ori.gamma;
      }
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription = undefined;
  }

}
