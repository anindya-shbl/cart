import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// "deployUrl": "https://sastasundar.com/ngcart/V2_41/",
// "deployUrl": "https://stage.sastasundar.com/ngcart/",

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
