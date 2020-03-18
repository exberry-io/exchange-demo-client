import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, Inject, ViewChild } from '@angular/core';
import { Observable, Subject, Subscription, from } from 'rxjs';
import { MatTable } from '@angular/material';

import * as _ from 'lodash';
declare const $: any;

import { ExchangeService } from '../../_services/exchange.service';

@Component({
  selector: 'app-order-tables',
  templateUrl: './order-tables.component.html',
  styleUrls: ['./order-tables.component.scss']
})
export class OrderTablesComponent implements OnInit, OnDestroy {

	@Input() options: any;
	@Output() onAction = new EventEmitter<any>();
	@ViewChild('exchangeTable') exchangeTable: MatTable<Element>;
	loading: boolean = true;

	private activeOrdersSubscription: Subscription = null;
	activeOrders = [];

	private executedOrdersSubscription: Subscription = null;
	executedOrders = [];

	tables: any = [
		{ id: "activeOrders", name: "Active Orders", displayedColumns: ['instrument', 'side', 'quantity', 'price', 'orderId', 'brokerId', 'spacer'] },
		{ id: "executedOrders", name: "Executed Orders", displayedColumns: ['instrument', 'makerOrderId', 'takerOrderId', 'executedPrice', 'executedQuantity','eventTimestamp'] },
	];
	tablesMap: any;
	selectedTable: any = this.tables[0];

	defaultSelectedRow;
	defaultColoms = ['data'];
	
	constructor(
		public exService: ExchangeService
	) {
		this.tablesMap = _.keyBy(this.tables, 'id');
		if (!this.selectedTable) this.selectedTable = this.tables[0];

	}

	ngOnInit() {
		this.activeOrders = this.exService.activeOrders;
		this.activeOrdersSubscription = this.exService.activeOrdersChanged$.subscribe(() => {
			this.activeOrders = this.exService.activeOrders;
			if (this.selectedTable.id == 'activeOrders') this.exchangeTable.renderRows();
		});

		this.executedOrders = this.exService.executedOrders;
		this.executedOrdersSubscription = this.exService.executedOrdersChanged$.subscribe(() => {
			this.executedOrders = this.exService.executedOrders;
			if (this.selectedTable.id == 'executedOrders') this.exchangeTable.renderRows();
		});
	}

	ngOnDestroy() {
		this.executedOrdersSubscription.unsubscribe();
		this.activeOrdersSubscription.unsubscribe();
	}

    selectTable(tab) {
        if (this.options.tablesCollapsed) this.togglePanelHeight();
		this.selectedTable = tab;
	}

	sortActiveOrders(ev) {
		this.exService.sortActiveOrders(ev);
		this.exchangeTable.renderRows();
	}
	sortExecutedOrders(ev) {
		this.exService.sortExecutedOrders(ev);
		this.exchangeTable.renderRows();
	}

	closePosition(position) {
		if (position.loading) return;
		position.loading = true;

		let order = {
			orderType: "Limit",
			isClosePositionOrder: true,
			quantity: position.quantity,
			price: position.markPrice,
			side: position.side == 'Buy' ? 'Sell' : 'Buy'
		}

		this.exService.placeOrder(order).then(response => {
			position.loading = false;
		}).catch(err => {
			position.loading = false;
		});
	}


	cancelOrder(order) {
		if (order.closing) return;
		order.closing = true;

		this.exService.cancelOrder(order).then(response => {
			order.closing = false;
		}).catch(err => {
			order.closing = false;
		});
	}

	sendAction() {
		this.onAction.emit({ type: 'sampleAction', data: 123 });
	}

    togglePanelHeight() {
        if (this.options.tablesCollapsed) {
            this.options.tablesCollapsed = false;
            this.options.taHeight = (209 / ($(window).outerHeight() - 90) * 100);
        } else {
            this.options.tablesCollapsed = true;
            this.options.taHeight = (40 / ($(window).outerHeight() - 90) * 100);
        }

        this.options.taHeightDiff = 100 - this.options.taHeight;
        this.onAction.emit({});
    }

}

