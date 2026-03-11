import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-generic',
  templateUrl: './generic.component.html',
  styleUrl: './generic.component.scss'
})
export class GenericComponent implements OnInit {

  productId: string | null = null;
  finalList: any = [];
  isLoading: boolean = false;
  addedInCart: any = [];
  genericItem: any = [];
  mediCompText: any = [];

  constructor(
    public CommonService: CommonService, 
    private avtiveRoute: ActivatedRoute, 
    private router: Router, 
    private spinner: NgxSpinnerService,
    private dbService: NgxIndexedDBService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.spinner.show();
    let d: Date = new Date();
    this.cookieService.set('cartsynch', '0', d.getTime() + 86400 * 30, '/');
    this.productId = this.avtiveRoute.snapshot.queryParamMap.get('id');
    // console.log(this.productId);
    if (this.productId != null) {
      this.mediComparison();
      this.getAllRecord();
      this.getAletnatives();
    }else{
      this.isLoading = false;
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

  mediComparison() {
    let data = {
      productId: this.productId,
    };

    this.CommonService.getmedicineComparison('jito/medicine-comparison-text', data).subscribe((res: any) => {
      // console.log(res)
      if (res && res['status'] == 200) {
        this.mediCompText = res.data;
      } else {
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

    let url = `product_find?product_id=${this.productId}&token=${token}&wh=${WHId}&panindia=${IsPanIndia}&pincode=${PinCode}`;

    this.CommonService.getAlternativeList(url).subscribe((res: any) => {
      // console.log(res)
      if (res && res['items'].length > 0) {

        res['items'].forEach((p: any) => {
          p.addedQty = 0;
          if (this.addedInCart.length > 0) {
            this.addedInCart.forEach((item: any) => {
              if (p.ProductId == item.ProductId) {
                p.addedQty = item.ProductCount;
              }
            })
          }
        });
        this.genericItem = res['items'];      
        this.setBranded(res);
      }else{
        this.isLoading = false;
        this.genericItem = [];
        this.finalList = [];
        this.spinner.hide();
      }
    })
  }

  setBranded(res: any) {
    // let dataList: any = res['items'];
    let data: any = res['items'][0]['SubstitueBrand'];
    let mdLst: any = [];

    if(data.length > 0){
      data.forEach((elm: any) => {
        if (elm.MRP != '' && elm.MRP != null && elm.MRP > 0) {
          let mprdPrice: any = '';
          let sbrdPrice: any = '';

          if (this.CommonService.ConfigData.GenericPercentageCalOnOfferPrice == 'Y') {
            sbrdPrice = res['items'][0].OfferPrice;
            mprdPrice = elm.CustOfferPrice;
          } else {
            sbrdPrice = res['items'][0].MRP;
            mprdPrice = elm.MRP;
          }

          if (res['items'][0].Size > 0 && elm.Size > 0) {
            let mainUnitPrice: any = mprdPrice / elm.Size;
            let subUnitPrice: any = sbrdPrice / res['items'][0].Size;
            if (mainUnitPrice > subUnitPrice) {
              let savingsPercentage = ((mainUnitPrice - subUnitPrice) / mainUnitPrice) * 100;
              let savingPerStrip = ((mainUnitPrice - subUnitPrice) * res['items'][0].Size);
              let prNd = Math.floor(savingsPercentage);
              if (prNd >= this.CommonService.ConfigData.GenericMinPercentage) {
                let mps = {
                  ...res['items'][0],
                  pricePerUnit: subUnitPrice, 
                  savingsPercent: prNd, 
                  savePerStrip: savingPerStrip
                }
                let ds = { ...elm, pricePerUnit: mainUnitPrice, maimPrd: mps };
                mdLst.push(ds)
              }
            }
          }
        }
      });
    }

    if (mdLst.length > 0) {
      mdLst.sort((a: any, b: any) => b.pricePerUnit - a.pricePerUnit)
      this.finalList.push(mdLst[0])
    }else{
      this.finalList = [];
      let item = this.genericItem[0];
      this.CommonService.getProductDetailsPageURL(item.ProductId, item.DisplayName, item.PrescriptionOTC);
      this.router.navigate(['/jitosearch'])
    }
    
    // console.log(mdLst, this.finalList);

    this.isLoading = false;
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
      this.finalList = this.finalList.map((obj: any) => {
        if (obj.maimPrd.ProductId == tmp.ProductId) {
          obj.maimPrd.addedQty = tmp.ProductCount;
        }
        return obj;
      });
      this.getAllRecord();
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
        if (obj.maimPrd.ProductId == item.ProductId) {
          obj.maimPrd.addedQty = updatedItem.ProductCount;
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
          if (obj.maimPrd.ProductId == item.ProductId) {
            obj.maimPrd.addedQty = updatedItem.ProductCount;
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
        if (obj.maimPrd.ProductId == item.ProductId) {
          obj.maimPrd.addedQty = 0;
          return obj;
        }
        return obj;
      })
      this.getAllRecord();
    })
  }

  calMainSavings(item: any, subs: any){
    let addedNow = item.addedQty * subs.Size ;
    let tobeAdd = addedNow / item.Size;
    let alteQty = Math.ceil(tobeAdd);
    let save: any = item.savePerStrip * alteQty;
    return Math.trunc(save);
  }

   removeDece(item: any, subs: any){
    let tobeAdd = subs.Size / item.Size;
    let alteQty = Math.ceil(tobeAdd);
    let save: any = item.savePerStrip * alteQty;
    return Math.trunc(save);
  }
  
}
