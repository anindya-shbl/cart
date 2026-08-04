import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchComponent } from './components/search/search.component';
import { LoginComponent } from './components/login/login.component';
import { CartviewComponent } from './components/cartview/cartview.component';
import { PlaceOrderComponent } from './components/place-order/place-order.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { JitoSearchComponent } from './components/jito-search/jito-search.component';
import { BrandedComponent } from './components/branded/branded.component';
import { GenericComponent } from './components/generic/generic.component';
import { SaltCompositionComponent } from './components/salt-composition/salt-composition.component';
import { JitoCompareComponent } from './components/jito-compare/jito-compare.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { MapLocationPickerComponent } from './components/map-location-picker/map-location-picker.component';

// const dbConfig: DBConfig  = {
//   name: 'ssht_webDB',
//   version: 1,
//   objectStoresMeta: [{
//     store: 'cartItems',
//     storeConfig: { keyPath: 'id', autoIncrement: true },
//     storeSchema: [
//       { name: 'ProductId_idx', keypath: 'ProductId', options: { unique: false } },
//       // { name: 'email', keypath: 'email', options: { unique: false } }
//     ]
//   }],
// };

const dbConfig: DBConfig = {
  name: 'ssht_webDB',
  version: 2,
  objectStoresMeta:
    [
      {
        store: 'cartItems',
        storeConfig: { keyPath: 'id', autoIncrement: true },
        storeSchema: [
          { name: 'ProductId_idx', keypath: 'ProductId', options: { unique: false } },
        ]
      },
      {
        store: 'LabTests',
        storeConfig: { keyPath: 'id', autoIncrement: true },
        storeSchema: [
          { name: 'LabtestId_idx', keypath: 'ProductId', options: { unique: false } },
        ]
      }
    ],
  // provide the migration factory to the DBConfig
  // migrationFactory
};



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchComponent,
    LoginComponent,
    CartviewComponent,
    PlaceOrderComponent,
    JitoSearchComponent,
    BrandedComponent,
    GenericComponent,
    SaltCompositionComponent,
    JitoCompareComponent,
    NotFoundComponent,
    MapLocationPickerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
