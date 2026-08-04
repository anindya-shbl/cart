import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // ============= live ==========================
    // public webcartUrl = 'https://sastasundar.com/index.php/webapi/';

    // ============= development ==========================
    public webcartUrl = 'https://stage.sastasundar.com/index.php/webapi/';

    // ============= local ==========================
    // public webcartUrl = 'http://192.168.5.236:8081/sspl_com/index.php/webapi/';

    constructor(private router: Router, private http: HttpClient, private cookieService: CookieService) {
        // this.autoSignIn();
    }

    getLogindata(url: any) {
        let gettUrl = this.webcartUrl + url;
        return this.http.get(gettUrl);
    }

    getCaptcha(url: any) {
        let gettUrl = this.webcartUrl + url
        return this.http.get(gettUrl);
    }

    doLogin(url: any, postDataVal: any) {
        let postUrl = this.webcartUrl + url
        let sspl_csrf = this.cookieService.get('sspl_csrf');
        postDataVal.append('csrf_test_name', sspl_csrf);
        // postDataVal.append('hasTestLogin', environment.hasTestLogin);
        return this.http.post(postUrl, postDataVal);
    }

    getOTP(url: any, postDataVal: any) {
        let postUrl = this.webcartUrl + url
        let sspl_csrf = this.cookieService.get('sspl_csrf');
        postDataVal.append('csrf_test_name', sspl_csrf);
        // postDataVal.append('hasTestLogin', environment.hasTestLogin);
        return this.http.post(postUrl, postDataVal);
    }

    verifyOTP(url: any, postDataVal: any) {
        let postUrl = this.webcartUrl + url
        let sspl_csrf = this.cookieService.get('sspl_csrf');
        postDataVal.append('csrf_test_name', sspl_csrf);
        // postDataVal.append('hasTestLogin', environment.hasTestLogin);
        return this.http.post(postUrl, postDataVal);
    }

    setUserLocation(url: any, postDataVal: any) {
        let postUrl = this.webcartUrl + url
        let sspl_csrf = this.cookieService.get('sspl_csrf');
        postDataVal.append('csrf_test_name', sspl_csrf);
        // postDataVal.append('hasTestLogin', environment.hasTestLogin);
        return this.http.post(postUrl, postDataVal);
    }

    /**
   * Get address from coordinates (Reverse Geocoding)
   */
  getAddressFromCoordinates(latitude: number, longitude: number): Observable<any> {
    const params = new HttpParams()
      .set('lat', latitude.toString())
      .set('lng', longitude.toString());

    return this.http.get(`${this.catalogurl}/geocode-latlng`, { params });
  }

  /**
   * Search address by pincode
   */
  searchByPincode(pincode: string): Observable<any> {
    // const params = new HttpParams().set('input', pincode);

    // return this.http.get(`${this.catalogurl}/search-pincode`, { params });
    return this.http.post(`${this.catalogurl}/places`, { input: pincode });
  }

  /**
   * Search address by area/city name
   */
  searchByArea(searchText: string): Observable<any> {
    // const params = new HttpParams().set('input', searchText);

    // return this.http.get(`${this.catalogurl}/search-area`, { params });
    return this.http.post(`${this.catalogurl}/places`, { input: searchText });
  }

  /**
   * Get place details from place ID
   */
  getPlaceDetails(placeId: string): Observable<any> {
    // const params = new HttpParams().set('placeId', placeId);

    return this.http.get(`${this.catalogurl}/place-details/${placeId}`, {  });
  }

  /**
   * Save address to user profile
   */
  saveAddress(address: any): Observable<any> {
    return this.http.post(`${this.catalogurl}/save`, address);
  }

  /**
   * Get saved addresses
   */
  getSavedAddresses(): Observable<any> {
    return this.http.get(`${this.catalogurl}/list`);
  }
}
