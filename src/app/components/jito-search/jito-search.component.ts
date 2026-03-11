import { Component, HostListener, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-jito-search',
  templateUrl: './jito-search.component.html',
  styleUrl: './jito-search.component.scss'
})

export class JitoSearchComponent implements OnInit {

  searchText: any = '';
  // searchStart: boolean = false;
  searchList: any = [];
  typingTimer: any = 0;
  showSearchArea: boolean = false;
  activeSearchbtn: boolean = false;
  pageNo: any = 1;
  size: any = 100;
  uniqueSalts: any = [];
  isLoading: boolean = false;
  inside: boolean = false;
  addedInCart: any = [];

  constructor(
    private router: Router,
    public CommonService: CommonService,
    private cookieService: CookieService,
    private dbService: NgxIndexedDBService
  ) { }

  ngOnInit(): void {
    let d: Date = new Date();
    this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
    this.getAllRecord();
  }

  getAllRecord() {
    this.dbService.getAll('cartItems').subscribe((res: any) => {
      // console.log('all records', res);
      this.addedInCart = res;
    });
  }

  @HostListener("click")
  clicked() {
    this.inside = true;
    // console.log('inside') 
  }

  @HostListener("document:click")
  clickedOut() {
    // console.log('outside') 
    if (!this.inside) {
      this.cleareSearch()
    }
    this.inside = false;
  }

