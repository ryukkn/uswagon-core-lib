import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonRegisterButtonComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    register() {
        this.API.register();
    }
    isLoading() {
        return this.API.loading;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonRegisterButtonComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonRegisterButtonComponent, selector: "uswagon-register-button", inputs: { class: "class" }, ngImport: i0, template: "<button [disabled]=\"isLoading()\" [class]=\"class\" (click)=\"register()\">\n    <ng-content></ng-content>\n</button>", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonRegisterButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-register-button', template: "<button [disabled]=\"isLoading()\" [class]=\"class\" (click)=\"register()\">\n    <ng-content></ng-content>\n</button>" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1yZWdpc3Rlci1idXR0b24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1yZWdpc3Rlci1idXR0b24vdXN3YWdvbi1yZWdpc3Rlci1idXR0b24uY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1yZWdpc3Rlci1idXR0b24vdXN3YWdvbi1yZWdpc3Rlci1idXR0b24uY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVNqRCxNQUFNLE9BQU8sOEJBQThCO0lBR3pDLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBRmpDLFVBQUssR0FBUyxFQUFFLENBQUM7SUFFa0IsQ0FBQztJQUc3QyxRQUFRO1FBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDMUIsQ0FBQzsrR0FaVSw4QkFBOEI7bUdBQTlCLDhCQUE4QiwyRkNUM0Msd0hBRVM7OzRGRE9JLDhCQUE4QjtrQkFMMUMsU0FBUzsrQkFDRSx5QkFBeUI7dUZBSzFCLEtBQUs7c0JBQWIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd1c3dhZ29uLXJlZ2lzdGVyLWJ1dHRvbicsXG4gIHRlbXBsYXRlVXJsOiAnLi91c3dhZ29uLXJlZ2lzdGVyLWJ1dHRvbi5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3Vzd2Fnb24tcmVnaXN0ZXItYnV0dG9uLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uUmVnaXN0ZXJCdXR0b25Db21wb25lbnQge1xuICBASW5wdXQoKSBjbGFzczpzdHJpbmcgPScnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuICBcblxuICByZWdpc3Rlcigpe1xuICAgIHRoaXMuQVBJLnJlZ2lzdGVyKCk7XG4gIH1cblxuICBpc0xvYWRpbmcoKXtcbiAgICByZXR1cm4gdGhpcy5BUEkubG9hZGluZztcbiAgfVxufVxuIiwiPGJ1dHRvbiBbZGlzYWJsZWRdPVwiaXNMb2FkaW5nKClcIiBbY2xhc3NdPVwiY2xhc3NcIiAoY2xpY2spPVwicmVnaXN0ZXIoKVwiPlxuICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbjwvYnV0dG9uPiJdfQ==