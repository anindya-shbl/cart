import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // ============= live ==========================
    // public webcartUrl = 'https://sastasundar.com/index.php/webapi/';

    // ============= development ==========================
    // public webcartUrl = 'https://stage.sastasundar.com/index.php/webapi/';

    // ============= local ==========================
    public webcartUrl = 'http://192.168.5.236:8081/sspl_com/index.php/webapi/';

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
}
