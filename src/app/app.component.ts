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
    this.chkloggingStatus();
  }

  chkloggingStatus() {
    console.log('chkloggingStatus from app component');
    // let  res: any ={"data":{"UserId":468326,"UserCode":"SSPLWBC00468326","EmailId":"asarkar@sastasundar.com","MobileNo":7003477290,"OTP":null,"NeedToResetPass":"N","ActiveStatus":1,"Status":"Y","FName":"Avik","MName":"","LName":"","CustFullName":null,"DOB":null,"Age":null,"Gender":null,"MaritalStatus":null,"AnivDate":null,"WalletVal":null,"RewardPoint":null,"SSCurrencyValue":0,"Subscribed":null,"HealthBuddyId":145044,"HealthBuddyCode":"WB174","HealthBuddyName":"Healthbuddy Harsh Enterprises","HealthBuddyImage":"1435567461IMG-20150629-WA0024.jpg","IsDeleted":0,"CreatedDate":"2024-07-17 14:49:37.607","ModificationReason":null,"UpdatedDate":"2024-10-18 15:38:30.680","RegisteredCity":"Kolkata","RegisteredStateCode":"WB","CreatedBy":468326,"RegisteredStateName":"West Bengal","RM":null,"ReferredBy":null,"GroupId":null,"GroupName":null,"RegistrationSourceId":null,"EnquirySourceId":null,"EnquirySourceOther":null,"ProfileId":null,"CustomerCategory":"Silver","CustGSTIN":null,"CustGSTINDate":null,"WellnessBuddyId":null,"WarehouseId":1,"WarehouseLocation":"Kolkata","AlternativeContactNo":null,"CustAffiliateMasId":0,"AlternativeEmailId":null,"TotalSavings":0,"XplorPoint":0,"EmailAWSStatus":null,"EmailAWSStatusUpdateDate":null,"PreviousTransactionCount":null,"EmailAWSStatusUpdateCNT":null,"IsRealCustomer":0,"IsEmailVerified":0,"IsPrimaryUncontactable":null,"IsAltUncontactable":null,"CardId":null,"CardType":null,"HBContactNo":"8017938435 \/ 033 25782301","EncodedUserId":"759956tl76ti85988597o6tl547"},"message":"success","response_code":"1","location":{"UserLocationPincode":"","CityName":"Others","PanIndia":"Y","WarehouseId":"1","LocationSkipped":1,"StateCode":"OT","StateId":"37","StateName":"Others","CityId":"6310","IsLab":null}}
    this.authService.getLogindata('users/dochkLogging').subscribe((res: any) => {
      // console.log(res);
      res = {"data":{"UserId":"800027","UserCode":"SSPLWBC00800027","EmailId":"anindyab30@gmail.com","MobileNo":"9836370209","OTP":null,"NeedToResetPass":"N","ActiveStatus":1,"Status":"Y","FName":"Anindya","MName":null,"LName":"Bhattacharya","CustFullName":"Anindya Bhattacharya","DOB":"1986-11-10","Age":40,"Gender":"M","MaritalStatus":null,"AnivDate":null,"WalletVal":null,"RewardPoint":null,"SSCurrencyValue":".00","Subscribed":null,"HealthBuddyId":"1701622","HealthBuddyCode":"HBWHT1701622","HealthBuddyName":"Myjoy Pharmaceuticals Private Limited","HealthBuddyImage":null,"IsDeleted":0,"CreatedDate":"2025-03-05 15:34:03.977","ModificationReason":"<br>------------------<br> Cust Mapped with Calcutta Pharmacy-965185-As mail recv fr Manoj ji on 14.05.25<br>------------------<br> <br>------------------<br> Cust TRFD to Calcutta Pharmacy-965185-As mail recv fr Manoj ji on 05.08.25<br>------------------<br> as per mail from Abhijit<br>------------------<br> updated on::Oct 14 2025  2:14PM<br>------------------<br> Cust TRFD to Paras Medicos-As mail recv fr Manoj ji on 01.12.25<br>------------------<br> Cust TRFD to Myjoy Pharma_RSPL Hub Srirampur-As mail recv fr Manoj ji on 24.02.26<br>------------------<br> Cust TRFD to Paras Medicos-As mail recv fr Manoj ji on 07.03.26<br>------------------<br> updated on::Mar 18 2026 12:08PM<br>------------------<br> Cust TRFD to Paras Medicos_As mail recv fr Manoj ji on 27.03.26<br>------------------<br> updated on::Jul  2 2026 12:28PM<br>------------------<br> Cust TRFD to Paras Medicos_Mail recv fr Manoj ji on 20.07.26<br>------------------<br> updated on::Aug  1 2026  4:14PM","UpdatedDate":"2026-10-12 11:13:57.770","RegisteredCity":"Hooghly","RegisteredStateCode":"WB","CreatedBy":"800027","RegisteredStateName":"West Bengal","RM":null,"ReferredBy":null,"GroupId":null,"GroupName":null,"RegistrationSourceId":null,"EnquirySourceId":null,"EnquirySourceOther":null,"ProfileId":null,"CustomerCategory":"Silver","CustGSTIN":null,"CustGSTINDate":null,"WellnessBuddyId":null,"WarehouseId":1,"WarehouseLocation":"Kolkata","AlternativeContactNo":null,"CustAffiliateMasId":0,"AlternativeEmailId":"anindyab30@gmail.com","TotalSavings":0,"XplorPoint":".00","EmailAWSStatus":null,"EmailAWSStatusUpdateDate":null,"PreviousTransactionCount":24,"EmailAWSStatusUpdateCNT":null,"IsRealCustomer":0,"IsEmailVerified":null,"IsPrimaryUncontactable":null,"IsAltUncontactable":null,"CardId":null,"CardType":null,"HBContactNo":"7044468893","RazorPayUserId":null,"LabCartPin":null,"EncodedUserId":"9o95lo87oo875o877o89oo94oi9","downtimeFlg":0,"downtimemsg":"We\u2019re updating GST% and MRP for your benefit. Checkout will be unavailable from 5 AM \u2013 8 AM on 21st Sept. Please shop again after 8 AM to enjoy updated rates."},"message":"success","response_code":"0","location":{"UserLocationPincode":"700156","CityName":"Kolkata","PanIndia":"N","WarehouseId":"1","LocationSkipped":"0","StateCode":"WB","StateId":"35","StateName":"West Bengal","CityId":"806","IsLab":0}};
      console.log(res);
      // res['response_code'] = 1;
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
}
