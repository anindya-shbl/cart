import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-jito-compare',
  templateUrl: './jito-compare.component.html',
  styleUrl: './jito-compare.component.scss'
})
export class JitoCompareComponent implements OnInit {

  productId: string | null = null;
  subsId: string | null = null;
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
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    })
    this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
    this.productId = this.avtiveRoute.snapshot.queryParamMap.get('prd');
    this.subsId = this.avtiveRoute.snapshot.queryParamMap.get('sub');
    // console.log(this.productId);
    if (this.productId != null && this.subsId != null) {
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
    // let data = {
    //   productId: this.productId,
    // };

    this.CommonService.getmedicineComparison('jito/medicine-comparison-text', this.subsId).subscribe((res: any) => {
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
      // let data: any = prdct.PreferredSubtitute;
      let data: any = [];
      data.push(prdct.PreferredSubtitute.find((item: any) => item.PreferredProductId == this.subsId));
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

  updateById(tmp: any) {
    this.dbService.update('cartItems', tmp).subscribe((res: any) => {
      // console.log('storeData: ', res);
      if (res) {
        this.getAllRecord();
      }
    });
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

  backtoCompare(salt: any){
    this.router.navigate(['/saltcomposition'], { queryParams: { salt: salt.Name } });
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
