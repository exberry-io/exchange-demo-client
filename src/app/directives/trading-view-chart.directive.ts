import { Directive, Input, Output, EventEmitter, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';

declare const $: any;
import * as _ from 'lodash';

@Directive({
	selector: '[tvChart]',
	exportAs: 'tvChart',
})
export class TradingViewChartDirective {
	@Output() onloaded = new EventEmitter<any>();
	
	$el: any;
	objTableau: any;
	chartSymbol: string;

	constructor(
		private el: ElementRef,
	) {
		this.$el = $(this.el.nativeElement);
	}
	
	@Input() set tvChart(args: any) {

		let chartSymbol = _.get(args, 'instrument.chartSumbol');
		if (chartSymbol != this.chartSymbol) {
			this.chartSymbol = chartSymbol;

			this.$el.html("");
			this.onloaded.emit(null);
			let that = this;
			let targetId = "tvChart_" + new Date().valueOf();
			let target = $("<span id='" + targetId + "'></span>").appendTo(this.$el);
			new window["TradingView"].widget({
				"symbol": chartSymbol,
				"container_id": targetId,
				"autosize": true,
				"interval": "60",
				"timezone": "Etc/UTC",
				"theme": "Dark",
				"style": "1",
				"locale": "en",
				"toolbar_bg": "rgba(19, 23, 34, 1)",//"rgba(55, 61, 73, 1)",
				"enable_publishing": false,
				"hide_side_toolbar": true,
				"allow_symbol_change": true
			});
		}
	}

}
