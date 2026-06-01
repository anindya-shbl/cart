import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UploadImagesService } from '../../services/upload-images.service';
import { SearchComponent } from '../search/search.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebEngageService } from '../../services/webengage.service';
import { ToastrService } from 'ngx-toastr';
import { animate, state, style, transition, trigger } from '@angular/animations';


declare var Razorpay: any;
declare function onScriptLoad(txnToken: any, orderId: any, amount: any): any;

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.scss',
  animations: [
    trigger('slideInOut', [
      state('in', style({ opacity: 1, height: '*', visibility: 'visible' })),
      state('out', style({ opacity: 0, height: '0px', visibility: 'hidden' })),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out'))
    ])
  ]
})
export class PlaceOrderComponent implements OnInit {
  isLoggedIn: any = '';
  msgText: any = '';
  allItemsList: any = [];
  totalCount: any = 0;
  finalList: any = [];
  headerDetails: any = [];
  outOfStockList: any = [];
  couponList: any = [];
  savedPrscList: any = [];
  savedPrscListForPet: any = [];
  saveForLaterList: any = [];
  prscFiles: any = [];
  selectedPrsc: any = [];
  savedPrscFile: any = [];
  prscImages: any = [];
  
  // Pet prescription files (separate tracking)
  prscFilesPet: any = [];
  selectedPrscPet: any = [];
  savedPrscFilePet: any = [];
  prscImagesPet: any = [];
  HB_Details: any = [];
  ReqPrscList: any = [];
  slicedArray: any = [];
  UploadedPrscList: any = []; 
  UploadedPrscListForPet: any = [];
  showImgPath: any = '';
  showMoreBtn: boolean = false;
  totalSaving: any = 0;
  shippingId: any = 0;
  billingId: any = 0;
  AppliedCouponFlg: any = false;

  freeShippingChage: any = '';
  freeCourierChage: any = '';
  minOnlinePayVal: any = '';

  shippingFlg: boolean = false;
  shippingContinue: boolean = false;
  PrescUpldFlg: boolean = false;
  PrescUpldFlgHuman: boolean = false;      // Human products needing prescription
  PrescUpldFlgPet: boolean = false;        // Pet products needing prescription
  ReqPrscListHuman: any = [];              // Human prescription required items
  ReqPrscListPet: any = [];                // Pet prescription required items
  slicedArrayHuman: any = [];              // Human - first 3 items
  slicedArrayPet: any = [];                // Pet - first 3 items
  hasHumanProducts: boolean = false;       // Cart has human products
  hasPetProducts: boolean = false;         // Cart has pet/animal products
  paymentFlg: boolean = false;
  paymentContinue: boolean = false;

  AddressForm!: FormGroup;
  EmailIdForm!: FormGroup;
  AddCardForm!: FormGroup;
  submitted: boolean = false;
  emailsubmit: boolean = false;
  cfhsubmit: boolean = false;
  serviceAreaMsg: boolean = false;
  isLoading: boolean = false;
  modalloader: boolean = false;
  addressList: any = [];
  state_city: any = '';
  selectedAddress: any = '';
  billingAddress: any = '';
  billingCheck: boolean = false;
  addressType: any = '';

  ExpectedDeliveryMsg: any = '';
  sellerDetails: any = '';
  DeliveryChargeSlab = [];
  MinOrderSlabAmtForFreeShipping: number = 0;

  pglist: any = [];
  paymentMode: any = '';
  selectedPG: any = '';
  isCheckedTmc: boolean = true;
  removeType: any = '';
  itemForRemove: any = [];
  PGROW: any = '';
  alterSaved: any = '';

  assiannablePincode: any = 0;
  // whFail: boolean = false;
  walletBalance: any = 0;
  useWallet: boolean = false;
  payableAmount: any = 0;
  // showSubs: any = '';
  altrPrdcts: any = [];
  JitoConfig: any = '';
  totalSavebyAlternative: any = '';
  replaceAllSubs: boolean = false;

  allReplaceArr: any = [];
  compareAlter: any = '';

  cardBalance: any = 0;
  useCardBalance: boolean = false;
  cfhBalance: any = 0;
  showCFHBlock: boolean = false;  // Add this property
  specialistFlag: number = 0; // Counter for specialty prescription items

  @ViewChild('closebutton') closebutton: any;
  @ViewChild('closeAdssBtn') closeAdssBtn: any;
  @ViewChild('addShipping') addShipping: any;
  @ViewChild('newaddress') newaddress: any;
  @ViewChild('closesavedAdssBtn') closesavedAdssBtn: any;
  @ViewChild('closebuttonSVP') closebuttonSVP: any;

  @ViewChild('appliedCuppon') appliedCuppon: any = '';
  @ViewChild('uploadedPrsc') uploadedPrsc: any;
  @ViewChild(SearchComponent, { static: false })
  Searchchild!: SearchComponent;

  @Output() newItemEvent = new EventEmitter<any>();

  addOrder: Subscription;

  @ViewChild('open') open: any;
  @ViewChild('whFailMod') whFailMod: any;
  @ViewChild('otst') otst: any;
  @ViewChild('close') close: any;
  @ViewChild('ItemListAcd') ItemListAcd: any;
  @ViewChild('emailUpdate') emailUpdate: any;
  @ViewChild('closeEmailMod') closeEmailMod: any;
  @ViewChild('alterModal') alterModal: any;
  @ViewChild('closeAltMod') closeAltMod: any;
  @ViewChild('closeAllaltMod') closeAllaltMod: any;
  jitoItems: any;
  nonJitoItems: any;
  forAllProducts!: number;
  deduction:any=0;
  itemsBreakDown:boolean = false;
  total_non_jito_transaction_amount:number = 0;

  constructor(
    public CommonService: CommonService,
    private dbService: NgxIndexedDBService,
    private cookieService: CookieService,
    private router: Router,
    private imagesService: UploadImagesService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    // private profileService: ProfileService,
    private http: HttpClient,
    private webengageService: WebEngageService,
    private toastr: ToastrService
  ) {
    this.addOrder = this.CommonService.getClickEvent().subscribe(() => {
      this.getAllRecord();
    });
  }

  ngOnInit() {
    localStorage.removeItem('toReplace');
    // debugger;
    this.isLoggedIn = this.cookieService.get('isLoggedIn');
    if (this.isLoggedIn == 'true') {
      if (this.CommonService.isDownTime == 0) {
        this.configMinOrderStatus();
        this.cartSynch();
        this.generateform();
        this.setEmailform();
        this.setCFHform();
        this.getSavedPrescription();
        this.getSavedPrescriptionForPet();
        this.getDeliveryChargeSlot();
        this.getHB_Details();
        if (this.CommonService.ConfigData.WalletEnable == 'Y') {
          this.getWalletBalance();
        }
        this.setJitoHeader();
        if (this.CommonService.ConfigData.IsCFHActive) {
          this.showCFHBlock = true;
          this.getCFHBalance('get');
          // this.itemsBreakDown = true;
          this.getCFHApplicableAmt();
        }
      }
      // console.log("this.showCFHBlock",this.showCFHBlock);
    } else {
      this.router.navigate(['ordermedicine']);
    }
  }

  //  ngAfterViewInit() {
  //   // This code will run after the component's view has been initialized
  //   this.open.nativeElement.click();

  //   // setTimeout(() => {
  //   //   this.close.nativeElement.click()
  //   // }, 100);
  // }

  configMinOrderStatus() {
    // let response: any = {"Status":"Success","minOnlinePayVal":50,"minOrderValForShippingFree":250,"minOrderValForCourierFree":750}
    this.CommonService.getMinOrderValue('cartuserapp/ConfigBaseData').subscribe((response: any) => {
        if (response['Status'] == 'Success') {
          this.freeShippingChage = response['minOrderValForShippingFree'];
          this.freeCourierChage = response['minOrderValForCourierFree'];
          this.minOnlinePayVal = parseInt(response['minOnlinePayVal']);
          // this.router.navigate([''])
        }
      });
  }

  setJitoHeader() {
    this.CommonService.getJitoHeader('home/recommended-alternative').subscribe((res: any) => {
      // console.log(res)
      if (res && res['data'] != undefined) {
        this.JitoConfig = res['data'];
      }
    })
  }

  cartSynch() {
    // this.isLoading = true;
    this.spinner.show();
    let fd = new FormData();
    let cartSynchCall = this.cookieService.get('cartsynch');
    fd.append('SyncType', 'L');
    this.CommonService.cartSynch('cart/cart_sync', fd).subscribe((response: any) => {
        // let response: any = {"status":200,"message":"List provided.","data":{"List":[{"ProductId":"273511","ProductName":"Cal Aid Capsule (15 Cap)","DosageRestriction":0,"OfferPrice":"272.06","Discount":18,"Iscourierable":0,"ProductImage":"Cal-Aid-1663222704-10102896-1.jpg","MRP":331.78,"IsGiftProduct":0,"PrescriptionOTC":"P","WarehouseId":"1","PKLotId":"10000288","MfgGroup":"Indoco Remedies Ltd.","ExpiryDate":"2027-10-31","Brand":"Indoco Remedies Ltd.","DosageForm":"capsule","ProductImageUrl":"https:\/\/asset.sastasundar.com\/incom\/images\/product\/thumb\/Cal-Aid-1663222704-10102896-1.jpg","ProductCount":"2","RefOrderId":""},{"ProductId":"220897","ProductName":"Ran CV 500 mg Tablet (10 Tab)","DosageRestriction":0,"OfferPrice":"108.47","Discount":18,"Iscourierable":1,"ProductImage":"Ran-CV-1663920084-10050287-1.jpg","MRP":132.28,"IsGiftProduct":0,"PrescriptionOTC":"P","WarehouseId":"1","PKLotId":"10000781","MfgGroup":"Msn Laboratories Private Limited","ExpiryDate":"2029-10-31","Brand":"Msn Laboratories Private Limited","DosageForm":"tablet.","ProductImageUrl":"https:\/\/asset.sastasundar.com\/incom\/images\/product\/thumb\/Ran-CV-1663920084-10050287-1.jpg","ProductCount":"2","RefOrderId":""}],"Time":""}}
        if (response && response['data']['List'] != undefined) {
          let RedishData = response['data']['List'];
          if (RedishData.length > 0) {
            this.CompareCartResult(response);
          } else {
            // if(cartSynchCall == "0"){
            //   this.getAllRecord();
            // }else{
            //   this.getCartDetails()
            // }
            this.getAllRecord();
          }
        }
    });
  }

  getAllRecord() {
    let cartSynchCall = this.cookieService.get('cartsynch');
    this.dbService.getAll('cartItems').subscribe((res: any) => {
      // console.log('all records', res);
      this.allItemsList = res;

      if (localStorage.getItem('toReplace') != null && localStorage.getItem('toReplace') != undefined && localStorage.getItem('toReplace') != '') {
        let arr: any = localStorage.getItem('toReplace');
        if (arr !== null) {
          arr = JSON.parse(arr);
        } else {
          arr = []
        }
        this.allReplaceArr = arr;
      } else {
        this.allReplaceArr = [];
      }

      this.cartViewWebEngage(this.allItemsList);
      if (this.allItemsList.length > 0) {
        if (cartSynchCall == '0') {
          this.checkoutCart(res);
        } else {
          this.getCartDetails();
        }
      } else {
        let d: Date = new Date();
        this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
        this.router.navigate(['ordermedicine']);
      }
    });
  }

  CompareCartResult(redisRes: any) {
    //alert(new Date().getTime());
    if (redisRes['data']['List'] != undefined) {
      let RedishData = redisRes['data']['List'];
      RedishData.forEach((elm: any) => {
        let id = `${elm.ProductId}_0_0`;
        // console.log(elm.ProductId, id);
        this.dbService.getByKey('cartItems', id).subscribe((res: any) => {
          // console.log(res);
          if (res == undefined) {
            let tmp = {
              id: elm.ProductId + '_' + 0 + '_' + 0,
              ProductId: elm.ProductId,
              ProductName: elm.ProductName,
              CustProductName: elm.CustomProductName,
              InteractiveHealthProfileId: elm.InteractiveHealthProfileId,
              DosageRestriction: elm.DosageRestriction == null ? 0 : parseInt(elm.DosageRestriction),
              OfferPrice: 0,
              ProductCount: elm.ProductCount,
              ItemVal: elm.ItemVal,
              SSCurrencyValue: elm.SSCurrencyValue,
              Iscourierable: elm.IsCourierable,
              ProductImage: elm.ProductImage,
              ProductPrice: elm.ItemBasePrice,
              // IsGiftProduct: elm.IsGiftableProduct,
              PrescriptionOTC: elm.PrescriptionOTC,
              WarehouseId: this.CommonService.WHId,
              CPId: 0,
              MyFamilyId: 0,
              PKLotId: 0,
              MfgGroup: elm.MfgGroup,
              ExpiryDate: elm.ExpiryDate,
              ProductInteractiveModule: elm.InteractiveModule,
              ProductInteractiveSubModule: elm.InteractiveSubModule,
              IsNonReturnable: elm.IsNonReturnable,
              RefOrderId: elm.RefOrderId == null ? 0 : parseInt(elm.RefOrderId),
              Brand: elm.Brand,
            };

            this.dbService.add('cartItems', tmp).subscribe((res: any) => {
              // console.log('Record added successfully.', res);
              // this.newItemEvent.emit();
              // this.CommonService.sendClickEvent();
              // this.searchResult = false;
              // this.searchTxt = '';
              // this.ProductList = [];
            });
          }
        });
      });
      this.getAllRecord();
    }
  }

  checkoutCart(res: any) {
    // this.isLoading = true;
    this.spinner.show();
    this.closeAllaltMod.nativeElement.click();
    this.closeAltMod.nativeElement.click();
    let requestData = JSON.stringify(res);
    let fd = new FormData();
    fd.append('itemlist', requestData);
    fd.append('pincode', this.CommonService.PinCode.toString());
    // debugger
    this.CommonService.checkoutCart('cartapp/checkoutincart', fd).subscribe((cartData: any) => {
        // console.log('in cart synch', cartData);
        if (cartData) {
          let d: Date = new Date();
          this.cookieService.set(
            'cartsynch',
            '1',
            d.getTime() + 86400 * 30,
            '/'
          );
          // this.outOfStockProducts = cartData['result']['outOfStockProducts'];
          this.finalList = cartData['result']['itemlist'];

          let outofStock = cartData['result']['outOfStockProducts'];
          // console.log('final', this.finalList);
          // console.log('outofstock', this.outOfStockList);
          // console.log('headerDetails', this.headerDetails);
          // console.log('couponList', this.couponList);

          if (outofStock.length > 0) {
            outofStock.forEach((d: any) => {
              let obj = this.allItemsList.find(
                (o: any) => o['ProductId'] === d['ProductId']
              );
              // console.log(obj)
              this.outOfStockList.push({
                ProductId: obj['ProductId'],
                ProductName: obj['ProductName'],
              });
              this.removeWebEngage(obj)
            });
            // this.spinner.hide();
            // console.log('out of stock', this.outOfStockList);
            // outofStockModal()
            this.otst.nativeElement.click();
          }

          if (this.finalList.length > 0) {
            // this.headerDetails = cartData['result']['header'];
            // this.couponList = cartData['result']['coupons'];
            if (this.CommonService.ConfigData.IsDisplayGenericProduct == 1) {
              this.getAletnatives();
            }
            this.processOrderDetails();
            this.getReqPrsMeds(this.finalList);
            this.updateRedish(this.finalList);
            this.getCustomerCoupon();
            this.getSaveForLaterList();
            this.getExpectedDeliveryDate();
            this.getCFHApplicableAmt();
            this.getCFHBalance('add');
          }

          this.processLocalCart(this.finalList);
        }
      });
  }

  getCartDetails() {
    // debugger
    // this.isLoading = true;
    this.spinner.show();
    this.replaceAllSubs = false;
    this.closeAllaltMod.nativeElement.click();
    this.closeAltMod.nativeElement.click();
    this.CommonService.getCartDetails('cartapp/getcartdetails').subscribe((cartData: any) => {
      // console.log('in cart synch', cartData);
      if (cartData) {
        this.finalList = cartData['result']['itemlist'];
        
        let outofStock = cartData['result']['outOfStockProducts'];
        if (outofStock.length > 0) {
          outofStock.forEach((d: any) => {
            let obj = this.allItemsList.find(
              (o: any) => o['ProductId'] === d['ProductId']
            );
            // console.log(obj)
            this.outOfStockList.push({
              ProductId: obj['ProductId'],
              ProductName: obj['ProductName'],
            });
            this.removeWebEngage(obj)
          });
          // console.log('out of stock', this.outOfStockList);
          this.otst.nativeElement.click();
        }

        if (this.finalList.length > 0) {
          if (this.CommonService.ConfigData.IsDisplayGenericProduct == 1) {
            this.getAletnatives();
          }
          this.processOrderDetails();
          this.getReqPrsMeds(this.finalList);
          this.updateRedish(this.finalList);
          this.getCustomerCoupon();
          this.getSaveForLaterList();
          this.getExpectedDeliveryDate();
          this.getCFHApplicableAmt();
          this.getCFHBalance('add');
        }
        this.processLocalCart(this.finalList);
      }
    });
  }

