import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, input } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  // ============== Live ================
  // public catalogurl = 'https://serv-catalog.sastasundar.com/geocode';

  // ============== stage ================
  // public catalogurl = 'https://stage-serv-catalog.sastasundar.com/geocode';

  // ============== local ================
  public catalogurl = 'http://192.168.5.236:8003/geocode';

  constructor(private http: HttpClient) { }

  // getData(url: any): Observable<any>{
  //   return this.http.get(url);
  // }

  // getData(path: any, data: any): Observable<any> {
  //   // data.AuthKey = '9v6lZbc2Q12fSDQ6jWFyUS7CU4BxrxDd';
  //   let gettUrl = this.articleurl + path;
  //   return this.http.get(gettUrl, data);
  // }

  // postData(path: any, data: any): Observable<any> {
  //   // data.AuthKey = '9v6lZbc2Q12fSDQ6jWFyUS7CU4BxrxDd';
  //   const headers = new HttpHeaders({
  //   'authkey' : '9v6lZbc2Q12fSDQ6jWFyUS7CU4BxrxDd'
  //   });
  //   let postUrl = this.articleurl + path;
  //   return this.http.post(postUrl, data, {headers});
  // }

  // getAddressFromCoordinates_bkp_030826(latitude: number, longitude: number): Observable<any> {
  //   const params = new HttpParams()
  //     .set('lat', latitude.toString())
  //     .set('lng', longitude.toString());

  //   return this.http.get(`${this.catalogurl}/geocode-latlng`, { params });
  // }
  /**
   * Get address from coordinates (Reverse Geocoding)
   */
  getAddressFromCoordinates(latitude: number, longitude: number): Observable<any> {
    // const params = new HttpParams()
    //   .set('lat', latitude.toString())
    //   .set('lng', longitude.toString());

    return this.http.post(`${this.catalogurl}/reverse-geocode`, { lat: latitude.toString(), lng: longitude.toString() });
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
