import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { ToastrManager } from 'ng6-toastr-notifications';

import { AppService } from '../app.service';
import { DataService } from './data.service';

import * as _ from 'lodash';

const WS_URL = 'wss://master-ws.genesis.om2.com//';


@Injectable({
	providedIn: 'root'
})
export class ExchangeServiceOld {
	WS: WebSocket;

	logSentRequests: boolean = false;
	logReceivedMessages: boolean = false;
	logReconnections: boolean = true;
	logErrors: boolean = true;

	user: any = { "userId": "100", "currency": "EUR", "ipAddress": "127.0.0.1" }
	userId: any = "100";

	instrument: any = {};
	instrumentInstanceId: string = 'E79AC63A3ADF5ABD5655';

	started: boolean = false;
	starting: boolean = false;

	callbacks: any = {};
	currentCallbackId: number = 0;



	symbols: any = [];

	private marketRateChangedSource = new Subject<void>();
	public marketRateChanged$ = this.marketRateChangedSource.asObservable();

	private orderBookChangedSource = new Subject<void>();
	public orderBookChanged$ = this.orderBookChangedSource.asObservable();
	orderBook: any = [];

	private orderFillsChangedSource = new Subject<void>();
	public orderFillsChanged$ = this.orderFillsChangedSource.asObservable();
	orderFills: any = [];

	private positionsChangedSource = new Subject<void>();
	public positionsChanged$ = this.positionsChangedSource.asObservable();
	positions: any = [];

	private userOrdersChangedSource = new Subject<void>();
	public userOrdersChanged$ = this.userOrdersChangedSource.asObservable();
	userOrders: any = [];

	private infoStackChangedSource = new Subject<void>();
	public infoStackChanged$ = this.userOrdersChangedSource.asObservable();
	infoStack: any = [];

	public messages: Subject<{}>;

	constructor(
		public appService: AppService,
		public dataService: DataService,
		public toastr: ToastrManager
	) {

	}

	public start(instrument?, user?) {
		if (instrument) {
			this.instrument = instrument;
			this.instrumentInstanceId = instrument.key;
		}
		if (!this.instrument.marketRate) this.instrument.marketRate = 0;
		if (user) {
			this.user = user;
			this.userId = user.userId;
		}

		this.resetStorage();

		this.started = false;
		this.starting = true;

		this.initSocket();
	}

	public stop() {
		this.started = false;
		this.starting = false;
		this.resetStorage();
		if (this.WS) this.WS.close(1000);
	}

	private resetStorage() {
		this.callbacks = {};
		this.currentCallbackId = 10;

		this.symbols = [];
		this.orderBook = [];
		this.orderFills = [];
		this.positions = [];
		this.userOrders = [];
	}


	public placeOrder(_order) {
		let order = _.cloneDeep(_order);
		if (order.orderType == 'market') delete order.price;
		if (!order.userId) order.userId = this.userId;
		if (!order.sourceIpAddress) order.sourceIpAddress = this.user.ipAddress;
		if (!order.instanceId) order.instanceId = this.instrumentInstanceId;
		let request = {
			"q": "/om2.exchange.orders/placeOrder", "d": order
		}
		//console.log(JSON.stringify(request));
		return new Promise((resolve, reject) => {
			this.sendRequest(request, 'placeOrder', { resolve: resolve, reject: reject });
		});
	}

	public cancelOrder(order) {
		if (!order.userId) order.userId = this.userId;

		if (order.status != 'Cancelled' && order.remainingQuantity > 0) {
			let request = {
				"q": "/om2.exchange.orders/cancelOrder", "d": {
					orderId: order.orderId,
					userId: this.userId
				}
			}
			return new Promise((resolve, reject) => {
				this.sendRequest(request, 'cancelOrder', { resolve: resolve, reject: reject });
			});
		}
		let messageIndex = _.findIndex(this.userOrders, { orderId: order.orderId });
		if (messageIndex != -1) this.userOrders.splice(messageIndex, 1);
		this.userOrdersChangedSource.next(order);
		return Promise.resolve(order);
	}

	private processOrderBookEvent(message) {
		if (message.instrumentInstanceId != this.instrumentInstanceId) return;
		let messageIndex = _.findIndex(this.orderBook, { id: message.id });

		if (message.action == 'Delete') {
			if (messageIndex != -1) this.orderBook.splice(messageIndex, 1);
		} else if (messageIndex == -1) {
			this.orderBook.push(message);
		} else {
			let reffMessage = this.orderBook[messageIndex];
			if (this.isSameMessage(message, this.orderBook[messageIndex], ['quantity', 'side', 'price'])) {
				return;
			}
			this.orderBook[messageIndex] = message;
		}
		this.orderBook = _.orderBy(this.orderBook, ['price', 'asc']);
		this.orderBookChangedSource.next(message);
	}