  processOrderDetails() {
    this.spinner.show();
    this.headerDetails = [];
    this.pglist = [];
    this.PrescUpldFlg = false;
    this.shippingFlg = false;
    this.paymentFlg = false;
    this.paymentContinue = false;
    this.shippingContinue = false;
    this.HB_Details = [];
    this.totalSaving = 0;
    this.totalSavebyAlternative = '';
    let fd = new FormData();
    fd.append('cartItems', this.finalList.length);
    // console.log('items to order', this.itemlist);
    // this.getReqPrsMeds(this.itemlist);
    this.CommonService.getOrderDetails('cartapp/load_order_details', fd).subscribe((data: any) => {
      // console.log('order data', data);
      this.headerDetails = data['header_cart_detail'][0];
      this.shippingId = data['ShippingAddressId'];
      this.billingId = data['BillingAddressId'];

      if (this.headerDetails != undefined) {
        if (this.headerDetails['HBName'] != undefined) {
          this.HB_Details.push({
            HBName: this.headerDetails['HBName'], // seller nam,
            // 'HBAddline': this.headerDetails['HBAddline'],
            // 'HBCity': this.headerDetails['HBCity'],
            // 'HBPinCode': this.headerDetails['HBPinCode'],
            // 'HBStateName': this.headerDetails['HBStateName'],
            // 'HBContact': this.headerDetails['HBContact'],
          });
        }
        // Check if all needed prescriptions are uploaded
        const humanPrescriptionNeeded = this.headerDetails['NeedToAttachPrescription'] == 'Y';
        const humanPrescriptionUploaded = this.headerDetails['IsPrescriptionUploaded'] == 1;
        const petPrescriptionNeeded = this.headerDetails['NeedToAttachPetCarePrescription'] == 'Y';
        const petPrescriptionUploaded = this.headerDetails['IsPetCarePrescriptionUploaded'] == 1;

        // Allow shipping only when:
        // 1. Human prescription: not needed OR successfully uploaded
        // 2. Pet prescription: not needed OR successfully uploaded
        const allNeededPrescriptionsUploaded = 
          (!humanPrescriptionNeeded || humanPrescriptionUploaded) &&
          (!petPrescriptionNeeded || petPrescriptionUploaded);

        if (allNeededPrescriptionsUploaded) {
          // All required prescriptions are uploaded - allow shipping to continue
          this.shippingFlg = true;
          this.paymentFlg = false;
          this.PrescUpldFlg = false;
          this.shippingContinue = true;
        } else {
          // Some required prescriptions are still pending - block shipping
          this.shippingFlg = false;
          this.paymentFlg = false;
          this.PrescUpldFlg = true;
          this.shippingContinue = false;
        }
       

        if (
          this.headerDetails.CartItemDiscount != null &&
          this.headerDetails.CartItemDiscount != ''
        ) {
          this.totalSaving += parseFloat(this.headerDetails.CartItemDiscount);
        }
        if (
          this.headerDetails.CouponDiscount != null &&
          this.headerDetails.CouponDiscount != '' &&
          this.headerDetails.CouponDiscount != '.00'
        ) {
          this.totalSaving += parseFloat(this.headerDetails.CouponDiscount);
        } else {
          this.AppliedCouponFlg = false;
        }
        if (
          this.headerDetails.PromoDiscount != null &&
          this.headerDetails.PromoDiscount != ''
        ) {
          this.totalSaving += parseFloat(this.headerDetails.PromoDiscount);
        } if (this.headerDetails.CartVal <= this.headerDetails.BaseShippingChargeCartVal) {
          this.totalSaving += parseFloat(this.headerDetails.BaseShippingCharge);
        }
        if (
          this.headerDetails.AppliedCouponCode != null &&
          this.headerDetails.AppliedCouponCode != ''
        ) {
          this.AppliedCouponFlg = true;
        } else {
          this.AppliedCouponFlg = false;
        }

        let ptfDisc: any = this.headerDetails.BaseConvienceFee - this.headerDetails.ConvienceFee;
        this.totalSaving += parseFloat(ptfDisc);

        if (this.useWallet == true) {
          this.setPayableAmnt()
        } else {
          this.payableAmount = this.headerDetails.CartVal;
        }

        if (this.useCardBalance == true) {
          this.setCFHBalance()
        } else {
          this.cfhBalance = this.headerDetails.CartVal;
        }

      }
      this.getAlternativesTotalsave(this.finalList);
      // this.setShippingAddress(this.shippingId);
      this.updateWebEngage(this.headerDetails, this.finalList);
      this.getAddressList();
      this.spinner.hide();
    });
    // this.isLoading = false;
  }

  // getReqPrsMeds(data: any) {
  //   let rqsPrs: any = [];
  //   this.slicedArray = [];
  //   data.forEach((d: any) => {
  //     if (d['PrescriptionOTC'] !== 'O') {
  //       rqsPrs.push({
  //         ProductId: d['ProductId'],
  //         ProductName: d['ProductName'],
  //       });
  //     }
  //   });
  //   this.ReqPrscList = rqsPrs;
  //   if (this.ReqPrscList.length > 3) {
  //     this.slicedArray = this.ReqPrscList.slice(0, 3);
  //     this.showMoreBtn = true;
  //   } else {
  //     this.slicedArray = this.ReqPrscList;
  //     this.showMoreBtn = false;
  //   }
  // }

  getReqPrsMeds(data: any) {
    let rqsPrsHuman: any = [];
    let rqsPrsPet: any = [];
    this.slicedArray = [];
    this.slicedArrayHuman = [];
    this.slicedArrayPet = [];
    this.specialistFlag = 0;
    // Separate items by product type
    data.forEach((d: any) => {
      // console.log('processing item for prescription check', d);
      if (d['PrescriptionOTC'] !== 'O') {
        let itemObj = {
          ProductId: d['ProductId'],
          ProductName: d['ProductName'],
          Speciality: d['SltProdCategory'] || '',
        };

        // Check if it's a pet product (InteractiveModule exists and is not empty)
        if (d['InteractiveModule'] && d['InteractiveModule'] != '' && d['InteractiveModule'] == 'PetCare') {
        //reversed condition to see the html part
        // if (d['InteractiveModule']=='' || d['InteractiveModule'] == null) {
          rqsPrsPet.push(itemObj);
         } else if(d['PrescriptionOTC'] == 'P') {
          // Human product
          rqsPrsHuman.push(itemObj);
        }
      }
    });
    console.log('Human prescription products', rqsPrsHuman);
    // Set flags and lists
    this.ReqPrscList = rqsPrsHuman;        // Keep existing for backward compatibility
    this.ReqPrscListHuman = rqsPrsHuman;
    this.ReqPrscListPet = rqsPrsPet;
    for (let specialItem of this.ReqPrscListHuman ){
      if(specialItem.Speciality === 128)
        this.specialistFlag++;
    }

    this.hasHumanProducts = rqsPrsHuman.length > 0;
    this.hasPetProducts = rqsPrsPet.length > 0;

    // Process human products
    if (this.ReqPrscListHuman.length > 3) {
      this.slicedArrayHuman = this.ReqPrscListHuman.slice(0, 3);
      this.showMoreBtn = true;
    } else {
      this.slicedArrayHuman = this.ReqPrscListHuman;
      this.showMoreBtn = false;
    }

    // Process pet products
    if (this.ReqPrscListPet.length > 3) {
      this.slicedArrayPet = this.ReqPrscListPet.slice(0, 3);
    } else {
      this.slicedArrayPet = this.ReqPrscListPet;
    }

    // Set upload prescription flags
    if (this.headerDetails['IsPrescriptionUploaded'] == 0) {
      if (this.headerDetails['NeedToAttachPrescription'] == 'Y') {
        // Show based on what products exist
        this.PrescUpldFlgHuman = this.hasHumanProducts;
        // this.PrescUpldFlgPet = this.hasPetProducts;
      } else {
        this.PrescUpldFlgHuman = false;
        // this.PrescUpldFlgPet = false;
      }
    } else {
      // Already uploaded - show both if items exist
      this.PrescUpldFlgHuman = this.hasHumanProducts;
      // this.PrescUpldFlgPet = this.hasPetProducts;
    }

    // Set upload petcare prescription flags
    if (this.headerDetails['IsPetCarePrescriptionUploaded'] == 0) {
      if (this.headerDetails['NeedToAttachPetCarePrescription'] == 'Y') {
        // Show based on what products exist
        // this.PrescUpldFlgHuman = this.hasHumanProducts;
        this.PrescUpldFlgPet = this.hasPetProducts;
      } else {
        // this.PrescUpldFlgHuman = false;
        this.PrescUpldFlgPet = false;
      }
    } else {
      // Already uploaded - show both if items exist
      // this.PrescUpldFlgHuman = this.hasHumanProducts;
      this.PrescUpldFlgPet = this.hasPetProducts;
    }

    // For backward compatibility, set PrescUpldFlg if either human or pet is needed
    this.PrescUpldFlg = this.PrescUpldFlgHuman || this.PrescUpldFlgPet;
  }

  getAllReqPrsc() {
    if (this.showMoreBtn == true) {
      this.showMoreBtn = false;
      this.slicedArray = this.ReqPrscList;
    } else {
      this.slicedArray = this.ReqPrscList.slice(0, 3);
      this.showMoreBtn = true;
    }
  }

  getAlternativesTotalsave(list: any) {

    let prodArr: any = [];

    list.forEach((elm: any) => {
      let obj = {
        id: elm['ProductId'],
        qnt: elm['ItemQuantity'],
      };
      prodArr.push(obj);
    });

    let temp = {
      development: false,
      products: prodArr
    };

    this.CommonService.getTotalAlterSave('product/getSubstituteProductListSaving', temp).subscribe((res: any) => {
      // console.log(res)
      if (res && res['msgcode'] == 1) {
        this.totalSavebyAlternative = res;
        // this.closeAllaltMod.nativeElement.click();
      }
    })
  }

  processLocalCart(items: any) {
    let RedisProductLsit: any = [];
    // console.log(items);
    this.dbService.clear('cartItems').subscribe((successDeleted) => {
      // console.log('success? ', successDeleted);
      if (items.length > 0) {
        items.forEach((elm: any) => {
          this.addToLocalCart(elm, elm.ItemQuantity);
          // this.addWebEngage(elm);
          let redisArray = {
            ProductId: elm.ProductId,
            ProductCount: parseInt(elm.ItemQuantity),
            ProductType: elm.PrescriptionOTC,
            FamilyId: '0',
            PreviousFamilyId: '',
            RefOrderId: elm.RefOrderId,
          };
          RedisProductLsit.push(redisArray);
        });
        if (RedisProductLsit.length > 0) {
          this.CartsynchWithRedis(RedisProductLsit, 'S');
        } else {
          this.CartsynchWithRedis(RedisProductLsit, 'D');
        }
      } else {
        this.router.navigate(['ordermedicine']);
      }
    });
  }

  updateRedish(data: any) {
    // console.log(data);
  }

  addToLocalCart(elm: any, Qty: any) {
    let qty = parseInt(Qty);
    let tmp = {
      id: elm.ProductId + '_' + 0 + '_' + 0,
      ProductId: elm.ProductId,
      // ProductName: elm.DisplayName,
      ProductName: elm.ProductName,
      CustProductName: elm.CustomProductName,
      InteractiveHealthProfileId: elm.InteractiveHealthProfileId,
      DosageRestriction: elm.DosageRestriction == null ? 0 : parseInt(elm.DosageRestriction),
      OfferPrice: elm.OfferPrice,
      ProductCount: qty,
      ItemVal: elm.ItemVal,
      SSCurrencyValue: elm.SSCurrencyValue,
      Iscourierable: elm.IsCourierable,
      ProductImage: elm.ProductImage,
      ProductPrice: elm.ItemBasePrice,
      // IsGiftProduct: elm.IsGiftableProduct,
      PrescriptionOTC: elm.PrescriptionOTC,
      WarehouseId: this.CommonService.WHId,
      CPId: 0,
      MyFamilyId: 0,
      PKLotId: elm.PKLotId == null ? 0 : elm.PKLotId,
      MfgGroup: elm.MfgGroup,
      ExpiryDate: elm.ExpiryDate,
      ProductInteractiveModule: elm.InteractiveModule,
      ProductInteractiveSubModule: elm.InteractiveSubModule,
      IsNonReturnable: elm.IsNonReturnable,
      RefOrderId: elm.RefOrderId == null ? 0 : parseInt(elm.RefOrderId),
      Brand: elm.Brand,
      DiscountPercent: elm.DiscountPercent
    };

    this.dbService.add('cartItems', tmp).subscribe((res: any) => {
      // console.log('Record added successfully.', res);
      // this.newItemEvent.emit();
      // this.CommonService.sendClickEvent();
      // this.searchResult = false;
      // this.searchTxt = '';
      // this.ProductList = [];
    });
  }

  cartAddPlus(pro_id: any) {
    this.alterSaved = '';
    localStorage.removeItem('toReplace');
    this.allReplaceArr = [];
    this.msgText = '';
    let PID = `${pro_id}_0_0`;
    // console.log(PID);
    this.dbService.getByKey('cartItems', PID).subscribe((item: any) => {
      // console.log('item by key path', item);
      let qty = item['ProductCount'];
      if (item['DosageRestriction'] == 0 || (item['DosageRestriction'] != 0 && item['DosageRestriction'] > qty)) {
        const updatedItem = { ...item, ProductCount: item['ProductCount'] + 1 };
        // console.log(updatedItem);
        this.updateById(updatedItem);
      } else {
        // alert('max limit reached');
        this.msgText = 'You can order ' + item['DosageRestriction'] + ' quantity of ' + item['ProductName'];
        this.open.nativeElement.click();
      }
    });
  }

  cartAddMinus(pro_id: any) {
    this.alterSaved = '';
    localStorage.removeItem('toReplace');
    this.allReplaceArr = [];
    this.msgText = '';
    let PID = `${pro_id}_0_0`;
    // console.log(PID);
    this.dbService.getByKey('cartItems', PID).subscribe((item: any) => {
      // console.log('item by key path', item);
      let objItem = item;
      let qty = item['ProductCount'];
      if (qty > 1) {
        const updatedItem = { ...item, ProductCount: item['ProductCount'] - 1 };
        // console.log(updatedItem);
        this.updateById(updatedItem);
      } else {
        // alert('remove');
        this.deleteById(objItem);
      }
    });
  }

  // getRecordByKeyPath(){
  //   let productId = 'abc123_1';
  //   this.dbService.getByKey('cartItems', productId).subscribe((item: any) => {
  //     console.log('item by key path',item);
  //   });
  // }

  updateById(item: any) {
    // this.dbService.update('cartItems', tmp).subscribe((res: any) => {
    //   console.log('storeData: ', res);
    //   if(res){
    //     this.getAllRecord();
    //   }
    // });
    let refOrderID: any = '';

    if (item.RefOrderId != null && item.RefOrderId != '' && item.RefOrderId != undefined) {
      refOrderID = item.RefOrderId
    }
    this.spinner.show()

    let fd = new FormData();

    fd.append('ProductId', item.ProductId);
    fd.append('Qty', item.ProductCount);
    fd.append('InteractiveModule', item.ProductInteractiveModule);
    fd.append('InteractiveSubModule', item.ProductInteractiveSubModule);
    fd.append('InteractiveHealthProfileId', item.InteractiveHealthProfileId);
    fd.append('PKLotId', item.PKLotId);
    fd.append('OfferPrice', item.OfferPrice);
    fd.append('ProductName', item.ProductName);
    fd.append('CPId', item.CPId);
    fd.append('RefOrderId', refOrderID);
    this.CommonService.update_to_cart('cartapp/update_to_cart', fd).subscribe(
      (udata: any) => {
        if (udata && udata['status'] == 'success') {
          this.spinner.hide();
          let redisItem = {
            ProductId: item.ProductId,
            ProductCount: parseInt(item.ProductCount),
            ProductType: item.PrescriptionOTC,
            FamilyId: '',
            PreviousFamilyId: '',
            RefOrderId: item.RefOrderId,
          };
          let redisArr = [];
          redisArr.push(redisItem);
          this.CartsynchWithRedis(redisArr, 'U');
          this.dbService.update('cartItems', item).subscribe((res: any) => {
            // console.log('storeData: ', res);
            if (res) {
              this.getCartDetails();
            }
          });
        } else {
          this.msgText = 'Unable to process your request, Please try after some time';
          this.open.nativeElement.click();
          this.spinner.hide();
        }
      }
    );
  }

  CartsynchWithRedis(itemList: any, SynchType: any) {
    let requestData = JSON.stringify(itemList);
    let fd = new FormData();
    if (itemList.length == 0 && SynchType == 'D') {
      let D = new Date();
      let time = D.getTime();
      fd.append('DeleteTime', time.toString());
    }
    fd.append('SyncType', SynchType);
    fd.append('CartItems', requestData);

    this.CommonService.cartSynch('cart/cart_sync', fd).subscribe(
      (response: any) => {
        // console.log(response);
      }
    );
  }

  openRemoveModal(item: any, type: any) {
    this.removeType = type;
    this.itemForRemove = item;
    this.msgText = `${item.ProductName}`;
  }

  resetRemove() {
    this.removeType = '';
    this.itemForRemove = [];
    this.msgText = '';
  }

