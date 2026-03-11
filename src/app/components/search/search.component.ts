import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonService } from '../../services/common.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { WebEngageService } from '../../services/webengage.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  ProductList: any = [];
  ProductListKey: any = [];
  searchTxt: any = '';
  typingTimer: any = 0;

  productIndex: any = 0;
  OfferPriceIndex: any = 0;
  MRPIndex: any = 0;
  IsOutOfStock: any = 0;
  PrescriptionOTC: any = 0;
  productID: any = 0;
  DiscountPercent: any = 0;
  MfgGroup: any = '';
  ProductImage: any = '';

  searchStart: boolean = false;
  searchResult: boolean = false;
  addedInCart: any = [];
  isExisting: any = 0;
  addedQty: any = 0;
  SubtituteIndex : any = 0;
  SizeIndex: any = 0;
  showSubs: any = '';

  ProductStatus: any = '';
  RefProductDetails: any = '';
  showRefPrd: any = 0;
  showVar: any = '';

  alertMsg: any = '';
  isLoggedIn = 'false';

  currentUrl: string = '';

  @Output() newItemEvent = new EventEmitter<any>();
  @ViewChild('confirm') confirm: any;

  @ViewChild('psearch') psearch: any;

  inside = false;
   
  @HostListener("click") 
  clicked() { 
    this.inside = true; 
  } 

  @HostListener("document:click") 
  clickedOut() { 
    if(!this.inside){
      this.resetSearch()
    }
    this.inside = false;
  }

  searchOTCMed() {
    this.psearch.nativeElement.focus();
  }

  constructor(
    public CommonService: CommonService,
    private dbService: NgxIndexedDBService,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private webengageService: WebEngageService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.cookieService.get('isLoggedIn');
    this.currentUrl = this.route.snapshot.url[0].path;
    // console.log(this.currentUrl);
  }

  getAllRecord() {
    this.dbService.getAll('cartItems').subscribe((res: any) => {
      // console.log('all records', res);
      this.addedInCart = res;
    });
  }

  onSearchChange(evnt: any) {
    let str = evnt.target.value;
    // console.log(str);
    clearTimeout(this.typingTimer);
    if (str.length > 2) {
      this.searchTxt = str;
      this.getAllRecord();
      this.typingTimer = setTimeout(() => {
        this.doneTyping();
      }, 500);
    } else {
      this.ProductList = [];
      this.searchResult = false;
      // this.emptyResult = false;
    }
  }

  doneTyping() {
    this.searchStart = true;
    // this.CartService.cartList().subscribe(data => {
    let pincodeTxt = '';
    if (this.CommonService.PinCode > 0) {
      pincodeTxt = '&pincode=' + this.CommonService.PinCode;
    }
    let searchtext = this.CommonService.searchUrl + 'search_list/?device=1&page=1&size=100&includeGiftable=1&include_discontinued=1&strict_match=1' + '&q=' +  this.searchTxt + '&panindia=' + this.CommonService.IsPanIndia + '&token=' + this.CommonService.Token + '&wh=' + this.CommonService.WHId + pincodeTxt;
    searchtext += '&_t=' + new Date().getTime();
    this.searchResult = true;
    this.CommonService.getSearchData(searchtext).subscribe((data: any) => {
      this.searchStart = false;

      // console.log(data);

      if (data['products'].length > 0) {
        // this.emptyResult = false;
        data['keys'].push('isAdded');
        data['keys'].push('addedQty');
        data['keys'].push('showRefPrd');
        this.ProductList = data['products'];
        this.ProductListKey = data['keys'];
        this.productIndex = this.getKeyIndex('DisplayName');
        this.OfferPriceIndex = this.getKeyIndex('OfferPrice');
        this.MRPIndex = this.getKeyIndex('MRP');
        this.IsOutOfStock = this.getKeyIndex('IsOutOfStock');
        this.PrescriptionOTC = this.getKeyIndex('PrescriptionOTC');
        this.isExisting = this.getKeyIndex('isAdded');
        this.addedQty = this.getKeyIndex('addedQty');
        this.productID = this.getKeyIndex('ProductId');
        this.DiscountPercent = this.getKeyIndex('DiscountPercent');
        this.MfgGroup = this.getKeyIndex('MfgGroup');
        this.ProductImage = this.getKeyIndex('ProductImage');
        this.SubtituteIndex = this.getKeyIndex('PreferredSubtitute');
        this.SizeIndex = this.getKeyIndex('Size');
        this.ProductStatus = this.getKeyIndex('ProductStatus');
        this.RefProductDetails = this.getKeyIndex('RefProductDetails');
        this.showRefPrd = this.getKeyIndex('showRefPrd');

        data['products'].forEach((elm: any) => {
          let pID = this.getKeyIndex('ProductId');
          elm[this.isExisting]= 0;
          elm[this.addedQty] = 0;
          elm[this.showRefPrd] = 0;
          // console.log('pID', elm[pID]);
          this.addedInCart.forEach((item: any) => {
            if (parseInt(elm[pID]) == item.ProductId) {
              elm[this.isExisting] = 1;
              elm[this.addedQty] = item.ProductCount;
            }
          });
          if ((elm[this.ProductStatus] == 'D' || (elm[this.ProductStatus] == 'C' && elm[this.IsOutOfStock] == 'Y')) && elm[this.RefProductDetails] != null && elm[this.RefProductDetails] != undefined && elm[this.RefProductDetails] != '') {
            if (elm[this.RefProductDetails]['IsOutOfStock'] == 'N' && elm[this.RefProductDetails]['ProductStatus'] == 'C') {
              elm[this.showRefPrd] = 1;
              elm[this.RefProductDetails].addedQty = 0;
              elm[this.SubtituteIndex] = [];
              this.addedInCart.forEach((itm: any) => {
                if (parseInt(elm[this.RefProductDetails]['ProductId']) == itm.ProductId) {
                  elm[this.RefProductDetails].addedQty = itm.ProductCount;
                }
              });
            } else {
              if (elm[this.SubtituteIndex].length > 0 && this.CommonService.ConfigData.IsDisplayGenericProduct == 1) {
                let subs = this.setSubProduct(elm);
                if (subs.length > this.CommonService.ConfigData.MaxgenericProductList) {
                  let slicedArray = subs.slice(0, this.CommonService.ConfigData.MaxgenericProductList);
                  elm[this.SubtituteIndex] = slicedArray;
                } else {
                  elm[this.SubtituteIndex] = subs;
                }
              }
            }
          } else if(elm[this.SubtituteIndex].length > 0 && this.CommonService.ConfigData.IsDisplayGenericProduct == 1){
            let subs = this.setSubProduct(elm);
            if(subs.length > this.CommonService.ConfigData.MaxgenericProductList){
              let slicedArray = subs.slice(0, this.CommonService.ConfigData.MaxgenericProductList);
              elm[this.SubtituteIndex] = slicedArray;
            }else{
              elm[this.SubtituteIndex] = subs;
            }
            // elm[this.SubtituteIndex] = subs;
          }
        });
      } else {
        this.ProductList = [];
        // this.emptyResult = true;
      }
      this.webengageService.trackEvent('Product Searched', {'Search Keyword': this.searchTxt, 'Item Count': data['total']});
    });

    // });
  }

  onKeydown() {
    clearTimeout(this.typingTimer);
  }

  getKeyIndex(key: any) {
    let indexval = this.ProductListKey.indexOf(key);
    return indexval;
  }

  addLocalCart(productObj: any, ProductQty: any) {
    // console.log(productObj, ProductQty);
    let productId = productObj[this.getKeyIndex('ProductId')];
    // let LotId = parseInt(productObj[this.getKeyIndex("PKLotId")]);
    let LotId = 0;
    let CPId = 0;

    let tmp = {
      id: productId + '_' + CPId + '_' + LotId,
      ProductId: parseInt(productId),
      ProductName: productObj[this.getKeyIndex('DisplayName')],
      CustProductName: '',
      InteractiveHealthProfileId: '',
      DosageRestriction: productObj[this.getKeyIndex('DosageRestriction')],
      OfferPrice: productObj[this.getKeyIndex('OfferPrice')],
      ProductCount: parseInt(ProductQty),
      ItemVal: productObj[this.getKeyIndex('OfferPrice')],
      SSCurrencyValue: '.00',
      Iscourierable: productObj[this.getKeyIndex('IsCourierable')],
      ProductImage: productObj[this.getKeyIndex('ProductImage')],
      ProductPrice: productObj[this.getKeyIndex('MRP')],
      // IsGiftProduct: productObj[this.getKeyIndex("IsGiftableProduct")],
      PrescriptionOTC: productObj[this.getKeyIndex('PrescriptionOTC')],
      WarehouseId: this.CommonService.WHId,
      CPId: 0,
      MyFamilyId: 0,
      PKLotId: parseInt(productObj[this.getKeyIndex('PKLotId')]),
      MfgGroup: productObj[this.getKeyIndex('MfgGroup')],
      ExpiryDate: productObj[this.getKeyIndex('ExpiryDate')],
      ProductInteractiveModule: productObj[this.getKeyIndex('InteractiveModule')],
      ProductInteractiveSubModule: productObj[this.getKeyIndex('InteractiveSubModule')],
      IsNonReturnable: productObj[this.getKeyIndex('IsNonReturnable')],
      RefOrderId: 0,
      Brand: productObj[this.getKeyIndex('Brand')],
      DiscountPercent: productObj[this.getKeyIndex('DiscountPercent')]
    };

    // this.getContraIndecatedSaltAgainstCart(productId , productObj.DisplayName)

    this.dbService.add('cartItems', tmp).subscribe((res: any) => {
      // console.log('Record added successfully.', res);
      this.newItemEvent.emit();
      // this.CommonService.sendClickEvent();
      this.searchResult = false;
      this.searchTxt = '';
      this.ProductList = [];
      this.showSubs = '';
      this.showVar = '';
      this.checkSalt(productId, productObj.DisplayName);
    });
    this.addWebEngage(tmp, parseInt(ProductQty))
  }

  addToCart(productObj: any, ProductQty: any, type: any) {
    // debugger

    if (parseInt(ProductQty) > 0) {
      let ProductDisplayName = productObj[this.getKeyIndex('DisplayName')];
      let dossageQty = productObj[this.getKeyIndex('DosageRestriction')];

      if ( parseInt(ProductQty) > parseInt(dossageQty) && parseInt(dossageQty) > 0 ) {
        ProductQty = dossageQty;
        this.alertMsg = 'You can order ' + dossageQty + ' quantity of ' + productObj[this.getKeyIndex('ProductName')];
        this.confirm.nativeElement.click();
      }

      let ProductId = '';
      let qty = ProductQty;
      let PKLotId = productObj[this.getKeyIndex('PKLotId')];
      let PrescriptionOTC = productObj[this.getKeyIndex('PrescriptionOTC')];
      let refOrderId = '';
      let InteractiveHealthProfileId = '';
      let CustProductName = productObj[this.getKeyIndex('DisplayName')];
      let InteractiveModule = '';

      let Familyid = '0';
      let CPId = '0';

      // if (this.isLoggedIn != 'true' || this.currentUrl == 'viewcart') {
      if (this.isLoggedIn != 'true' || this.currentUrl == 'ordermedicine') {
        this.addLocalCart(productObj, ProductQty);
      } else {
        // debugger

        this.spinner.show();

        productObj[this.getKeyIndex('ProductId')];

        let fd = new FormData();

        if (type == 'MoveToCart') {
          ProductId = productObj.ProductId;
          fd.append('ProductId', ProductId);
          fd.append('qty', qty);
          fd.append('PrescriptionOTC', productObj.PrescriptionOTC);
          fd.append('refOrderId', refOrderId);
          fd.append('CPId', CPId);
          fd.append('InteractiveHealthProfileId', InteractiveHealthProfileId);
          fd.append('CustProductName', productObj.DisplayName);
          fd.append('InteractiveModule', InteractiveModule);
          fd.append('PKLotId', '');
          fd.append('xplorpromotion', '0');
          fd.append('xplorpromotionoh', '0');
          fd.append('xplorpromotionmh', '0');
        } else if (type == 'AddTo') {
          ProductId = productObj[this.getKeyIndex('ProductId')];
          fd.append('ProductId', ProductId);
          fd.append('qty', qty);
          fd.append('PrescriptionOTC', PrescriptionOTC);
          fd.append('refOrderId', refOrderId);
          fd.append('CPId', CPId);
          fd.append('InteractiveHealthProfileId', InteractiveHealthProfileId);
          fd.append('CustProductName', CustProductName);
          fd.append('InteractiveModule', InteractiveModule);
          fd.append('PKLotId', PKLotId);
          fd.append('xplorpromotion', '0');
          fd.append('xplorpromotionoh', '0');
          fd.append('xplorpromotionmh', '0');
        }

        this.CommonService.addToCartOrder('cartapp/addtocart', fd).subscribe((response: any) => {
            // debugger

            let addeddproductName = '';
            let itemAddedQty = 0;
            let productAddedFlg = 0;

            if (response['status'] == 'success' && response['RetStatus'] == 1) {
              for ( let i = 0; i < response['cart_product_details'].length; i++ ) {
                let item = response['cart_product_details'][i];
                if (item['ProductId'] == ProductId) {
                  itemAddedQty = itemAddedQty + parseInt(item['ItemQuantity']);
                  addeddproductName = item['ProductName'];
                  productAddedFlg = 1;
                  if (parseInt(ProductQty) > itemAddedQty) {
                    this.alertMsg = 'We are sorry, the ' + addeddproductName + ' is only have ' + itemAddedQty + ' qty available';
                    this.spinner.hide();
                    this.confirm.nativeElement.click();
                  }
                  if (productAddedFlg == 1) {
                    this.addWebEngage(item, itemAddedQty)
                    // faimly Id Update
                    this.spinner.hide();

                    let redisItem = {
                      ProductId: ProductId,
                      ProductCount: itemAddedQty,
                      ProductType: PrescriptionOTC,
                      FamilyId: '',
                      PreviousFamilyId: '',
                      RefOrderId: refOrderId,
                    };
                    let redisArr = [];
                    redisArr.push(redisItem);
                    this.CartsynchWithRedis(redisArr, 'U');
                  } else {
                    // this.CommonService.loaderFlg = false;
                    //let ProductStr = 'product';
                    let ProductStr = 'item';
                    if (PrescriptionOTC == 'P') {
                      ProductStr = 'medicine';
                    }
                    // this.alertMsg = 'We apologize that this ' + ProductStr + ' is not in stock OR not available at your location';
                    this.alertMsg = 'Sorry, this product is currently Out of Stock or Not Available at your location';
                    if ( response['RetStatus'] != undefined && response['RetStatus'] == -3 ) {
                      this.alertMsg = 'Please place Separate Order with Prescription for this medicine.';
                    }
                    this.spinner.hide();
                    this.confirm.nativeElement.click();
                  }
                }
              }
            } else if ((response['status'] == 'error') || (response['status'] == 'success' && response['RetStatus'] != 1)) {
              let ProductStr = 'item';
              if (PrescriptionOTC == 'P') {
                ProductStr = 'medicine';
              }
              // this.alertMsg = 'We apologize that this ' + ProductStr + ' is not in stock OR not available at your location';
              this.alertMsg = 'Sorry, this product is currently Out of Stock or Not Available at your location';
              if ( response['RetStatus'] != undefined &&  response['RetStatus'] == -3 ) {
                this.alertMsg = 'Please place Separate Order with Prescription for this medicine.';
              }
              this.spinner.hide();
              this.confirm.nativeElement.click();
            }
          }
        );
      }
    } else {
      this.alertMsg = 'Please select quantity ';
      this.confirm.nativeElement.click();
    }
  }

  checkSalt(productId: any, DisplayName: any) {
    this.dbService.getAll('cartItems').subscribe((res: any) => {
      // console.log('all records', res);
      this.addedInCart = res;
      this.getContraIndecatedSaltAgainstCart(productId, DisplayName);
    });
  }

  async getContraIndecatedSaltAgainstCart(
    product_id: any,
    addeddproductName: any
  ) {
    let addedProductIds: any = [];

    for (let i = 0; i < this.addedInCart.length; i++) {
      addedProductIds.push(parseInt(this.addedInCart[i].ProductId));
    }

    let productstring = addedProductIds.join('|');
    productstring = '#' + 0 + '|' + productstring;

    let temp = {
      setId: productstring,
      productId: product_id,
    };
    let result = {};
    await this.CommonService.getCatalogData(
      'product/getcontradictedproductlist',
      temp
    ).subscribe((response: any) => {
      if (response['msgcode'] == 1) {
        // console.log(response);
        // debugger
        // let cResultdata =  response['results'];
        let productnameStr = '';
        for (let i = 0; i < Object.keys(response['results']).length; i++) {
          for (
            let k = 0;
            k < response['results'][i]['ProductList'].length;
            k++
          ) {
            if (
              response['results'][i]['ProductList'][k]['ProductId'] ==
              product_id
            ) {
              for (
                let j = 0;
                j <
                response['results'][i]['ProductList'][k]['CProductId'].length;
                j++
              ) {
                let indexkey = addedProductIds.indexOf(
                  response['results'][i]['ProductList'][k]['CProductId'][j]
                );

                if (indexkey >= 0) {
                  if (productnameStr == '') {
                    productnameStr = this.addedInCart[indexkey]['ProductName'];
                  } else {
                    productnameStr =
                      productnameStr +
                      ', ' +
                      this.addedInCart[indexkey]['ProductName'];
                  }
                }
              }
            }
          }
        }
        // alert message
        if (productnameStr != '') {
          let errorMsg =
            'You have added ' +
            productnameStr +
            ' with ' +
            addeddproductName +
            '.  We suggest to consult your doctor whether these medicines can be taken together';
          this.alertMsg = errorMsg;
          this.confirm.nativeElement.click();
        }
        // alert message
      } else {
        //return result;
      }
    });
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
        this.newItemEvent.emit();
        this.searchResult = false;
        this.searchTxt = '';
        this.ProductList = [];
      }
    );
  }

  confirmBtn() {
    this.alertMsg = '';
    this.searchResult = false;
    this.searchTxt = '';
    this.ProductList = [];
  }

  resetSearch() {
    this.searchResult = false;
    this.searchTxt = '';
    this.ProductList = [];
  }


  // setSubProduct(mainobj: any) {
  //   let mdLst: any = []
  //   let data: any = mainobj[this.getKeyIndex("PreferredSubtitute")];
  //   data.forEach((elm: any) => {
  //     if (elm.MRP != '' && elm.MRP != null && elm.MRP > 0) {
  //       let mainProductConfigPrice: any = '';
  //       let subProductConfigPrice: any = '';
  //       let mainProductSize: any = mainobj[this.getKeyIndex("Size")];
  //       let subProductSize: any = elm['Size'];

  //       if(this.CommonService.ConfigData.GenericPercentageCalOnOfferPrice == 'Y'){
  //         mainProductConfigPrice = mainobj[this.getKeyIndex("OfferPrice")];
  //         subProductConfigPrice = elm['CustOfferPrice'];
  //       }else{
  //         mainProductConfigPrice = mainobj[this.getKeyIndex("MRP")];
  //         subProductConfigPrice = elm['MRP'];
  //       }

  //       if (mainProductSize > 0 && subProductSize > 0) {
  //         let mainUnitPrice: any = mainProductConfigPrice / mainProductSize;
  //         let subUnitPrice: any = subProductConfigPrice / subProductSize;
  //         if(mainUnitPrice > subUnitPrice){
  //           let savingsPercentage = ((mainUnitPrice - subUnitPrice) / mainUnitPrice) * 100;
  //           let prNd = Math.floor(savingsPercentage);
  //           if (prNd >= this.CommonService.ConfigData.GenericMinPercentage) {
  //             let ds = { ...elm, savingsPercent: prNd, isExisting: 0, addedQty: 0 };
  //             this.addedInCart.forEach((item: any) => {
  //               if (parseInt(ds['PreferredProductId']) == item.ProductId) {
  //                 ds.isExisting = 1;
  //                 ds.addedQty = item.ProductCount;
  //               }
  //             });
  //             mdLst.push(ds)
  //           }
  //         }
  //       }
  //     }
  //   });

  //   if(this.CommonService.ConfigData.SortOnSaving == 'Y'){
  //     mdLst.sort((a:any, b: any) => b.savingsPercent - a.savingsPercent)
  //   }else{
  //     mdLst.sort((a:any, b: any) => a.DisplaySeq - b.DisplaySeq)      
  //   }

  //   // console.log(mdLst);
  //   return mdLst;
  // }

  setSubProduct(mainobj: any) {
    let mdLst: any = []
    let data: any = mainobj[this.getKeyIndex("PreferredSubtitute")];
    data.forEach((elm: any) => {
      elm.savingsPercent = 0,
      elm.isExisting = 0,
      elm.addedQty = 0;
      elm.pricePerUnit = 0;
      
      this.addedInCart.forEach((item: any) => {
        if (parseInt(elm.PreferredProductId) == item.ProductId) {
          elm.isExisting = 1;
          elm.addedQty = item.ProductCount;
        }
      });
      if (elm.MRP != '' && elm.MRP != null && elm.MRP > 0) {
        let mainProductConfigPrice: any = '';
        let mainProductSize: any = mainobj[this.getKeyIndex("Size")];

        let subProductConfigPrice: any = '';
        let subProductSize: any = elm['Size'];

        if (this.CommonService.ConfigData.GenericPercentageCalOnOfferPrice == 'Y') {
          mainProductConfigPrice = mainobj[this.getKeyIndex("OfferPrice")];
          subProductConfigPrice = elm['CustOfferPrice'];
        } else {
          mainProductConfigPrice = mainobj[this.getKeyIndex("MRP")];
          subProductConfigPrice = elm['MRP'];
        }

        if (mainProductSize > 0 && subProductSize > 0) {
          let mainUnitPrice: any = 0;
          let subUnitPrice: any = subProductConfigPrice / subProductSize;
          elm.pricePerUnit = subUnitPrice;
          if (mainProductConfigPrice > 0) {
            mainUnitPrice = mainProductConfigPrice / mainProductSize;
            if (mainUnitPrice > subUnitPrice) {
              let savingsPercentage = ((mainUnitPrice - subUnitPrice) / mainUnitPrice) * 100;
              let prNd = Math.floor(savingsPercentage);
              if (prNd >= this.CommonService.ConfigData.GenericMinPercentage) {
                elm.savingsPercent = prNd;
                mdLst.push(elm)
              }
            }
          } else {
            mdLst.push(elm)
          }

        }
      }
    });
    if (this.CommonService.ConfigData.SortOnSaving == 'Y') {
      // mdLst.sort((a: any, b: any) => b.savingsPercent - a.savingsPercent)
      mdLst.sort((a: any, b: any) => {
        if (a.savingsPercent !== b.savingsPercent) {
          return b.savingsPercent - a.savingsPercent;
        }
        return a.pricePerUnit - b.pricePerUnit;
      });
    } else {
      mdLst.sort((a: any, b: any) => a.DisplaySeq - b.DisplaySeq)
    }
    return mdLst;
    // console.log(mdLst);
  }

  getMaxSavings(data: any) {
    let maxSavings: any = Math.max(...data.map((o: any) => o.savingsPercent));
    return maxSavings;
  }

  displaySubs(ds: any){
    this.showSubs = ds[this.getKeyIndex("ProductId")];
    this.showVar = '';
  }

  hideSub(){
    this.showSubs = '';
  }

  addAlternative(prdct: any, ProductQty: any, PrescriptionOTC: any){
    // console.log(prdct);
    let productId = prdct.PreferredProductId;
    // let LotId = parseInt(productObj[this.getKeyIndex("PKLotId")]);
    let LotId = 0;
    let CPId = 0;

    let tmp = {
      id: productId + '_' + CPId + '_' + LotId,
      ProductId: parseInt(productId),
      ProductName: prdct.DisplayName,
      CustProductName: '',
      InteractiveHealthProfileId: '',
      // DosageRestriction: productObj[this.getKeyIndex("DosageRestriction")],
      DosageRestriction: prdct.DosageRestriction ? prdct.DosageRestriction : 0,
      OfferPrice: prdct.CustOfferPrice,
      ProductCount: parseInt(ProductQty),
      ItemVal: prdct.CustOfferPrice,
      SSCurrencyValue: ".00",
      // Iscourierable: productObj[this.getKeyIndex("IsCourierable")],
      Iscourierable: prdct.IsCourierable ? prdct.IsCourierable : 'N',
      ProductImage: prdct.ProductImage,
      ProductPrice: prdct.MRP,
      // PrescriptionOTC: productObj[this.getKeyIndex("PrescriptionOTC")],
      PrescriptionOTC: PrescriptionOTC,
      WarehouseId: this.CommonService.WHId,
      CPId: 0,
      MyFamilyId: 0,
      PKLotId: '',
      MfgGroup: prdct.MfgGroup ? prdct.MfgGroup : '',
      // ExpiryDate: productObj[this.getKeyIndex("ExpiryDate")],
      ExpiryDate: prdct.ExpiryDate ? prdct.ExpiryDate : '',
      ProductInteractiveModule: '',
      ProductInteractiveSubModule: '',
      // IsNonReturnable: productObj[this.getKeyIndex("IsNonReturnable")],
      IsNonReturnable: prdct.IsNonReturnable ? prdct.IsNonReturnable : 'N',
      RefOrderId: 0,
      Brand: '',
      DiscountPercent: prdct.CustDiscPercent
    };

    if (this.isLoggedIn != 'true' || this.currentUrl == 'ordermedicine') {
      this.dbService.add('cartItems', tmp).subscribe((res: any) => {
        // console.log('Record added successfully.', res);
        this.newItemEvent.emit();     
        this.searchResult = false;
        this.searchTxt = '';
        this.ProductList = [];
        this.checkSalt(productId, prdct.DisplayName);
        this.showSubs = '';
        this.showVar = '';
        this.addWebEngage(tmp, parseInt(ProductQty))
      });
    }else{
      this.addToCart(tmp, 1, 'MoveToCart');
      this.showSubs = '';
    }
  }

  replaceAlternative(altr: any, mainProd: any) {
    // console.log(altr, mainProd);
    let addedNow = mainProd[this.addedQty] * mainProd[this.SizeIndex];
    let tobeAdd = addedNow / altr.Size;
    let alteQty = Math.ceil(tobeAdd);
    // console.log(addedNow, alteQty);
    if (this.isLoggedIn != 'true' || this.currentUrl == 'ordermedicine') {
      this.addAlternative(altr, alteQty, mainProd[this.PrescriptionOTC]);
      // this.deleteById(mainProd[this.getKeyIndex("ProductId")]);
      let id = `${mainProd[this.productID]}_0_0`;
      this.dbService.deleteByKey('cartItems', id).subscribe((status: any) => { })
      this.showSubs = '';
      this.showVar = '';
    } else {
      let arr: any = [];
      let productId = mainProd[this.getKeyIndex('ProductId')];
      // arr.push({ "ProductId": productId, "ProductCount": 0 });
      // arr.push({ "ProductId": parseInt(altr.PreferredProductId), "ProductCount": alteQty });
      arr.push({
        "ProductId": parseInt(altr.PreferredProductId),
        "ProductCount": alteQty,
        "OriginalProductId": productId,
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
          this.newItemEvent.emit();
          this.searchResult = false;
          this.searchTxt = '';
          this.ProductList = [];
          this.checkSalt(altr.PreferredProductId, altr.DisplayName);
          this.showSubs = '';
          this.showVar = '';
        }
      }
      );
    }

  }

  displayVrnt(ds: any) {
    this.showVar = ds[this.getKeyIndex("ProductId")];
    this.showSubs = '';
  }

  hideVrnt() {
    this.showVar = '';
  }

  addVarient(prdct: any, ProductQty: any){
    // console.log(prdct);
    let productId = prdct.ProductId;
    // let LotId = parseInt(productObj[this.getKeyIndex("PKLotId")]);
    let LotId = 0;
    let CPId = 0;

    let tmp = {
      id: productId + '_' + CPId + '_' + LotId,
      ProductId: parseInt(productId),
      ProductName: prdct.DisplayName,
      CustProductName: '',
      InteractiveHealthProfileId: '',
      // DosageRestriction: productObj[this.getKeyIndex("DosageRestriction")],
      DosageRestriction: prdct.DosageRestriction ? prdct.DosageRestriction : 0,
      OfferPrice: prdct.CustOfferPrice,
      ProductCount: parseInt(ProductQty),
      ItemVal: prdct.CustOfferPrice,
      SSCurrencyValue: ".00",
      // Iscourierable: productObj[this.getKeyIndex("IsCourierable")],
      Iscourierable: prdct.IsCourierable ? prdct.IsCourierable : 'N',
      ProductImage: prdct.ProductImage,
      ProductPrice: prdct.MRP,
      // PrescriptionOTC: productObj[this.getKeyIndex("PrescriptionOTC")],
      PrescriptionOTC: prdct.PrescriptionOTC,
      WarehouseId: this.CommonService.WHId,
      CPId: 0,
      MyFamilyId: 0,
      PKLotId: '',
      MfgGroup: prdct.MfgGroup ? prdct.MfgGroup : '',
      // ExpiryDate: productObj[this.getKeyIndex("ExpiryDate")],
      ExpiryDate: prdct.ExpiryDate ? prdct.ExpiryDate : '',
      ProductInteractiveModule: '',
      ProductInteractiveSubModule: '',
      // IsNonReturnable: productObj[this.getKeyIndex("IsNonReturnable")],
      IsNonReturnable: prdct.IsNonReturnable ? prdct.IsNonReturnable : 'N',
      RefOrderId: 0,
      Brand: '',
      DiscountPercent: prdct.CustDiscPercent
    };

    if (this.isLoggedIn != 'true' || this.currentUrl == 'ordermedicine') {
      this.dbService.add('cartItems', tmp).subscribe((res: any) => {
        // console.log('Record added successfully.', res);
        this.newItemEvent.emit();     
        this.searchResult = false;
        this.searchTxt = '';
        this.ProductList = [];
        this.checkSalt(productId, prdct.DisplayName);
        this.showSubs = '';
        this.showVar = '';
        this.addWebEngage(tmp, parseInt(ProductQty))
      });
    }else{
      this.addToCart(tmp, 1, 'MoveToCart');
      this.showSubs = '';
    }
  }

  // subAddPlus(productObj : any){
  //   // let pro_id = productObj.PreferredProductId;
  //   // let id = `${pro_id}_0_0`;
  //   // // console.log(id)
  //   // this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
  //   //   // console.log('item by key path',item);
  //   //   let qty = item['ProductCount'];
  //   //   if(item['DosageRestriction'] == 0 || (item['DosageRestriction'] != 0 && item['DosageRestriction']> qty)){
  //   //     const updatedItem = {...item, 'ProductCount': item['ProductCount'] + 1 }
  //   //   // console.log(updatedItem);
  //   //   this.updateById(updatedItem)
  //   //   }else{
  //   //     // alert('max limit reached');
  //   //     this.alertMsg = `You can order maximum ${item['DosageRestriction']} quantity`;
  //   //     this.headerModal.nativeElement.click();
  //   //   }
  //   // });
  // }

  // subAddMinus(productObj : any){
  //   // let pro_id = productObj.PreferredProductId;
  //   // let id = `${pro_id}_0_0`;
  //   // // console.log(id)
  //   // this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
  //   //   // console.log('item by key path',item);
  //   //   let qty = item['ProductCount'];
  //   //   if(qty >1){
  //   //     const updatedItem = {...item, 'ProductCount': item['ProductCount'] - 1 };
  //   //   // console.log(updatedItem);
  //   //   this.updateById(updatedItem)
  //   //   }else{
  //   //     // alert('remove');
  //   //     this.deleteById(pro_id)
  //   //   }
  //   // });
  // }

  requestNotify(item: any) {
    // console.log(item);
    this.spinner.show()
    if (this.isLoggedIn == 'true') {
      let fd = new FormData();
      fd.append('ProductId', item[this.getKeyIndex("ProductId")]);
      fd.append('ProductName', item[this.getKeyIndex("DisplayName")]);
      fd.append('ProductType', item[this.getKeyIndex("PrescriptionOTC")]);
      fd.append('RequestSource', 'S');
      // fd.append('DeviceId', '');
      // fd.append('AppType', '');
      // fd.append('AppVersion', '');

      this.CommonService.requestNotify('request_product/productRequest', fd).subscribe((res: any) => {
        // console.log(res);      
        if (res && res.response_code == 0) {
          this.toastr.success(res.message);
        } else {
          this.toastr.error(res.message);
        }
        this.spinner.hide()
      })
    } else {
      this.spinner.hide()
      window.location.href = `${this.CommonService.baseurl}user/login`;
    }
  }


  requestAddNew() {
    this.spinner.show()
    if(this.isLoggedIn == 'true') {
      let fd = new FormData();
      // fd.append('ProductName', this.searchTxt);
      // fd.append('ProductType', '');
      fd.append('ProductId', '');
      fd.append('ProductName', this.searchTxt);
      fd.append('ProductType', '');
      fd.append('RequestSource', 'S');
      // fd.append('DeviceId', '');
      // fd.append('AppType', '');
      // fd.append('AppVersion', '');
  
      this.CommonService.requestNotify('request_product/productRequest', fd).subscribe((res: any) => {
        // console.log(res);      
        if(res && res.response_code == 0){
          this.toastr.success(res.message);
        }else{
          this.toastr.error(res.message);
        }
        this.spinner.hide()
      })
    } else {
      this.spinner.hide()
      window.location.href = `${this.CommonService.baseurl}user/login`;
    }
  }

  addWebEngage(data: any, Qty: any){
    let returnable : boolean= false;
    if(data.IsNonReturnable == 0){
      returnable = true;
    }else{
      returnable = false;
    }
    let dscPrcnt = `${data.DiscountPercent}%`;
    let webData = {
      'Product Name': data.ProductName,
      'Brand': data.MfgGroup? data.MfgGroup :'',
      'Returnable': returnable,
      'Product Expiry Date': data.ExpiryDate,
      'Delivery Pincode': this.CommonService.PinCode,
      'Variant Selected': '',
      'Quantity': Qty,
      'Retail Price': data.OfferPrice,
      'Discount Percentage': dscPrcnt,
      'Price': data.ItemBasePrice? data.ItemBasePrice : data.ProductPrice,
      'Image': data.ProductImage? data.ProductImage :'',
    }
    this.webengageService.trackEvent('Product Added To Cart', webData);
  }


  // updateSearchList(tmp: any) {
  //   this.ProductList = this.ProductList.map((obj: any) => {
  //     if (obj[this.getKeyIndex('ProductId')] == tmp.ProductId) {
  //       obj[this.getKeyIndex('addedQty')] = tmp.ProductCount;
  //       obj[this.getKeyIndex('isAdded')] = 1;
  //     } else {
  //       if (obj[this.getKeyIndex('PreferredSubtitute')].length > 0) {
  //         obj[this.getKeyIndex('PreferredSubtitute')] = obj[this.getKeyIndex('PreferredSubtitute')].map((obj1: any) => {
  //           if (obj1.PreferredProductId == tmp.ProductId) {
  //             obj1.addedQty = tmp.ProductCount;
  //             obj1.isExisting = 1;
  //           }
  //           return obj1;
  //         });
  //       }
  //     }
  //     return obj;
  //   });
  // }
 
}
