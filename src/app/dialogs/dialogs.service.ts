import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, DialogPosition } from '@angular/material';

import { ImgPreviewDialogComponent } from './img-preview-dialog/img-preview-dialog.component';



@Injectable({
	providedIn: 'root'
})

export class DialogsService {
	public report: any = {};

	constructor(
		private http: HttpClient,
		public dialog: MatDialog,
	) { }


	/*
	public showFindingDialog(args): Promise<any> {
		let that = this;
		return new Promise((resolve, reject) => {
			let dialogPosition: DialogPosition = {top: "0px", left:"40%"};
			let dialogRef = this.dialog.open(ReportFindingDialogComponent, {
				panelClass: 'finding-dialog',
				position: dialogPosition,
				width: "60vw",
				height: "100vw",
				data: args
			});
			dialogRef.afterClosed().subscribe(result => {
				resolve(result);
			});
		});
	}
	*/


	public showPreviewDialog(args): Promise<any> {
		let that = this;
		return new Promise((resolve, reject) => {
			let dialogRef = this.dialog.open(ImgPreviewDialogComponent, {
				panelClass: 'full',
				data: args
			});
			dialogRef.afterClosed().subscribe(result => {
				resolve(result);
			});
		});
	}

}

