import {Inject, Injectable, OnDestroy, Optional} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {IDeviceInfo} from "./i-device-info";


const mobileMaxWidth = 800;

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectorService implements OnDestroy {

  private readonly _isMobile: BehaviorSubject<boolean>;
  public readonly isMobileObservable: Observable<boolean>;

  constructor(@Optional() @Inject('DEVICE') public deviceInfo: IDeviceInfo) {
    this._isMobile = new BehaviorSubject(this.isMobile());
    this.isMobileObservable = this._isMobile.asObservable();

    this.updateDeviceInfo();

    if (this.isSsr())
      return;

    window.addEventListener('resize', this.windowResizeHandler);
  }

  public isSsr = (): boolean => {
    const isServerSide = this.deviceInfo !== null;// typeof window === 'undefined';
    return isServerSide;
  };

  public isMobile = (): boolean => {
    if (this.deviceInfo !== null)
      return this.deviceInfo.isMobile;

    const isMobile = window.innerWidth < mobileMaxWidth;
    return isMobile;
  };

  public isIOS = (): boolean => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return iOS;
  }

  public isDesktop = (): boolean => {
    if (this.deviceInfo !== null)
      return this.deviceInfo.isDesktop;

    return !this.isMobile();
  }

  public isDesktopHD = (): boolean => {
    if (this.deviceInfo !== null)
      return this.deviceInfo.isDesktop;

    const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;

    return this.isDesktop() && width > 1800;
  }

  private windowResizeHandler = () => {
    this.updateDeviceInfo();
  }

  private updateDeviceInfo = (): void => {

    const isMobile = this.isMobile();

    if (this._isMobile.value === isMobile)
      return;

    this._isMobile.next(isMobile);
  }

  ngOnDestroy(): void {

    if (this.isSsr())
      return;

    window.removeEventListener('resize', this.windowResizeHandler);
  }
}
