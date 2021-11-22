import { AfterViewInit, ChangeDetectorRef, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { AfterContentInit, Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { CcTabPanelComponent } from './cc-tabPanel/cc-tabPanel.component';
import { DynamicTabDirective } from './dynamic-tab.directive';

@Component({
  selector: 'app-cc-tabView',
  templateUrl: './cc-tabView.component.html',
  styleUrls: ['./cc-tabView.component.scss']
})
export class CcTabViewComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  @ContentChildren(CcTabPanelComponent) tabs!: QueryList<CcTabPanelComponent>
  dynamicTabs: CcTabPanelComponent[] = [];
  tabWidth: number = 150;
  dropdownIsOpen: boolean = false;
  dropdownItemElem?: HTMLElement;
  observer?: ResizeObserver;
  // @ContentChildren(forwardRef(() => CcTabPanelComponent)) tabs;

  @Input() showAddTabButton: boolean = false;
  @Input() stretchTabs: boolean = false;
  @Input() dynamicTemplate!: TemplateRef<any>;

  @Output() tabRemoved = new EventEmitter<CcTabPanelComponent>();
  @Output() tabSelected = new EventEmitter<CcTabPanelComponent>();
  @Output() tabAdded = new EventEmitter<CcTabPanelComponent>();

  @ViewChild(DynamicTabDirective) dynamicTabPlaceholder!: DynamicTabDirective;
  @ViewChild("tabPanel") tabPanelElem?: ElementRef;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.dropdownItemElem !== undefined) {
      this.dropdownItemElem = undefined;
    } else {
      this.dropdownIsOpen = false;
    }
  }

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private cdr: ChangeDetectorRef) { }

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

  ngAfterViewInit() {
    this.observer = new ResizeObserver(entries => {
      this.foldUpExcess();
    });

    if (this.tabPanelElem !== undefined && this.observer !== undefined) {
      this.observer.observe(this.tabPanelElem.nativeElement);
    }

    this.foldUpExcess();
  }

  ngOnDestroy() {
    if (this.tabPanelElem !== undefined && this.observer !== undefined) {
      this.observer.unobserve(this.tabPanelElem.nativeElement);
    }
  }

  selectTab(tab: CcTabPanelComponent): void {
    // deactive all tabs
    this.tabs.toArray().forEach((tab: CcTabPanelComponent) => tab.active = false);

    // active the tab the user has clicked on.
    if (tab !== undefined) {
      tab.active = true;
      this.tabSelected.emit(tab);
    }
  }

  closeTab(tab: CcTabPanelComponent): void {
    tab.closed = true
    tab.active = false;

    const nextSelectedTab: CcTabPanelComponent = this.getAfterClosingNextSelectedTab(tab);

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

    if (nextSelectedTab !== undefined) {
      this.selectTab(nextSelectedTab);
    }

    this.foldUpExcess();
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

    this.foldUpExcess();
  }

  getAfterClosingNextSelectedTab(closedTab: CcTabPanelComponent): any {
    const currentTabIndex = this.tabs.toArray().findIndex(x => x.id === closedTab.id);
    let nextTab;

    const activeTab = this.tabs.find((tab: CcTabPanelComponent) => tab.active === true);
    if (activeTab !== undefined) {
      if (closedTab.id !== activeTab.id) {
        return nextTab
      }
    }

    for (let i = currentTabIndex; i < this.tabs.length; i++) {
      nextTab = this.tabs.get(i+1);
      if (nextTab !== undefined) {
        if (nextTab.closed || nextTab.disabled) {
          continue;
        } else {
          break;
        }
      }
    }

    if (nextTab === undefined) {
      for (let i = currentTabIndex; i >= 0; i--) {
        nextTab = this.tabs.get(i-1);
        if (nextTab !== undefined) {
          if (nextTab.closed || nextTab.disabled) {
            continue;
          } else {
            break;
          }
        }
      }
    }

    return nextTab;
  }

  foldUpExcess(): void {
    if (this.tabPanelElem !== undefined) {
      let addBtnWidth: number = 0;

      if (this.showAddTabButton === true) {
        addBtnWidth = 30;
      }

      if (((this.tabs.length * this.tabWidth) + addBtnWidth) > this.tabPanelElem.nativeElement.offsetWidth) {
        const maxCountOfDisplays: number = Math.floor((this.tabPanelElem.nativeElement.offsetWidth) / this.tabWidth);
        
        for (let i = 0; i < this.tabs.length; i++) {
          const tab = this.tabs.get(i);

          if (tab !== undefined) {
            tab.dropdownTab = false;
            if (i >= maxCountOfDisplays) {
              tab.dropdownTab = true;
            }
          }
        }
      } else {
        this.tabs.toArray().forEach((tab: CcTabPanelComponent) => tab.dropdownTab = false);
      }
      this.cdr.detectChanges();
    }
  }

  dropdownOnClick(elem?: HTMLElement): void {
    this.dropdownIsOpen = !this.dropdownIsOpen;
    this.dropdownItemElem = this.dropdownIsOpen === true ? elem : undefined;
  }

  getTabWidth(): string {
    if (!this.stretchTabs) {
      return this.tabWidth + 'px';
    } else {
      return 'auto';
    }
  }

  tabCountInDropdown(): number {
    return this.tabs.filter((tab: CcTabPanelComponent) => tab.dropdownTab === true).length;
  }

}
