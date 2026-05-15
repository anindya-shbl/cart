import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { map, take, timer } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { WebEngageService } from '../../services/webengage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted: boolean = false;
  recaptcha: any = '';

  otpChecked: boolean = false;
  otpSec: boolean = false;
  otpValue: any = '';

  secondsLeft: any = 0;
  showTimer: boolean = false;
  isLoading: boolean = false;
  rspMsg: any = '';
  errorMsg: any = '';
  isResendOTP: any = '';

  cpatchaLoading: boolean = false;

  @ViewChild('login_otp') login_otp: any = '';
  @Output() closeLogin = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    public CommonService: CommonService,
    private formBuilder: FormBuilder,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private webengageService: WebEngageService
  ) {}

  ngOnInit(): void {
    // let checkLogIn = this.cookieService.get('isLoggedIn');
    // if(checkLogIn == 'true'){
    //   this.router.navigate(['ordermedicine']);
    // }else{
    // this.chkloggingStatus();
    this.generateform();
    this.ReCaptcha();
    //  }
  }

  generateform() {
    this.loginForm = this.formBuilder.group({
      email_mobileno: ['', Validators.required],
      password: [''],
      Login_Captcha: ['', Validators.required],
      // loginwithotp: [false],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  chkloggingStatus() {
    this.authService.getLogindata('users/dochkLogging').subscribe((res: any) => {
        // console.log(res);
        res = {"data":{"UserId":"800027","UserCode":"SSPLWBC00800027","EmailId":"anindyab30@gmail.com","MobileNo":"9836370209","OTP":null,"NeedToResetPass":"N","ActiveStatus":1,"Status":"Y","FName":"Anindya","MName":null,"LName":"Bhattacharya","CustFullName":"Anindya Bhattacharya","DOB":"1986-11-10","Age":40,"Gender":"M","MaritalStatus":null,"AnivDate":null,"WalletVal":null,"RewardPoint":null,"SSCurrencyValue":".00","Subscribed":null,"HealthBuddyId":"888832","HealthBuddyCode":"HBWHT888832","HealthBuddyName":"Paras Medicos","HealthBuddyImage":null,"IsDeleted":0,"CreatedDate":"2025-03-05 15:34:03.977","ModificationReason":"<br>------------------<br> Cust Mapped with Calcutta Pharmacy-965185-As mail recv fr Manoj ji on 14.05.25<br>------------------<br> <br>------------------<br> Cust TRFD to Calcutta Pharmacy-965185-As mail recv fr Manoj ji on 05.08.25<br>------------------<br> as per mail from Abhijit<br>------------------<br> updated on::Oct 14 2025  2:14PM<br>------------------<br> Cust TRFD to Paras Medicos-As mail recv fr Manoj ji on 01.12.25<br>------------------<br> Cust TRFD to Myjoy Pharma_RSPL Hub Srirampur-As mail recv fr Manoj ji on 24.02.26<br>------------------<br> Cust TRFD to Paras Medicos-As mail recv fr Manoj ji on 07.03.26<br>------------------<br> updated on::Mar 18 2026 12:08PM<br>------------------<br> Cust TRFD to Paras Medicos_As mail recv fr Manoj ji on 27.03.26","UpdatedDate":"2026-05-05 17:58:27.223","RegisteredCity":"Hooghly","RegisteredStateCode":"WB","CreatedBy":"800027","RegisteredStateName":"West Bengal","RM":null,"ReferredBy":null,"GroupId":null,"GroupName":null,"RegistrationSourceId":null,"EnquirySourceId":null,"EnquirySourceOther":null,"ProfileId":null,"CustomerCategory":"Silver","CustGSTIN":null,"CustGSTINDate":null,"WellnessBuddyId":null,"WarehouseId":1,"WarehouseLocation":"Kolkata","AlternativeContactNo":null,"CustAffiliateMasId":0,"AlternativeEmailId":"anindyab30@gmail.com","TotalSavings":0,"XplorPoint":".00","EmailAWSStatus":null,"EmailAWSStatusUpdateDate":null,"PreviousTransactionCount":8,"EmailAWSStatusUpdateCNT":null,"IsRealCustomer":0,"IsEmailVerified":null,"IsPrimaryUncontactable":null,"IsAltUncontactable":null,"CardId":null,"CardType":null,"HBContactNo":"9330920025","RazorPayUserId":null,"LabCartPin":null,"EncodedUserId":"o5i9l5il75ili5ilo5iil5i848i","downtimeFlg":0,"downtimemsg":"We\u2019re updating GST% and MRP for your benefit. Checkout will be unavailable from 5 AM \u2013 8 AM on 21st Sept. Please shop again after 8 AM to enjoy updated rates."},"message":"success","response_code":"0","location":{"UserLocationPincode":"700156","CityName":"Kolkata","PanIndia":"N","WarehouseId":"1","LocationSkipped":"0","StateCode":"WB","StateId":"35","StateName":"West Bengal","CityId":"806","IsLab":0}};
        this.isLoading = false;
        // if(res){
        if (res && res['response_code'] == 0) {
          // alert('login')
          this.cookieService.set('isLoggedIn', 'true');

          this.CommonService.UserName = res['data']['FName'];
          this.CommonService.Mobile = res['data']['MobileNo'];
          this.CommonService.isDownTime = res['data']['downtimeFlg'] !== undefined ? res['data']['downtimeFlg'] : 0;
          this.CommonService.downTimeMsg = res['data']['downtimemsg'] !== undefined ? res['data']['downtimemsg'] : '';
          this.CommonService.Warehouse = res['location']['HealthBuddyName'];

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
            this.CommonService.cartSynchCall = true;
            this.closeLogin.emit();
            this.router.navigate(['customercart']);
            this.webengageService.identifyUser(res)
          } else {
            // alert('not login');
            // this.cookieService.delete('isLoggedIn');
            this.router.navigate(['ordermedicine']);
          }
          let d: Date = new Date();
          this.cookieService.set(
            'cartsynch',
            '0',
            d.getTime() + 86400 * 30,
            '/'
          ); // cookie set for cartsynch
          // this.isTrue = true;
        }
        // }
        this.onReset();
      });
  }

  ReCaptcha() {
    this.cpatchaLoading = true;
    this.authService.getCaptcha('users/generateCaptcha').subscribe((response: any) => {
      if (response['status'] == 200) {
        this.recaptcha = response['data']['image'];
        this.cpatchaLoading = false;
        this.f['Login_Captcha'].reset();
        // this.recaptcha = this.domSanitizer.bypassSecurityTrustUrl(url)
        // console.log(this.recaptcha);
      }
    });
  }

  setLoginType(evnt: any) {
    if (evnt.target.checked == true) {
      this.f['password'].reset();
      this.otpChecked = true;
    }
  }

  onPasswordvalChange(val: any) {
    let value = val.target.value.replace(/\s/g, '');
    if (value.length > 0) {
      this.otpChecked = false;
    } else {
      this.otpChecked = true;
    }
  }

  onSubmit() {
    // this.startTimer()

    this.submitted = true;
    this.otpSec = false;
    this.otpValue = '';

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.isLoading = true;

      // if (this.loginForm.value.password != '') {
      //   this.loginWithPassword();
      // } else {
      //   this.resendOTP();
      // }

      this.resendOTP();
    }
  }

  loginWithPassword() {
    this.otpSec = false;
    this.otpValue = '';
    let fd = new FormData();
    fd.append('emailmobileno', this.loginForm.value.email_mobileno);
    fd.append('Login_Captcha', this.loginForm.value.Login_Captcha);
    fd.append('password', this.loginForm.value.password);

    this.authService.doLogin('users/userLogin', fd).subscribe((data: any) => {
      // console.log('login status', data);
      if (data['response_code'] == 0) {
        this.chkloggingStatus();
      }
    });
  }

  resendOTP() {
    // this.countDown = 0;
    // this.counter = 25;
    // this.tick = 1000;
    this.errorMsg = '';
    let captcha = '';
    captcha = this.loginForm.value.Login_Captcha.toUpperCase();
    this.otpValue = '';
    let fd = new FormData();
    fd.append('mobile', this.loginForm.value.email_mobileno.toString());
    fd.append('Login_Captcha', captcha);
    this.authService.getOTP('users/regenerateOtp', fd).subscribe((data: any) => {
        if (data['response_code'] == 0) {
          this.otpSec = true;
          this.isLoading = false;
          this.rspMsg = data['message'];
          this.startTimer();
          this.isResendOTP = false;
        } else {
          this.isLoading = false;
          // alert(data['message']);
          this.errorMsg = data['message'];
        }
    });
  }

  regenerateOTP(){
    let currentMob = this.loginForm.value.email_mobileno 
    this.onReset();
    this.isResendOTP = true;
    this.loginForm.patchValue({ email_mobileno: currentMob });
    // this.ReCaptcha();
  }

  veryfyOTP() {
    this.isLoading = true;
    this.errorMsg = '';
    let fd = new FormData();
    fd.append('mobile', this.loginForm.value.email_mobileno.toString());
    fd.append('otp', this.otpValue);
    this.authService.verifyOTP('users/verifyOtp', fd).subscribe((data: any) => {
      this.showTimer = false;
      if (data['response_code'] == 0) {
        this.chkloggingStatus();
      } else {
        this.isLoading = false;
        // alert(data['message']);
        this.errorMsg = data['message'];
      }
    });
  }

  onReset() {
    this.loginForm.reset();
    this.submitted = false;
    this.recaptcha = '';

    this.otpChecked = false;
    this.otpSec = false;
    this.otpValue = '';

    this.secondsLeft = 0;
    this.showTimer = false;
    this.isLoading = false;
    this.rspMsg = '';
    this.errorMsg = '';
    this.isResendOTP = false;
    this.ReCaptcha();
  }

  startTimer() {
    this.showTimer = true;
    const countdown$ = timer(0, 1000).pipe(
      take(30),
      map((secondsElapsed) => 29 - secondsElapsed)
    );

    countdown$.subscribe((secondsLeft) => {
      this.secondsLeft = secondsLeft;
      if (this.secondsLeft == 0) {
        this.showTimer = false;
      }
    });
  }

  //   signInForm = new FormGroup({
  //     email: new FormControl<string>('', [Validators.required]),
  // });

  // constructor(private authService: AuthService) { }

  // signIn() {
  //     if (this.signInForm.valid) {
  //         this.authService.signIn(this.signInForm.value.email as string);
  //     }
  // }

  changeNumber(){
    this.onReset();
    // this.ReCaptcha();
  }

  numCheck(event: any) {
    return event.charCode == 8 || event.charCode == 0 || event.charCode == 13
      ? null
      : event.charCode >= 48 && event.charCode <= 57;
  }
}
