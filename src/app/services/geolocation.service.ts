import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private currentLocationSubject = new BehaviorSubject<CurrentLocation | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  private isGeolocationSupported = 'geolocation' in navigator;

  constructor() {
    this.loadCurrentLocation();
  }

  /**
   * Load current location on service initialization
   */
  private loadCurrentLocation(): void {
    if (this.isGeolocationSupported) {
      this.getCurrentLocation().subscribe({
        next: (location) => {
          this.currentLocationSubject.next(location);
          console.log('Current location loaded:', location);
        },
        error: (error) => {
          console.warn('Geolocation error:', error);
          // Will use default coordinates
        }
      });
    } else {
      console.warn('Geolocation is not supported by this browser');
    }
  }

  /**
   * Get current location from browser
   */
  getCurrentLocation(): Observable<CurrentLocation> {
    return new Observable((observer) => {
      if (!this.isGeolocationSupported) {
        observer.error('Geolocation is not supported');
        return;
      }

      const options = {
        enableHighAccuracy: true,  // Get more precise location
        timeout: 10000,            // Wait max 10 seconds
        maximumAge: 0              // Don't use cached position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: CurrentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          observer.next(location);
          observer.complete();
        },
        (error) => {
          let errorMessage = 'Unable to get current location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Enable location in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          console.error(errorMessage);
          observer.error(errorMessage);
        },
        options
      );
    });
  }

  /**
   * Get current location (synchronous from cache)
   */
  getCurrentLocationSync(): CurrentLocation | null {
    return this.currentLocationSubject.value;
  }

  /**
   * Clear cached location
   */
  clearLocation(): void {
    this.currentLocationSubject.next(null);
  }

  /**
   * Reload current location
   */
  reloadLocation(): Observable<CurrentLocation> {
    return new Observable((observer) => {
      this.getCurrentLocation().subscribe({
        next: (location) => {
          this.currentLocationSubject.next(location);
          observer.next(location);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}