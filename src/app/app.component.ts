import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSidenav, MatIconRegistry } from '@angular/material';
import { Router } from '@angular/router';

import { AppService } from './app.service';
import { DataService } from './_services/data.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: {
        '[class.cordova]':'cordova'
    }
})
export class AppComponent implements OnInit {
    title:string = 'tla';
    direction:string = 'ltr';
    cordova:string = '';

    @ViewChild('appSidenav') public appSidenav: MatSidenav;

    constructor(
		private appService: AppService,
		private dataService: DataService,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private router: Router,
        @Inject(PLATFORM_ID) private _platformId: Object
    ) {
        isPlatformBrowser(this._platformId);
		iconRegistry.addSvgIcon('ex-bell', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bell.svg'));
		iconRegistry.addSvgIcon('ex-cog', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/cog.svg'));
    }

    loading = true;
    ngOnInit() {
        let that = this;
		// Check Session
		this.dataService.restoreSignIn().then(response => {
			this.dataService.getMetaData().then(response => {
				that.loading = false;
			}).catch(err => {
				this.appService.alert({ content: "Error loading meta data!" }).then(o => {
					document.location.reload();
				})
			});
            
			//that.router.navigate(['/hub']);
        })
    }

}