	private processMarketRateEvent(message) {
		let marketRate = !isNaN(message.marketRate) ? _.round(message.marketRate, 5) == 0 ? 0 : message.marketRate : 0;
		let instrument = this.instrument;
		if (!instrument.wasFirstChange) instrument.wasFirstChange = true;
		else if (!message.trendValue) {
			let instrumentRate = instrument.marketRate;
			let trendValue = ((marketRate / instrumentRate) - 1) * 100;
			instrument.trendValue = _.round(trendValue, 2);
		}
		instrument.marketRate = marketRate;
		this.marketRateChangedSource.next(instrument);
	}

	private processOrderFillEvent(message) {
		if (message.instrumentInstanceId != this.instrumentInstanceId) return;
		let messageIndex = _.findIndex(this.orderFills, { fillOrderId: message.fillOrderId });
		if (message.action == 'Delete') {
			if (messageIndex != -1) this.orderFills.splice(messageIndex, 1);
		} else if (messageIndex == -1) {
			this.orderFills.push(message);
		} else {
			this.orderFills[messageIndex] = message;
		}
		this.orderFillsChangedSource.next(message);
	}

	private processPositionEvent(message) {
		if (message.instrumentInstanceId != this.instrumentInstanceId) return;
		let messageIndex = _.findIndex(this.positions, { positionId: message.positionId });
		if (message.action == 'Delete') {
			if (messageIndex != -1) this.positions.splice(messageIndex, 1);
		} else if (messageIndex == -1) {
			this.positions.push(message);
		} else {
			this.positions[messageIndex] = message;
		}
		this.positionsChangedSource.next(message);
	}

	private processUserOrderEvent(message) {
		if (message.instrumentInstanceId != this.instrumentInstanceId) return;
		let messageIndex = _.findIndex(this.userOrders, { orderId: message.orderId });

		let actionMap: any = {
			"Accepted": "Accepted",
			"Validated": "Validated",
			"New": "Submitted",
			"PartiallyFilled": "Partially Filled",
			"Filled": "Filled",
			"Cancelled": "Cancelled",
			"Rejected": "Rejected"
		}

		let tMessage = '';
		if (message.side == 'buy') {
			tMessage = `Order ${actionMap[message.status]}: Buy ${message.quantity} Contracts of ${message.instrumentName} at ${message.price}.`;
		} else {
			tMessage = `Order ${actionMap[message.status]}: ${message.quantity} Contracts of ${message.instrumentName} sold at  ${message.price}.`;
		}

		switch (message.status) {
			case "Filled":
				tMessage += " The order was fully filled.";
				break;
			case "Cancelled":
				//if (message.side == 'sell') {
				//    tMessage = `Order ${actionMap[message.status]}: ${message.quantity} Contracts of ${message.instrumentName} sell at  ${message.price}.`;
				//}
				break;
			case "PartiallyFilled":
				if (message.side == 'buy') {
					tMessage = `Order ${actionMap[message.status]}: Buy ${message.filledQuantity} Contracts of ${message.instrumentName} at ${message.price}.`;
				} else {
					tMessage = `Order ${actionMap[message.status]}: ${message.filledQuantity} Contracts of ${message.instrumentName} sold at  ${message.price}.`;
				}
				tMessage += ` ${message.remainingQuantity} contracts remain in the order.`
				break;
		}
		this.addInfoStack({ side: message.side, message: tMessage, timestamp: message.timestamp });

		if (message.action == 'Delete') {
			if (messageIndex != -1) this.userOrders.splice(messageIndex, 1);
		} else if (messageIndex == -1) {
			if (message.status != 'Rejected') {
				this.userOrders.push(message);
			}
		} else {
			if (message.status != 'Rejected') {
				this.userOrders.splice(messageIndex, 1);
			} else {
				this.userOrders[messageIndex] = message;
			}
		}
		this.userOrdersChangedSource.next(message);
	}

	private processPlacedOrder(message) {
		let status = _.get(message, 'd.orderStatus');
		let isRejected = false;
		switch (status) {
			case "Rejected":
				isRejected = true;
				//this.appService.toastr('Order Rejected', { panelClass: 'error-snackbar', duration:3000});
				break;
			default:
				//if (status) this.appService.toastr('Order ' + status, { panelClass: 'success-snackbar', duration: 3000 });
				//else debugger;
				break;
		}
		this.handleMessageCallBack(message, isRejected);
	}


