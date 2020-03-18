import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild } from '@angular/core';
import { formatNumber } from '@angular/common';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import * as _ from 'lodash';

import { ExchangeService } from '../../_services/exchange.service';
import { DataService } from '../../_services/data.service';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {
	@BlockUI() blockUI: NgBlockUI;
	@Input() options: any;
	@Output() onAction = new EventEmitter<any>();


    constructor(
        public dataService: DataService,
		public exService: ExchangeService
	) {

	}

	ngOnInit() {

	}

	sendAction() {
		this.onAction.emit({ type: 'sampleAction', data: 123 });
	}

	resetMessage() {
		this.options.newOrder = {
			"orderType": this.options.newOrder.orderType,
			"isClosePositionOrder": true
		};
	}

	placeOrder(side, form) {
		if (form.valid) {
			this.blockUI.start();
			let order = this.options.newOrder;
			order.side = side;
			this.exService.placeOrder(this.options.newOrder).then(response => {
				this.blockUI.stop();
				let price = order.orderType == 'Market' ? 'Market Price' : formatNumber(order.price, 'en', '1.2-2')
				this.exService.addInfoStack({ 'message': `Order Accepted: ${side} ${formatNumber(order.quantity, 'en', '1.2-2')} Contracts of ${this.exService.instrument.name} at ${price}.` });
			}).catch(err => {
				this.blockUI.stop();
			});
		}
	}

	getOrderValue() {
		let quantity = this.options.newOrder.quantity;
		let price = this.options.newOrder.orderType == 'Limit' ? this.options.newOrder.price : this.getMarketRate();
		if (isNaN(quantity) || isNaN(price)) return ' -- ';
		return formatNumber(quantity * price,'en','1.2-2');
	}

	getAvailableBalance() {
		return 1500000;
	}

	getMarketRate() {
		return this.exService.instrument.marketRate;
	}

}
