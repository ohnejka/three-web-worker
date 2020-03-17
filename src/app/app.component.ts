import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DeviceDetectorService } from './device-detector-service';
import { ReturnStatement } from '@angular/compiler';


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
  public accessMotionGranted = false;

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
      this.accessMotionGranted = true;
      this.message = 'android no need to check'
    }

    console.log('ios ', this.isIOS);
  }

  ngOnInit(): void { }


  @HostListener('window: deviceorientation', ['$event'])
  onDeviceRotation(event: DeviceOrientationEvent) {

    if (!this.accessOrientaionGranted)
      return;

    this.alpha = event.alpha;
    this.beta = event.beta;
    this.gamma = event.gamma;
    this.changeDetector.detectChanges();
  }

  @HostListener('window: devicemotion', ['$event'])
  onDeviceMotion(event: DeviceMotionEvent) {

    if (!this.accessMotionGranted)
      return;

    this.alpha = event.rotationRate.alpha;
    this.beta = event.rotationRate.beta;
    this.gamma = event.rotationRate.gamma;
    this.changeDetector.detectChanges();

  }

  public requestPermissionsIOS() {
    this.requestDeviceMotionIOS();
    this.requestDeviceOrientationIOS();
    this.message = 'checked!'
    this.overlayClicked = true;
  }

  private requestDeviceMotionIOS() {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this.accessMotionGranted = true;
          }
        })
        .catch(console.error);
    } else {

      // handle regular non iOS 13+ devices
      this.accessMotionGranted = true;
    }
  }

  private requestDeviceOrientationIOS() {
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


}
