import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// "deployUrl": "https://sastasundar.com/ngcart/V2_30/",
// "deployUrl": "https://stage.sastasundar.com/ngcart/",
// "deployUrl": "https://stage.sastasundar.com/ngcart/v_26.8.6_2/",

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