  onSearch() {
    // console.log('Search text:', this.searchText);
    let timenow = new Date().getTime();
    let pincode = this.CommonService.PinCode;
    let werehouseId = this.CommonService.WHId;
    let panindia = this.CommonService.IsPanIndia;
    let token = this.CommonService.Token;
    let device = '';
    // this.searchStart = true;
    let searchUrl = `product_list_v2?q=${this.searchText}&page=${this.pageNo}&size=${this.size}&ptype=P&token=${token}&wh=${werehouseId}&panindia=${panindia}&pincode=${pincode}&strict_match=1&mtype=&includeGiftable=0&include_discontinued=0&timestamp=${timenow}&format=2`;
    // Implement your search logic here;
    // let res: any = { "total_match": 8, "page_total": 8, "items": [{ "ServicePreparation": "Over night fasting", "Permalink": "https:\/\/stage.sastasundar.com\/test\/glucose-fasting", "DiscPercent": 0, "ReportPeriod": 0, "IsActive": true, "IsPopular": true, "IsHomeCollectionAvailable": true, "IsRptAvlOnline": true, "Fees": 70, "PackageServices": [], "ServiceImage": null, "DiscAmount": 0, "ServiceId": 146, "LabId": "38", "IsPackage": false, "ServiceName": "GLUCOSE FASTING", "TestCase": "gpl|test", "ServiceDesc": "GLUCOSE FASTING", "ServiceText": null, "OfferFees": 70, "HealthProfile": ["Diabetes", "High Blood Pressure", "Kidney Problem"], "HomeCollectionText": "Home Collection Available", "ReportText": "Online Report - Same Day" }, { "ServicePreparation": "2 hrs post heavy meal from starting time of food intake", "Permalink": "https:\/\/stage.sastasundar.com\/test\/glucose-pp", "DiscPercent": 0, "ReportPeriod": 0, "IsActive": true, "IsPopular": true, "IsHomeCollectionAvailable": true, "IsRptAvlOnline": true, "Fees": 70, "PackageServices": [], "ServiceImage": null, "DiscAmount": 0, "ServiceId": 148, "LabId": "38", "IsPackage": false, "ServiceName": "GLUCOSE PP", "TestCase": "gpl|test", "ServiceDesc": "GLUCOSE PP", "ServiceText": null, "OfferFees": 70, "HealthProfile": ["Diabetes", "High Blood Pressure", "Kidney Problem"], "HomeCollectionText": "Home Collection Available", "ReportText": "Online Report - Same Day" }, { "ServicePreparation": "No Preparation Needed", "Permalink": "https:\/\/stage.sastasundar.com\/test\/glucose-random", "DiscPercent": 0, "ReportPeriod": 0, "IsActive": true, "IsPopular": true, "IsHomeCollectionAvailable": true, "IsRptAvlOnline": true, "Fees": 70, "PackageServices": [], "ServiceImage": null, "DiscAmount": 0, "ServiceId": 149, "LabId": "38", "IsPackage": false, "ServiceName": "GLUCOSE RANDOM", "TestCase": "gpl|test", "ServiceDesc": "GLUCOSE RANDOM", "ServiceText": null, "OfferFees": 70, "HealthProfile": ["Arthritis"], "HomeCollectionText": "Home Collection Available", "ReportText": "Online Report - Same Day" }, { "ServicePreparation": "2 hrs post intake of 75gm Glucose from starting time", "Permalink": "https:\/\/stage.sastasundar.com\/test\/75gm-glucose-pp", "DiscPercent": 0, "ReportPeriod": 0, "IsActive": true, "IsPopular": true, "IsHomeCollectionAvailable": true, "IsRptAvlOnline": true, "Fees": 70, "PackageServices": [], "ServiceImage": null, "DiscAmount": 0, "ServiceId": 7, "LabId": "38", "IsPackage": false, "ServiceName": "75GM GLUCOSE (PP)", "TestCase": "gpl|test", "ServiceDesc": "75GM GLUCOSE (PP)", "ServiceText": null, "OfferFees": 70, "HealthProfile": [], "HomeCollectionText": "Home Collection Available", "ReportText": "Online Report - Same Day" }, { "ServicePreparation": "1 fasting blood, 3 pp blood, or as directed by physician", "Permalink": "https:\/\/stage.sastasundar.com\/test\/glucose-tolerance-testgtt", "DiscPercent": 0, "ReportPeriod": 0, "IsActive": true, "IsPopular": false, "IsHomeCollectionAvailable": false, "IsRptAvlOnline": true, "Fees": 250, "PackageServices": [], "ServiceImage": null, "DiscAmount": 0, "ServiceId": 151, "LabId": "38", "IsPackage": false, "ServiceName": "GLUCOSE TOLERANCE TEST(GTT)", "TestCase": "gpl|test", "ServiceDesc": "GLUCOSE TOLERANCE TEST(GTT)", "ServiceText": null, "OfferFees": 250, "HealthProfile": [], "HomeCollectionText": "", "ReportText": "Online Report - Same Day" }, { "ServicePreparation": "Blood will be taken at 1 hr from drinking of 50gms glucose.", "Permalink": "https:\/\/stage.sastasundar.com\/test\/glucose-challenge-test-gct-50gms", "DiscPercent": 0, "ReportPeriod": 0, "IsActive": true, "IsPopular": null, "IsHomeCollectionAvailable": true, "IsRptAvlOnline": true, "Fees": 70, "PackageServices": [], "ServiceImage": null, "DiscAmount": 0, "ServiceId": 4632, "LabId": "38", "IsPackage": false, "ServiceName": "GLUCOSE CHALLENGE TEST (GCT) 50 GMS", "TestCase": "gpl|test", "ServiceDesc": "GLUCOSE CHALLENGE TEST (GCT) 50 GMS", "ServiceText": null, "OfferFees": 70, "HealthProfile": [], "HomeCollectionText": "Home Collection Available", "ReportText": "Online Report - Same Day" }, { "ServicePreparation": "For this\u00a0test, patient has to take 75gms (glucose), blood will be drawn one hour from having the drink or as instructed by doctor..", "Permalink": "https:\/\/stage.sastasundar.com\/test\/glucose-challenge-test-gct-75-gms", "DiscPercent": 0, "ReportPeriod": 0, "IsActive": true, "IsPopular": null, "IsHomeCollectionAvailable": true, "IsRptAvlOnline": true, "Fees": 70, "PackageServices": [], "ServiceImage": null, "DiscAmount": 0, "ServiceId": 5626, "LabId": "38", "IsPackage": false, "ServiceName": "GLUCOSE CHALLENGE TEST (GCT) 75 GMS", "TestCase": "gpl|test", "ServiceDesc": "GLUCOSE CHALLENGE TEST (GCT) 75 GMS", "ServiceText": null, "OfferFees": 70, "HealthProfile": [], "HomeCollectionText": "Home Collection Available", "ReportText": "Online Report - Same Day" }, { "ServicePreparation": "10 to 12 Hrs Fasting", "Permalink": "https:\/\/stage.sastasundar.com\/health-packages\/diabetic-package-home-collection", "DiscPercent": 63.55, "ReportPeriod": 0, "IsActive": true, "IsPopular": false, "IsHomeCollectionAvailable": true, "IsRptAvlOnline": true, "Fees": 3155, "PackageServices": [{ "ServiceName": "COMPLETE HAEMOGRAM", "ServiceDesc": "", "ServiceId": 79 }, { "ServiceName": "CREATININE", "ServiceDesc": "", "ServiceId": 86 }, { "ServiceName": "GLUCOSE FASTING", "ServiceDesc": "", "ServiceId": 146 }, { "ServiceName": "GLUCOSE PP", "ServiceDesc": "", "ServiceId": 148 }, { "ServiceName": "GLYCATED HB (HBA1C)", "ServiceDesc": "", "ServiceId": 152 }, { "ServiceName": "LIPID PROFILE", "ServiceDesc": "", "ServiceId": 182 }, { "ServiceName": "SGOT(AST)", "ServiceDesc": "", "ServiceId": 242 }, { "ServiceName": "SGPT(ALT)", "ServiceDesc": "", "ServiceId": 243 }, { "ServiceName": "UREA", "ServiceDesc": "", "ServiceId": 271 }, { "ServiceName": "ALPHA FETO PROTEIN(AFP) MATERNAL MARKER", "ServiceDesc": "", "ServiceId": 688 }, { "ServiceName": "URINE RE", "ServiceDesc": "", "ServiceId": 284 }], "ServiceImage": "Diabetic-Package---Home-Collection.jpg", "DiscAmount": 2005, "ServiceId": 555, "LabId": "38", "IsPackage": true, "ServiceName": "Diabetic Package - Home Collection", "TestCase": "gpl|test", "ServiceDesc": "Diabetic Package - Home Collection", "ServiceText": "All samples should be given in same day", "OfferFees": 1150, "HealthProfile": [], "HomeCollectionText": "Home Collection Available", "ReportText": "Online Report - Same Day" }], "fz": 0 };

    this.CommonService.getAlternativeList(searchUrl).subscribe((res: any) => {
      // console.log(res)
      if (res) {
        let data: any = res.items;
        if (data.length > 0) {
          // this.uniqueSalts = [...new Set(data.map((item: any) => item.Salts['Name']))];
          let seen: any = {};
          let dist: any = [];

          data.forEach((item: any) => {
            let salt = item.Salts;
            if (salt && salt.Id) {
              if (!seen[salt.Id]) {
                dist.push(salt);
                seen[salt.Id] = true;
              }
            }
          });
          this.uniqueSalts = dist;
          // console.log(this.uniqueSalts)
          this.searchList = data;
          this.isLoading = false
        }else{
          this.searchList = [];
          this.isLoading = false;
        }
      } else {
        this.searchList = [];
        this.isLoading = false;
      }
    })



    // this.searchStart = false;
  }

