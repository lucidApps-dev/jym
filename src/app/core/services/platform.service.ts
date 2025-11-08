import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private readonly _isIOS = signal<boolean>(false);

  public readonly isIOS = this._isIOS.asReadonly();

  constructor() {
    this.detectPlatform();
  }

  private detectPlatform(): void {
    if (typeof window !== 'undefined' && window.navigator) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      this._isIOS.set(isIOS);
    }
  }
}

