import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
	selector: 'app-img-preview-dialog',
	templateUrl: './img-preview-dialog.component.html',
	styleUrls: ['./img-preview-dialog.component.scss']
})
export class ImgPreviewDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<ImgPreviewDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {

	}

	ngOnInit() {
	}

}
