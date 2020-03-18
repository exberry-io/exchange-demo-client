import { Component, OnInit, Input, Output } from '@angular/core';

import * as _ from 'lodash';

import { DataService } from '../../_services/data.service';
import { ExchangeService } from '../../_services/exchange.service';

@Component({
	selector: 'app-exchange-simulator',
	templateUrl: './exchange-simulator.component.html',
	styleUrls: ['./exchange-simulator.component.scss']
})
export class ExchangeSimulatorComponent implements OnInit {
	@Input() sideNav: any;

	constructor(
		public dataService: DataService,
		public exService: ExchangeService
	) { }

	ngOnInit() {
	}

	newOrder: any = {
		"userId": "100",
		"orderType": "Limit",
		"side": "Sell",
		"quantity": 123,
		"price": 100,
		"timeInForce": "GTD",
		"offsetMinutes": 5
	};

	iOrderTypeChange() {
		let orderType = this.newOrder.orderType;
		let TIF = this.newOrder.timeInForce;
		if (orderType == 'Limit') {
			if (TIF == 'FOK' || TIF == 'IOC') {
				this.newOrder.timeInForce = 'GTD';
			}
		} else {
			if (TIF == 'GTC' || TIF == 'GTD') {
				this.newOrder.timeInForce = 'IOC';
			}
		}
	}

	iOrderTimeForceChange() {

	}

	placeOrder(form) {
		if (form.valid) {
			this.exService.placeOrder(this.newOrder).catch(err => { });
		}
	}

	selectUser(user) {
		this.dataService.user = user;
		this.exService.start(null, user);
	}

    sim1: any = { minStepSize:0.5};
    

    simOrder: any = {
        "userId": "1",
        "orderType": "Limit",
        "side": "Sell"
    };

    doOrderbookInitialization() {
        //Enter a market order for 1,000,000 for sell
        let n = 0;
        this.sendSimOrder({ orderType: 'Market', side: 'Sell', quantity: 1000000 }, 0);
        //Enter a market order for 1, 000, 000 for buy
        this.sendSimOrder({ orderType: 'Market', side: 'Buy', quantity: 1000000 }, ++n);

        let price = this.sim1.startingPrice;
        let maxQ = this.sim1.obMaxPriceQuantity;
        let minStepSize = this.sim1.minStepSize;

        for (let i = 0; i < this.sim1.obDepth; i++) {
            let diff = (i + 1) * minStepSize;
            let q = Math.ceil(Math.random() * maxQ);
            this.sendSimOrder({ orderType: 'Limit', side: 'Sell', quantity: q, price: price + diff }, ++n);
            q = Math.ceil(Math.random() * maxQ);
            this.sendSimOrder({ orderType: 'Limit', side: 'Buy', quantity: q, price: price - diff }, ++n);
        }
    }

    sim2: any = { groupPairsCount: 4, maxStepIncrease: 6, minStepSize: 0.5, minQuantity: 50, maxQuantity: 4000, ordersTimeInterval:400};
    sim2Config: any = {}

    tradingSimulation_fire() {
        let config = this.sim2Config;
        let order = config.orders[config.index];
        if (!order) {
            if (this.sim2.started) {
                this.toggleTradingSimulation();
            }
            this.toggleTradingSimulation(this.sim2Config.prevPrice);
            return;
        }
        this.sendSimOrder(order, 0);

        ++config.index;
        let that = this;
        config.timeout = window.setTimeout(o => {
            that.tradingSimulation_fire();
        }, this.sim2.ordersTimeInterval)
    }

    toggleTradingSimulation(startPrice?) {
        if (this.sim2.started) {
            this.sim2.started = false;
            window.clearTimeout(this.sim2Config.timeout)
            return;
        }

        let that = this;
        this.sim2.started = true;
        let groupPairsCount = this.sim2.groupPairsCount;
        let startingPrice = startPrice || this.sim2.startingPrice;
        let maxStepIncrease = this.sim2.maxStepIncrease;
        let minStepSize = this.sim2.minStepSize;
        let minQuantity = this.sim2.minQuantity;
        let maxQuantity = this.sim2.maxQuantity;
        let qDiff = maxQuantity - minQuantity;
        

        let groupMajoritySide = Math.random() > 0.5 ? 'Buy' : 'Sell';
        let randomGroup = Math.floor(Math.random() * groupPairsCount);

        let orders = [];

        let prevPrice = startingPrice;
        for (let i = 0; i < groupPairsCount; i++) {
            let side = groupMajoritySide;
            let priceOffsetFactor = 1;
            if (i == randomGroup) {
                side = side == 'Buy' ? 'Sell' : 'Buy';
                priceOffsetFactor = Math.ceil(Math.random() * maxStepIncrease);
            }
            let newPrice = prevPrice;
            if (side == 'Buy') {
                newPrice += minStepSize * priceOffsetFactor;
            } else {
                newPrice -= minStepSize * priceOffsetFactor;
            }

            toggleTradingSimulation_order(i, side, newPrice);
            toggleTradingSimulation_order(i, side, newPrice);

            prevPrice = newPrice;
        }

        function toggleTradingSimulation_order(index, side, price) {            
            let q = minQuantity + Math.ceil(Math.random() * qDiff);
            if (index != randomGroup) {
                q = Math.ceil(q / 2);
            }
            orders.push(_.assignIn({}, that.simOrder, { orderType: 'Limit', side: side, quantity: q, price: price }));
        }                

        this.sim2Config = {
            orders: orders,
            index: 0,
            count: orders.length,
            prevPrice: prevPrice
        }
        this.tradingSimulation_fire();


    }

    sendSimOrder(order, delay?) {
        if (!delay) delay = 0;
        window.setTimeout(o => {
            this.exService.placeOrder(
                _.assignIn({}, this.simOrder, order)
			).catch(err => { });
        }, delay);
    }


}
