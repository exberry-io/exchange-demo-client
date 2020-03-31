import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class DataService {

	appConfig = environment.appConfig;
	user: any = {};
	meta: any = {};

	appHttpOptions = {
		headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': '' }),
	};

	constructor(
		private httpClient: HttpClient,
	) {
	}

	//-------------------------------------------------------------->
	//api
	//-------------------------------------------------------------->

	public restoreSignIn(credentials?) {
		return this.getSimulated('account').then(response => {
			this.user = response;
			return this.user;
		});
	}

	metaSimulated: boolean = false;
	public getMetaData() {
		let that = this;
		if (this.metaSimulated) return this.getSimulated('metaData').then(preparMetaData);
		else {
			let payload = {
				"apiKey": "eyJraWQiOiJmMDRlMmExMy01ZWExLTRjNGYtOWRhYi04OTBiODI3ZGI2ZGIiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJPUkctRERFMzBEODQ0NjI2MDE0OTdFN0QiLCJpYXQiOjE1Njc2ODc0MTksInN1YiI6Ik9SRy1EREUzMEQ4NDQ2MjYwMTQ5N0U3RCIsImlzcyI6InNjYWxlY3ViZS5pbyIsImF1ZCI6Ik9SRy1EREUzMEQ4NDQ2MjYwMTQ5N0U3RCIsInJvbGUiOiJNZW1iZXIifQ.FYUBG1_EvdGPT2bqHW0XE20wl2FthointURbCKTvmlZ92gXO2j459LlCUXLD2BdHxw7TqqkFAo3sW-DOiQ7tMLtE84th9h72U3D3RCHzNGP7Xzlna_4zfS4nv7TXiCk5ZgEpqXMPrWpMRruBk0P5Fk5nldauLFWQYdMyeknTjMssR6NkEDWOOIFvIzFgtoS0GbCPd07kRjVnH9GPA6JqvPjKvTuoOnOvCrVoMHkEKmRWFlsNUcS9gqe4-HUyvOwrvbyjPRoseoxU691nQDoYWwJ__5wClw9J84lgCc0H6-dBNLbIm2ycOa8eb-NzNHUumu4uID0oalyLWFSwumBKkw",
				"repository": "ExchangeDemoUI"
			}
			return this.postClean('https://configuration-service-http.genesis.om2.com/configuration/readList', payload).then(preparMetaData);
		}

		function preparMetaData(response) {
			that.meta = _.get(response, '[0].value');
			//if (!that.meta.bidsURL) that.meta.bidsURL = "http://bids.oridemo.com/";
			_.each(that.meta.users, (user, index) => {
				if (!user.balance) user.balance = 150000;
				if (index === 0) that.user = user;
			})

			_.each(that.meta.instruments, (instrument, index) => {
				if (index === 0) that.meta.currentInstrument = instrument;
				instrument.name = instrument.instrumentInstance && instrument.instrumentInstance.name || 'Missing Name';
				instrument.decimals = instrument.instrumentInstance && instrument.instrumentInstance.decimalPrecision || 2;
				instrument.rounding = instrument.instrumentInstance && instrument.instrumentInstance.rounding || "down";
			});
			return response;
		}

	}


	//-------------------------------------------------------------->
	//utils
	//-------------------------------------------------------------->

	public handleHttpError(error: any) {

		if (error && error.url && error.url.indexOf("sso/login") > -1) {
			// user logged out refresh
			window.location.reload();
			return;
		}
		// more cases to handle
		console.error(error);
		return error
	}

	public post(url, payload?, headers?): Promise<any> {
		return this.postClean(this.appConfig.endPoint + url, payload, headers);
	}
	public postClean(url, payload?, headers?): Promise<any> {
		return new Promise((resolve, reject) => {
			this.httpClient.post(url, payload || {}, headers || {})
				.subscribe(
					(results: any) => {
						resolve(results);
					},
					(err) => {
						this.handleHttpError(err);
						reject(err);
					}
				);
		});
	}


	public put(url, payload?, headers?): Promise<any> {
		return new Promise((resolve, reject) => {
			this.httpClient.put(this.appConfig.endPoint + url, payload || {}, headers || {})
				.subscribe(
					(results: any) => {
						resolve(results);
					},
					(err) => {
						this.handleHttpError(err);
						reject(err);
					}
				);
		});
	}

	public get(url, payload?): Promise<any> {
		let that = this;
		return new Promise((resolve, reject) => {
			this.httpClient.get(this.appConfig.endPoint + url, { params: payload })
				.subscribe(
					(results: any) => {
						resolve(results);
					},
					(err) => {
						this.handleHttpError(err);
						reject(err)
					}
				);
		});
	}

	public remove(url, payload?, headers?): Promise<any> {
		return new Promise((resolve, reject) => {

			this.httpClient.delete(this.appConfig.endPoint + url, { params: payload })
				.subscribe(
					(results: any) => {
						resolve(results);
					},
					(err) => {
						this.handleHttpError(err);
						reject(err);
					}
				);
		});
	}

	public getSimulated(what, args?): Promise<any> {
		let sURL = "assets/mock/";
		let resolved = null;
		let delay = 300;

		switch (what) {
			case "general":
				delay = 1000;
				sURL += "any.json"; break;
			case "account": sURL += "account.json"; break;
			case "metaData": sURL += "metaData.json"; break;
			default: sURL += "any.json"; break;
		}

		let that = this;
		return new Promise((resolve, reject) => {
			this.httpClient.get(sURL)
				.subscribe(
					(results: any) => {
						window.setTimeout(function () {
							resolve(resolved || results);
						}, delay);
					},
					(err) => {
						reject(err)
					}
				);
		});
	}


}
