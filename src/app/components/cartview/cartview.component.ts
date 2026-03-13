import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebEngageService } from '../../services/webengage.service';

@Component({
  selector: 'app-cartview',
  templateUrl: './cartview.component.html',
  styleUrl: './cartview.component.scss',
})
export class CartviewComponent implements OnInit {
  isLoggedIn: any = 'false';
  allItemsList: any = [];
  totalCount: any = 0;
  clickEventsubscription: Subscription;
  infoMsg: any = '';
  isLoading: boolean = false;

  @ViewChild('openLogin') openLogin: any;
  @ViewChild('closelogin') closelogin: any;
  @ViewChild('infoMdl') infoMdl: any;
  @ViewChild('psearch') psearch: any;
  @ViewChild(SearchComponent, { static: false })
  Searchchild!: SearchComponent;

  constructor(
    public CommonService: CommonService,
    private dbService: NgxIndexedDBService,
    private cookieService: CookieService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private webengageService: WebEngageService
  ) {
    this.clickEventsubscription = this.CommonService.getClickEvent().subscribe(() => {
        this.getAllRecord();
      }
    );
  }

  ngOnInit() {
    // debugger
    this.getAllRecord();
    this.isLoggedIn = this.cookieService.get('isLoggedIn');
  }

  getAllRecord() {
    // this.spinner.show();
    this.isLoading = true;
    this.infoMsg = '';
    this.dbService.getAll('cartItems').subscribe((res: any) => {
      console.log('all records from cartview', res);
      this.allItemsList = res;
      this.count();
      if (this.allItemsList.length == 0) {
        let d: Date = new Date();
        this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
        this.webengageService.trackEvent('Product Cart Viewed', { 'No. Of Products': this.totalCount, 'Total Amount': 0, 'Product Details': this.allItemsList });
      }
      this.isLoading = false
      this.spinner.hide();
    });
  }

  count() {
    this.infoMsg = '';
    this.dbService.count('cartItems').subscribe((res: any) => {
      // console.log('totaCount', res);
      this.totalCount = res;
    });
  }

  cartAddPlus(pro_id: any) {
    this.infoMsg = '';
    let id = `${pro_id}_0_0`;
    // console.log(id);
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
      // console.log('item by key path', item);
      let qty = item['ProductCount'];
      if (
        item['DosageRestriction'] == 0 ||
        (item['DosageRestriction'] != 0 && item['DosageRestriction'] > qty)
      ) {
        const updatedItem = { ...item, ProductCount: item['ProductCount'] + 1 };
        // console.log(updatedItem);
        this.updateById(updatedItem);
      } else {
        // alert('max limit reached');
        this.infoMsg = 'You can order ' + item['DosageRestriction'] + ' quantity of ' + item['ProductName'];
        this.infoMdl.nativeElement.click();       
      }
    });
  }

  cartAddMinus(pro_id: any) {
    this.infoMsg = '';
    let id = `${pro_id}_0_0`;
    // console.log(id);
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
      // console.log('item by key path', item);
      let qty = item['ProductCount'];
      if (qty > 1) {
        const updatedItem = { ...item, ProductCount: item['ProductCount'] - 1 };
        // console.log(updatedItem);
        this.updateById(updatedItem);
      } else {
        // alert('remove');
        this.deleteById(pro_id);
      }
    });
  }

  // getRecordByKeyPath(){
  //   let productId = 'abc123_1';
  //   this.dbService.getByKey('cartItems', productId).subscribe((item: any) => {
  //     console.log('item by key path',item);
  //   });
  // }

  updateById(tmp: any) {
    this.dbService.update('cartItems', tmp).subscribe((res: any) => {
      // console.log('storeData: ', res);
      if (res) {
        this.getAllRecord();
      }
    });
  }

  deleteById(pro_id: any) {
    let id = `${pro_id}_0_0`;
    let item = this.allItemsList.find((prd:any) => prd.ProductId == pro_id);
    this.dbService.deleteByKey('cartItems', id).subscribe((status: any) => {
      // console.log('Deleted?:', status);
      if (status == true) {
        this.removeWebEngage(item);
        this.getAllRecord();
        this.CommonService.sendClickEvent();
      } else {
        alert('some thing went wrong');
      }
    });
  }

  proceed() {
    // this.isLoggedIn = this.cookieService.get('isLoggedIn');
    // console.log(this.isLoggedIn)
    // this.isLoggedIn = 'false';
    if (this.isLoggedIn == 'true') {
      this.CommonService.cartSynchCall = true;
      // this.router.navigate(['ordermedicine'])
      this.router.navigate(['customercart']);
    } else {
      // this.router.navigate(['login']);
      this.openLogin.nativeElement.click();
    }
  }

  ngOnDestroy() {
    // if(this.isLoggedIn == 'false'){
    //   this.closelogin.nativeElement.click();
    // }
    this.clickEventsubscription.unsubscribe();
  }

  LoginModClose(){
    this.closelogin.nativeElement.click();
  }

  SearchOTCMEDProduct() {
    this.Searchchild.searchOTCMed();
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    })
  }

  removeWebEngage(data: any){
    let returnable : boolean= false;
    if(data.IsNonReturnable == 0){
      returnable = true;
    }else{
      returnable = false;
    }
    let dscPrcnt = `${data.DiscountPercent}%`;
    let webData = {
      'Product Name': data.ProductName,
      'Brand': data.MfgGroup,
      'Returnable': returnable,
      'Product Expiry Date': data.ExpiryDate,
      'Delivery Pincode': this.CommonService.PinCode,
      'Variant Selected': '',
      'Quantity': data.ProductCount,
      'Retail Price': data.OfferPrice,
      'Discount Percentage': dscPrcnt,
      'Price': data.ProductPrice,
      'Image': data.ProductImage,
    }
    this.webengageService.trackEvent('Product Removed From Cart', webData);
  }

  cartUpdateWebEngage(data: any){
    let list: any = []
    this.dbService.getAll('cartItems').subscribe((res: any) => {
      // console.log('all records', res);
      list = res;
    });
    let webData = {
      'No. Of Products': list.length,
      'Total Amount': 0,
      'Product Details': list,
    }
    this.webengageService.trackEvent('Product Cart Updated', webData);
  }

  
}
