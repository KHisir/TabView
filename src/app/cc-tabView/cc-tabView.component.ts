import { forwardRef } from '@angular/core';
import { AfterContentInit, Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { CcTabPanelComponent } from './cc-tabPanel/cc-tabPanel.component';

@Component({
  selector: 'app-cc-tabView',
  templateUrl: './cc-tabView.component.html',
  styleUrls: ['./cc-tabView.component.scss']
})
export class CcTabViewComponent implements OnInit, AfterContentInit {
  @ContentChildren(CcTabPanelComponent) tabs!: QueryList<CcTabPanelComponent>
  // @ContentChildren(forwardRef(() => CcTabPanelComponent)) tabs;

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    if (this.tabs !== undefined) {
      console.log(this.tabs.length);

      // get the active tab
      const activeTab = this.tabs.find((tab: CcTabPanelComponent) => tab.active === true);
    
      // if there is no active tab set, active the first
      if (activeTab === undefined) {
        this.selectTab(this.tabs.first);
      }
    }
  }

  selectTab(tab: CcTabPanelComponent): void {
    // deactive all tabs
    this.tabs.toArray().forEach((tab: CcTabPanelComponent) => tab.active = false);

    // active the tab the user has clicked on.
    tab.active = true;
  }

}
