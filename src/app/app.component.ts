import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnInit, OnDestroy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { DeviceDetectorService } from './device-detector-service';
import { isDefined } from '@angular/compiler/src/util';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit , OnDestroy{
  // @ViewChild('canvas') public canvas: HTMLCanvasElement;

  public alpha = 0;
  public beta = 0;
  public gamma = 0;
  public message = ``;

  public isIOS = false;
  public overlayClicked = false;

  private motionListener: () => void;
  private orientationListener: () => void;

  constructor(
    deviceService: DeviceDetectorService,
    private changeDetector: ChangeDetectorRef,
    private renderer: Renderer2) {
    if (!deviceService.isMobile()) {
      console.log('not mobile, return')
      // return;
    }

    this.isIOS = deviceService.isIOS();

    if (!this.isIOS) {
      this.message = 'android no need to check';
      this.listenToDeviceMotion();
      this.listenToDeviceOrientation();
    }
  }


  ngOnInit(): void { }

  public requestPermissionsIOS() {
    this.requestDeviceMotionIOS();
    this.requestDeviceOrientationIOS();
    this.message = 'checked!'
    this.overlayClicked = true;
  }


   // MOTION
  private requestDeviceMotionIOS() {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this.listenToDeviceMotion();
          }
        })
        .catch(console.error);
    } else {

      // handle regular non iOSdevices
      this.listenToDeviceMotion();
    }
  }

  private listenToDeviceMotion(): void {
    this.motionListener = this.renderer.listen('window', 'devicemotion', (event: DeviceMotionEvent) => {
      console.log('motionListener: ', event);
      this.alpha = event.rotationRate.alpha;
      this.beta = event.rotationRate.beta;
      this.gamma = event.rotationRate.gamma;
      this.changeDetector.detectChanges();
    })
  }

  // ORIENTATION
  private requestDeviceOrientationIOS() {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this.listenToDeviceOrientation();
          }
        })
        .catch(console.error);
    } else {
      // handle regular non iOSdevices
      this.listenToDeviceOrientation();
    }
  }

  private listenToDeviceOrientation(): void {
    this.orientationListener = this.renderer.listen('window', 'deviceorientation', (event: DeviceOrientationEvent) => {
      this.alpha = event.alpha;
      this.beta = event.beta;
      this.gamma = event.gamma;
      this.changeDetector.detectChanges();
    })
  }

  ngOnDestroy(): void {

    if(isDefined(this.orientationListener))
      this.orientationListener();

    if(isDefined(this.motionListener))
    this.motionListener();
  }

}
