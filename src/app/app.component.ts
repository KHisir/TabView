import { Component } from '@angular/core';
import { CcTabPanelComponent } from './cc-tabView/cc-tabPanel/cc-tabPanel.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cc-tabs';

  tabSelected(tab: CcTabPanelComponent): void {
    console.log(tab);
  }

  tabRemoved(tab: CcTabPanelComponent): void {
    console.log(tab);
  }

  tabAdded(tab: CcTabPanelComponent): void {
    console.log(tab);
  }
}
