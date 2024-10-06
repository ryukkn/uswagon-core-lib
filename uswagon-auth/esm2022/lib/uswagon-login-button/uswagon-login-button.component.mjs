import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonLoginButtonComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    login() {
        this.API.login();
    }
    isLoading() {
        return this.API.loading;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonLoginButtonComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonLoginButtonComponent, selector: "uswagon-login-button", inputs: { class: "class" }, ngImport: i0, template: "<button [disabled]=\"isLoading()\" [class]=\"class + ' uswagon-login-button'\" (click)=\"login()\">\n    <ng-content></ng-content>\n</button>\n\n", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonLoginButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-login-button', template: "<button [disabled]=\"isLoading()\" [class]=\"class + ' uswagon-login-button'\" (click)=\"login()\">\n    <ng-content></ng-content>\n</button>\n\n" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1sb2dpbi1idXR0b24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1sb2dpbi1idXR0b24vdXN3YWdvbi1sb2dpbi1idXR0b24uY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1sb2dpbi1idXR0b24vdXN3YWdvbi1sb2dpbi1idXR0b24uY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVFqRCxNQUFNLE9BQU8sMkJBQTJCO0lBR3RDLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBRmpDLFVBQUssR0FBUyxFQUFFLENBQUM7SUFFa0IsQ0FBQztJQUc3QyxLQUFLO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDMUIsQ0FBQzsrR0FaVSwyQkFBMkI7bUdBQTNCLDJCQUEyQix3RkNSeEMsbUpBSUE7OzRGRElhLDJCQUEyQjtrQkFMdkMsU0FBUzsrQkFDRSxzQkFBc0I7dUZBS3ZCLEtBQUs7c0JBQWIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndXN3YWdvbi1sb2dpbi1idXR0b24nLFxuICB0ZW1wbGF0ZVVybDogJy4vdXN3YWdvbi1sb2dpbi1idXR0b24uY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLWxvZ2luLWJ1dHRvbi5jb21wb25lbnQuY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkxvZ2luQnV0dG9uQ29tcG9uZW50IHtcbiAgQElucHV0KCkgY2xhc3M6c3RyaW5nID0nJztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIEFQSTpVc3dhZ29uQXV0aFNlcnZpY2Upe31cbiAgXG5cbiAgbG9naW4oKXtcbiAgICB0aGlzLkFQSS5sb2dpbigpO1xuICB9XG5cbiAgaXNMb2FkaW5nKCl7XG4gICAgcmV0dXJuIHRoaXMuQVBJLmxvYWRpbmc7XG4gIH1cbiAgXG4gXG59XG4iLCI8YnV0dG9uIFtkaXNhYmxlZF09XCJpc0xvYWRpbmcoKVwiIFtjbGFzc109XCJjbGFzcyArICcgdXN3YWdvbi1sb2dpbi1idXR0b24nXCIgKGNsaWNrKT1cImxvZ2luKClcIj5cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L2J1dHRvbj5cblxuIl19