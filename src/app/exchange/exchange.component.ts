import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { DataService } from '../_services/data.service';
import { ExchangeService } from '../_services/exchange.service';

import * as _ from 'lodash';
declare const $: any;

@Component({
	selector: 'app-exchange',
	templateUrl: './exchange.component.html',
	styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements OnInit, OnDestroy {
	@BlockUI() blockUI: NgBlockUI;

	private marketRateSubscription: Subscription = null;
    private infoStackSubscription: Subscription = null;

	layoutId: string = 'defaultLayout';
	instrument: any = {};
	user: any;

	sideNav: any = {
        mode: 'over'//'side'
		//hasBackdrop: true
	}

    exchangeOptions: any = {
        taHeight: 20,
        taHeightDiff: 80,

        tablesCollapsed: false,
		newOrder: {
			"orderType": "Limit",
			"isClosePositionOrder": true,
			"quantity": 1
		}
	}

	narrowColWidth: number;
	widerColWidth: number;
	wideColWidth: number;

	constructor(
		public dataService: DataService,
		public exService: ExchangeService
	) {
		this.instrument = this.dataService.meta.currentInstrument;
		this.user = this.dataService.user;
        this.claculatePanelSizes();		
	}

    claculatePanelSizes() {
        this.narrowColWidth = Math.ceil(270 / ($(window).outerWidth() -24) * 100);
        this.widerColWidth = Math.ceil(320 / $(window).outerWidth() * 100);
        this.wideColWidth = 100 - (2 * this.narrowColWidth);
        this.exchangeOptions.taHeight = (209 / ($(window).outerHeight() - 90) * 100);
        this.exchangeOptions.taHeightDiff = 100 - this.exchangeOptions.taHeight;
    }

	ngOnInit() {
		this.initInstrument(this.instrument, this.user);

		this.marketRateSubscription = this.exService.marketRateChanged$.subscribe((instrument: any) => {
			if (!this.exchangeOptions.newOrder.price && instrument.marketRate) {
				this.exchangeOptions.newOrder.price = instrument.marketRate;
			}
        });
        
        this.infoStackSubscription = this.exService.infoStackChanged$.subscribe((message: any) => {
            let obj = $("#dvInfoCounter > span");
            if (obj.hasClass('pulse')) return;
            obj.addClass("pulse");
            window.setTimeout(() => {
                obj.removeClass("pulse");
            }, 1000);
        });
	}

	ngOnDestroy() {
        this.marketRateSubscription.unsubscribe();
        this.infoStackSubscription.unsubscribe();
	}

	selectInstrument(instrument) {
		if (instrument == this.instrument) return;
		this.instrument = instrument;
		delete this.exchangeOptions.newOrder.price;
		this.exchangeOptions.newOrder.quantity = 1;
		this.initInstrument(this.instrument);
	}

	initInstrument(instrument?, user?) {
		
		this.exService.start(instrument, user).then(() => {
			//this.blockUI.stop();
		})
	}

	//-------------------------------------------------------------->
	//component events
	//-------------------------------------------------------------->


	onOrderBookAction(action) {
		_.assignIn(this.exchangeOptions.newOrder, { orderType: "Limit", price: action.price, quantity: Math.abs(action.quantity) });
	}

	onPlaceOrderAction(action?) {

	}

	onTablesAction(action?) {

	}

	//-------------------------------------------------------------->
	//ui
	//-------------------------------------------------------------->

	gutterSize: number = 5;
	dragStart(ev) {
        $(".tv-Chart-container").addClass("_dragging");
	}
	dragEnd() {
        $(".tv-Chart-container").removeClass("_dragging");
        let isBigger = $('app-order-tables').height() > 50;
        if (isBigger) {
            if (this.exchangeOptions.tablesCollapsed) this.exchangeOptions.tablesCollapsed = false;
        } else {
            if (!this.exchangeOptions.tablesCollapsed) this.exchangeOptions.tablesCollapsed = true;
        }
	}

}