  deleteById(item: any) {
    this.alterSaved = '';
    localStorage.removeItem('toReplace');
    this.allReplaceArr = [];
    this.msgText = '';
    let refOrderID: any = '';

    if (item.RefOrderId != null && item.RefOrderId != '' && item.RefOrderId != undefined) {
      refOrderID = item.RefOrderId
    }
    let fd = new FormData();
    fd.append('ProductId', item.ProductId);
    fd.append('Qty', '');
    // fd.append('InteractiveModule', item.ProductInteractiveModule);
    // fd.append('InteractiveSubModule', item.ProductInteractiveSubModule);
    // fd.append('InteractiveHealthProfileId', item.InteractiveHealthProfileId);
    fd.append('PKLotId', item.PKLotId);
    fd.append('OfferPrice', item.OfferPrice);
    fd.append('ProductName', item.ProductName);
    fd.append('CPId', '0');
    fd.append('RefOrderId', refOrderID);

    this.CommonService.remove_item('cartapp/remove_item', fd).subscribe(
      (udata: any) => {
        if (udata['status'] == 'success') {
          this.removeWebEngage(item);
          let redisItem = {
            ProductId: item.ProductId,
            ProductCount: 0,
            ProductType: item.PrescriptionOTC,
            FamilyId: '',
            PreviousFamilyId: '',
            RefOrderId: item.RefOrderId,
          };
          let redisArr = [];
          redisArr.push(redisItem);
          this.CartsynchWithRedis(redisArr, 'R');

          let PID = `${item['ProductId']}_0_0`;
          // console.log(PID);
          this.dbService.deleteByKey('cartItems', PID).subscribe((status: any) => {
            // console.log('Deleted?:', status);
            if (status == true) {
              this.getCartDetails();
              this.resetRemove();
            } else {
              // alert('some thing went wrong')
              this.msgText = 'some thing went wrong';
              this.open.nativeElement.click();
            }
          });
        } else {
          this.msgText = udata['msg'];
          this.open.nativeElement.click();
        }
      }
    );
  }

  getSaveForLaterList() {
    this.saveForLaterList = [];
    this.CommonService.getSavedForLaterList('cart/saveForLaterListNew').subscribe(
      (rsp: any) => {
        if (rsp['status'] == 200) {
          let TempsaveForLaterMedList = [
            ...rsp['data']['Med'],
            ...rsp['data']['Otc'],
          ];
          this.saveForLaterList = TempsaveForLaterMedList;
        }
        // console.log(this.saveForLaterList);
        this.resetRemove();
      }
    );
  }

  saveForLaterAdd(itemObj: any) {
    //  debugger
    this.spinner.show();
    this.msgText = '';
    let fd = new FormData();
    fd.append('CPID', itemObj['CPId']);
    fd.append('Qty', itemObj['ItemQuantity']);
    fd.append('ProductId', itemObj['ProductId']);

    if (itemObj['InteractiveHealthProfileId'] != '' && itemObj['InteractiveHealthProfileId'] != null) {
      fd.append('InteractiveHealthProfileId', itemObj['InteractiveHealthProfileId']);

      if (itemObj['CustProductName'] != '' && itemObj['CustProductName'] != null) {
        fd.append('CustomProductName', itemObj['CustProductName']);
      }
      if (itemObj['ProductInteractiveModule'] != '' && itemObj['ProductInteractiveModule'] != null) {
        fd.append('InteractiveModule', itemObj['ProductInteractiveModule']);
      }
    }
    this.CommonService.addSaveForLater('cart/saveForLaterAdd', fd).subscribe((response: any) => {
      //  debugger
      if (response['status'] == 200) {
        this.saveForLaterList = [];

        let TempsaveForLaterMedList = [...response['data']['Med'], ...response['data']['Otc']];
        this.saveForLaterList = TempsaveForLaterMedList;

        if (TempsaveForLaterMedList.length > 0) {
          for (let i = 0; i < TempsaveForLaterMedList.length; i++) {
            if (TempsaveForLaterMedList[i]['ProductId'] == itemObj['ProductId']) {
              // this.doRemoveCartItem(itemObj);
              this.deleteById(itemObj);
            }
          }
        }
      } else {
        // alert("Unable to process your request now, Please try after some time.");
        this.msgText = 'Unable to process your request now, Please try after some time.';
        this.spinner.hide();
        this.open.nativeElement.click();
      }
    }
    );
  }

  moveToCart(itemObj: any, qty: any) {
    // console.log(itemObj, qty);
    itemObj['saveforLaterFlg'] = 1;
    // this.addToCart(itemObj, qty); need to work
    // this.getAllRecord();
    this.Searchchild.addToCart(itemObj, qty, 'MoveToCart');
    itemObj['sforLaterMoveCartFlg'] = 1;
    this.dosaveForLaterRemove(itemObj);
  }

  savedItemsMinus(id: any) {
    // console.log(id);
    this.saveForLaterList = this.saveForLaterList.map((obj: any) => {
      if (obj.ProductId === id) {
        let qty = parseInt(obj.ProductCount) - 1;
        if (qty > 0) {
          return { ...obj, ProductCount: qty };
        } else {
          this.dosaveForLaterRemove(obj);
          return;
        }
      }
      return obj;
    });
  }

  savedItemsPlus(id: any) {
    this.saveForLaterList = this.saveForLaterList.map((obj: any) => {
      if (obj.ProductId === id) {
        let qty = parseInt(obj.ProductCount) + 1;
        return { ...obj, ProductCount: qty };
      }
      return obj;
    });
  }

  confirmRemove() {
    if (this.removeType == 'InCart') {
      this.deleteById(this.itemForRemove);
    } else if (this.removeType == 'SavedLater') {
      this.itemForRemove['sforLaterMoveCartFlg'] = 0;
      this.dosaveForLaterRemove(this.itemForRemove);
    }
  }

  dosaveForLaterRemove(itemObj: any) {
    this.msgText = '';
    let fd = new FormData();
    fd.append('ProductId', itemObj['ProductId']);
    fd.append('movetocart', itemObj['sforLaterMoveCartFlg']);
    this.CommonService.saveForLaterRemove('cart/saveForLaterRemove', fd).subscribe((response: any) => {
      if (response['status'] == 200) {
        this.saveForLaterList = [];
        let TempsaveForLaterMedList = [
          ...response['data']['Med'],
          ...response['data']['Otc'],
        ];
        this.saveForLaterList = TempsaveForLaterMedList;
        this.getSaveForLaterList();
      } else {
        // alert("Unable to process your request now, Please try after some time.");
        this.msgText = 'Unable to process your request now, Please try after some time.';
        this.open.nativeElement.click();
      }
    });
  }

  getCustomerCoupon() {
    this.CommonService.getCouponList('cartuserapp/get_cust_coupons').subscribe(
      (resp: any) => {
        if (resp['status'] == 'success') {
          this.couponList = [];
          this.couponList = resp['coupons'];
          this.findApplicablePromos();
        } else {
          this.couponList = [];
          this.findApplicablePromos();
        }
        // console.log(this.couponList);
      }
    );
  }

  findApplicablePromos() {
    if (this.finalList.length > 0) {
      let fd: any = {};
      fd['device'] = 'W';
      fd['userType'] = 'C';
      fd['wh'] = this.CommonService.WHId;
      fd['panindia'] = this.CommonService.IsPanIndia;
      let items = [];

      for (let i = 0; i < this.finalList.length; i++) {
        let temp = {
          productId: this.finalList[i]['ProductId'],
          unitOfferPrice: this.finalList[i]['OfferPrice'],
          qty: this.finalList[i]['ItemQuantity'],
        };
        items.push(temp);
      }
      fd['products'] = items;

      this.http.post(this.CommonService.promoUrl, fd, {
        headers: { 'Content-Type': 'application/json' },
      })
        .subscribe((results: any) => {
          // this.autoApplyXplorPoint();
          if (
            results['applicablePromos'] != '' &&
            results['applicablePromos'].length > 0
          ) {
            for (let i = 0; i < results['applicablePromos'].length; i++) {
              let promo = {
                CouponName: results['applicablePromos'][i]['PromoName'],
                CouponId: results['applicablePromos'][i]['PromoId'],
                CouponCode: results['applicablePromos'][i]['PromoCode'],
                CouponDesc: results['applicablePromos'][i]['PromoDesc'],
              };
              this.couponList.push(promo);
            }
          }
        });
    }
  }

  getSavedPrescription() {
    this.savedPrscList = [];
    this.CommonService.getSavedPrescription('cartuserapp/getprescriptionList').subscribe((data: any) => {
      // console.log('saved prsc List', data, data['results']);
      if (data && data['status'] == 'success') {
        if (data['results'].length > 0) {
          let list: any = [];
          data['results'].forEach((elm: any) => {
            elm = { ...elm, checked: false };
            list.push(elm);
          });
          this.savedPrscList = list;
        } else {
          this.savedPrscList = data['results'];
        }
      }
      // console.log('saved prsc List 2', this.savedPrscList);
    });
  }
  getSavedPrescriptionForPet() {
    this.savedPrscListForPet = [];
    this.CommonService.getSavedPrescription('cartuserapp/getprescriptionListforPet').subscribe((data: any) => {
      // console.log('saved prsc List', data, data['results']);
      if (data && data['status'] == 'success') {
        if (data['results'].length > 0) {
          let list: any = [];
          data['results'].forEach((elm: any) => {
            elm = { ...elm, checked: false };
            list.push(elm);
          });
          this.savedPrscListForPet = list;
        } else {
          this.savedPrscListForPet = data['results'];
        }
      }
      // console.log('saved prsc List 2', this.savedPrscList);
    });
  }
  // selectPrescription_bckp(evt: any) {
  //   this.savedPrscFile = [];
  //   this.selectedPrsc = [];
  //   this.msgText = '';
  //   let resp = this.imagesService.onSelectFile(evt, 4);
  //   if (resp.msg == 'success') {
  //     this.prscFiles = resp.fileDetails;
  //     this.prscImages = resp.Images;
  //     this.shippingContinue = true;
  //   } else {
  //     // alert(resp.msg);

  //     this.msgText = resp.msg;
  //     this.open.nativeElement.click();
  //     this.prscFiles = [];
  //     this.prscImages = [];
  //     this.shippingContinue = false;
  //   }
  //   // console.log(resp);
  //   if (this.savedPrscList.length > 0) {
  //     let list: any = [];
  //     this.savedPrscList.forEach((elm: any) => {
  //       elm = { ...elm, checked: false };
  //       list.push(elm);
  //     });
  //     this.savedPrscList = list;
  //   }
  // }



  // assignPrescription_bckp(evnt: any) {
  //   // debugger
  //   // console.log('saved prsc', this.savedPrscList);
  //   // console.log(evnt.target.checked, evnt.target.value);
  //   if (evnt.target.checked == true) {
  //     let item1 = this.savedPrscList.find(
  //       (i: any) => i.PrescriptionId == evnt.target.value
  //     );
  //     this.selectedPrsc.push(item1);
  //   } else {
  //     const indx = this.selectedPrsc.findIndex(
  //       (x: any) => x.PrescriptionId == evnt.target.value
  //     );
  //     this.selectedPrsc.splice(indx, 1);
  //   }
  // }

  // setPrescriptionData() {
  //   // debugger
  //   // console.log('cdr', this.selectedPrsc);
  //   this.prscFiles = [];
  //   this.prscImages = [];
  //   this.savedPrscFile = [];
  //   this.shippingContinue = false;

  //   if (this.selectedPrsc.length > 0) {
  //     let files = [];
  //     this.selectedPrsc.forEach((elm: any) => {
  //       this.savedPrscFile.push({
  //         PrescriptionId: elm.PrescriptionId,
  //         PrescriptionName: elm.PrescriptionName,
  //         PrescriptionDate: elm.PrescriptionDate,
  //         FilePath: elm.FilePath,
  //         MyFamilyId: elm.MyFamilyId,
  //       });
  //     });
  //     this.shippingContinue = true;
  //   }
  //   this.closebuttonSVP.nativeElement.click();
  //   // console.log(this.savedPrscFile);
  // }

  // cancelSVP() {
  //   // this.prscFiles = [];
  //   // this.prscImages = [];
  //   this.savedPrscFile = [];
  //   this.selectedPrsc = [];
  //   this.shippingContinue = false;
  //   this.closebuttonSVP.nativeElement.click();
  //   if (this.savedPrscList.length > 0) {
  //     let list: any = [];
  //     this.savedPrscList.forEach((elm: any) => {
  //       elm = { ...elm, checked: false };
  //       list.push(elm);
  //     });
  //     this.savedPrscList = list;
  //   }
  // }

  selectPrescription(evt: any) {
    var file = evt.target.files[0];
    if (file) {

      this.msgText = '';
      let resp = this.imagesService.onSelectFile(evt, 4, this.prscFiles, this.prscImages);
      if (resp.msg == 'success') {
        this.prscFiles = resp.fileDetails;
        this.prscImages = resp.Images;
        this.shippingContinue = true;
        this.savedPrscFile = [];
        this.selectedPrsc = [];
        if (this.savedPrscList.length > 0) {
          let list: any = [];
          this.savedPrscList.forEach((elm: any) => {
            elm = { ...elm, checked: false };
            list.push(elm);
          });
          this.savedPrscList = list;
        }
      } else {
        this.msgText = resp.msg;
        this.open.nativeElement.click();
        // alert(this.msgText)
        this.prscFiles = resp.fileDetails;
        this.prscImages = resp.Images;
        if (this.prscFiles.length > 0 || this.savedPrscFile.length > 0) {
          this.shippingContinue = true;
        } else {
          this.shippingContinue = false;
        }
      }
      // console.log(resp);

    }
  }

  assignPrescription(evnt: any) {
    this.prscFiles = [];
    this.prscImages = [];
    if (evnt.target.checked == true) {
      this.savedPrscList = this.savedPrscList.map((obj: any) => {
        if (obj.PrescriptionId == evnt.target.value) {
          this.savedPrscFile.push({
            PrescriptionId: obj.PrescriptionId,
            PrescriptionName: obj.PrescriptionName,
            PrescriptionDate: obj.PrescriptionDate,
            FilePath: obj.FilePath,
            MyFamilyId: obj.MyFamilyId,
          });
          this.shippingContinue = true;
          return { ...obj, checked: true };
        }
        return obj;
      })
    } else {
      this.delSelectedSVP(evnt.target.value);
    }
  }

  delSelectedSVP(id: any) {
    const indx = this.savedPrscFile.findIndex((x: any) => x.PrescriptionId == id);
    this.savedPrscFile.splice(indx, 1);
    if (this.savedPrscFile.length == 0) {
      this.shippingContinue = false;
    }
    this.savedPrscList = this.savedPrscList.map((obj: any) => {
      if (obj.PrescriptionId == id) {
        return { ...obj, checked: false };
      }
      return obj;
    })
  }

  delFile(img: any) {
    const index = this.prscImages.indexOf(img);
    this.prscImages.splice(index, 1);
    this.prscFiles.splice(index, 1);
    if (this.prscFiles.length == 0) {
      // this.ValidateContinue = true;
      this.shippingContinue = false;
    }
  }

  // ============== PET PRESCRIPTION UPLOAD METHODS ==============

  selectPrescriptionPet(evt: any) {
    var file = evt.target.files[0];
    if (file) {

      this.msgText = '';
      let resp = this.imagesService.onSelectFile(evt, 4, this.prscFilesPet, this.prscImagesPet);
      if (resp.msg == 'success') {
        this.prscFilesPet = resp.fileDetails;
        this.prscImagesPet = resp.Images;
        this.shippingContinue = true;
        this.savedPrscFilePet = [];
        this.selectedPrscPet = [];
        if (this.savedPrscList.length > 0) {
          let list: any = [];
          this.savedPrscList.forEach((elm: any) => {
            elm = { ...elm, checked: false };
            list.push(elm);
          });
          this.savedPrscList = list;
        }
      } else {
        this.msgText = resp.msg;
        this.open.nativeElement.click();
        // alert(this.msgText)
        this.prscFilesPet = resp.fileDetails;
        this.prscImagesPet = resp.Images;
        if (this.prscFilesPet.length > 0 || this.savedPrscFilePet.length > 0) {
          this.shippingContinue = true;
        } else {
          this.shippingContinue = false;
        }
      }
    }
  }

  assignPrescriptionPet(evnt: any) {
    this.prscFilesPet = [];
    this.prscImagesPet = [];
    if (evnt.target.checked == true) {
      this.savedPrscListForPet = this.savedPrscListForPet.map((obj: any) => {
        if (obj.PrescriptionId == evnt.target.value) {
          this.savedPrscFilePet.push({
            PrescriptionId: obj.PrescriptionId,
            PrescriptionName: obj.PrescriptionName,
            PrescriptionDate: obj.PrescriptionDate,
            FilePath: obj.FilePath,
            MyFamilyId: obj.MyFamilyId,
          });
          this.shippingContinue = true;
          return { ...obj, checked: true };
        }
        return obj;
      })
    } else {
      this.delSelectedSVPPet(evnt.target.value);
    }
  }

  delSelectedSVPPet(id: any) {
    const indx = this.savedPrscFilePet.findIndex((x: any) => x.PrescriptionId == id);
    this.savedPrscFilePet.splice(indx, 1);
    if (this.savedPrscFilePet.length == 0) {
      this.shippingContinue = false;
    }
    this.savedPrscListForPet = this.savedPrscListForPet.map((obj: any) => {
      if (obj.PrescriptionId == id) {
        return { ...obj, checked: false };
      }
      return obj;
    })
  }

  delFilePet(img: any) {
    const index = this.prscImagesPet.indexOf(img);
    this.prscImagesPet.splice(index, 1);
    this.prscFilesPet.splice(index, 1);
    if (this.prscFilesPet.length == 0) {
      this.shippingContinue = false;
    }
  }

  // showUploadedPresc_bckp() {
  //   this.UploadedPrscList = [];
  //   // this.uploadedPrsc.nativeElement.click();
  //   this.modalloader = true;
  //   this.CommonService.getNewUploadedPrsc('cartuserapp/getPrescriptionPreview').subscribe((res: any) => {
  //   // let res = {"status":"success","msg":"","results":{"data":["https:\/\/res.aadharhealth.in\/test_uploads\/Prescription-2c729e8cc390aebff540bfb8bbc5a86b-1729520157181.jpg"],"message":"Prescription Listed","status":2000}}

