import { Injectable, Renderer2, RendererFactory2, OnDestroy, Component, ComponentDecorator, ComponentRef } from '@angular/core';
import { isDefined, isNotDefined } from './utils';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


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
export class GyroService implements OnDestroy {

  private orientation: BehaviorSubject<IOrientation>;

  private renderer: Renderer2;
  private motionListener: () => void;
  private orientationListener: () => void;

  private subscribed: any[] = [];
  private observables: Observable<IOrientation>[] = [];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    this.orientation = new BehaviorSubject({ alpha: 0, beta: 0, gamma: 0 });
  }

  public get activated() {
    return this._activated;
  }

  private _activated = false;

  public listen(device: IDeviceInfo, component: any): Observable<IOrientation> {

    if (this.subscribed.indexOf(component) > -1)
      return;

    if (device.isIos) {
      this.requestPermissionsIOS();
    } else {
      this._listen();
      this._activated = true;
    }

    const copy$ = this.orientation.asObservable();

    this.subscribed.push(component);
    this.observables.push(copy$);

    return copy$;
  }

  public close(component: any): void {
    const index = this.subscribed.indexOf(component);

    if (index < 0) {
      console.warn('trying to delete unknown');
      return;
    }

    this.subscribed.splice(index, 1);

    const obs = this.observables.splice(index, 1);
    const observable = obs[0];

    const end$ = new Subject<any>();
    observable.pipe(takeUntil(end$));
    end$.next();

    if (this.subscribed.length > 0)
      return;

    this.destroyListeners();
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
        alpha: this.roundToHundredth(event.rotationRate.alpha),
        beta: this.roundToHundredth(event.rotationRate.beta),
        gamma: this.roundToHundredth(event.rotationRate.gamma)
      });
    })
  }

  private listenToDeviceOrientation(): void {
    this.orientationListener = this.renderer.listen('window', 'deviceorientation', (event: DeviceOrientationEvent) => {
      this.orientation.next({
        alpha: this.roundToHundredth(event.alpha),
        beta: this.roundToHundredth(event.beta),
        gamma: this.roundToHundredth(event.gamma)
      })
    })
  }

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

  private roundToHundredth(number: number): number {
    if (isNotDefined(number))
      return;

    const digitsAfterPoint = 2;
    return Math.round(number * Math.pow(10, digitsAfterPoint)) / Math.pow(10, digitsAfterPoint)
  }


  private destroyListeners(): void {
    if (isDefined(this.orientationListener))
      this.orientationListener();

    if (isDefined(this.motionListener))
      this.motionListener();
  }


  ngOnDestroy(): void {
    this.destroyListeners();
  }

}