	private handleSocketResponse(message) {
		if (!message) return;


		if (_.get(message.d, 'errorCode', null)) {
			this.handleMessageError(message);
			return;
		}

		this.log('Received Message', message);

		switch (message.q) {
			case '/om2.exchange.trade/marketRateEvents':
				this.processMarketRateEvent(message.d)
				break;
			case '/om2.exchange.marketdata/orderBookEvents':
				this.processOrderBookEvent(message.d);
				break;
			case '/om2.exchange.userTrade/orderFilledEvents':
				this.processOrderFillEvent(message.d);
				break;
			case '/om2.exchange.userTrade/positionEvents':
				this.processPositionEvent(message.d);
				break;
			case '/om2.exchange.orders/userOrderEvents':
				this.processUserOrderEvent(message.d);
				break;
			case '/om2.exchange.orders/placeOrder':
				this.processPlacedOrder(message);
				break;
			case '/om2.exchange.orders/cancelOrder':
				this.toastr.successToastr('Order Cancelled Successfully', null, { showCloseButton: true });
				this.handleMessageCallBack(message);
				break;
			case '/io.scalecube.services.error/500':

				break;
			default:
				if (message.d) {
					this.handleMessageCallBack(message);
				} else {

				}
		}
	}

	private handleMessageError(message) {
		this.log('Error', message, 'error');
		let messageText = _.get(message.d, 'errorMessage', 'Unknown Error');
		this.handleMessageCallBack(message, true);
		this.toastr.warningToastr(messageText, null, { showCloseButton: true });
	}

	private handleMessageCallBack(message, isRejected?) {
		let qMeesage = this.callbacks[message.sid];
		if (qMeesage) {
			if (qMeesage.callBack) {
				if (isRejected) qMeesage.callBack.reject(message);
				else qMeesage.callBack.resolve(message);
			}
			this.callbacks[message.sid] = null;
		}
	}

	private isSameMessage(message1, message2, props) {
		let isSame = true;
		_.each(props, prop => {
			if (message1[prop] != message2[prop]) {
				isSame = false;
				return false;
			}
		});
		return isSame;
	}


	private initSocket() {
		let that = this;
		_.each(this.callbacks, (callBack) => {
			try {
				if (callBack.callBack) callBack.callBack.reject();
			} catch (e) { }
		})
		this.callbacks = {};
		this.currentCallbackId = 10;
		if (this.WS) this.WS.close(1000);

		this.WS = new WebSocket(_.get(this.dataService, 'meta.wsEndPoint', WS_URL));
		this.WS.onopen = (res) => {
			console.log('on open', res);
			this.started = true;
			that.initRequests();
		};
		this.WS.onclose = (res) => {
			if (res.code == 1000) return;
			if (res.code == 1006) {
				this.log('Reconnect', res, 'warn');
				that.WS = null;
				that.initSocket();
			} else {
				this.log('Reconnect', res, 'error');
			}
		};
		this.WS.onerror = (res) => {
			this.log('WS Error', res, 'error');
		};
		this.WS.onmessage = (res) => {
			that.handleSocketResponse(res && JSON.parse(res.data));
		};
	}

	private initRequests() {
		//marketRates
		this.sendRequest({
			"q": "/om2.exchange.trade/marketRateEvents", "sid": 1, "d": {
				"instrumentInstanceId": this.instrumentInstanceId
			}
		});
		//get fills
		this.sendRequest({
			"q": "/om2.exchange.userTrade/orderFilledEvents", "sid": 2, "d": {
				"userId": this.userId, "numberOfReturnedFillsOnSubscription": 20
			}
		});
		//get order books
		this.sendRequest({
			"q": "/om2.exchange.marketdata/orderBookEvents", "sid": 3, "d": {
				"instanceId": this.instrumentInstanceId
			}
		});
		//get positions
		this.sendRequest({
			"q": "/om2.exchange.userTrade/positionEvents", "sid": 4, "d": {
				"userId": this.userId
			}
		});
		//get orders
		this.sendRequest({
			"q": "/om2.exchange.orders/userOrderEvents", "sid": 5, "d": {
				"userId": this.userId
			}
		});
	}

	public sendRequest(request, requsestType?, callBack?) {
		if (!request.sid) {
			let callbackId = ++this.currentCallbackId;
			request.sid = callbackId;
		}
		this.callbacks[request.sid] = {
			time: new Date(),
			type: requsestType,
			callBack: callBack
		};
		this.log('Sent Request', request);
		this.WS.send(JSON.stringify(request));
	}

	public addInfoStack(message) {
		this.infoStack.unshift(message);
		if (this.infoStack.length == 51) {
			this.infoStack.splice(-1, 1)
		}
		this.infoStackChangedSource.next(message);
		this.toastr.successToastr(message.message, null, { showCloseButton: true });
	}

	private log(topic, data, type?) {
		if (!type) type = "log";
		switch (topic) {
			case "Sent Request": if (!this.logSentRequests) return; break;
			case "Received Message": if (!this.logReceivedMessages) return; break;
			case "Reconnect": if (!this.logReconnections) return; break;
			case "Error": if (!this.logErrors) return; break;
		}
		switch (type) {
			case "warn": console.warn(topic, data); break;
			case "error": console.error(topic, data); break;
			default: console.log(topic, data);
		}
	}




}
