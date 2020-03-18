/**
 * ng serve -c production
 * ng build -c production
 * ng build -c simulation
 */

export const environment = {
	production: false,
	appConfig: {
		simulated: true,
		endPoint: '/',
		locale: 'en-US',
		host: 'http://localhost:4200',
	}
};
