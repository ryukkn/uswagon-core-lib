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
}
UswagonLoginButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLoginButtonComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonLoginButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonLoginButtonComponent, selector: "uswagon-login-button", inputs: { class: "class" }, ngImport: i0, template: "<button [class]=\"class + ' uswagon-login-button'\" (click)=\"login()\">\n    <ng-content></ng-content>\n</button>\n\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLoginButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-login-button', template: "<button [class]=\"class + ' uswagon-login-button'\" (click)=\"login()\">\n    <ng-content></ng-content>\n</button>\n\n" }]
        }], ctorParameters: function () { return [{ type: i1.UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1sb2dpbi1idXR0b24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1sb2dpbi1idXR0b24vdXN3YWdvbi1sb2dpbi1idXR0b24uY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1sb2dpbi1idXR0b24vdXN3YWdvbi1sb2dpbi1idXR0b24uY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVFqRCxNQUFNLE9BQU8sMkJBQTJCO0lBR3RDLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBRmpDLFVBQUssR0FBUyxFQUFFLENBQUM7SUFFa0IsQ0FBQztJQUc3QyxLQUFLO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQixDQUFDOzt5SEFSVSwyQkFBMkI7NkdBQTNCLDJCQUEyQix3RkNSeEMsd0hBSUE7NEZESWEsMkJBQTJCO2tCQUx2QyxTQUFTOytCQUNFLHNCQUFzQjt5R0FLdkIsS0FBSztzQkFBYixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVXN3YWdvbkF1dGhTZXJ2aWNlIH0gZnJvbSAnLi4vdXN3YWdvbi1hdXRoLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd1c3dhZ29uLWxvZ2luLWJ1dHRvbicsXG4gIHRlbXBsYXRlVXJsOiAnLi91c3dhZ29uLWxvZ2luLWJ1dHRvbi5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3Vzd2Fnb24tbG9naW4tYnV0dG9uLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uTG9naW5CdXR0b25Db21wb25lbnQge1xuICBASW5wdXQoKSBjbGFzczpzdHJpbmcgPScnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuICBcblxuICBsb2dpbigpe1xuICAgIHRoaXMuQVBJLmxvZ2luKCk7XG4gIH1cbiAgXG4gXG59XG4iLCI8YnV0dG9uIFtjbGFzc109XCJjbGFzcyArICcgdXN3YWdvbi1sb2dpbi1idXR0b24nXCIgKGNsaWNrKT1cImxvZ2luKClcIj5cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L2J1dHRvbj5cblxuIl19