  //     if (res && res['status'] == 'success') {
  //       // this.UploadedPrscList = res['results']['data']['prescriptionlist'];
  //       this.UploadedPrscList = res['results']['data'];
  //       this.showImgPath = this.UploadedPrscList[0];
  //       this.modalloader = false;
  //     }else{
  //       this.showImgPath = '';
  //       this.modalloader = false;
  //     }
  //   });
  // }

  // showImg_bckp(img: any) {
  //   this.showImgPath = img;
  // }

  showUploadedPresc() {
    this.UploadedPrscList = [];
    this.spinner.show();
    this.CommonService.getNewUploadedPrsc('cartuserapp/getPrescriptionPreview').subscribe((res: any) => {

      if (res && res['status'] == 'success') {

        let ds = res['results']['data'];
        let ls: any = [];

        ds.forEach((elm: any) => {
          let ext = elm.substr(elm.lastIndexOf('.') + 1);
          let obj = { path: elm, type: ext };
          ls.push(obj)
        });
        this.UploadedPrscList = ls;
        this.spinner.hide();
      } else {
        this.showImgPath = '';
        this.spinner.hide();
      }
    });
  }
  showUploadedPrescForPet() {
    this.UploadedPrscListForPet = [];
    this.spinner.show();
    this.CommonService.getNewUploadedPrsc('cartuserapp/getPrescriptionPreviewForPet').subscribe((res: any) => {

      if (res && res['status'] == 'success') {

        let ds = res['results']['data'];
        let ls: any = [];

        ds.forEach((elm: any) => {
          let ext = elm.substr(elm.lastIndexOf('.') + 1);
          let obj = { path: elm, type: ext };
          ls.push(obj)
        });
        this.UploadedPrscListForPet = ls;
        this.spinner.hide();
      } else {
        this.showImgPath = '';
        this.spinner.hide();
      }
    });
  }
  showImg(img: any) {
    window.open(img.path);
  }


  // continueShipping() {
  //   this.spinner.show();
  //   const formData = new FormData();
  //   let uploadFiles: any = [];
  //   this.msgText = '';

  //   // ============ HANDLE HUMAN PRESCRIPTIONS ============
  //   if (this.prscFiles.length > 0) {
  //     uploadFiles = this.prscFiles;

  //     for (var i = 0; i < uploadFiles.length; i++) {
  //       formData.append('refFiles', uploadFiles[i]);
  //     }

  //     this.webengageService.trackEvent('Prescription Upload Initiated', {})

  //     this.CommonService.uploadprescription('upload/prescription/v2', formData).subscribe((res: any) => {
  //       // console.log(res);

  //       if (res && res['msgcode'] == 1) {
  //         let fd = new FormData();
  //         let requestData = JSON.stringify(res['data']);
  //         fd.append('prescriptionlist', requestData);
  //         fd.append('use_pet_prescription', '0'); // 0 for human prescription

  //         this.prscFiles = [];
  //         this.savedPrscFile = [];

  //         this.CommonService.updatePrescriptionStatus('cartuserapp/updatePrescription', fd).subscribe((resData: any) => {
  //           // console.log('CP update resData', resData)
  //           if (resData['status'] == 'success') {
  //             this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': true })
  //             this.processOrderDetails();
  //             // this.setShippingAddress(this.shippingId);
  //           } else {
  //             // alert('Somthing went wrong. Please try again');
  //             this.msgText = 'Unable to process your request now, Please try after some time.';
  //             this.open.nativeElement.click();
  //             this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': false })
  //           }
  //         });
  //         this.spinner.hide();
  //       } else {
  //         this.msgText = 'Some thing went wrong, Please try again.';
  //         this.open.nativeElement.click();
  //         this.spinner.hide();
  //       }
  //     });
  //   } else if (this.savedPrscFile.length > 0) {
  //     uploadFiles = this.savedPrscFile;

  //     let fd = new FormData();
  //     let requestData = JSON.stringify(uploadFiles);
  //     fd.append('prescriptionlist', requestData);
  //     fd.append('use_pet_prescription', '0'); // 0 for human prescription

  //     this.webengageService.trackEvent('Prescription Upload Initiated', {})

  //     this.CommonService.updatePrescriptionStatus('cartuserapp/updatePrescription', fd).subscribe((resData: any) => {
  //       // console.log('CP update resData', resData);

  //       this.prscFiles = [];
  //       this.savedPrscFile = [];
  //       let list: any = [];
  //       this.savedPrscList.forEach((elm: any) => {
  //         elm = { ...elm, checked: false };
  //         list.push(elm);
  //       });
  //       this.savedPrscList = list;
  //       if (resData['status'] == 'success') {
  //         this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': true })
  //         this.processOrderDetails();
  //         // this.setShippingAddress(this.shippingId);
  //       } else {
  //         this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': false })
  //         // alert('Somthing went wrong. Please try again');
  //         this.msgText = 'Unable to process your request now, Please try after some time.';
  //         this.open.nativeElement.click();
  //       }
  //     });
  //     this.spinner.hide();
  //   } if (this.prscFilesPet.length > 0) {
  //     // ============ HANDLE PET PRESCRIPTIONS ============
  //     uploadFiles = this.prscFilesPet;

  //     for (var i = 0; i < uploadFiles.length; i++) {
  //       formData.append('refFiles', uploadFiles[i]);
  //     }

  //     this.webengageService.trackEvent('Prescription Upload Initiated', {})

  //     this.CommonService.uploadprescription('upload/prescription/v2', formData).subscribe((res: any) => {

  //       if (res && res['msgcode'] == 1) {
  //         let fd = new FormData();
  //         let requestData = JSON.stringify(res['data']);
  //         fd.append('prescriptionlist', requestData);
  //         fd.append('use_pet_prescription', '1'); // 1 for pet prescription

  //         this.prscFilesPet = [];
  //         this.savedPrscFilePet = [];

  //         this.CommonService.updatePrescriptionStatus('cartuserapp/updatePrescription', fd).subscribe((resData: any) => {
  //           if (resData['status'] == 'success') {
  //             this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': true })
  //             this.processOrderDetails();
  //           } else {
  //             this.msgText = 'Unable to process your request now, Please try after some time.';
  //             this.open.nativeElement.click();
  //             this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': false })
  //           }
  //         });
  //         this.spinner.hide();
  //       } else {
  //         this.msgText = 'Some thing went wrong, Please try again.';
  //         this.open.nativeElement.click();
  //         this.spinner.hide();
  //       }
  //     });
  //   } else if (this.savedPrscFilePet.length > 0) {
  //     uploadFiles = this.savedPrscFilePet;

  //     let fd = new FormData();
  //     let requestData = JSON.stringify(uploadFiles);
  //     fd.append('prescriptionlist', requestData);
  //     fd.append('use_pet_prescription', '1'); // 1 for pet prescription

  //     this.webengageService.trackEvent('Prescription Upload Initiated', {})

  //     this.CommonService.updatePrescriptionStatus('cartuserapp/updatePrescription', fd).subscribe((resData: any) => {

