import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-salt-composition',
  templateUrl: './salt-composition.component.html',
  styleUrl: './salt-composition.component.scss'
})
export class SaltCompositionComponent implements OnInit {

  salt: string | null = null;
  finalList: any = [];
  pageNo: any = 1;
  size: any = 100;
  isloading: boolean = false;
  addedInCart: any = [];
  countnow: any = 0;
  totalcount: any = 0;

  constructor(
    public CommonService: CommonService, 
    private avtiveRoute: ActivatedRoute, 
    private router: Router, 
    private spinner: NgxSpinnerService,
    private dbService: NgxIndexedDBService,
    private cookieService: CookieService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.isloading = true;
    this.spinner.show();
    let d: Date = new Date();
    this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
    this.salt = this.avtiveRoute.snapshot.queryParamMap.get('salt');
    // console.log(this.salt);
    if (this.salt != null) {
      this.getAllRecord();
      this.onSearch()
    }else{
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

  onSearch() {
    // console.log('Search text:', this.salt);
    let timenow = new Date().getTime();
    let pincode = this.CommonService.PinCode;
    let werehouseId = this.CommonService.WHId;
    let panindia = this.CommonService.IsPanIndia;
    let token = this.CommonService.Token;
    let device = '';
    let searchUrl = `product_list_v2?q=${this.salt}&page=${this.pageNo}&size=${this.size}&ptype='P'&wh=${werehouseId}&token=${token}&panindia=${panindia}&pincode=${pincode}&strict_match=1&mtype='P'&includeGiftable=0&include_discontinued=0&timestamp=${timenow}&format=2`;

    this.CommonService.getAlternativeList(searchUrl).subscribe((res: any) => {
      // console.log(res)
      if(res){
        let data: any = res.items;
        
        if (data.length > 0) {
          this.countnow = data.length + this.countnow;
          this.totalcount = res.total;
          let onlysalts = res.items.filter((ds:any) => ds.Salts.Name === this.salt);
          if(onlysalts.length>0){
            let filtered = {...res, items: onlysalts}
            this.setSubProduct(filtered)
          }else{
            // this.finalList = [];
            this.isloading = false;
            this.spinner.hide();
          }
        }
      }else{
        this.finalList = [];
        this.isloading = false;
        this.spinner.hide();
      }
    })
  }



  setSubProduct(res: any) {

    let dataList: any = res['items'];
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

    // this.finalList = res['items'];
    let List = dataList.map((ds: any) => {
      let data = res['items'].find((ls: any) => parseInt(ls.ProductId) == ds.ProductId);
      return { ...ds, PreferredSubtitute: data.PreferredSubtitute };
    });

    this.finalList.push(...List);

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
      this.updateFinalList(tmp)
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
      this.updateFinalList(tmp)
    });

  }

  updateFinalList(tmp: any){
    this.finalList = this.finalList.map((obj: any) => {
      if (obj.ProductId == tmp.ProductId) {
        obj.addedQty = tmp.ProductCount;       
      }else{
        if(obj.PreferredSubtitute.length > 0){
          obj.PreferredSubtitute = obj.PreferredSubtitute.map((obj1: any) => {
            if (obj1.PreferredProductId == tmp.ProductId) {
              obj1.addedQty = tmp.ProductCount;       
            }
            return obj1;
          });
        }        
      }
      return obj;      
    });

    this.getAllRecord();
  }


  cartAddPlus(elm: any) {
    let id = `${elm.ProductId}_0_0`;
    // console.log(id);
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
      const updatedItem = { ...item, ProductCount: elm.addedQty + 1 };
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
        this.updateById(updatedItem);
      }else{
        this.delMainProduct(elm);
      }
    });
  }

  updateById(tmp: any) {
    this.dbService.update('cartItems', tmp).subscribe((res: any) => {
      if (res) {
        this.updateFinalList(tmp)
      }
    });
  }

  delMainProduct(item: any) {
    let id = `${item.ProductId}_0_0`;
    this.dbService.deleteByKey('cartItems', id).subscribe((status: any) => { })
    this.finalList = this.finalList.map((obj: any) => {
      if (obj.ProductId == item.ProductId) {
        obj.addedQty = 0;
      } else {
        if (obj.PreferredSubtitute.length > 0) {
          obj.PreferredSubtitute = obj.PreferredSubtitute.map((obj1: any) => {
            if (obj1.PreferredProductId == item.ProductId) {
              obj1.addedQty = 0;
            }
            return obj1;
          });
        }
      }
       return obj;
    });
    // console.log('finalList', this.finalList);
    this.getAllRecord();
  }

  alterAddPlus(elm: any) {
    let id = `${elm.PreferredProductId}_0_0`;
    this.dbService.getByKey('cartItems', id).subscribe((item: any) => {
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
        if (obj.ProductId == item.PreferredProductId) {
        obj.addedQty = 0; 
        return obj;      
      }else{
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
      }
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

  notifySubs(item: any){

    // console.log(item)

    let data = {
      "ProductName": item.DisplayName,
      "DosageForm": item.DosageForm,
      "ProductId": item.ProductId,
      "Size": item.Size
    }

    // this.spinner.show();

    // this.CommonService.postData('jito/request-product', data).subscribe((res: any) => {
    //   // console.log(res)
    //   if (res && res['status'] == 200) {
    //     this.spinner.hide();
    //     this.toastr.success(res['message']);
    //   } else {
    //     this.spinner.hide();
    //     this.toastr.error(res['message']);
    //   }
    // })
  }

  // onselectItem(item: any) {
  //   // console.log(item);
  //   if (item.IsGenericNew == 1) {
  //     this.router.navigate(['/generic'], { queryParams: { id: item.ProductId, name: item.DisplayName } });
  //   } else {
  //     this.router.navigate(['/branded'], { queryParams: { id: item.ProductId, name: item.DisplayName } });
  //   }
  // }

  onselectItem(item: any, subs: any) {
    // console.log(item);
    this.router.navigate(['/product-compare'], { queryParams: { prd: item.ProductId, sub: subs.PreferredProductId } });
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

  nextpage(){
    this.pageNo = this.pageNo + 1;
    this.spinner.show();
    this.onSearch();    
  }

}
