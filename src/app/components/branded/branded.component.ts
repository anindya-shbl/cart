import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-branded',
  templateUrl: './branded.component.html',
  styleUrl: './branded.component.scss'
})
export class BrandedComponent implements OnInit {

  productId: string | null = null;
  finalList: any = [];
  isloading: boolean = false;
  addedInCart: any = [];
  mediCompText: any = [];

  constructor(
    public CommonService: CommonService,
    private dbService: NgxIndexedDBService,
    private avtiveRoute: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.isloading = true;
    this.spinner.show();
    let d: Date = new Date();
    this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
    this.productId = this.avtiveRoute.snapshot.queryParamMap.get('id');
    // console.log(this.productId);
    if (this.productId != null) {
      this.mediComparison();
      this.getAllRecord();
      this.getAletnatives();
    } else {
      this.isloading = false;
      this.spinner.hide();
      this.router.navigate(['/home']);
    }
  }

  getAllRecord() {
    this.dbService.getAll('cartItems').subscribe((res: any) => {
      // console.log('all records', res);
      this.addedInCart = res;
    });
  }

  mediComparison(){    
    let data = {
      productId: this.productId,
    };

    this.CommonService.getmedicineComparison('jito/medicine-comparison-text', data).subscribe((res: any) => {
      // console.log(res)
      if(res && res['status']==200){
        this.mediCompText = res.data;
      }else{
        this.mediCompText = [];
      }
    })
  }

  getAletnatives() {
    let arr: any = [];
    // this.finalList.forEach((item: any)=>{
    //   item.PreferredSubtitute = [];
    //   arr.push(item.ProductId)
    // })
    // let productIDs = arr.join("|");
    let PinCode = this.CommonService.PinCode;
    let WHId = this.CommonService.WHId;
    let IsPanIndia = this.CommonService.IsPanIndia;
    let token = this.CommonService.Token;

    let url = `product_find?product_id=${this.productId}&wh=${WHId}&token=${token}&panindia=${IsPanIndia}&pincode=${PinCode}`;

    this.CommonService.getAlternativeList(url).subscribe((res: any) => {
      // console.log(res)
      if (res && res['items'].length > 0) {
        this.setSubProduct(res)
      } else {
        this.finalList = [];
        this.isloading = false;
        this.spinner.hide();
      }
    })
  }

