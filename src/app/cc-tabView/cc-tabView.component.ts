import { ChangeDetectorRef, ComponentFactoryResolver, EventEmitter, forwardRef, Input, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AfterContentInit, Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { CcTabPanelComponent } from './cc-tabPanel/cc-tabPanel.component';
import { DynamicTabDirective } from './dynamic-tab.directive';

@Component({
  selector: 'app-cc-tabView',
  templateUrl: './cc-tabView.component.html',
  styleUrls: ['./cc-tabView.component.scss']
})
export class CcTabViewComponent implements OnInit, AfterContentInit {
  @ContentChildren(CcTabPanelComponent) tabs!: QueryList<CcTabPanelComponent>
  dynamicTabs: CcTabPanelComponent[] = [];
  // @ContentChildren(forwardRef(() => CcTabPanelComponent)) tabs;

  @Input() showAddTabButton: boolean = false;
  @Input() stretchTabs: boolean = false;
  @Input() dynamicTemplate!: TemplateRef<any>;

  @Output() tabRemoved = new EventEmitter<CcTabPanelComponent>();
  @Output() tabSelected = new EventEmitter<CcTabPanelComponent>();
  @Output() tabAdded = new EventEmitter<CcTabPanelComponent>();

  @ViewChild(DynamicTabDirective) dynamicTabPlaceholder!: DynamicTabDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    if (this.tabs !== undefined) {
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
    this.tabSelected.emit(tab);
  }

  closeTab(tab: CcTabPanelComponent): void {
    tab.closed = true

    // Close fix Tabs:
    for (let i = 0; i < this.tabs.length; i++) {
      const item = this.tabs.get(i);
      if (item !== undefined) {
        if (tab.active && item.id === tab.id) {
          let nextTab = this.tabs.get(i+1);
          let prevTab = this.tabs.get(i-1);
          if (nextTab !== undefined) {
            if (!nextTab.closed) {
              tab.active = false;
              this.selectTab(nextTab);
            } else {
              continue;
            }
          } else if (prevTab !== undefined) {
            if (!prevTab.closed) {
              tab.active = false;
              this.selectTab(prevTab);
            } else {
              continue;
            }
          } else {
            tab.active = false;
            // Todo - If only a tab! For example, prevent delete:
            // tab.closed = false;
            // tab.active = true;
          }
          break;
        }
      }
    }

    const notClosedTabs = this.tabs.filter((tab: CcTabPanelComponent) => tab.closed === false);
    this.tabs.reset([...notClosedTabs]);

    // remove/destroy dynamically created component:
    for (let i = 0; i < this.dynamicTabs.length; i++) {
      if (this.dynamicTabs[i] === tab) {
        // remove the tab from our array
        this.dynamicTabs.splice(i, 1);

        // destroy our dynamically created component again
        let viewContainerRef = this.dynamicTabPlaceholder.viewContainer;
        // let viewContainerRef = this.dynamicTabPlaceholder;
        viewContainerRef.remove(i);
        break;
      }
    }
    this.tabRemoved.emit(tab);
  }

  addDynamicTab(): void {
    // deactive all tabs
    this.tabs.toArray().forEach((tab: CcTabPanelComponent) => tab.active = false);

    // get a component factory for our CcTabPanelComponent
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(CcTabPanelComponent);
    // fetch the view container reference from the anchor directive
    const viewContainerRef = this.dynamicTabPlaceholder.viewContainer;
    // create a component instance
    const componentRef = viewContainerRef.createComponent(componentFactory);
    // set the properties on the component instance
    const instance: CcTabPanelComponent = componentRef.instance as CcTabPanelComponent;
    instance.title = "New Tab";
    instance.active = true;
    instance.closeable = true;
    instance.dynamicTemplate = this.dynamicTemplate;

    // Remember the dynamic tabs in a separate list - needed for later deletion from the dome!
    this.dynamicTabs.push(componentRef.instance as CcTabPanelComponent);
    
    this.tabs.reset([...this.tabs.toArray(), instance]);
    this.tabAdded.emit(instance);
  }

}
