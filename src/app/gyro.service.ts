import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { isDefined } from './utils';
import { BehaviorSubject, Observable } from 'rxjs';


export interface IOrientation {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface IDeviceInfo {
  isIos: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GyroService {

  public orientation$: Observable<IOrientation>;
  private orientation: BehaviorSubject<IOrientation>;

  private renderer: Renderer2;
  private motionListener: () => void;
  private orientationListener: () => void;


  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    this.orientation = new BehaviorSubject({ alpha: 0, beta: 0, gamma: 0 });
    this.orientation$ = this.orientation.asObservable();
  }

  public get activated() {
    return this._activated;
  }

  private _activated = false;

  public listen(device: IDeviceInfo): Observable<IOrientation> {

    if (device.isIos) {
      this.requestPermissionsIOS();
    }

    else {
      this._listen();
      this._activated = true;
    }

    return this.orientation$;
  }

  private _listen(): void {
    this.listenToDeviceMotion();
    this.listenToDeviceOrientation();
  }

  private requestPermissionsIOS(): void {
    this.requestDeviceMotionIOS();
    this.requestDeviceOrientationIOS();
  }

  private listenToDeviceMotion(): void {
    this.motionListener = this.renderer.listen('window', 'devicemotion', (event: DeviceMotionEvent) => {
      this.orientation.next({
        alpha: event.rotationRate.alpha,
        beta: event.rotationRate.beta,
        gamma: event.rotationRate.gamma
      });
    })
  }


  private listenToDeviceOrientation(): void {
    this.orientationListener = this.renderer.listen('window', 'deviceorientation', (event: DeviceOrientationEvent) => {
      this.orientation.next({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      })
    })
  }



  // запросы прав на ios
  private requestDeviceMotionIOS(): void {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this._activated = true;
            this.listenToDeviceMotion();
          }
        })
        .catch(console.error);
    } else {

      // handle regular non iOSdevices
      this.listenToDeviceMotion();
      this._activated = true;
    }
  }

  private requestDeviceOrientationIOS() {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this._activated = true;
            this.listenToDeviceOrientation();
          }
        })
        .catch(console.error);
    } else {
      // handle regular non iOSdevices
      this.listenToDeviceOrientation();
      this._activated = true;
    }
  }


  ngOnDestroy(): void {

    if (isDefined(this.orientationListener))
      this.orientationListener();

    if (isDefined(this.motionListener))
      this.motionListener();
  }

}
