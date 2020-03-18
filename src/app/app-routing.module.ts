import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { ExchangeComponent } from './exchange/exchange.component';


const routes: Routes = [
	{ path: '', redirectTo: '/exchange', pathMatch: 'full' },
	{ path: 'exchange', component: ExchangeComponent }
];


@NgModule({
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {
}
