import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, Inject, ViewChild } from '@angular/core';
import { Observable, Subject, Subscription, from } from 'rxjs';

import * as _ from 'lodash';
declare const $: any;

import { ExchangeService } from '../../_services/exchange.service';

@Component({
	selector: 'app-order-book',
	templateUrl: './order-book.component.html',
	styleUrls: ['./order-book.component.scss']
})
export class OrderBookComponent implements OnInit {
	@Input() options: any;
	@Output() onAction = new EventEmitter<any>();

	private orderBookSubscription: Subscription = null;

	buyTotal: number = 0;
	selTotal: number = 0;
    scrolled = false;

	constructor(
		public exService: ExchangeService
	) { }



	ngOnInit() {
		this.fixTotals();
		this.orderBookSubscription = this.exService.orderBookChanged$.subscribe((message: any) => {
            this.updateScroll();
			this.fixTotals();
			if (message) {
				window.setTimeout(() => {
					let hRow = $("#ob-row-" + message.id);
					let cclass = message.action == 'Add' ? 'flash-row' : 'flash-quantity';
					hRow.addClass(cclass);
					window.setTimeout(() => {
						hRow.removeClass(cclass);
						this.updateScroll();
					}, 3000);
					this.updateScroll();
				});
			}
        });

        let that = this;

		$("#order-book-lctop-scroll").on('scroll', function () {
            that.scrolled = true;
        });

	}


    updateScroll() {
        //if (!this.scrolled) {
		var element = document.getElementById("order-book-lctop-scroll");
		element.scrollTop = element.scrollHeight;
        //}
    }

	ngOnDestroy() {
		this.orderBookSubscription.unsubscribe();
	}

	fixTotals() {
		this.buyTotal = 0;
		this.selTotal = 0;

        var buyMax = 0, sellMax = 0;

		_.each(this.exService.orderBook, order => {
            if (order.side == 'Buy') {
                this.buyTotal += order.quantity;
                buyMax = Math.max(buyMax, order.quantity);
            } else {
                this.selTotal += order.quantity;
                sellMax = Math.max(sellMax, order.quantity);
            }
		})
		_.each(this.exService.orderBook, order => {
            if (order.side == 'Buy') {
                order.bar = order.quantity / this.buyTotal * 100;
                order.barQ = order.quantity / buyMax * 100;
            } else {
                order.bar = order.quantity / this.selTotal * 100;
                order.barQ = order.quantity / sellMax * 100;
            }
		})
	}

	injectOrder(row) {
		this.onAction.emit(row);	
	}


}
