import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DeviceDetectorService } from './device-detector-service';
import { of, BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


interface IOrientation {
  alpha: number;
  beta: number;
  gamma: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // @ViewChild('canvas') public canvas: HTMLCanvasElement;

  public alpha = 0;
  public beta = 0;
  public gamma = 0;
  public message = ``;

  public accessOrientaionGranted = false;
  // public accessMotionGranted = false;

  private orientation: Subject<IOrientation>;


  public isIOS = false;
  public overlayClicked = false;

  constructor(deviceService: DeviceDetectorService, private changeDetector: ChangeDetectorRef) {
    if (!deviceService.isMobile()) {
      console.log('not mobile, return')
      // return;
    }

    this.isIOS = deviceService.isIOS();

    if (!this.isIOS) {
      this.accessOrientaionGranted = true;
      // this.accessMotionGranted = true;
      this.message = 'android no need to check'
    }

    console.log('ios ', this.isIOS);

    this.orientation = new Subject();
  }

  ngOnInit(): void {

    this.orientation.asObservable().pipe(
      debounceTime(300)
    )
      .subscribe((orientation) => {
        this.alpha = orientation.alpha;
        this.beta = orientation.beta;
        this.gamma = orientation.gamma;

      });
  }

  public requestPermissionsIOS() {
    this.requestDeviceOrientationIOS();
    // нужно ли моушн?
    // this.requestDeviceMotionIOS();
    this.message = 'checked ios 13+!'
    this.overlayClicked = true;
  }


  @HostListener('window: deviceorientation', ['$event'])
  onDeviceRotation(event: DeviceOrientationEvent) {

    if (!this.accessOrientaionGranted)
      return;

    this.orientation.next(
      {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      }
    );

    this.changeDetector.detectChanges();
  }


  private requestDeviceOrientationIOS(): void {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this.accessOrientaionGranted = true;
          }
        })
        .catch(console.error);
    } else {
      // handle regular non iOS 13+ devices
      this.accessOrientaionGranted = true;
    }
  }

  // @HostListener('window: devicemotion', ['$event'])
  // onDeviceMotion(event: DeviceMotionEvent) {
// }

  // private requestDeviceMotionIOS() {
  //   if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
  //     (DeviceMotionEvent as any).requestPermission()
  //       .then(permissionState => {
  //         if (permissionState === 'granted') {
  //           this.accessMotionGranted = true;
  //         }
  //       })
  //       .catch(console.error);
  //   } else {

  //     // handle regular non iOS 13+ devices
  //     this.accessMotionGranted = true;
  //   }
  // }

}
