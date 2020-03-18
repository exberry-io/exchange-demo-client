import { NgModule } from '@angular/core';

import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSplitModule } from 'angular-split';
import { ToastrModule } from 'ng6-toastr-notifications';
import {
	MatSidenavModule,
	MatButtonModule,
	MatCheckboxModule,
	MatInputModule,
	MatGridListModule,
	MatIconModule,
	MatStepperModule,
	MatDatepickerModule,
	MatCardModule,
	MatListModule,
	MatToolbarModule,
	MatChipsModule,
	MatSelectModule,
	MatExpansionModule,
	MatSlideToggleModule,
	MatProgressSpinnerModule,
	MatDialogModule,
	MatMenuModule,
	MatSnackBarModule,
	MatRadioModule,
	MatAutocompleteModule,
	MatTabsModule,
	MatPaginatorModule,
	MatBottomSheetModule,
	MatBadgeModule,
	MatTableModule,
	MatSortModule,
	MatRippleModule
} from '@angular/material';



@NgModule({
	imports: [
		NgbModule,
		NgxDnDModule,
        AngularSplitModule,
        ToastrModule.forRoot(),
		BrowserAnimationsModule,
		MatGridListModule,
		MatIconModule,
		MatButtonModule,
		MatCheckboxModule,
		MatInputModule,
		MatStepperModule,
		MatDatepickerModule,
		MatCardModule,
		MatListModule,
		MatToolbarModule,
		MatChipsModule,
		MatSidenavModule,
		MatSelectModule,
		MatExpansionModule,
		MatSlideToggleModule,
		MatProgressSpinnerModule,
		MatDialogModule,
		MatMenuModule,
		MatSnackBarModule,
		MatRadioModule,
		MatAutocompleteModule,
		MatTabsModule,
		MatPaginatorModule,
		MatBottomSheetModule,
		MatBadgeModule,
		MatTableModule,
		MatSortModule,
		MatRippleModule
	],
	exports: [
		NgbModule,
		NgxDnDModule,
        AngularSplitModule,
        ToastrModule,
		BrowserAnimationsModule,
		MatGridListModule,
		MatIconModule,
		MatButtonModule,
		MatCheckboxModule,
		MatInputModule,
		MatStepperModule,
		MatDatepickerModule,
		MatCardModule,
		MatListModule,
		MatToolbarModule,
		MatChipsModule,
		MatSidenavModule,
		MatSelectModule,
		MatExpansionModule,
		MatSlideToggleModule,
		MatProgressSpinnerModule,
		MatDialogModule,
		MatMenuModule,
		MatSnackBarModule,
		MatRadioModule,
		MatAutocompleteModule,
		MatTabsModule,
		MatPaginatorModule,
		MatBottomSheetModule,
		MatBadgeModule,
		MatTableModule,
		MatSortModule,
		MatRippleModule
	],
})
export class CoreModule { }
