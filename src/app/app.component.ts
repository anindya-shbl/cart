import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CommonService } from './services/common.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Dashboard_Web';
  cookieValue: any = '';

  loading: boolean = true;

  constructor(
    private dbService: NgxIndexedDBService,
    private cookieService: CookieService,
    private authService: AuthService,
    public CommonService: CommonService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    // this.cookieService.set('isLoggedIn', 'false');
  }

  ngOnInit(): void {
    this.spinner.show();
    this.loading = true;
    // this.cookieService.set('isLoggedIn', 'false');
    this.setConfig();
    this.setLoyaltyConfig();
    this.chkloggingStatus();
    this.getLoyaltyConfig();
    this.getLoyaltyRate();
  }

  chkloggingStatus() {
    console.log('chkloggingStatus from app component');
    this.authService.getLogindata('users/dochkLogging').subscribe((res: any) => {
      console.log(res);
      if (res && res['response_code'] == 0) {       
        this.cookieService.set('isLoggedIn', 'true');
        this.CommonService.UserName = res['data']['FName'];
        this.CommonService.Mobile = res['data']['MobileNo'];
        this.CommonService.EmailId = res['data']['EmailId'];
        this.CommonService.Token = res['data']['EncodedUserId'];
        this.CommonService.Warehouse = res['location']['HealthBuddyName'];
        this.CommonService.isDownTime = res['data']['downtimeFlg'] !== undefined ? res['data']['downtimeFlg'] : 0;
        this.CommonService.downTimeMsg = res['data']['downtimemsg'] !== undefined ? res['data']['downtimemsg'] : '';

        if (res['location'] != undefined) {
          this.CommonService.PinCode = res['location']['UserLocationPincode'];
          this.CommonService.WHId = res['location']['WarehouseId'];
          this.CommonService.PanIndiaStateName = res['location']['StateName'];
          this.CommonService.PanIndiaStateCode = res['location']['StateCode'];
          this.CommonService.PanIndiaCityID = res['location']['CityId'];
          this.CommonService.PanIndiaCityName = res['location']['CityName'];

          if (
            res['location']['PanIndia'] == 0 ||
            res['location']['PanIndia'] == 1
          ) {
            this.CommonService.IsPanIndia = res['location']['PanIndia'];
          } else {
            if (res['location']['PanIndia'] == 'Y') {
              this.CommonService.IsPanIndia = 1;
            } else {
              this.CommonService.IsPanIndia = 0;
            }
          }
        }
        this.loading = false;
        this.spinner.hide();
        // this.router.navigate(['customercart']);
      } else {
        // alert('not login');
        this.cookieService.set('isLoggedIn', 'false');

        let PinCode = this.cookieService.get('UserLocationPincode');
        let WHId = this.cookieService.get('WHId');
        let isPanIndia = this.cookieService.get('IsPanIndia');
        let PanIndiaStateName = this.cookieService.get('PanIndiaStateName');
        let PanIndiaStateCode = this.cookieService.get('PanIndiaStateID');
        let PanIndiaCityID = this.cookieService.get('PanIndiaCityID');
        let PanIndiaCityName = this.cookieService.get('PanIndiaCityName');

        if(isPanIndia == 'Y'){
          this.CommonService.IsPanIndia = 1;
        }else{
          this.CommonService.IsPanIndia = 0;
        }
        if (WHId == null || WHId == undefined) {
          WHId = '1';        
        }

        this.CommonService.PinCode = PinCode;
        this.CommonService.WHId = WHId;
        this.CommonService.PanIndiaStateName = decodeURI(PanIndiaStateName);
        this.CommonService.PanIndiaStateCode = decodeURI(PanIndiaStateCode);;
        this.CommonService.PanIndiaCityID = PanIndiaCityID;
        this.CommonService.PanIndiaCityName = decodeURI(PanIndiaCityName);

        this.loading = false;
        this.spinner.hide();
        // this.router.navigate(['ordermedicine']);
      }
    });
  }

  setConfig(){
    this.CommonService.getConfigDetails('home/getconfig').subscribe((res: any) => {
      if(res && res['msgcode'] == 1){
        this.CommonService.ConfigData = res['results']
      }
    })
  }

  setLoyaltyConfig(){
    this.CommonService.getConfigDetails('home/getLoyaltyConfig').subscribe((res: any) => {
      if(res && res['msgcode'] == 1){
        this.CommonService.LoyaltyConfigData = res['results']
      }
    })
  }

  getLoyaltyConfig() {
    this.authService.getLoyaltyInterface('loyalty/get_loyalty_config').subscribe((res: any) => {
      if (res && res['response_code'] == 1) {
        this.authService.LoyaltyConfig = res['data'];
        // console.log("this.authService.LoyaltyConfig", this.authService.LoyaltyConfig);
        // this.authService.RedemptionEnabled = this.authService.LoyaltyConfig.find((c:any) =>c.config_key === "REDEMPTION_ENABLED").config_value;
        // console.log("this.authService.RedemptionEnabled",this.authService.RedemptionEnabled);

        // Returns the config_value string for a key, or undefined if the key is missing
        const getConfigValue = (key: string): string | undefined =>
          this.authService.LoyaltyConfig.find((c: any) => c.config_key === key)?.config_value;

        // config_value is a string ("1"), so convert before using it
        this.authService.RedemptionEnabled = getConfigValue('REDEMPTION_ENABLED') === '1';
        this.authService.RedemptionCapPercent = Number(getConfigValue('REDEMPTION_CAP_PERCENT') ?? 0);
      }
    })
  }

  getLoyaltyRate() {
    this.authService.getLoyaltyInterface('loyalty/get_loyalty_rate').subscribe((res: any) => {
      if (res && res['response_code'] == 1) {
        const rateMap: Record<string, { rate_percent: number; redeemable: number }> =
          Object.fromEntries(
            res['data'].map((c: any) => [
              c.category_label,
              { rate_percent: Number(c.rate_percent), redeemable: Number(c.redeemable) }
            ])
          );
        this.authService.LoyaltyConfigData = rateMap;
        // rateMap.GENERIC.rate_percent === 10
        // rateMap.BRANDED.redeemable === 0
      }
      console.log("this.authService.LoyaltyConfigData",this.authService.LoyaltyConfigData);
    })
  }
}