  showSearcArea() {
    if (this.showSearchArea == false) {
      this.showSearchArea = true;
    }
  }


  onSearchChange(evnt: any) {
    let str = evnt.target.value;
    clearTimeout(this.typingTimer);
    if (str.length > 2) {
      this.isLoading = true;
      this.searchText = str;
      this.showSearcArea();
      this.typingTimer = setTimeout(() => {
        this.onSearch();
      }, 300);
    } else {
      // this.searchStart = false;
      this.isLoading = false;
      this.showSearchArea = false;
      this.searchList = [];

    }
    // this.searchText = str;
    // this.showSearchArea = true;
    // if (str.length == 0) {
    //   this.searchStart = false;
    //   this.searchList = [];
    // }
  }

  cleareSearch() {
    this.searchText = '';
    // this.searchStart = false;
    this.searchList = [];
    this.showSearchArea = false;
    this.isLoading = false;
  }

  onselectItem(item: any) {
    // console.log(item);
    if (item.IsGenericNew == 1) {
      this.router.navigate(['/generic'], { queryParams: { id: item.ProductId, name: item.DisplayName } });
    } else {
      this.router.navigate(['/branded'], { queryParams: { id: item.ProductId, name: item.DisplayName } });
    }
  }

  onSaltClick(salt: any) {
    // console.log(salt);
    this.router.navigate(['/saltcomposition'], { queryParams: { salt: salt.Name } });
  }

  onKeydown() {
    clearTimeout(this.typingTimer);
  }

  gotoJITO(){
    window.open('https://jitohealth.com', '_blank');
  }

}