  setSubProduct(res: any) {

    // let dataList: any = res['items'];

    res['items'].forEach((prdct: any) => {
      let mUnitPrice: any = 0;

      if (this.CommonService.ConfigData.GenericPercentageCalOnOfferPrice == 'Y') {
        mUnitPrice = prdct.OfferPrice / prdct.Size;
      } else {
        mUnitPrice = prdct.MRP / prdct.Size;
      }
      prdct.pricePerUnit = mUnitPrice;
      prdct.addedQty = 0;

      if (this.addedInCart.length > 0) {
        this.addedInCart.forEach((item: any) => {
          if (prdct.ProductId == item.ProductId) {
            prdct.addedQty = item.ProductCount;
          }
        })
      }

      let mdLst: any = [];
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
                  let ds = { ...elm, pricePerUnit: subUnitPrice, savingsPercent: prNd, savePerStrip: savingPerStrip, addedQty: 0 };
                  // let ds = { ...elm, savingsPercent: prNd, isExisting: 0, addedQty: 0, savePerStrip: savingPerStrip };
                  if (this.addedInCart.length > 0) {
                    this.addedInCart.forEach((item: any) => {
                      if (ds.PreferredProductId == item.ProductId) {
                        ds.addedQty = item.ProductCount;
                      };
                    });
                  }
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

    this.finalList = res['items'];

    // console.log(this.finalList);
    this.isloading = false;
    this.spinner.hide();

  }

  addToLocalCart(elm: any, Qty: any) {
    let qty = parseInt(Qty);
    let tmp = {
      id: elm.ProductId + '_' + 0 + '_' + 0,
      ProductId: parseInt(elm.ProductId),
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
      ProductPrice: elm.MRP,
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
      this.finalList = this.finalList.map((obj: any) => {
        if (obj.ProductId == tmp.ProductId) {
          obj.addedQty = tmp.ProductCount;
        }
        return obj;
      });
      this.getAllRecord();
    });
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


    this.dbService.add('cartItems', tmp).subscribe((res: any) => {
      this.finalList = this.finalList.map((obj: any) => {
        if (obj.PreferredSubtitute.length > 0) {
          obj.PreferredSubtitute = obj.PreferredSubtitute.map((obj1: any) => {
            if (obj1.PreferredProductId == tmp.ProductId) {
              obj1.addedQty = tmp.ProductCount;
            }
            return obj1;
          });
        }
        return obj;
      });
      this.getAllRecord()
    });

  }

  cartAddPlus(elm: any) {
    let id = `${elm.ProductId}_0_0`;
    // console.log(id);
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
      // console.log('item by key path', item);
      // let qty = item.addedQty;
      const updatedItem = { ...item, ProductCount: elm.addedQty + 1 };
      this.finalList = this.finalList.map((obj: any) => {
        if (obj.ProductId == item.ProductId) {
          obj.addedQty = updatedItem.ProductCount;
          return obj;
        }
        return obj;
      })
      this.updateById(updatedItem);
    });
  }

  cartAddMinus(elm: any) {
    let id = `${elm.ProductId}_0_0`;
    // console.log(id);
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {

      let qty = item.ProductCount;
      if (qty > 1) {
        const updatedItem = { ...item, ProductCount: qty - 1 };
        this.finalList = this.finalList.map((obj: any) => {
          if (obj.ProductId == item.ProductId) {
            obj.addedQty = updatedItem.ProductCount;
            return obj;
          }
          return obj;
        })
        this.updateById(updatedItem);
      }else{
        this.delMainProduct(elm);
      }
    });
  }

  updateById(tmp: any) {
    this.dbService.update('cartItems', tmp).subscribe((res: any) => {
      // console.log('storeData: ', res);
      if (res) {
        this.getAllRecord();
      }
    });
  }

  delMainProduct(item: any) {
    let id = `${item.ProductId}_0_0`;
    this.dbService.deleteByKey('cartItems', id).subscribe((status: any) => {
      this.finalList = this.finalList.map((obj: any) => {
        if (obj.ProductId == item.ProductId) {
          obj.addedQty = 0;
          return obj;
        }
        return obj;
      })
      this.getAllRecord();
    })
  }

  alterAddPlus(elm: any) {
    let id = `${elm.PreferredProductId}_0_0`;
    // console.log(id);
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
      // console.log('item by key path', item);
      const updatedItem = { ...item, ProductCount: elm.addedQty + 1 };
      this.finalList = this.finalList.map((obj: any) => {
        if (obj.PreferredSubtitute.length > 0) {
          obj.PreferredSubtitute = obj.PreferredSubtitute.map((obj1: any) => {
            if (obj1.PreferredProductId == item.ProductId) {
              obj1.addedQty = updatedItem.ProductCount;
              return obj1;
            } else {
              return obj1
            }
          });
          return obj;
        }
        return obj;
      })
      this.updateById(updatedItem);
    });
  }

  alterAddMinus(elm: any) {
    let id = `${elm.PreferredProductId}_0_0`;
    // console.log(id);
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
      let qty = item.ProductCount;
      if (qty > 1) {
        const updatedItem = { ...item, ProductCount: elm.addedQty - 1 };
        this.finalList = this.finalList.map((obj: any) => {
          if (obj.PreferredSubtitute.length > 0) {
            obj.PreferredSubtitute = obj.PreferredSubtitute.map((obj1: any) => {
              if (obj1.PreferredProductId == item.ProductId) {
                obj1.addedQty = updatedItem.ProductCount;
                return obj1;
              } else {
                return obj1
              }
            });
            return obj;
          }
          return obj;
        })
        this.updateById(updatedItem);
      } else {
       this.delAlternative(elm)
      }
    });
  }

  delAlternative(item: any) {
    let id = `${item.PreferredProductId}_0_0`;
    this.dbService.deleteByKey('cartItems', id).subscribe((status: any) => {
      this.finalList = this.finalList.map((obj: any) => {
        if (obj.PreferredSubtitute.length > 0) {
          obj.PreferredSubtitute = obj.PreferredSubtitute.map((obj1: any) => {
            if (obj1.PreferredProductId == item.PreferredProductId) {
              obj1.addedQty = 0;
              return obj1;
            } else {
              return obj1
            }
          });
          return obj;
        }
        return obj;
      });
      this.getAllRecord();
    })
  }

  replaceAlternative(item: any, subs: any) {
    let addedNow = item.addedQty * item.Size;
    let tobeAdd = addedNow / subs.Size;
    let alteQty = Math.ceil(tobeAdd);

    this.delMainProduct(item);
    this.addAlternative(subs, alteQty, item.PrescriptionOTC);
  }

  replaceMain(item: any, subs: any){
    let addedNow = subs.addedQty * subs.Size;
    let tobeAdd = addedNow / item.Size;
    let alteQty = Math.ceil(tobeAdd);

    this.delAlternative(subs);    
    this.addToLocalCart(item, alteQty);
  }

  calAltSavings(item: any, subs: any){
    // let addedNow = item.addedQty * item.Size;
    // let tobeAdd = addedNow / subs.Size;
    // let alteQty = Math.ceil(tobeAdd);
    // let save: any = subs.savePerStrip * alteQty;
    // return save.toFixed(2);
    let save: any = item.addedQty * subs.savePerStrip;
    return Math.trunc(save);
  }

  calMainSavings(item: any, subs: any){
    let addedNow = subs.addedQty * subs.Size;
    let tobeAdd = addedNow / item.Size;
    let alteQty = Math.ceil(tobeAdd);
    let save: any = subs.savePerStrip * alteQty;
    return Math.trunc(save);
  }

  removeDece(val: any){
    return Math.trunc(val);
  }



  notifyItem(item: any) {

    this.spinner.show();

    let isLoggedIn =  this.cookieService.get('isLoggedIn');

    if (isLoggedIn == 'true') {
      let fd = new FormData();
      fd.append('ProductId', item.ProductId);
      fd.append('ProductName', item.DisplayName);
      fd.append('ProductType', item.PrescriptionOTC);
      fd.append('RequestSource', 'S');

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

}
