import { Injectable } from '@angular/core';

declare let webengage: any; // Declare global WebEngage

@Injectable({
  providedIn: 'root',
})
export class WebEngageService {
  constructor() {
    this.initWebEngage();
  }

  initWebEngage() {
    if (typeof window !== 'undefined' && (window as any)['webengage']) {
      webengage.init('in~~15ba20749');
      console.log('WebEngage Initialized');
    } else {
      console.error('WebEngage SDK is not loaded properly');
    }
  }

  trackEvent(eventName: string, eventData: any = {}) {
    if (typeof window !== 'undefined' && (window as any)['webengage']) {
      webengage.track(eventName, eventData);
    }
  }

  identifyUser(userData: any) {
    if (webengage) {
      let mob = userData['data']['MobileNo'].toString();
      let addedMob = '+91'+mob;
      webengage.user.login(userData['data']['EncodedUserId'],);
      webengage.user.setAttribute('we_first_name', userData['data']['FName']);
      webengage.user.setAttribute('we_last_name', userData['data']['LName']);
      webengage.user.setAttribute('we_email', userData['data']['EmailId']);
      webengage.user.setAttribute('we_phone', addedMob);
    } else {
      console.error('WebEngage not initialized');
    }
  }
}