  //       this.prscFilesPet = [];
  //       this.savedPrscFilePet = [];
  //       let list: any = [];
  //       this.savedPrscListForPet.forEach((elm: any) => {
  //         elm = { ...elm, checked: false };
  //         list.push(elm);
  //       });
  //       this.savedPrscListForPet = list;
  //       if (resData['status'] == 'success') {
  //         this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': true })
  //         this.processOrderDetails();
  //       } else {
  //         this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': false })
  //         this.msgText = 'Unable to process your request now, Please try after some time.';
  //         this.open.nativeElement.click();
  //       }
  //     });
  //     this.spinner.hide();
  //   } if (((this.headerDetails['IsPrescriptionUploaded'] == 1) || (this.headerDetails['IsPetCarePrescriptionUploaded'] == 1)) && this.addressList.length == 0) {
  //     this.spinner.hide();
  //     this.addShipping.nativeElement.click()
  //   } else if (((this.headerDetails['IsPrescriptionUploaded'] == 1) || (this.headerDetails['IsPetCarePrescriptionUploaded'] == 1)) && this.addressList.length > 0) {
  //     this.spinner.hide();
  //   }
  // }
  continueShipping() {
    this.spinner.show();
    this.msgText = '';

    // Determine what needs to be uploaded
    const hasHumanToUpload = this.prscFiles.length > 0 || this.savedPrscFile.length > 0;
    const hasPetToUpload = this.prscFilesPet.length > 0 || this.savedPrscFilePet.length > 0;

    // If nothing to upload, proceed to address
    if (!hasHumanToUpload && !hasPetToUpload) {
      if (((this.headerDetails['IsPrescriptionUploaded'] == 1) || (this.headerDetails['IsPetCarePrescriptionUploaded'] == 1)) && this.addressList.length == 0) {
        this.spinner.hide();
        this.addShipping.nativeElement.click();
      } else if (((this.headerDetails['IsPrescriptionUploaded'] == 1) || (this.headerDetails['IsPetCarePrescriptionUploaded'] == 1)) && this.addressList.length > 0) {
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
      return;
    }

    this.webengageService.trackEvent('Prescription Upload Initiated', {});

    // ============ SEQUENTIAL UPLOAD CHAIN ============
    // Step 1: Upload/Update human prescription first
    if (hasHumanToUpload) {
      this.uploadAndUpdateHumanPrescription(() => {
        // Step 2: After human is done, upload/update pet prescription
        if (hasPetToUpload) {
          this.uploadAndUpdatePetPrescription(() => {
            // Step 3: Both complete - proceed to order details
            this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': true });
            this.processOrderDetails();
            this.spinner.hide();
          });
        } else {
          // Only human needed - proceed
          this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': true });
          this.processOrderDetails();
          this.spinner.hide();
        }
      });
    } else if (hasPetToUpload) {
      // Only pet prescription needed
      this.uploadAndUpdatePetPrescription(() => {
        this.webengageService.trackEvent('Prescription Upload Completed', { 'Status': true });
        this.processOrderDetails();
        this.spinner.hide();
      });
    }
  }

  // Step 1: Upload new human prescription file OR update with saved
  private uploadAndUpdateHumanPrescription(callback: any) {
    if (this.prscFiles.length > 0) {
      // Upload new human prescription files
      const formData = new FormData();
      for (let i = 0; i < this.prscFiles.length; i++) {
        formData.append('refFiles', this.prscFiles[i]);
      }

      this.CommonService.uploadprescription('upload/prescription/v2', formData).subscribe(
        (res: any) => {
          if (res && res['msgcode'] == 1) {
            // Now update the prescription status
            this.updateHumanPrescriptionStatus(res['data'], callback);
          } else {
            this.msgText = 'Human prescription upload failed. Please try again.';
            this.open.nativeElement.click();
            this.spinner.hide();
          }
        },
        (error) => {
          this.msgText = 'Human prescription upload error. Please try again.';
          this.open.nativeElement.click();
          this.spinner.hide();
        }
      );
    } else if (this.savedPrscFile.length > 0) {
      // Use saved human prescription - update directly
      this.updateHumanPrescriptionStatus(this.savedPrscFile, callback);
    } else {
      callback();
    }
  }

  // Update human prescription status
  private updateHumanPrescriptionStatus(prescriptionData: any, callback: any) {
    let fd = new FormData();
    let requestData = JSON.stringify(prescriptionData);
    fd.append('prescriptionlist', requestData);
    fd.append('use_pet_prescription', '0'); // 0 for human prescription

    this.CommonService.updatePrescriptionStatus('cartuserapp/updatePrescription', fd).subscribe(
      (resData: any) => {
        if (resData['status'] == 'success') {
          // Clear human prescription arrays
          this.prscFiles = [];
          this.savedPrscFile = [];
          let list: any = [];
          this.savedPrscList.forEach((elm: any) => {
            elm = { ...elm, checked: false };
            list.push(elm);
          });
          this.savedPrscList = list;
          callback();
        } else {
          this.msgText = 'Unable to update human prescription. Please try again.';
          this.open.nativeElement.click();
          this.spinner.hide();
        }
      },
      (error) => {
        this.msgText = 'Error updating human prescription.';
        this.open.nativeElement.click();
        this.spinner.hide();
      }
    );
  }

  // Step 2: Upload new pet prescription file OR update with saved
  private uploadAndUpdatePetPrescription(callback: any) {
    if (this.prscFilesPet.length > 0) {
      // Upload new pet prescription files
      const formData = new FormData();
      for (let i = 0; i < this.prscFilesPet.length; i++) {
        formData.append('refFiles', this.prscFilesPet[i]);
      }

      this.CommonService.uploadprescription('upload/prescription/v2', formData).subscribe(
        (res: any) => {
          if (res && res['msgcode'] == 1) {
            // Now update the prescription status
            this.updatePetPrescriptionStatus(res['data'], callback);
          } else {
            this.msgText = 'Pet prescription upload failed. Please try again.';
            this.open.nativeElement.click();
            this.spinner.hide();
          }
        },
        (error) => {
          this.msgText = 'Pet prescription upload error. Please try again.';
          this.open.nativeElement.click();
          this.spinner.hide();
        }
      );
    } else if (this.savedPrscFilePet.length > 0) {
      // Use saved pet prescription - update directly
      this.updatePetPrescriptionStatus(this.savedPrscFilePet, callback);
    } else {
      callback();
    }
  }

  // Update pet prescription status
  private updatePetPrescriptionStatus(prescriptionData: any, callback: any) {
    let fd = new FormData();
    let requestData = JSON.stringify(prescriptionData);
    fd.append('prescriptionlist', requestData);
    fd.append('use_pet_prescription', '1'); // 1 for pet prescription

    this.CommonService.updatePrescriptionStatus('cartuserapp/updatePrescription', fd).subscribe(
      (resData: any) => {
        if (resData['status'] == 'success') {
          // Clear pet prescription arrays
          this.prscFilesPet = [];
          this.savedPrscFilePet = [];
          let list: any = [];
          this.savedPrscListForPet.forEach((elm: any) => {
            elm = { ...elm, checked: false };
            list.push(elm);
          });
          this.savedPrscListForPet = list;
          callback();
        } else {
          this.msgText = 'Unable to update pet prescription. Please try again.';
          this.open.nativeElement.click();
          this.spinner.hide();
        }
      },
      (error) => {
        this.msgText = 'Error updating pet prescription.';
        this.open.nativeElement.click();
        this.spinner.hide();
      }
    );
  }

  // =================== address  ================

  generateform() {
    this.AddressForm = this.formBuilder.group({
      AddressType: ['H', Validators.required],
      ContactPerson: ['', Validators.required],
      MobileNo: [''],
      Addressline: ['', Validators.required],
      Landmark: [''],
      Pincode: ['', Validators.required],
      // AddressName: [''],
    });
  }

  get f() {
    return this.AddressForm.controls;
  }

  setEmailform() {
    this.EmailIdForm = this.formBuilder.group({
      emailId: ['', Validators.required]
    });
  }

  get emf() {
    return this.EmailIdForm.controls;
  }

  setCFHform() {
    this.AddCardForm = this.formBuilder.group({
      code: ['', Validators.required]
    })
  }

  get cfh() {
    return this.AddCardForm.controls;
  }

  // getAdressById(addressId: number) {
  //   let fd = new FormData();
  //   fd.append('AddressId', addressId.toString());
  //   this.CommonService.postData('cartuserapp/fetch_ship_bill_address', fd).subscribe((data: any) => {

  //   });
  // }

  // getAddressList(){
  //   this.profileService.getAllAddress('customers/address/manageAddress').subscribe((data: any) => {
  //     // let data = {"result":{"rs":{"allAddressData":[{"AddressId":3317699,"UserId":603032,"NickName":"test","AddressType":"H","IsPrimary":0,"Addline":123,"Landmark":896,"City":"Kolkata","AreaId":null,"ServiceArea":null,"FamilyId":null,"StateId":35,"StateName":"West Bengal","PinCode":700102,"CountryId":1,"CountryName":"India","IsDeleted":0,"WarehouseId":1,"MedDiscPercent":20,"IsLab":1,"CustContactNo":null,"RecepientName":null},{"AddressId":3317707,"UserId":603032,"NickName":"Animesh Banerjee","AddressType":"H","IsPrimary":0,"Addline":"RB Tower, Kestopur, Kolkata-700102","Landmark":"3 No health Camp","City":"Kolkata","AreaId":null,"ServiceArea":null,"FamilyId":null,"StateId":35,"StateName":"West Bengal","PinCode":700156,"CountryId":1,"CountryName":"India","IsDeleted":0,"WarehouseId":1,"MedDiscPercent":10,"IsLab":1,"CustContactNo":null,"RecepientName":null},{"AddressId":3317770,"UserId":603032,"NickName":"Sanjeev Aug 07","AddressType":0,"IsPrimary":1,"Addline":"Innovation Tower","Landmark":"Innovation Tower","City":"Kolkata","AreaId":null,"ServiceArea":null,"FamilyId":null,"StateId":35,"StateName":"West Bengal","PinCode":700156,"CountryId":1,"CountryName":"India","IsDeleted":0,"WarehouseId":1,"MedDiscPercent":10,"IsLab":1,"CustContactNo":null,"RecepientName":null},{"AddressId":3317771,"UserId":603032,"NickName":"Sanjeev Postman 1","AddressType":0,"IsPrimary":0,"Addline":"Innovation Tower 3","Landmark":"Innovation Tower Postman 3","City":"Kolkata","AreaId":null,"ServiceArea":null,"FamilyId":null,"StateId":35,"StateName":"West Bengal","PinCode":700156,"CountryId":1,"CountryName":"India","IsDeleted":0,"WarehouseId":1,"MedDiscPercent":10,"IsLab":1,"CustContactNo":null,"RecepientName":null},{"AddressId":3317774,"UserId":603032,"NickName":"Avik Sarkar","AddressType":"T","IsPrimary":0,"Addline":"R N Road, DumDum","Landmark":"Netaji Club","City":"Kolkata","AreaId":null,"ServiceArea":null,"FamilyId":null,"StateId":35,"StateName":"West Bengal","PinCode":700079,"CountryId":1,"CountryName":"India","IsDeleted":0,"WarehouseId":1,"MedDiscPercent":20,"IsLab":1,"CustContactNo":null,"RecepientName":null}],"CustomerType":"N"}}}
  //     console.log(data, data['result']['rs']['allAddressData']);
  //     this.addressList = data['result']['rs']['allAddressData'];
  //   })
  // }

  addAdrType(adrType: any, action: any) {
    // console.log(adrType);
    this.addressType = adrType;
    if (action == 'add') {
      this.AddressForm.patchValue({ Pincode: this.CommonService.PinCode });
      if (this.addressType == 'shipping') {
        this.checkServiceArea();
        this.newaddress.nativeElement.click();
      } else {
        this.newaddress.nativeElement.click();
      }
    }
  }

  getAddressList() {
    // this.addressList = [];
    this.CommonService.getAllAddress('cartuserapp/getall_addresses').subscribe((data: any) => {
      if (data['data']['all_address'] != undefined) {
        // console.log(data, data['data']['all_address']);
        this.addressList = data['data']['all_address'];
        this.setShippingAddress(this.shippingId);
        this.setBillingAddress(this.billingId);
      }
    });
  }

  checkServiceArea() {
    this.state_city = '';
    this.serviceAreaMsg = false;
    // console.log(this.AddressForm.value.Pincode, this.state_city);
    let checkPin = this.AddressForm.value.Pincode;
    if (this.AddressForm.value.Pincode.length == 6) {
      let fd = new FormData();
      fd.append('pincode', checkPin);
      this.CommonService.checkServiceArea('webapi/cartuserapp/get_nearest_area', fd).subscribe((res: any) => {
        // console.log(res);
        if (res && res['status'] == 'success') {
          this.state_city = res['state_city'];
          // console.log(this.state_city);
        } else {
          this.state_city = 'Service not available yet.';
          this.serviceAreaMsg = true;
        }
      });
    }
  }

  saveNewAddress() {
    this.submitted = true;
    this.msgText = '';
    // stop here if form is invalid
    if (this.AddressForm.invalid) {
      return;
    } else if (this.serviceAreaMsg == true && this.addressType == 'shipping') {
      // alert('Service not available yet.');
      this.msgText = 'Service not available yet.';
      this.open.nativeElement.click();
      return;
    } else {
      let fd = new FormData();
      fd.append('address_type', 'shipping');
      fd.append('add_name', this.AddressForm.value.ContactPerson);
      fd.append('add_address', this.AddressForm.value.Addressline);
      fd.append('user_address_type', this.AddressForm.value.AddressType);
      fd.append('add_landmark', this.AddressForm.value.Landmark);
      fd.append('add_pin', this.AddressForm.value.Pincode);
      fd.append('mobile_number', this.AddressForm.value.MobileNo);
      if (this.AddressForm.value.MobileNo != '') {
        fd.append('recepient_name', this.AddressForm.value.ContactPerson);
      }
      // console.log(this.AddressForm.value, fd);

      this.CommonService.addAddress('cartuserapp/create_address', fd).subscribe((res: any) => {
        // console.log(res);
        if (res && res['status'] == 1) {
          // this.shippingId = res['AddressId'];
          // this.billingId = res['AddressId'];
          // this.new
          // this.getAddressList();
          this.doAssignAddress(res['AddressId'], this.AddressForm.value.Pincode);

          this.closebutton.nativeElement.click();
          this.onReset();
        } else {
          // alert('some thing went wrong. please try again');
          this.msgText = 'Unable to process request, please try after some time.';
          this.open.nativeElement.click();
        }
      }
      );
    }
  }

  onReset() {
    this.submitted = false;
    this.AddressForm.reset();
    this.state_city = '';
    this.serviceAreaMsg = false;
    this.AddressForm.patchValue({
      AddressType: 'H',
      // AddressName: ''
    });
  }

  resetEmail() {
    this.emailsubmit = false;
    this.EmailIdForm.reset();
    this.msgText = '';
  }

  getPdf(path: any) {
    // console.log(pID);
    // target="_blank" href="{{ CommonService.baseurl }}pages/view/privacy-policy";
    let linkpath = this.CommonService.catalogUrl + 'customer/dwnpres?pname=' + path;
    window.open(linkpath);
  }

  setShippingAddress(id: any) {
    this.paymentFlg = false;
    // console.log(id, this.addressList);
    // id='';
    if (id == '' || id == null || id == undefined) {
      this.selectedAddress = '';
      // console.log(this.selectedAddress);
    } else {
      if (this.addressList.length > 0) {
        this.selectedAddress = this.addressList.find(
          (adr: any) => adr.AddressId == id
        );
        this.checkBilling(this.selectedAddress.AddressId);
        this.paymentFlg = true;
      } else {
        this.selectedAddress = '';
      }
      // this.closeAdssBtn.nativeElement.click();
    }
  }

  checkBilling(billindId: any) {
    if (this.billingId == billindId) {
      this.billingCheck = true;
      this.billingAddress = this.selectedAddress;
    } else {
      this.billingCheck = false;
      this.setBillingAddress(billindId);
    }
  }

  setBillingAddress(id: any) {
    // console.log(id, this.addressList);
    if (id == '' || id == null || id == undefined) {
      this.billingAddress = '';
      // console.log(this.billingAddress);
    } else {
      if (this.addressList.length > 0) {
        this.billingAddress = this.addressList.find((adr: any) => adr.AddressId == id);
      } else {
        this.billingAddress = '';
      }
      // this.closesavedAdssBtn.nativeElement.click();
    }
  }

  changeBilling(evnt: any) {
    // console.log(evnt.target.checked);
    if (evnt.target.checked == true) {
      this.billingCheck = true;
      this.billingAddress = this.selectedAddress;
      // console.log(this.selectedAddress)
      let fd = new FormData();
      fd.append('ShippingId', '');
      fd.append('BillingId', this.selectedAddress.AddressId);
      fd.append('PinCode', 'NULL');
      this.CommonService.saveShipBillAddress('cartuserapp/save_ship_bill_address', fd).subscribe((data: any) => {
        // this.billingId = adressId;
        // this.getAddressList();
      })
    } else {
      this.billingCheck = false;
    }
  }

  getExpectedDeliveryDate() {
    let fd = new FormData();
    fd.append('page', 'CA');
    this.CommonService.getExpectedDelivery('location/get_delivery_date', fd).subscribe((resp: any) => {
      // console.log(resp);
      if (resp['status'] == 200) {
        this.ExpectedDeliveryMsg = resp['data']['Msg'];
      }
    });
  }

  doAssignAddress(adressId: any, pincode: any): void {
    //console.log(value);
    this.msgText = '';

    // debugger
    let fd = new FormData();
    if (this.addressType == 'shipping') {
      fd.append('ShippingId', adressId);
      fd.append('BillingId', adressId);
      fd.append('PinCode', pincode);
    } else {
      fd.append('ShippingId', '');
      fd.append('BillingId', adressId);
      fd.append('PinCode', 'NULL');
    }

    this.assiannablePincode = pincode;

    this.CommonService.saveShipBillAddress('cartuserapp/save_ship_bill_address', fd).subscribe((data: any) => {
      // debugger
      if (data['status'] == 'Success') {
        if (this.addressType == 'shipping') {
          if ((this.CommonService.PinCode != this.assiannablePincode) || this.shippingId == null || this.shippingId == '') {
            //  this.CommonService.userLocationPincode = value['PinCode'];
            let fd = new FormData();
            fd.append('Pincode', this.assiannablePincode.toString());
            this.CommonService.setUserLocation('location/set_user_location', fd).subscribe((resdata: any) => {
              // debugger

              if (resdata && resdata['Status'] == 200) {
                let d: Date = new Date();
                this.cookieService.set('cartsynch', '1', d.getTime() + 86400 * 30, '/'); // cookie set for cartsynch
                // this.cookieService.set('IsLab', value['IsLab'].toString(), d.getTime() + (86400 * 30), "/"); // ISLAB SetCookies
                // this.cookieService.set( 'userLocationPincode', value['PinCode'] );
                if (resdata['Location'] != undefined) {
                  this.CommonService.PanIndiaStateName = resdata['Location']['StateName'];
                  this.CommonService.PanIndiaStateCode = resdata['Location']['StateCode'];
                  this.CommonService.PinCode = resdata['Location']['Pincode'];
                  this.CommonService.WHId = resdata['Location']['WarehouseId'];
                  // this.authService.Warehouse = data['Location']['WarehouseId'];
                  if (
                    resdata['Location']['PanIndia'] == 0 ||
                    resdata['Location']['PanIndia'] == 1
                  ) {
                    this.CommonService.IsPanIndia =
                      resdata['Location']['PanIndia'];
                  } else {
                    if (resdata['Location']['PanIndia'] == 'Y') {
                      this.CommonService.IsPanIndia = 1;
                    } else {
                      this.CommonService.IsPanIndia = 0;
                    }
                  }
                  // DeliverySlab
                  this.getDeliveryChargeSlot();
                  this.getHB_Details();
                  // Delivery Slab
                  this.getAllRecord()
                  this.closebutton.nativeElement.click();
                  this.shippingId = adressId;
                  this.billingId = adressId;
                  this.billingCheck = true;
                  this.getAddressList();
                }
                // this.dialogRef.close(value);
              } else {
                this.msgText =
                  'Something went wrong, please try after some time';
                this.open.nativeElement.click();
              }
              //this.cookieService.set( 'userLocationPincode', value['PinCode'] );
            });
          } else {
            // when pincode is same
            // set shippin address only
            // this.getAddressList();
            this.closebutton.nativeElement.click();
            this.shippingId = adressId;
            this.billingId = adressId;
            this.billingCheck = true;
            this.getAddressList();
          }
        } else {
          // set billing address only
          // this.getAddressList();
          this.closebutton.nativeElement.click();
          this.billingId = adressId;
          this.getAddressList();
          // this.setBillingAddress(adressId);
          // debugger
        }
        this.closeAdssBtn.nativeElement.click();
        this.closesavedAdssBtn.nativeElement.click();
        // }
      } else if (data['status'] == 'WhFail') {
        //let selectedState = data['res']['StateName'];
        // this.selectedAddressId = 0;
        let d: Date = new Date();
        this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
        let selectedState = data['res']['MsgStateName'];
        let selectedCity = data['res']['MsgCityName'];
        let MsgStateCode = data['res']['MsgStateCode'];
        let currentState = this.CommonService.PanIndiaStateName;
        let currentStateCode = this.CommonService.PanIndiaStateCode;
        let confirmtitle = '';
        if (currentStateCode != MsgStateCode) {
          if (selectedCity != '' && selectedCity != undefined) {
            confirmtitle =
              'Your location is currently set to ' +
              currentState +
              '. But you are choosing a delivery location from ' +
              selectedState +
              ', ' +
              selectedCity +
              '. Some product may not be available at ' +
              selectedState +
              ', ' +
              selectedCity +
              '. Press OK to proceed.';
          } else {
            confirmtitle =
              'Your location is currently set to ' +
              currentState +
              '. But you are choosing a delivery location from ' +
              selectedState +
              '. Some product may not be available at ' +
              selectedState +
              '. Press OK to proceed.';
          }
        } else if (currentStateCode == MsgStateCode) {
          if (selectedCity != '' && selectedCity != undefined) {
            //confirmtitle = " Some product may not be available at " + selectedState + ", " + selectedCity + ". Press OK to proceed.";
            confirmtitle = " Sorry, some products of your cart might be currently Out of Stock or Not Available at your location. ";
            // ' We apologize that some items of your cart are not in stock OR not available at your location';
          } else {
            //confirmtitle = " Some product may not be available at " + selectedState + ". Press OK to proceed.";
            confirmtitle = " Sorry, some products of your cart might be currently Out of Stock or Not Available at your location. ";
            // ' We apologize that some items of your cart are not in stock OR not available at your location ';
          }
        }
        // alert(data['status']);
        // this.whFail = true;
        this.msgText = confirmtitle;
        this.whFailMod.nativeElement.click();
      } else if (data['status'] == 'WhFail2') {
        // this.selectedAddressId = 0;
        let d: Date = new Date();
        this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
        let selectedState = data['res']['MsgStateName'];
        let selectedCity = data['res']['MsgCityName'];
        let MsgStateCode = data['res']['MsgStateCode'];
        let currentState = this.CommonService.PanIndiaStateName;
        let currentStateCode = this.CommonService.PanIndiaStateCode;
        let confirmtitle = '';
        if (currentStateCode != MsgStateCode) {
          if (selectedCity != '' && selectedCity != undefined) {
            confirmtitle =
              'Your location is currently set to ' +
              currentState +
              '. But you are choosing a delivery location from ' +
              selectedState +
              ', ' +
              selectedCity +
              '. Some product may not be available at ' +
              selectedState +
              ', ' +
              selectedCity +
              '. Press OK to proceed.';
          } else {
            confirmtitle =
              'Your location is currently set to ' +
              currentState +
              '. But you are choosing a delivery location from ' +
              selectedState +
              '. Some product may not be available at ' +
              selectedState +
              '. Press OK to proceed.';
          }
        } else if (currentStateCode == MsgStateCode) {
          if (selectedCity != '' && selectedCity != undefined) {
            confirmtitle = " Sorry, some products of your cart is currently Out of Stock or Not Available at your location. ";
            // ' We apologize that some items of your cart are not in stock OR not available at your location';
          } else {
            confirmtitle = " Sorry, some products of your cart is currently Out of Stock or Not Available at your location. ";
            // ' We apologize that some items of your cart are not in stock OR not available at your location';
          }
        }

        // this.whFail = true;
        this.msgText = confirmtitle;
        this.whFailMod.nativeElement.click();
        // }
      } else if (data['status'] == 'WhFail3' || data['status'] == 'WhFail4') {
        let d: Date = new Date();
        this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
        // this.selectedAddressId = 0;
        // get non- couriable products
        let productStr = '';
        // alert(data['status'])
        // this.finalList.cartList().subscribe(data => {

        // this.productListdata = data;
        if (this.finalList.length > 0) {
          for (let i = 0; i < this.finalList.length; i++) {
            if (this.finalList[i]['IsCourierable'] == 0) {
              if (i == 0) {
                productStr += this.finalList[i]['ProductName'];
              } else {
                productStr += ', ' + this.finalList[i]['ProductName'];
              }
            }
          }
          // alert Message
          this.msgText = `The items (` + productStr + `) can not be delivered to your selected Pincode.`;
          this.open.nativeElement.click();
        }

        // });
      } else if (data['status'] == 'CourierFail') {
        // this.selectedAddressId = 0;
        // alert Message
        let confirmtitle = `Currently we are not servicing in your area.`;
        // this.whFail = true;
        this.msgText = confirmtitle;
        this.open.nativeElement.click();
      } else {
        // this.selectedAddressId = 0;
        let confirmtitle = `Oops, something went wrong. Try again after sometime, to change your shipping address. `;
        // this.whFail = true;
        this.msgText = confirmtitle;
        this.open.nativeElement.click();
      }
    });
  }

  whFailCnf() {
    this.CommonService.clearCart('cartapp/clearCart').subscribe((response: any) => {
      if (response['Status'] == 'Success') {
        let fd = new FormData();
        fd.append('Pincode', this.assiannablePincode.toString());
        this.CommonService.setUserLocation('location/set_user_location', fd).subscribe((data: any) => {
          // debugger
          if (data['Status'] == 200) {
            let d: Date = new Date();
            // this.cookieService.set('cartsynch', '1', d.getTime() + (86400 * 30), "/"); // cookie set for cartsynch
            // this.cookieService.set('IsLab', value['IsLab'].toString(), d.getTime() + (86400 * 30), "/"); // ISLAB SetCookies
            // this.cookieService.set( 'userLocationPincode', value['PinCode'] );
            if (data['Location'] != undefined) {
              this.CommonService.PanIndiaStateName =
                data['Location']['StateName'];
              this.CommonService.PanIndiaStateCode =
                data['Location']['StateCode'];
              this.CommonService.PinCode = data['Location']['Pincode'];
              this.CommonService.WHId = data['Location']['WarehouseId'];
              // this.authService.Warehouse = data['Location']['WarehouseId'];
              if (
                data['Location']['PanIndia'] == 0 ||
                data['Location']['PanIndia'] == 1
              ) {
                this.CommonService.IsPanIndia = data['Location']['PanIndia'];
              } else {
                if (data['Location']['PanIndia'] == 'Y') {
                  this.CommonService.IsPanIndia = 1;
                } else {
                  this.CommonService.IsPanIndia = 0;
                }
              }
              // DeliverySlab
              this.getDeliveryChargeSlot();
              this.getHB_Details();
              // Delivery Slab
              this.getAllRecord();
              this.ItemListAcd.nativeElement.click()

              // if (data['Location'] != undefined) {
              //   if (data['Location']['PanIndia'] == 0 || data['Location']['PanIndia'] == 1) {
              //   } else {
              //     if (data['Location']['PanIndia'] == 'Y') {
              //     } else {
              //     }
              //   }
              //   this.getAllRecord();
              // }
            }
            //this.cookieService.set( 'userLocationPincode', value['PinCode'] );
          }
        });
      }
    }
    );
  }

  getDeliveryChargeSlot() {
    let temp = {
      panindia: this.CommonService.IsPanIndia,
      pincode: this.CommonService.PinCode,
      warehouseId: this.CommonService.WHId.toString(),
    };
    this.CommonService.getCatalogData('sspl/getdeliverychargeslot', temp).subscribe((response: any) => {
      // console.log('dl slot', response);
      if (response['msgcode'] == 1) {
        this.DeliveryChargeSlab = response['DeliveryChargeSlab'];

        for (let i = 0; i < this.DeliveryChargeSlab.length; i++) {
          if (this.DeliveryChargeSlab[i]['DeliveryCharge'] == 0) {
            this.MinOrderSlabAmtForFreeShipping = this.DeliveryChargeSlab[i]['MinAmount'];
          }
        }
      }
    });
  }
getHB_Details() {
    let panindia = this.CommonService.IsPanIndia;
    let pincode = this.CommonService.PinCode;
    let warehouseId = this.CommonService.WHId.toString();
    this.CommonService.getHBDetails(`customer/v1/product/getsellername?pincode=${pincode}&whid=${warehouseId}&panindia=${panindia}`).subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp['response_code'] == 200) {
        let data = resp['data'];
        // Remove everything after <br>
        if (data.HBName) {
          data.HBName = data.HBName.split('<br>')[0].trim();
        }
        this.sellerDetails = data;
      } else {
        this.sellerDetails = '';
      }
    });
  }
  // applyCoupon(code: any){
  //   console.log(code);
  // }

  applyCoupon(code: any, type: any) {
    // console.log(this.AppliedCouponFlg)
    // debugger
    this.removeType = '';
    if ((code == '' || code == null || code == undefined) && type == 'addCoupon') {
      this.msgText = 'Please enter a valid coupon code.';
      this.open.nativeElement.click();
      return;
    } else {
      let cartValBeforeApply: any = this.headerDetails.CartVal;
      this.msgText = '';
      let fd = new FormData();
      fd.append('CouponCode', code);
      fd.append('PromoId', '0');

      this.CommonService.applyCouponCode('cartapp/apply_coupon_code', fd).subscribe((response: any) => {
        // console.log(response);
        // debugger
        if (response && response['status'] == 'success') {
          // this.orderDetails['header_cart_detail'][0] = response['order_summery_block'];
          this.headerDetails = response['order_summery_block'];
          // total saving
          this.totalSaving = 0;

          if (
            this.headerDetails.CartItemDiscount != null &&
            this.headerDetails.CartItemDiscount != ''
          ) {
            this.totalSaving += parseFloat(this.headerDetails.CartItemDiscount);
          }
          if (
            this.headerDetails.CouponDiscount != null &&
            this.headerDetails.CouponDiscount != '' &&
            this.headerDetails.CouponDiscount != '.00'
          ) {
            this.totalSaving += parseFloat(this.headerDetails.CouponDiscount);
          }
          if (this.headerDetails.PromoDiscount != null && this.headerDetails.PromoDiscount != '') {
            this.totalSaving += parseFloat(this.headerDetails.PromoDiscount);
          } if (this.headerDetails.CartVal <= this.headerDetails.BaseShippingChargeCartVal) {
            this.totalSaving += parseFloat(this.headerDetails.BaseShippingCharge);
          }
          if (this.headerDetails.AppliedCouponCode != null && this.headerDetails.AppliedCouponCode != '') {
            this.AppliedCouponFlg = true;
            // alert('Coupon applied successfully');
            // this.msgText = 'Coupon applied successfully';
            // this.open.nativeElement.click();
            // this.appliedCuppon.nativeElement.value = '';
          } else {
            this.AppliedCouponFlg = false;
            // alert('Coupon removed successfully');
            // this.msgText = 'Coupon removed successfully';
            // this.open.nativeElement.click();
          }
          if (type == 'addCoupon') {
            this.msgText = 'Coupon applied successfully';
            this.couponAppliedWebEngage(this.headerDetails, code, cartValBeforeApply)
          } else if (type == 'removeCoupon') {
            this.msgText = 'Coupon removed successfully';
            this.couponRemoveWebEngage();
          }

          let ptfDisc: any = this.headerDetails.BaseConvienceFee - this.headerDetails.ConvienceFee;
          this.totalSaving += parseFloat(ptfDisc);

          if (this.useWallet == true) {
            this.setPayableAmnt()
          } else {
            this.payableAmount = this.headerDetails.CartVal;
          }

          if (this.useCardBalance == true) {
            this.setCFHBalance()
          } else {
            this.cfhBalance = this.headerDetails.CartVal;
          }

          this.removeType = 'CouponSuccess';
          this.open.nativeElement.click();
          this.appliedCuppon.nativeElement.value = '';
        } else {
          // alert(response['msg']);
          this.removeType = 'CouponFailed';
          this.msgText = response['msg'];
          this.open.nativeElement.click();
          this.appliedCuppon.nativeElement.value = '';
        }
      });

      this.resetPG(); 
    }
  }

  getPaymentOptions() {
    this.spinner.show();
    this.selectedPG = '';
    // this.isCheckedTmc = false;
    this.isCheckedTmc = true;
    this.CommonService.get_PG_List('cartapp/getpaymentoptions').subscribe((response: any) => {
      if (response['response_code'] == 0) {
        // console.log('pg list', response);
        this.pglist = response['data']['pg_list'];
        if (this.pglist.length > 0) {
          this.paymentContinue = true;
          this.selectedPG = this.pglist[0].PGListingId;
        } else {
          this.paymentContinue = false;
          this.selectedPG = '';
        }
        this.spinner.hide();
      }
    });
  }

  // chekTermandCondition() {
  //   if (this.isCheckedTmc == false) {
  //     this.isCheckedTmc = true;
  //   } else {
  //     this.isCheckedTmc = false;
  //   }
  //   // console.log(this.isCheckedTmc);
  // }

  // ========== PRESCRIPTION VALIDATION METHODS ==========

  validatePrescriptionUploads(): boolean {
    let humanPrescriptionRequired = this.headerDetails['NeedToAttachPrescription'] == 'Y' && this.ReqPrscListHuman.length > 0;
    let petPrescriptionRequired = this.headerDetails['NeedToAttachPetCarePrescription'] == 'Y' && this.ReqPrscListPet.length > 0;

    // Check human prescription
    if (humanPrescriptionRequired && this.headerDetails['IsPrescriptionUploaded'] == 0) {
      let hasHumanFiles = this.prscFiles.length > 0 || this.savedPrscFile.length > 0;
      if (!hasHumanFiles) {
        this.msgText = 'Please upload prescription for human medicines';
        this.open.nativeElement.click();
        return false;
      }
    }

    // Check pet prescription
    if (petPrescriptionRequired && this.headerDetails['IsPetCarePrescriptionUploaded'] == 0) {
      let hasPetFiles = this.prscFilesPet.length > 0 || this.savedPrscFilePet.length > 0;
      if (!hasPetFiles) {
        this.msgText = 'Please upload prescription for pet medicines';
        this.open.nativeElement.click();
        return false;
      }
    }

    return true;
  }

  // ========== APPEND FILES TO FORMDATA ==========

  appendPrescriptionFilesToFormData(fd: FormData): void {
    // Append human prescription files
    if (this.prscFiles && this.prscFiles.length > 0) {
      this.prscFiles.forEach((file: any, index: number) => {
        fd.append(`human_prescription_${index}`, file, file.name);
      });
      fd.append('human_prescription_count', this.prscFiles.length.toString());
    } else {
      fd.append('human_prescription_count', '0');
    }

    // Append saved human prescription references
    if (this.savedPrscFile && this.savedPrscFile.length > 0) {
      let savedPrescIds = this.savedPrscFile.map((f: any) => f.PrescriptionId).join(',');
      fd.append('saved_human_prescriptions', savedPrescIds);
    }

    // Append pet prescription files
    if (this.prscFilesPet && this.prscFilesPet.length > 0) {
      this.prscFilesPet.forEach((file: any, index: number) => {
        fd.append(`pet_prescription_${index}`, file, file.name);
      });
      fd.append('pet_prescription_count', this.prscFilesPet.length.toString());
    } else {
      fd.append('pet_prescription_count', '0');
    }

    // Append saved pet prescription references
    if (this.savedPrscFilePet && this.savedPrscFilePet.length > 0) {
      let savedPetPrescIds = this.savedPrscFilePet.map((f: any) => f.PrescriptionId).join(',');
      fd.append('saved_pet_prescriptions', savedPetPrescIds);
    }

    // Add flags indicating prescription status
    fd.append('has_human_prescriptions', (this.ReqPrscListHuman.length > 0).toString());
    fd.append('has_pet_prescriptions', (this.ReqPrscListPet.length > 0).toString());
  }

  assignPayment(value: any) {
    // let defaultgateway = value['PGListingId'];
    this.selectedPG = value['PGListingId'];
    // let index = this.checkEmailForPayment.indexOf(value['Key']);
    // console.log(value);
  }

  // placeOrder(data: any) {
  //   // console.log(data);
  //   // debugger
  //   this.PGROW = data;
  //   this.msgText = '';
  //   if (this.isCheckedTmc == false) {
  //     this.msgText = 'Please accept the Terms and Conditions and Privacy Policy to proceed.';
  //     this.open.nativeElement.click();
  //   } else {
  //     this.productCheckoutStartedWebEngage(this.headerDetails, this.finalList)
  //     if (data['Key'] == 'COD') {
  //       // this.msgText = 'Processing your order do not refresh page or press back button';
  //       // this.open.nativeElement.click();
  //       this.msgText = '';
  //       this.spinner.show();
  //       let fd = new FormData();

  //       fd.append('PaymentMethod', 'COD');
  //       fd.append('EwalletUsed', '0');
  //       if (this.useWallet == true) {
  //         if (this.headerDetails.CartVal >= this.walletBalance) {
  //           fd.append('WalletAmount', this.walletBalance);
  //         } else {
  //           fd.append('WalletAmount', this.headerDetails.CartVal);
  //         }
  //       } else {
  //         fd.append('WalletAmount', '0');
  //       }
  //       if (this.headerDetails['NeedToAttachPrescription'] == 'Y') {
  //         fd.append('Prescription_required', '1');
  //       } else {
  //         fd.append('Prescription_required', '0');
  //       }
  //       fd.append('ShipID', this.shippingId);
  //       fd.append('IsLocalCourierable', this.headerDetails['IsLocalCourierable']);

  //       this.CommonService.paymentInitiate('cartapp/online_payment_process', fd).subscribe((response: any) => {
  //         // console.log('online_payment_process', response);

  //         if (response['Status'] == 'Success') {
  //           this.productCheckoutCompletedWebEngage(this.headerDetails, this.finalList, response['OrderData']['Order'])
  //           this.orderSuccess(response);
  //         } else {
  //           this.msgText = response['StatusMsg'];
  //           this.spinner.hide();
  //           this.open.nativeElement.click();
  //           // this.refundWallet();
  //         }
  //       });
  //     } else {
  //       // if(this.CommonService.EmailId == '' || this.CommonService.EmailId == null || this.CommonService.EmailId == undefined){
  //       //   this.emailUpdate.nativeElement.click();
  //       // } else {
  //       this.processDgPay(data);
  //       // }
  //     }
  //   }
  // }
  placeOrder(data: any) {
    // console.log(data);
    // debugger
    this.PGROW = data;
    this.msgText = '';
//     if (this.isCheckedTmc == false) {
//       this.msgText = 'Please accept the Terms and Conditions and Privacy Policy to proceed.';
//       this.open.nativeElement.click();
//     } else {
      this.productCheckoutStartedWebEngage(this.headerDetails, this.finalList)
      if (data['Key'] == 'COD') {
        // this.msgText = 'Processing your order do not refresh page or press back button';
        // this.open.nativeElement.click();
        this.msgText = '';
        this.spinner.show();
        let fd = new FormData();

        fd.append('PaymentMethod', 'COD');
        fd.append('EwalletUsed', '0');
        if (this.useWallet == true) {
          if (this.headerDetails.CartVal >= this.walletBalance) {
            fd.append('WalletAmount', this.walletBalance);
          } else {
            fd.append('WalletAmount', this.headerDetails.CartVal);
          }
        } else {
          fd.append('WalletAmount', '0');
        }
        if (this.useCardBalance == true) {
          fd.append('user_gift_card', '1');
          fd.append('deduction_amount',this.deduction);
          if(!this.forAllProducts)  
            fd.append('is_jito','1');
          else
            fd.append('is_jito','0');
        } else {
          fd.append('user_gift_card', '0');
        }
        if (this.headerDetails['NeedToAttachPrescription'] == 'Y') {
          fd.append('Prescription_required', '1');
        } else {
          fd.append('Prescription_required', '0');
        }
        if (this.headerDetails['NeedToAttachPetCarePrescription'] == 'Y') {
          fd.append('Pet_Prescription_required', '1');
        } else {
          fd.append('Pet_Prescription_required', '0');
        }
        fd.append('ShipID', this.shippingId);
        fd.append('IsLocalCourierable', this.headerDetails['IsLocalCourierable']);

        this.CommonService.paymentInitiate('cartapp/online_payment_process', fd).subscribe((response: any) => {
          // console.log('online_payment_process', response);

          if (response['Status'] == 'Success') {
            this.productCheckoutCompletedWebEngage(this.headerDetails, this.finalList, response['OrderData']['Order'])
            this.orderSuccess(response);
          } else {
            this.msgText = response['StatusMsg'];
            this.spinner.hide();
            this.open.nativeElement.click();
            // this.refundWallet();
          }
        });
      } else {
        // if(this.CommonService.EmailId == '' || this.CommonService.EmailId == null || this.CommonService.EmailId == undefined){
        //   this.emailUpdate.nativeElement.click();
        // } else {
        this.processDgPay(data);
        // }
      }
//     }
  }

  placeWalletOnly() {
    // this.PGROW = data;
    this.msgText = '';
    // if (this.isCheckedTmc == false) {
    //   this.msgText = 'Please accept the Terms and Conditions and Privacy Policy to proceed.';
    //   this.open.nativeElement.click();
    //   return;
    // } else {
      // Validate prescription uploads before payment
      if (!this.validatePrescriptionUploads()) {
        return; // Error message already shown by validation method
      }
      
      this.msgText = '';
      this.spinner.show();
      let fd = new FormData();

      fd.append('PaymentMethod', 'EW');
      fd.append('EwalletUsed', '0');
      if (this.useWallet == true) {
        if (this.headerDetails.CartVal >= this.walletBalance) {
          fd.append('WalletAmount', this.walletBalance);
        } else {
          fd.append('WalletAmount', this.headerDetails.CartVal);
        }
      } else {
        fd.append('WalletAmount', '0');
      }
      if (this.useCardBalance == true) {
        fd.append('user_gift_card', '1');
        fd.append('deduction_amount',this.deduction);
        if(!this.forAllProducts)  
            fd.append('is_jito','1');
          else
            fd.append('is_jito','0');
      } else {
        fd.append('user_gift_card', '0');
      }
      if (this.headerDetails['NeedToAttachPrescription'] == 'Y') {
        fd.append('Prescription_required', '1');
      } else {
        fd.append('Prescription_required', '0');
      }
      if (this.headerDetails['NeedToAttachPetCarePrescription'] == 'Y') {
        fd.append('Pet_Prescription_required', '1');
      } else {
        fd.append('Pet_Prescription_required', '0');
      }
      fd.append('ShipID', this.shippingId);
      fd.append('IsLocalCourierable', this.headerDetails['IsLocalCourierable']);

      // ========== APPEND PRESCRIPTION FILES FOR WALLET ONLY ==========
      this.appendPrescriptionFilesToFormData(fd);

      this.CommonService.paymentInitiate('cartapp/online_payment_process', fd).subscribe((response: any) => {
        // console.log('online_payment_process', response);

        if (response['Status'] == 'Success') {
          this.orderSuccess(response);
        } else {
          this.msgText = response['StatusMsg'];
          this.spinner.hide();
          this.open.nativeElement.click();
          // this.refundWallet();
        }
      });
    // }
  }

  placeCFHOnly() {
    // this.PGROW = data;
    this.msgText = '';
    // if (this.isCheckedTmc == false) {
    //   this.msgText = 'Please accept the Terms and Conditions and Privacy Policy to proceed.';
    //   this.open.nativeElement.click();
    //   return;
    // } else {
      // Validate prescription uploads before payment
      if (!this.validatePrescriptionUploads()) {
        return; // Error message already shown by validation method
      }
      
      this.productCheckoutStartedWebEngage(this.headerDetails, this.finalList)
      this.msgText = '';
      this.spinner.show();
      let fd = new FormData();
      fd.append('PaymentMethod', 'COD');
      fd.append('EwalletUsed', '0');
      fd.append('WalletAmount', '0');
      if (this.useCardBalance == true) {
        fd.append('user_gift_card', '1');
        fd.append('deduction_amount',this.deduction);
        if(!this.forAllProducts)  
            fd.append('is_jito','1');
          else
            fd.append('is_jito','0');
      } else {
        fd.append('user_gift_card', '0');
      }
      if (this.headerDetails['NeedToAttachPrescription'] == 'Y') {
        fd.append('Prescription_required', '1');
      } else {
        fd.append('Prescription_required', '0');
      }
      if (this.headerDetails['NeedToAttachPetCarePrescription'] == 'Y') {
        fd.append('Pet_Prescription_required', '1');
      } else {
        fd.append('Pet_Prescription_required', '0');
      }
      fd.append('ShipID', this.shippingId);
      fd.append('IsLocalCourierable', this.headerDetails['IsLocalCourierable']);

      // ========== APPEND PRESCRIPTION FILES ==========
      this.appendPrescriptionFilesToFormData(fd);

      this.CommonService.paymentInitiate('cartapp/online_payment_process', fd).subscribe((response: any) => {
        // console.log('online_payment_process', response);
        
        if (response['Status'] == 'Success') {
          this.productCheckoutCompletedWebEngage(this.headerDetails, this.finalList, response['OrderData']['Order'])
          this.orderSuccess(response);
        } else {
          this.msgText = response['StatusMsg'];
          this.spinner.hide();
          this.open.nativeElement.click();
          // this.refundWallet();
        }
      });
    // }
  }

  processDgPay(data: any) {
    console.log(data);
    console.log(this.useCardBalance);
    this.msgText = '';
    this.spinner.show();
    let fd = new FormData();
    // if (data['GateWayPayMode'] != '' && data['GateWayPayMode'] != null) {
    //   fd.append('PaymentMode', data['GateWayPayMode']);
    // } else {
    //   fd.append('PaymentMode', '');
    // }
    if (data['PgType'] != '' && data['PgType'] != null && data['PgType'] != undefined) {
      fd.append('PaymentMode', data['PgType']);
    } else {
      fd.append('PaymentMode', '');
    }
    if (data['Key'] == 'PAYTMPG') {
      fd.append('PaymentMethod', 'PAYTMPG');
    } else {
      fd.append('PaymentMethod', data['Key']);
    }
    // if (this.useWallet == true) {
    //   if (this.headerDetails.CartVal >= this.walletBalance) {
    //     fd.append('WalletAmount', this.walletBalance);
    //   } else {
    //     fd.append('WalletAmount', this.headerDetails.CartVal);
    //   }
    // } else {
    //   fd.append('WalletAmount', '0');
    // }
     if (this.useCardBalance == true) {
        fd.append('user_gift_card', '1');
        fd.append('deduction_amount',this.deduction);
        if(!this.forAllProducts)  
            fd.append('is_jito','1');
          else
            fd.append('is_jito','0');
      } else {
        fd.append('user_gift_card', '0');
      }
    fd.append('WalletAmount', '0');
    fd.append('EwalletUsed', '0');
    if (this.headerDetails['NeedToAttachPrescription'] == 'Y') {
      fd.append('Prescription_required', '1');
    } else {
      fd.append('Prescription_required', '0');
    }
    if (this.headerDetails['NeedToAttachPetCarePrescription'] == 'Y') {
      fd.append('Pet_Prescription_required', '1');
    } else {
      fd.append('Pet_Prescription_required', '0');
    }
    fd.append('ShipID', this.shippingId);
    fd.append('IsLocalCourierable', this.headerDetails['IsLocalCourierable']);
    fd.append('BankCode', '');
    fd.append('EmailID', this.CommonService.EmailId);

    // ========== APPEND PRESCRIPTION FILES ==========
    this.appendPrescriptionFilesToFormData(fd);

    // this.CommonService.paymentInitiate('cartapp/online_payment_process', fd).subscribe((response: any) => {
    this.CommonService.paymentInitiate('cartapp/gatewayinfo', fd).subscribe((response: any) => {
      // console.log("p.res", response);
      // debugger
      // this.makePayment()
      if (response && response['Status'] == 'Success') {

        let d: Date = new Date();
        this.cookieService.set('defaultGateway', data['Key'], d.getTime() + 86400 * 30, '/');
        this.cookieService.set('GateWayPayMode', data['PgType'], d.getTime() + 86400 * 30, '/');
        //this.cookieService.set( 'defaultGateway', '');
        //if(value['Key'] == 'PAYTMPGJS'){

        if (data['Key'] == 'PAYTMPG') {
          // console.log("working file");
          let txnToken = response['PGData']['result']['PaytmPgMerchantDetails']['txnToken'];
          let orderId = response['PGData']['result']['PaytmPgMerchantDetails']['orderId'];
          let amount = response['PGData']['result']['PaytmPgMerchantDetails']['amount'];

          onScriptLoad(txnToken, orderId, amount);
          this.spinner.hide();

        } else if (data['Key'] == 'RAZORPAY') {
          let RZdata = response['PGData']['result']['data']['RazorpayMerchantDetails'];
          this.makePayment(RZdata);
          this.spinner.hide();
        } else if (data['Key'] == 'PHONEPE') {
          let PPdata = response['PGData']['result']['data']['PhonepeDetails'];
          this.PhonePepayment(PPdata);
          this.spinner.hide();
        } else if (data['Key'] == 'EASEBUZZ') {
          let EZdata = response['PGData']['result']['data']['EasebuzzDetails'];
          this.EASEBUZZPepayment(EZdata);
          this.spinner.hide();
        }
      } else {
        this.msgText = response['StatusMsg'];
        this.open.nativeElement.click();
        this.spinner.hide();
        // this.refundWallet();
      }
    });
  }

  resetPG() {
    this.selectedPG = '';
    // this.isCheckedTmc = false;
    this.isCheckedTmc = true;
    if (this.pglist.length > 0) {
      // this.paymentContinue = true;
      this.selectedPG = this.pglist[0].PGListingId;
    }
    this.PGROW = '';
  }

  AddEmailId() {
    this.msgText = '';
    this.emailsubmit = true;
    // console.log(this.EmailIdForm.value);
    if (this.EmailIdForm.invalid) {
      return;
    } else {
      this.spinner.show();
      let fd = new FormData();
      fd.append('EmailId', this.EmailIdForm.value.emailId);
      this.CommonService.emailUpdate('customer/updateCustomerDetails', fd).subscribe((resp: any) => {
        // console.log(resp);
        // this.UserEmail = result['email'];
        if (resp && resp['response_code'] == 0) {
          this.CommonService.EmailId = resp['email'];
          this.closeEmailMod.nativeElement.click();
          this.processDgPay(this.PGROW);
        } else if (resp['response_code'] == 3) {
          this.spinner.hide();
          this.msgText = resp['message']
          // alert(resp['message']);

        } else {
          this.spinner.hide();
          this.msgText = resp['message']
          // alert(resp['message']);
        }
      });
    }
  }

  ngOnDestroy() {
    this.addOrder.unsubscribe();
  }

  numCheck(event: any) {
    return event.charCode == 8 || event.charCode == 0 || event.charCode == 13 ? null : event.charCode >= 48 && event.charCode <= 57;
  }

  async makePayment(data: any) {
    const options: any = {
      key: data.razorpay_key,
      amount: data.amount_due, // amount in paisa
      currency: data.currency,
      name: "SastaSundar",
      description: '',
      image: 'incom/retail_WH/images/small_logo.png',
      order_id: data.id,
      // handler: (response: any) => {
      //   console.log('payment response', response)
      // },
      prefill: {
        name: this.CommonService.UserName,
        email: this.CommonService.EmailId,
        contact: this.CommonService.Mobile
      },
      modal: {
        // We should prevent closing of the form when esc key is pressed.
        escape: false,
      },
      notes: {
        amount: data.amount_due,
        receipt: data.receipt
      },
      theme: {
        color: '#3399cc'
      },
    };

    options.handler = ((response: any, error: any) => {
      options.response = response;
      // debugger
      // console.log(options);
      this.spinner.show();
      let fd = new FormData();
      fd.append('receipt', data.receipt);
      fd.append('amount', data.amount_due);
      fd.append('razorpay_payment_id', response.razorpay_payment_id);
      fd.append('razorpay_order_id', response.razorpay_order_id);
      fd.append('razorpay_signature', response.razorpay_signature);
      // fd.append('response', response);
      this.CommonService.paymentSuccess('cartapp/razorpay_payment_success', fd).subscribe((rsp: any) => {
        // console.log(rsp)
        if (rsp && rsp.response_code == 0) {
          this.productCheckoutCompletedWebEngage(this.headerDetails, this.finalList, rsp['data']['Orders']);
          this.orderSuccess(rsp);
          // alert(rsp['message']);
        } else {
          this.msgText = 'Unable to process your request, Please try after some time';
          this.open.nativeElement.click();
          this.spinner.hide();
          // this.refundWallet();
        }
      })
    });
    options.modal.ondismiss = (() => {
      // handle the case when user closes the form while transaction is in progress
      // alert('Transaction cancelled.');
      this.msgText = 'Transaction cancelled. Unable to process your request';
      this.open.nativeElement.click();
      // this.refundWallet();
    });

    const razorpay = new Razorpay(options);
    razorpay.open();
  }

  PhonePepayment(data: any) {
    // console.log(data);
    let url = data.redirectUrl;
    window.open(url, '_self');
  }

  EASEBUZZPepayment(data: any) {
    // console.log(data);
    let url = data.PayUrl;
    window.open(url, '_self');
  }

  orderSuccess(resp: any) {
    let d: Date = new Date();
    this.cookieService.set('defaultGateway', '', d.getTime() + 86400 * 30, '/');
    this.cookieService.set('GateWayPayMode', '', d.getTime() + 86400 * 30, '/');

    this.dbService.clear('cartItems').subscribe((res: any) => {
      // console.log(res);
      if (res == true) {

        var form = document.createElement('form');
        form.setAttribute('action', this.CommonService.codsuccessUrl);
        form.setAttribute('id', 'submitForm');
        form.setAttribute('method', 'POST');
        document.body.appendChild(form);
        let frmObj = <HTMLFormElement>(document.getElementById('submitForm'));
        let sspl_csrf = this.cookieService.get('sspl_csrf');
        let input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', 'csrf_test_name');
        input.setAttribute('value', sspl_csrf);
        frmObj.appendChild(input);
        // csrf token
        this.spinner.hide();
        frmObj.submit();
      } else {
        this.spinner.hide();
      }
    });
  }

  // orderSuccess(response: any){
  //   this.dbService.clear('cartItems').subscribe((res: any) => {
  //     // console.log(res);
  //     if (res == true) {
  //       var form = document.createElement('form');
  //       let obj = response['PGData']['FormData'];
  //       form.setAttribute('action', response['PGData']['ActionUrl']);
  //       form.setAttribute('id', 'submitForm');
  //       form.setAttribute('method', 'POST');
  //       document.body.appendChild(form);
  //       let frmObj = <HTMLFormElement>document.getElementById('submitForm');
  //       Object.keys(obj).forEach(function (key) {
  //         let input = document.createElement("input");
  //         input.setAttribute('type', "hidden");
  //         input.setAttribute('name', key);
  //         input.setAttribute('value', obj[key]);
  //         frmObj.appendChild(input);
  //       });
  //       // this.CommonService.loaderFlg = false;
  //       // csrf token
  //     let sspl_csrf = this.cookieService.get('sspl_csrf');
  //     let input = document.createElement("input");
  //     input.setAttribute('type', "hidden");
  //     input.setAttribute('name',"csrf_test_name");
  //     input.setAttribute('value',sspl_csrf);
  //     frmObj.appendChild(input);
  //     // csrf token
  //       frmObj.submit();
  //     }
  //   });
  // }

  alphaOnly(event: any) {
    return ((event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122) || (event.charCode == 32))
  };

  getWalletBalance() {
    this.spinner.show();
    this.CommonService.custWalletBalance('wallet/getWalletBalance').subscribe((res: any) => {
      if (res && res['response_code'] == 0) {
        // this.walletInfo = res['data'][0];
        this.walletBalance = res['data'][0]['balance'];
        if (this.walletBalance > 0) {
          this.useWallet = true;
        } else {
          this.useWallet = false;
        }
        this.spinner.hide();
      } else {
        // this.walletInfo = [];
        this.walletBalance = 0;
        this.useWallet = false;
        this.spinner.hide();
      }
      // console.log('wallet info',res, this.walletInfo['balance']);
    });
  }

  setWalletUse() {
    if (this.useWallet == true) {
      this.useWallet = false;
      this.payableAmount = this.headerDetails.CartVal;
    } else {
      this.useWallet = true;
      this.setPayableAmnt();
    }
  }

  setPayableAmnt() {
    if (this.headerDetails.CartVal > this.walletBalance) {
      this.payableAmount = this.headerDetails.CartVal - this.walletBalance;
    } else {
      this.payableAmount = 0;
    }
  }

  refundWallet() {
    this.CommonService.custWalletBalance('wallet/initiateWalletRefund').subscribe((res: any) => {
      // console.log(res)
    })
  }

  getCFHBalance(type: any) {
    let MobileNo = this.CommonService.Mobile;
    // let MobileNo = 7777777777; // for testing purpose
    // let res: any = {"status":1,"msg":"success","data":{"BeneficiaryId":47,"searched_beneficiary_remaining_balance":5763}}
    this.CommonService.getCFHBalance(`cfh/get_balance?search=${MobileNo}`).subscribe((res: any) => {
      if (res && res.status == 1) {
        this.cardBalance = res.data.searched_beneficiary_remaining_balance;
        // this.getTransationList();
        if (type == 'add') {
          this.useCardBalance = true;
          this.setCFHBalance();
        }
        this.spinner.hide();
      } else {
        // this.isloading = false;
        this.spinner.hide();
      }
    })
  }

  addCard() {
    this.cfhsubmit = true;
    if (this.AddCardForm.invalid) {
      return;
    } else {
      let data = this.AddCardForm.value.code;
      this.spinner.show();
      this.CommonService.getCFHBalance(`cfh/assign_healthcard?HealthCardCode=${data}`).subscribe((res: any) => {
        if (res && res.status == 1) {
          this.toastr.success('Health Card Added Successfully');
          this.AddCardForm.reset();
          this.cfhsubmit = false;
          this.getCFHBalance('add');
          // this.getTransationList();
        } else {
          this.spinner.hide();
          this.toastr.error(res.data || 'Something went wrong');
        }
      })
    }
  }

  useCardToggle(){
    if (this.useCardBalance == true) {
      this.useCardBalance = false;
      this.cfhBalance = this.headerDetails.CartVal;
      this.selectedPG = this.pglist[0].PGListingId;
    } else {
      this.useCardBalance = true;
      this.setCFHBalance();
    }
  }

  showItemsBreakDown(){
      this.itemsBreakDown = !this.itemsBreakDown;
  }

  setCFHBalance() {
    if (this.headerDetails.CartVal > this.deduction) {
      this.cfhBalance = this.headerDetails.CartVal - this.deduction;
    } else {
      this.cfhBalance = 0;
      this.selectedPG = '';
    }
  }

  setCFHBalance_bkp_270426() {
    if (this.headerDetails.CartVal > this.cardBalance) {
      this.cfhBalance = this.headerDetails.CartVal - this.cardBalance;
    } else {
      this.cfhBalance = 0;
      this.selectedPG = '';
    }
  }

