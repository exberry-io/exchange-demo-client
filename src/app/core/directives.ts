import { Directive, Input, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import * as $ from 'jquery';

@Directive({
    selector: '[ngxInit]',
})
export class NgxInitDirective {
    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef) {
    }

    @Input() set ngxInit(val: any) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef, { ngxInit: val });
    }
}

@Directive({
    selector: '[ngxCollapse]',
    exportAs: 'ngxCollapse',
    //host: { '[class.collapse]': 'true', '[class.show]': '!collapsed' }
})
export class NgxCollapseDirective {
  collapsed: boolean = false;
  onload: boolean = true;

  constructor(private el: ElementRef) { }

  @Input()
  set ngxCollapse(val: boolean) {

    this.collapsed = val;
    let $el = $(this.el.nativeElement);
    if (this.onload) {
      this.collapsed ? $el.hide() : $el.show()
      this.onload = false;
    } else {
      this.collapsed ? $el.hide(200) : $el.show(200);
    }
  }

  get ngxCollapse(): boolean { return this.collapsed; }




}
