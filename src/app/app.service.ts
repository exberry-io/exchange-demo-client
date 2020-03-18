
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';


import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { MatSidenav } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';

import { environment } from '../environments/environment';

import { appStrings } from './core/translations';
import * as _ from 'lodash';

@Injectable()
export class AppService {

  appConfig = environment.appConfig;


  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private router: Router,
    private httpClient: HttpClient

  ) {
    let local = this.appConfig.locale;
  }

  public logout() {
    top.location.replace("/logout");
  }

  public translate(path: string): string {
    const tokens = path.split('.');
    let translation: any = appStrings[this.appConfig.locale];
    for (let i = 0; i < tokens.length; i++) {
      translation = translation[tokens[i]];
      if (!translation) return path;
    }
    return translation;
  }

  public base(path: string): string {
    this.appConfig.host = this.appConfig.host.replace(/\/$/, '') + '/';
    path = path.replace(/^\//, '');
    return this.appConfig.host + path;
  }

  public confirm(args?) {
    return this.genereicDialog(_.assignIn({ mode: 'confirm' }, args));
  }
  public alert(args?) {
    return this.genereicDialog(_.assignIn({ mode: 'alert' }, args));
  }
  public prompt(args?) {
    return this.genereicDialog(_.assignIn({ mode: 'prompt', width: "400px", title: 'Please enter value', content: null, label: 'Please enter value' }, args));
  }

  public genereicDialog(args?) {
    let that = this;
    let base = _.assignIn({ mode: 'confirm', width: "300px", cancelText: 'Cancel', confirmText: 'OK', title: 'Please Confirm', content: 'Are You Sure?' }, args);
    return new Promise((resolve, reject) => {
      let dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: base.width,
        data: base
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve(result);
        } else {
          //reject();
        }
      });
    });
  }


  public toastr(message, args?) {
    let base = _.assignIn({ duration: 2000, message: message, action: null }, args);
    this.snackBar.open(base.message, base.action, {
      duration: base.duration,
      panelClass: base.panelClass
    });
  }

}
