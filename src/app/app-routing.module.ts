import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartviewComponent } from './components/cartview/cartview.component';
import { LoginComponent } from './components/login/login.component';
import { PlaceOrderComponent } from './components/place-order/place-order.component';
import { JitoSearchComponent } from './components/jito-search/jito-search.component';
import { GenericComponent } from './components/generic/generic.component';
import { BrandedComponent } from './components/branded/branded.component';
import { SaltCompositionComponent } from './components/salt-composition/salt-composition.component';
import { JitoCompareComponent } from './components/jito-compare/jito-compare.component';

const routes: Routes = [
  // { path: '', redirectTo: 'viewcart', pathMatch: 'full' },
  // { path: 'viewcart', component: CartviewComponent},
  // // { path: 'login', component: LoginComponent },
  // { path: 'ordermedicine', component: PlaceOrderComponent },
  // { path: '**', redirectTo: 'viewcart', pathMatch: 'full' },

  { path: '', redirectTo: 'ordermedicine', pathMatch: 'full' },
  { path: 'ordermedicine', component: CartviewComponent },
  { path: 'customercart', component: PlaceOrderComponent },
  { path: 'jitosearch', component: JitoSearchComponent },
  { path: 'generic', component: GenericComponent },
  { path: 'branded', component: BrandedComponent },
  { path: 'saltcomposition', component: SaltCompositionComponent },
  { path: 'product-compare', component: JitoCompareComponent },
  { path: '**', redirectTo: 'ordermedicine', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
