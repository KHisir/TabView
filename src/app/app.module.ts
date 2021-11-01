import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CcTabPanelComponent } from './cc-tabView/cc-tabPanel/cc-tabPanel.component';
import { CcTabViewComponent } from './cc-tabView/cc-tabView.component';

@NgModule({
  declarations: [		
    AppComponent,
      CcTabViewComponent,
      CcTabPanelComponent
   ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