getCFHApplicableAmt() {
    let MobileNo = this.CommonService.Mobile;
    // let MobileNo = 7777777777; // for testing purpose
    // let res: any = {"status":1,"msg":"success","data":{"BeneficiaryId":47,"searched_beneficiary_remaining_balance":5763}}
    this.CommonService.getCFHApplicableAmt(`cfh/get_cfh_applicable_amt?search=${MobileNo}`).subscribe((res: any) => {
      if (res && res.status == 200) {
        this.jitoItems = res.data.JitoItemsBreakdown;
        this.nonJitoItems = res.data.NonjitoItemsBreakdown;
        this.forAllProducts = res.data.applicable_for_all_products;
        this.deduction = res.data.deduction_amount;
        this.total_non_jito_transaction_amount = res.data.NonTotalJitoTransactionAmount;
        this.spinner.hide();
      } else {
        // this.isloading = false;
        this.forAllProducts = 1;  // Reset to default when beneficiary not found
        this.deduction = 0;
        this.jitoItems = [];
        this.nonJitoItems = [];
        this.spinner.hide();
      }
    })
  }

  getAletnatives() {
    let arr: any = [];
    this.finalList.forEach((item: any) => {
      item.PreferredSubtitute = [];
      arr.push(item.ProductId)
    })
    let productIDs = arr.join("|");
    let url = `product_find?product_id=${productIDs}&wh=${this.CommonService.WHId}&token=${this.CommonService.Token}&panindia=${this.CommonService.IsPanIndia}&pincode=${this.CommonService.PinCode}`
    this.CommonService.getAlternativeList(url).subscribe((res: any) => {
      // console.log(res)
      if (res) {
        this.setSubProduct(res)
      }
    })
  }

  setSubProduct(res: any) {
    res['items'].forEach((prdct: any) => {
      let mdLst: any = [];
      let mUnitPrice = 0;
      if (this.CommonService.ConfigData.GenericPercentageCalOnOfferPrice == 'Y') {
        mUnitPrice = prdct.OfferPrice / prdct.Size;
      } else {
        mUnitPrice = prdct.MRP / prdct.Size;
      }
      prdct.pricePerUnit = mUnitPrice;

      let data: any = prdct.PreferredSubtitute;
      if (data.length > 0) {
        data.forEach((elm: any) => {
          if (elm.MRP != '' && elm.MRP != null && elm.MRP > 0) {
            let mprdPrice: any = '';
            let sbrdPrice: any = '';

            if (this.CommonService.ConfigData.GenericPercentageCalOnOfferPrice == 'Y') {
              mprdPrice = prdct.OfferPrice;
              sbrdPrice = elm.CustOfferPrice;
            } else {
              mprdPrice = prdct.MRP;
              sbrdPrice = elm.MRP;
            }

            if (prdct.Size > 0 && elm.Size > 0) {
              let mainUnitPrice: any = mprdPrice / prdct.Size;
              let subUnitPrice: any = sbrdPrice / elm.Size;
              if (mainUnitPrice > subUnitPrice) {
                let savingsPercentage = ((mainUnitPrice - subUnitPrice) / mainUnitPrice) * 100;
                let savingPerStrip = ((mainUnitPrice - subUnitPrice) * elm.Size);
                let prNd = Math.floor(savingsPercentage);
                if (prNd >= this.CommonService.ConfigData.GenericMinPercentage) {
                  let ds = { ...elm, pricePerUnit: subUnitPrice, savingsPercent: prNd, isExisting: 0, addedQty: 0, savePerStrip: savingPerStrip, salts: prdct.Salts };
                  this.finalList.forEach((item: any) => {
                    if (parseInt(ds.PreferredProductId) == item.ProductId) {
                      ds.isExisting = 1;
                      ds.addedQty = item.ItemQuantity;
                    };
                  });
                  mdLst.push(ds)
                }
              }
            }
          }
        });
      };

      if (mdLst.length > 0) {
        if (this.CommonService.ConfigData.SortOnSaving == 'Y') {
          mdLst.sort((a: any, b: any) => b.savingsPercent - a.savingsPercent)
        } else {
          mdLst.sort((a: any, b: any) => a.DisplaySeq - b.DisplaySeq)
        }
      }

      if (mdLst.length > this.CommonService.ConfigData.MaxgenericProductList) {
        let slicedArray = mdLst.slice(0, this.CommonService.ConfigData.MaxgenericProductList);
        prdct.PreferredSubtitute = slicedArray;
      } else {
        prdct.PreferredSubtitute = mdLst;
      }

    });

    this.finalList = this.finalList.map((ds: any) => {
      let data = res['items'].find((ls: any) => parseInt(ls.ProductId) == ds.ProductId);
      return { ...ds, PricePerUnit: data.pricePerUnit, PreferredSubtitute: data.PreferredSubtitute, MfgGroup: data.MfgGroup, Unit1: data.Unit1 };
    });

    let count = 0

    // let count = this.finalList.filter((p: any) => p.PreferredSubtitute && p.PreferredSubtitute.length > 1).length;

    this.finalList.forEach((ds: any) => {
      if (ds.PreferredSubtitute.length > 0) {
        count = count + 1;
      }
    })

    if (count > 1) {
      this.replaceAllSubs = true;
    }

  }

  getMaxSavings(data: any) {
    let maxSavings: any = Math.max(...data.map((o: any) => o.savingsPercent));
    return maxSavings;
  }

  calAltSavings(item: any, subs: any) {
    let addedNow = item.ItemQuantity * item.Size;
    let tobeAdd = addedNow / subs.Size;
    let alteQty = Math.ceil(tobeAdd);
    let save: any = subs.savePerStrip * alteQty;
    return save.toFixed(2);
  }


  displaySubs(ds: any) {
    // this.showSubs = ds.ProductId;
    this.compareAlter = '';
    this.altrPrdcts = ds;
    this.alterModal.nativeElement.click();
  }

  closeAlterMod() {
    this.altrPrdcts = [];
    this.compareAlter = '';
  }

  replaceAlternative(altr: any, mainProd: any) {
    localStorage.removeItem('toReplace');
    this.allReplaceArr = [];
    // console.log(altr, mainProd);
    let addedNow = mainProd.ItemQuantity * mainProd.Size;
    let tobeAdd = addedNow / altr.Size;
    let alteQty = Math.ceil(tobeAdd);
    // console.log(addedNow, alteQty);

    let arr: any = [];
    // arr.push({"ProductId" : mainProd.ProductId, "ProductCount" : 0});
    // arr.push({"ProductId": parseInt(altr.PreferredProductId), "ProductCount" : alteQty});
    arr.push({
      "ProductId": parseInt(altr.PreferredProductId),
      "ProductCount": alteQty,
      "OriginalProductId": mainProd.ProductId,
    });
    // console.log(arr)

    this.spinner.show();
    let requestData = JSON.stringify(arr);
    let fd = new FormData();
    fd.append('itemlist', requestData);
    fd.append('pincode', this.CommonService.PinCode.toString());
    // debugger
    this.CommonService.checkoutCart('cartapp/add_edit_subtitute_products', fd).subscribe((cartData: any) => {
      if (cartData) {
        this.alterSaved = cartData['result']['itemlist'].find((o: any) => o['ProductId'] == altr.PreferredProductId);
        if (this.alterSaved != '') {
          this.alterSaved.savePerStrip = altr.savePerStrip;
        }
        this.getCartDetails();
      }
      this.closeAltMod.nativeElement.click();
      // this.closeAllaltMod.nativeElement.click();
    }
    );
  }

  // replaeAllSubstitude_bckp(){
  //   // console.log(this.finalList)
  //   // let checkOutData : any = []
  //   localStorage.removeItem('toReplace');
  //   let replacedSaved: any = [];
  //   this.dbService.clear('cartItems').subscribe((successDeleted) => {
  //     this.finalList.forEach((item: any) => {
  //       if(item.PreferredSubtitute.length == 0){

  //         this.addToLocalCart(item, item.ItemQuantity);

  //       } else {
  //         item.PreferredSubtitute.forEach((subs: any) => {

  //           let addedNow = item.ItemQuantity * item.Size;
  //           let tobeAdd = addedNow / subs.Size;
  //           let alteQty = Math.ceil(tobeAdd);

  //           let productId = subs.PreferredProductId;
  //           let LotId = 0;
  //           let CPId = 0;

  //           replacedSaved.push({
  //             altId: productId,
  //             svngPerpck: subs.savePerStrip
  //           })

  //           let tmp = {
  //             id: productId + '_' + CPId + '_' + LotId,
  //             ProductId: parseInt(productId),
  //             ProductName: subs.DisplayName,
  //             CustProductName: '',
  //             InteractiveHealthProfileId: '',
  //             DosageRestriction: subs.DosageRestriction ? subs.DosageRestriction : 0,
  //             OfferPrice: subs.CustOfferPrice,
  //             ProductCount: alteQty,
  //             ItemVal: subs.CustOfferPrice,
  //             SSCurrencyValue: ".00",
  //             Iscourierable: subs.IsCourierable ? subs.IsCourierable : 'N',
  //             ProductImage: subs.ProductImage,
  //             ProductPrice: subs.MRP,
  //             PrescriptionOTC: item.PrescriptionOTC,
  //             WarehouseId: this.CommonService.WHId,
  //             CPId: 0,
  //             MyFamilyId: 0,
  //             PKLotId: '',
  //             MfgGroup: subs.MfgGroup ? subs.MfgGroup : '',
  //             ExpiryDate: subs.ExpiryDate ? subs.ExpiryDate : '',
  //             ProductInteractiveModule: '',
  //             ProductInteractiveSubModule: '',
  //             IsNonReturnable: subs.IsNonReturnable ? subs.IsNonReturnable : 'N',
  //             RefOrderId: 0,
  //             Brand: '',
  //             DiscountPercent: subs.CustDiscPercent
  //           };

  //           this.dbService.add('cartItems', tmp).subscribe((res: any) => {})

  //         });
  //       }
  //     });

  //     let d: Date = new Date();
  //     this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
  //     localStorage.setItem('toReplace', JSON.stringify(replacedSaved));
  //     this.getAllRecord()
  //   })

  // }

  replaeAllSubstitude() {
    // console.log(this.finalList)
    localStorage.removeItem('toReplace');
    let checkOutData: any = [];
    let replacedSaved: any = [];

    this.finalList.forEach((item: any) => {
      if (item.PreferredSubtitute.length == 0) {

        let existingItem = checkOutData.find((o: any) => o.ProductId == item.ProductId);
        let idx = `${item.ProductId}_0_0`;
        if (existingItem) {
          existingItem.ProductCount += item.ItemQuantity;
          // checkOutData.push({...existingItem, id: idx});
        } else {
          let tmp = {
            id: idx,
            ProductId: item.ProductId,
            // ProductName: elm.DisplayName,
            ProductName: item.ProductName,
            CustProductName: item.CustomProductName,
            InteractiveHealthProfileId: item.InteractiveHealthProfileId,
            DosageRestriction: item.DosageRestriction == null ? 0 : parseInt(item.DosageRestriction),
            OfferPrice: item.OfferPrice,
            ProductCount: item.ItemQuantity,
            ItemVal: item.ItemVal,
            SSCurrencyValue: item.SSCurrencyValue,
            Iscourierable: item.IsCourierable,
            ProductImage: item.ProductImage,
            ProductPrice: item.ItemBasePrice,
            // IsGiftProduct: elm.IsGiftableProduct,
            PrescriptionOTC: item.PrescriptionOTC,
            WarehouseId: this.CommonService.WHId,
            CPId: 0,
            MyFamilyId: 0,
            PKLotId: item.PKLotId == null ? 0 : item.PKLotId,
            MfgGroup: item.MfgGroup,
            ExpiryDate: item.ExpiryDate,
            ProductInteractiveModule: item.InteractiveModule,
            ProductInteractiveSubModule: item.InteractiveSubModule,
            IsNonReturnable: item.IsNonReturnable,
            RefOrderId: item.RefOrderId == null ? 0 : parseInt(item.RefOrderId),
            Brand: item.Brand,
            DiscountPercent: item.DiscountPercent
          };
          checkOutData.push(tmp);
        }
      } else {
        item.PreferredSubtitute.forEach((subs: any) => {

          let addedNow = item.ItemQuantity * item.Size;
          let tobeAdd = addedNow / subs.Size;
          let alteQty = Math.ceil(tobeAdd);

          let productId = subs.PreferredProductId;
          let LotId = 0;
          let CPId = 0;

          let existingSub = replacedSaved.find((o: any) => o.altId == productId);
          if (existingSub) {
            existingSub.count = (existingSub.count || 1) + 1;
            existingSub.svngPerpck = ((existingSub.svngPerpck * (existingSub.count - 1)) + subs.savePerStrip) / existingSub.count;
          } else {
            replacedSaved.push({
              altId: productId,
              svngPerpck: subs.savePerStrip,
              count: 1
            })
          }

          let existingItem = checkOutData.find((o: any) => o.ProductId == productId);
          // let idx = `${productId}_${CPId}_${LotId}`;

          if (existingItem) {
            existingItem.ProductCount += alteQty;
            // checkOutData.push({...existingItem, id: idx});
          } else {
            let tmp = {
              id: productId + '_' + CPId + '_' + LotId,
              ProductId: parseInt(productId),
              ProductName: subs.DisplayName,
              CustProductName: '',
              InteractiveHealthProfileId: '',
              DosageRestriction: subs.DosageRestriction ? subs.DosageRestriction : 0,
              OfferPrice: subs.CustOfferPrice,
              ProductCount: alteQty,
              ItemVal: subs.CustOfferPrice,
              SSCurrencyValue: ".00",
              Iscourierable: subs.IsCourierable ? subs.IsCourierable : 'N',
              ProductImage: subs.ProductImage,
              ProductPrice: subs.MRP,
              PrescriptionOTC: item.PrescriptionOTC,
              WarehouseId: this.CommonService.WHId,
              CPId: 0,
              MyFamilyId: 0,
              PKLotId: '',
              MfgGroup: subs.MfgGroup ? subs.MfgGroup : '',
              ExpiryDate: subs.ExpiryDate ? subs.ExpiryDate : '',
              ProductInteractiveModule: '',
              ProductInteractiveSubModule: '',
              IsNonReturnable: subs.IsNonReturnable ? subs.IsNonReturnable : 'N',
              RefOrderId: 0,
              Brand: '',
              DiscountPercent: subs.CustDiscPercent
            };
            checkOutData.push(tmp);
          }
        });
      }
    });

    localStorage.setItem(
      'toReplace', JSON.stringify(replacedSaved.map(({ altId, svngPerpck }: any) => ({ altId, svngPerpck })))
    );
    // console.log('checkOutData', checkOutData);
    // console.log('replacedSaved', replacedSaved);
    this.setAllSubsReplace(checkOutData)

  }

  setAllSubsReplace(items: any) {
    this.dbService.clear('cartItems').subscribe((successDeleted) => {
      this.dbService.bulkAdd('cartItems', items).subscribe((result) => {
        // console.log('result: ', result);
        let d: Date = new Date();
        this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
        this.getAllRecord()
      });
    })
  }

  calSavings(qty: any, amt: any) {
    // let addedNow = subs.addedQty * subs.Size;
    // let tobeAdd = addedNow / item.Size;
    // let alteQty = Math.ceil(tobeAdd);
    let save: any = qty * amt;
    return Math.trunc(save);
  }

  // addWebEngage(data: any){
  //   let webData = {
  //     'Product Name': data.ProductName,
  //     'Category Name': '',
  //     'Sub Category Name': '',
  //     'Brand': data.MfgGroup? data.MfgGroup :'',
  //     'Returnable': data.IsNonReturnable ? (data.IsNonReturnable == 1 ? false: true): false,
  //     'Product Expiry Date': data.ExpiryDate,
  //     'Delivery Pincode': this.CommonService.PinCode,
  //     'Variant Selected': '',
  //     'Quantity': data.ItemQuantity,
  //     'Retail Price': data.OfferPrice,
  //     'Discount Percentage': data.DiscountPercent,
  //     'Price': data.ItemBasePrice,
  //     'Image': data.ProductImage? data.ProductImage :'',
  //   }
  //   this.webengageService.trackEvent('Product Added To Cart', webData);
  // }

  removeWebEngage(data: any) {
    let returnable: boolean = false;
    if (data.IsNonReturnable == 0) {
      returnable = true;
    } else {
      returnable = false;
    }
    let dscPrcnt = `${data.DiscountPercent}%`;
    let webData = {
      'Product Name': data.ProductName,
      'Brand': data.MfgGroup ? data.MfgGroup : '',
      'Returnable': returnable,
      'Product Expiry Date': data.ExpiryDate,
      'Delivery Pincode': this.CommonService.PinCode,
      'Variant Selected': '',
      'Quantity': data.ItemQuantity ? data.ItemQuantity : data.ProductCount,
      'Retail Price': data.OfferPrice,
      'Discount Percentage': dscPrcnt,
      'Price': data.ItemBasePrice ? data.ItemBasePrice : data.ProductPrice,
      'Image': data.ProductImage ? data.ProductImage : '',
    }
    this.webengageService.trackEvent('Product Removed From Cart', webData);
  }

  updateWebEngage(data: any, list: any) {
    let webData = {
      'No. Of Products': list.length,
      'Total Amount': data.CartVal,
      'Product Details': list
    }
    this.webengageService.trackEvent('Product Cart Updated', webData);
  }

  cartViewWebEngage(data: any) {
    let val: any = 0;
    data.forEach((item: any) => {
      val += item.OfferPrice * item.ProductCount;
    });
    let webData = {
      'No. Of Products': data.length,
      'Total Amount': val,
      'Product Details': data
    }
    this.webengageService.trackEvent('Product Cart Viewed', webData);
  }

  couponAppliedWebEngage(data: any, cuponCode: any, cartValBeforeApply: any) {
    let disc = 0;
    if (data.CouponDiscount != null && data.CouponDiscount != '' && data.CouponDiscount != '.00') {
      disc = parseFloat(this.headerDetails.CouponDiscount);
    } else if (data.PromoDiscount != null && data.PromoDiscount != '') {
      disc = parseFloat(this.headerDetails.PromoDiscount);
    }
    let webData = {
      'Cart Value Before Discount': cartValBeforeApply,
      'Cart Value After Discount': data.CartVal,
      'Coupon Code': cuponCode,
      'Discount Amount': disc
    }
    this.webengageService.trackEvent('Coupon Code Applied', webData);
  }

  couponRemoveWebEngage() {
    let webData = {
      'Coupon Code': this.headerDetails.AppliedCouponCode,
    }
    this.webengageService.trackEvent('Coupon Code Removed', webData);
  }

  productCheckoutStartedWebEngage(data: any, list: any) {
    let prodNames: any = [];
    list.forEach((item: any) => {
      prodNames.push(item.ProductName)
    });
    let webData = {
      'Product Name': prodNames.toString(),
      'No. Of Products': list.length,
      'Total Amount': data.CartVal,
      'Product Details': list,
      'Discount Amount': this.totalSaving,
      'Coupon Code': data.AppliedCouponCode ? data.AppliedCouponCode : '',
      'Sub Total': data.CartAmount,
    }
    this.webengageService.trackEvent('Product Checkout Started', webData);
  }

  productCheckoutCompletedWebEngage(data: any, list: any, order: any) {
    let prodNames: any = [];
    list.forEach((item: any) => {
      prodNames.push(item.ProductName)
    });

    let OrderIds: any = [];
    order.forEach((elm: any) => {
      OrderIds.push(elm.OrderId)
    });

    let shipping: any = 0;
    if (data.ShippingCharge > 0) {
      shipping = data.ShippingCharge;
    } else if (data.CourierCharge > 0) {
      shipping = data.CourierCharge;
    }

    let PaymntStatus = '';
    if (this.payableAmount > 0) {
      // if(this.useWallet == true){
      if (this.PGROW['Key'] == 'COD') {
        PaymntStatus = 'Not Paid';
      } else {
        PaymntStatus = 'Paid';
      }
      // }
    } else {
      PaymntStatus = 'Paid';
    }

    let webData = {
      'Order ID': OrderIds.toString(),
      'Payment Mode': this.PGROW['Title'],
      'Product Name': prodNames.toString(),
      'No. Of Products': list.length,
      'Product Details': list,
      'Sub Total': data.CartAmount,
      'Discount Amount': this.totalSaving,
      'Coupon Code': data.AppliedCouponCode ? data.AppliedCouponCode : '',
      'Shipping Charges': shipping,
      'Platform Fee': data.ConvienceFee,
      'Total Amount': data.CartVal,
      'Payment Status': PaymntStatus
    }
    this.webengageService.trackEvent('Product Checkout Completed', webData);
  }

  prescriptionViewdWebEngage() {
    this.webengageService.trackEvent('My Prescriptions Viewed', {})
  }

  openCompare(prdct: any) {
    // console.log(prdct);
    this.compareAlter = prdct.PreferredProductId;
  }

  viewAlter() {
    this.compareAlter = '';
  }

}
