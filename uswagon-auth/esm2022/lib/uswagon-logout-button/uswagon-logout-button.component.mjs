import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonLogoutButtonComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    logout() {
        this.API.logout();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: UswagonLogoutButtonComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: UswagonLogoutButtonComponent, selector: "uswagon-logout-button", inputs: { class: "class" }, ngImport: i0, template: "<button [class]=\"class + ' uswagon-logout-button'\" (click)=\"logout()\">\n    <ng-content></ng-content>\n</button>\n\n", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: UswagonLogoutButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-logout-button', template: "<button [class]=\"class + ' uswagon-logout-button'\" (click)=\"logout()\">\n    <ng-content></ng-content>\n</button>\n\n" }]
        }], ctorParameters: function () { return [{ type: i1.UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1sb2dvdXQtYnV0dG9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tbG9nb3V0LWJ1dHRvbi91c3dhZ29uLWxvZ291dC1idXR0b24uY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1sb2dvdXQtYnV0dG9uL3Vzd2Fnb24tbG9nb3V0LWJ1dHRvbi5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBUWpELE1BQU0sT0FBTyw0QkFBNEI7SUFHdkMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFGakMsVUFBSyxHQUFTLEVBQUUsQ0FBQztJQUVrQixDQUFDO0lBRzdDLE1BQU07UUFDSixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3BCLENBQUM7K0dBUlUsNEJBQTRCO21HQUE1Qiw0QkFBNEIseUZDUnpDLDBIQUlBOzs0RkRJYSw0QkFBNEI7a0JBTHhDLFNBQVM7K0JBQ0UsdUJBQXVCO3lHQUt4QixLQUFLO3NCQUFiLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBVc3dhZ29uQXV0aFNlcnZpY2UgfSBmcm9tICcuLi91c3dhZ29uLWF1dGguc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3Vzd2Fnb24tbG9nb3V0LWJ1dHRvbicsXG4gIHRlbXBsYXRlVXJsOiAnLi91c3dhZ29uLWxvZ291dC1idXR0b24uY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLWxvZ291dC1idXR0b24uY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25Mb2dvdXRCdXR0b25Db21wb25lbnQge1xuICBASW5wdXQoKSBjbGFzczpzdHJpbmcgPScnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuICBcblxuICBsb2dvdXQoKXtcbiAgICB0aGlzLkFQSS5sb2dvdXQoKTtcbiAgfVxufVxuIiwiPGJ1dHRvbiBbY2xhc3NdPVwiY2xhc3MgKyAnIHVzd2Fnb24tbG9nb3V0LWJ1dHRvbidcIiAoY2xpY2spPVwibG9nb3V0KClcIj5cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L2J1dHRvbj5cblxuIl19