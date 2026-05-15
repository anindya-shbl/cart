import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  // ============= live ==========================

  public webcartUrl = 'https://sastasundar.com/index.php/webapi/';
  public baseurl = 'https://sastasundar.com/';
  public custwebcartUrl = 'https://sastasundar.com/index.php/customercart/';
  public onlineplaceorderUrl = 'https://sastasundar.com/index.php/cart/online_payment_process';
  public codsuccessUrl = 'https://sastasundar.com/index.php/customercart/order_success';
  public promoUrl = 'https://search.sastasundar.com/coupon/find_applicable_promos';
  public catalogUrl = 'https://serv-catalog.sastasundar.com/';
  public searchUrl = 'https://search.sastasundar.com/';
  public ImageUrl = 'https://asset.sastasundar.com/';
  public paymentImageUrl = 'https://asset.sastasundar.com/incom/PaymentgatewayImages/web/';


  // ============= development ==========================

  // public webcartUrl = 'https://stage.sastasundar.com/index.php/webapi/';
  // public baseurl = 'https://stage.sastasundar.com/';
  // public custwebcartUrl = 'https://stage.sastasundar.com/index.php/customercart/';
  // public onlineplaceorderUrl = 'https://stage.sastasundar.com/index.php/cart/online_payment_process';
  // public codsuccessUrl = 'https://stage.sastasundar.com/index.php/customercart/order_success';
  // public promoUrl ='https://stage-search.sastasundar.com/coupon/find_applicable_promos';
  // public catalogUrl = 'https://stage-serv-catalog.sastasundar.com/';
  // public searchUrl = 'https://stage-search.sastasundar.com/';
  // public ImageUrl = 'https://res.sastasundar.com/';
  // public paymentImageUrl = 'https://asset.sastasundar.com/incom/PaymentgatewayImages/web/';




  // ============= local ==========================
  // public webcartUrl = 'http://192.168.5.236:8081/sspl_com/index.php/webapi/';
  // public baseurl = 'http://192.168.5.236:8081/sspl_com/';
  // public custwebcartUrl = 'http://192.168.5.236:8081/sspl_com/index.php/customercart/';
  // public onlineplaceorderUrl = 'http://192.168.5.236:8081/sspl_com/index.php/cart/online_payment_process';
  // public codsuccessUrl = 'http://192.168.5.236:8081/sspl_com/index.php/customercart/order_success';
  // public promoUrl ='http://192.168.5.192:4200/coupon/find_applicable_promos';
  // public catalogUrl = 'http://192.168.5.236:8003/';
  // // public searchUrl = 'http://192.168.5.192:4200/'; // local search
  // // public searchUrl = 'https://stage-search.sastasundar.com/'; // stage
  // public searchUrl = 'https://search.sastasundar.com/'; // live
  // public ImageUrl = 'https://res.sastasundar.com/';
  // public paymentImageUrl = 'https://asset.sastasundar.com/incom/PaymentgatewayImages/web/';
  
  constructor(private http: HttpClient, private cookieService: CookieService) { }
  // public userLocationPincode: number = 0;
  // public PanIndia = 0;
  // public Warehouse = 1;

  public PinCode: any = 0;
  public WHId: any = 1;
  public IsPanIndia: any = 0;
  public UserName: any = '';
  public Token: any = '';
  public Mobile: any = '';
  public EmailId: any = '';
  public synchType = '';

  public PanIndiaStateName = '';
  public PanIndiaStateCode = '';
  public PanIndiaCityID = '';
  public PanIndiaCityName = '';
  public cartSynchCall = false;

  public Warehouse = '';
  public ConfigData: any = '';
  public compareabledata: any = [];
  public isDownTime: any = 0;
  public downTimeMsg: any = '';

  private subject: any = new Subject<any>();

  sendClickEvent() {
    this.subject.next();
  }

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  getSearchData(url: any) {
    return this.http.get(url);
  }

  getMinOrderValue(url: any) {
    let gettUrl = this.webcartUrl + url;
    return this.http.get(gettUrl);
  }

  getCouponList(url: any) {
    let gettUrl = this.webcartUrl + url
    return this.http.get(gettUrl);
  }

  cartSynch(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }


  addToCartOrder(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    // postDataVal.append('hasTestLogin', environment.hasTestLogin);
    return this.http.post(postUrl, postDataVal);
  }

  update_to_cart(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  remove_item(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  checkoutCart(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  getCartDetails(url: any) {
    let gettUrl = this.webcartUrl + url
    return this.http.get(gettUrl);
  }

  getOrderDetails(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  getSavedForLaterList(url: any) {
    let gettUrl = this.webcartUrl + url
    return this.http.get(gettUrl);
  }

  addSaveForLater(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  saveForLaterRemove(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    // postDataVal.append('hasTestLogin', environment.hasTestLogin);
    return this.http.post(postUrl, postDataVal);
  }

  getSavedPrescription(url: any): Observable<any> {
    let gettUrl = this.webcartUrl + url;
    // let gettUrl = 'http://192.168.5.148:8074/sspl_com/webapi/' + url;
    return this.http.get(gettUrl);
  }

  uploadprescription(url: any, refFiles: any) {
    // let postUrl = this.uploadPrescriptionUrl + url;
    let postUrl = this.catalogUrl + url;
    return this.http.post(postUrl, refFiles);
  }

  updatePrescriptionStatus(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url;
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  setUserLocation(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    // postDataVal.append('hasTestLogin', environment.hasTestLogin);
    return this.http.post(postUrl, postDataVal);
  }

  getAllAddress(url: any) {
    let gettUrl = this.webcartUrl + url;
    return this.http.get(gettUrl);
  }

  getExpectedDelivery(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url;
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  checkServiceArea(url: any, fd: any): Observable<any> {
    let gettUrl = this.baseurl + url;
    // let sspl_csrf = this.cookieService.get('sspl_csrf');
    // let gettUrl = 'http://192.168.5.148:8074/sspl_com/' + url;
    let sspl_csrf = '';
    fd.append('csrf_test_name', sspl_csrf);
    return this.http.post(gettUrl, fd);
  }

  addAddress(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  saveShipBillAddress(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url;
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  getCatalogData(url: any, postDataVal: any) {
    let postUrl = this.catalogUrl + url
    return this.http.post(postUrl, postDataVal);
  }

  applyCouponCode(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  get_PG_List(url: any) {
    let gettUrl = this.webcartUrl + url
    return this.http.get(gettUrl);
  }

  paymentInitiate(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  paymentSuccess(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    return this.http.post(postUrl, postDataVal);
  }

  clearCart(url: any) {
    let gettUrl = this.webcartUrl + url
    return this.http.get(gettUrl);
  }

  getNewUploadedPrsc(url: any) {
    let getUrl = this.webcartUrl + url;
    return this.http.get(getUrl);
  }

  emailUpdate(url: any, postDataVal: any) {
    let postUrl = this.webcartUrl + url
    let sspl_csrf = this.cookieService.get('sspl_csrf');
    postDataVal.append('csrf_test_name', sspl_csrf);
    // postDataVal.append('hasTestLogin', environment.hasTestLogin);
    return this.http.post(postUrl, postDataVal);
  }

  // getProductDetailsPageURL(ProductId: any, ProductName: any, PrescriptionOTC: any) {
  //   // debugger
  //   let prod_name = ProductName.toLowerCase();
  //   prod_name = prod_name.trim(prod_name);
  //   prod_name = prod_name.replace(/\~/g, ' ');
  //   prod_name = prod_name.replace(/\`/g, ' ');
  //   prod_name = prod_name.replace(/\!/g, ' ');
  //   prod_name = prod_name.replace(/\@/g, ' ');
  //   prod_name = prod_name.replace(/\#/g, ' ');
  //   prod_name = prod_name.replace(/\$/g, ' ');
  //   prod_name = prod_name.replace(/\%/g, ' ');
  //   prod_name = prod_name.replace(/\^/g, ' ');
  //   prod_name = prod_name.replace(/\&/g, ' and ');
  //   prod_name = prod_name.replace(/\*/g, ' ');
  //   prod_name = prod_name.replace(/\(/g, ' ');
  //   prod_name = prod_name.replace(/\)/g, ' ');
  //   prod_name = prod_name.replace(/\-/g, ' ');
  //   prod_name = prod_name.replace(/\_/g, ' ');
  //   prod_name = prod_name.replace(/\+/g, ' ');
  //   prod_name = prod_name.replace(/\=/g, ' ');
  //   prod_name = prod_name.replace(/\{/g, ' ');
  //   prod_name = prod_name.replace(/\}/g, ' ');
  //   prod_name = prod_name.replace(/\[/g, ' ');
  //   prod_name = prod_name.replace(/\]/g, ' ');
  //   prod_name = prod_name.replace(/\:/g, ' ');
  //   prod_name = prod_name.replace(/\;/g, ' ');
  //   prod_name = prod_name.replace(/\"/g, ' ');
  //   prod_name = prod_name.replace(/\>/g, ' ');
  //   prod_name = prod_name.replace(/\</g, ' ');
  //   prod_name = prod_name.replace(/\,/g, ' ');
  //   prod_name = prod_name.replace(/\./g, ' ');
  //   prod_name = prod_name.replace(/\?/g, ' ');
  //   prod_name = prod_name.replace(/\//g, ' ');
  //   prod_name = prod_name.replace('\\', ' ');
  //   prod_name = prod_name.replace(/\|/g, ' ');
  //   prod_name = prod_name.replace(/\  /g, ' ');
  //   // prod_name = prod_name.replace(/\ /g, '-');
  //   prod_name = prod_name.substr(0, 200);

  //   let product_Id = btoa(ProductId);

  //   // if( PrescriptionOTC == 'P'){
  //   //   let product_url = this.baseurl + 'index.php/product/details/' + prod_name + '/medicine/' + product_Id;
  //   //   window.open(product_url, "_blank")
  //   // }else{
  //   //   let product_url = this.baseurl + 'index.php/product/details/' + prod_name + '/p/' + product_Id;
  //   //   window.open(product_url, "_blank")
  //   // }
  //   // return product_url;

  //   if (PrescriptionOTC == 'P') {
  //     let product_url = this.baseurl + 'order-medicine/' + prod_name + '-' + product_Id;
  //     window.open(product_url)
  //   } else {
  //     let product_url = this.baseurl + 'order-otc/' + '-' + ProductId;
  //     window.open(product_url)
  //   }

  // }

  getProductDetailsPageURL(productid: any, displayname: any, producttype: any) {
    var urisegment1 = '';
    var urisegment2 = '';
    if (displayname != '' && displayname != null) {
      var prod_name = this.get_seo_url_string(displayname);
      urisegment2 = prod_name + '-' + productid;
    }
    if (producttype == 'P') {
      urisegment1 = 'order-medicine';
    } else {
      urisegment1 = 'order-otc';
    }
    if (productid != '' && urisegment1 != '') {
      var product_url = this.baseurl + urisegment1 + '/' + urisegment2;
    } else {
      var product_url = this.baseurl;
    }
    // return product_url;
     window.open(product_url)
    // window.location.href = product_url
  }

  get_seo_url_string(name: any, charsize = 0) {
    name = name.trim(); // Trim String
    name = name.toLowerCase(); //Unwanted:  {UPPERCASE} ; / ? : @ & = + $ , . ! ~ * ' ( )
    name = name.replace(/[^a-z0-9_\s-]/g, '');
    name = name.replace(/[\s-]+/g, ' ');
    name = name.replace(/[\s_]/g, '-');
    if (charsize > 0) {
      name = name.substr(name, 0, charsize);
    }
    return name;
  }

  custWalletBalance(url: any) {
    let gettUrl = this.webcartUrl + url;
    return this.http.get(gettUrl);
  }

  getAlternativeList(url: any) {
    let gettUrl = this.searchUrl + url;
    return this.http.get(gettUrl);
  }

  requestNotify(url: any, fd: any) {
    let postUrl = this.webcartUrl + url
    // let postUrl = 'http://192.168.5.139:8082/sspl_com/index.php/webapi/' + url;
    return this.http.post(postUrl, fd);
  }

  getConfigDetails(url: any): Observable<any> {
    let gettUrl = this.catalogUrl + url;
    return this.http.get(gettUrl);
  }

  getJitoHeader(url: any): Observable<any> {
    let gettUrl = this.catalogUrl + url;
    // let gettUrl = 'https://stage-serv-catalog.sastasundar.com/' + url;
    return this.http.get(gettUrl);
  }

  getTotalAlterSave(url: any, fd: any) {
    let postUrl = this.catalogUrl + url;
    // let postUrl = 'https://stage-serv-catalog.sastasundar.com/' + url;
    return this.http.post(postUrl, fd);
  }

  getmedicineComparison(url: any, fd: any) {
    let getUrl = this.catalogUrl + url;
    // let getUrl = 'https://stage-serv-catalog.sastasundar.com/' + url;
    return this.http.get(getUrl, fd);
  }

  getCFHBalance(url: any) {
    let gettUrl = this.webcartUrl + url;
    return this.http.get(gettUrl);
  }

  // getHBDetails(path: any, pincode: any): Observable<any> {
  //   const headers = new HttpHeaders({
  //   'pincode' : pincode
  //   });
  //   let postUrl = this.catalogUrl + path;
  //   return this.http.post(postUrl,{}, {headers});
  // }

   getHBDetails(url: any): Observable<any> {
    let gettUrl = this.catalogUrl + url;
    return this.http.get(gettUrl);
  }
}
