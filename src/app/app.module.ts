import {
	BrowserModule, DomSanitizer
 } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockUIModule } from 'ng-block-ui';


import { TranslatePipe, SafeHTMLPipe, SafeStylePipe, SafeURLPipe, FilterPipe, ReverseOrderPipe, InstrumentDecimalPipe } from './core/pipes';
import { NgxInitDirective, NgxCollapseDirective } from './core/directives';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';

import { DialogsService } from './dialogs/dialogs.service';
import { AppService } from './app.service';


import { DataService } from './_services/data.service';
import { ExchangeService } from './_services/exchange.service';

import { TradingViewChartDirective } from './directives/trading-view-chart.directive';


import { ImgPreviewDialogComponent } from './dialogs/img-preview-dialog/img-preview-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { OrderBookComponent } from './exchange/order-book/order-book.component';
import { PlaceOrderComponent } from './exchange/place-order/place-order.component';
import { OrderTablesComponent } from './exchange/order-tables/order-tables.component';
import { ExchangeSimulatorComponent } from './exchange/exchange-simulator/exchange-simulator.component';



@NgModule({
	declarations: [
		TranslatePipe,
		SafeHTMLPipe,
		SafeStylePipe,
		SafeURLPipe,
		FilterPipe,
		ReverseOrderPipe,
		InstrumentDecimalPipe,

		NgxInitDirective,
		NgxCollapseDirective,

		TradingViewChartDirective,

		AppComponent,
		ImgPreviewDialogComponent,
		ConfirmDialogComponent,
		ExchangeComponent,
		OrderBookComponent,
		PlaceOrderComponent,
		OrderTablesComponent,
		ExchangeSimulatorComponent,
	],
	imports: [
		BlockUIModule.forRoot(),
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		AppRoutingModule,

		CoreModule,
		HttpClientModule
	],
	providers: [
		AppService,
		DialogsService,
		DataService,
		ExchangeService,
	],
	entryComponents: [
		ConfirmDialogComponent,
		ImgPreviewDialogComponent,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
