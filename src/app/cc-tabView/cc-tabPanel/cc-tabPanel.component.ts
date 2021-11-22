import { TemplateRef } from '@angular/core';
import { Input } from '@angular/core';
import { ContentChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cc-tabPanel',
  templateUrl: './cc-tabPanel.component.html',
  styleUrls: ['./cc-tabPanel.component.scss']
})
export class CcTabPanelComponent implements OnInit {
  @ContentChild(TemplateRef) template!: TemplateRef<any>
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() badge: string = '';
  @Input() closeable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() active: boolean = false;
  @Input() dynamicTemplate: any;

  id: string = '';
  closed: boolean = false;
  dropdownTab: boolean = false

  constructor() {
    this.id = this.createId();
  }

  ngOnInit() {
  }

  createId() {
    // tslint:disable-next-line:only-arrow-functions
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0;
      // tslint:disable-next-line:no-bitwise
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}
