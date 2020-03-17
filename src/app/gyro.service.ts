import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { isDefined, isNotDefined } from './utils';
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

  // перепроверь, что нужен фактори, я в примерах просто renderer везде видел
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // кул! как раз хотел предложить сделать адекватный Subject, не пустой, а со значением
    this.orientation = new BehaviorSubject({ alpha: 0, beta: 0, gamma: 0 });
    this.orientation$ = this.orientation.asObservable();
  }

  public get activated() {
    return this._activated;
  }

  private _activated = false;

  public listen(device: IDeviceInfo): Observable<IOrientation> {

    if (device.isIos) {
      // permission можно запрашивать только по клику/тапу
      // надо помнить об этом
      this.requestPermissionsIOS();
    } else {
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
      // здесь в orientation записываются motion данные
      this.orientation.next({
        alpha: this.round(event.rotationRate.alpha),
        beta: this.round(event.rotationRate.beta),
        gamma: this.round(event.rotationRate.gamma)
      });
    })
  }

  private listenToDeviceOrientation(): void {
    this.orientationListener = this.renderer.listen('window', 'deviceorientation', (event: DeviceOrientationEvent) => {
      this.orientation.next({
        alpha: this.round(event.alpha),
        beta: this.round(event.beta),
        gamma: this.round(event.gamma)
      })
    })
  }

  private round(num: number): number {
    if (isNotDefined(num))
      return;

    // ну ты сама понимаешь
    return parseFloat(num.toFixed(2));
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

    // удивительно, но у сервисов есть OnDestroy, только непонятно когда он срабатывает
    // с ними не всё так просто как с компонентами

    if (isDefined(this.orientationListener))
      this.orientationListener();

    if (isDefined(this.motionListener))
      this.motionListener();
  }

}
