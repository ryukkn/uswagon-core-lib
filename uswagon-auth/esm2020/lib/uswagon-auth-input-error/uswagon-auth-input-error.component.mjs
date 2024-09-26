import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthInputErrorComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        const field = this.API.getAuthField(this.name);
        if (field == null) {
            throw new Error('Uswagon Input Error Component must be connected to a text field with [name]="value" property');
        }
    }
    hasError() {
        return this.API.getAuthField(this.name).error != null;
    }
    getErrorMessage() {
        return this.API.getAuthField(this.name).error;
    }
}
UswagonAuthInputErrorComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputErrorComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthInputErrorComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthInputErrorComponent, selector: "lib-uswagon-auth-input-error", inputs: { name: "name", class: "class" }, ngImport: i0, template: "<div [hidden]=\"!hasError()\" [class]=\"class\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputErrorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-uswagon-auth-input-error', template: "<div [hidden]=\"!hasError()\" [class]=\"class\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n" }]
        }], ctorParameters: function () { return [{ type: i1.UswagonAuthService }]; }, propDecorators: { name: [{
                type: Input
            }], class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLWlucHV0LWVycm9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1pbnB1dC1lcnJvci91c3dhZ29uLWF1dGgtaW5wdXQtZXJyb3IuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLWlucHV0LWVycm9yL3Vzd2Fnb24tYXV0aC1pbnB1dC1lcnJvci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7O0FBUXpELE1BQU0sT0FBTyw4QkFBOEI7SUFJekMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFEakMsVUFBSyxHQUFTLEVBQUUsQ0FBQztJQUNrQixDQUFDO0lBRzdDLFFBQVE7UUFDTixJQUFHLElBQUksQ0FBQyxJQUFJLElBQUUsU0FBUyxFQUFDO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQTtTQUMvRTtRQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFHLEtBQUssSUFBSSxJQUFJLEVBQUM7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDhGQUE4RixDQUFDLENBQUE7U0FDaEg7SUFDSCxDQUFDO0lBRUQsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUssQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7SUFDekQsQ0FBQztJQUVELGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDakQsQ0FBQzs7NEhBdkJVLDhCQUE4QjtnSEFBOUIsOEJBQThCLDhHQ1IzQyxnSEFHQTs0RkRLYSw4QkFBOEI7a0JBTDFDLFNBQVM7K0JBQ0UsOEJBQThCO3lHQU0vQixJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBVc3dhZ29uQXV0aFNlcnZpY2UgfSBmcm9tICcuLi91c3dhZ29uLWF1dGguc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi11c3dhZ29uLWF1dGgtaW5wdXQtZXJyb3InLFxuICB0ZW1wbGF0ZVVybDogJy4vdXN3YWdvbi1hdXRoLWlucHV0LWVycm9yLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdXN3YWdvbi1hdXRoLWlucHV0LWVycm9yLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQXV0aElucHV0RXJyb3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBcbiAgQElucHV0KCkgbmFtZTpzdHJpbmd8dW5kZWZpbmVkO1xuICBASW5wdXQoKSBjbGFzczpzdHJpbmcgPScnO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIEFQSTpVc3dhZ29uQXV0aFNlcnZpY2Upe31cblxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIGlmKHRoaXMubmFtZT09dW5kZWZpbmVkKXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVXN3YWdvbiBJbnB1dCBDb21wb25lbnQgbXVzdCBoYXZlIGEgW25hbWVdPVwidmFsdWVcIiBwcm9wZXJ0eScpXG4gICAgfVxuICAgIGNvbnN0IGZpZWxkID0gdGhpcy5BUEkuZ2V0QXV0aEZpZWxkKHRoaXMubmFtZSlcbiAgICBpZihmaWVsZCA9PSBudWxsKXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVXN3YWdvbiBJbnB1dCBFcnJvciBDb21wb25lbnQgbXVzdCBiZSBjb25uZWN0ZWQgdG8gYSB0ZXh0IGZpZWxkIHdpdGggW25hbWVdPVwidmFsdWVcIiBwcm9wZXJ0eScpXG4gICAgfVxuICB9XG5cbiAgaGFzRXJyb3IoKXtcbiAgICByZXR1cm4gdGhpcy5BUEkuZ2V0QXV0aEZpZWxkKHRoaXMubmFtZSEpLmVycm9yICE9IG51bGw7XG4gIH1cblxuICBnZXRFcnJvck1lc3NhZ2UoKXtcbiAgICByZXR1cm4gdGhpcy5BUEkuZ2V0QXV0aEZpZWxkKHRoaXMubmFtZSEpLmVycm9yO1xuICB9XG5cbiAgXG59XG4iLCI8ZGl2IFtoaWRkZW5dPVwiIWhhc0Vycm9yKClcIiBbY2xhc3NdPVwiY2xhc3NcIj57e2dldEVycm9yTWVzc2FnZSgpfX1cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L2Rpdj5cbiJdfQ==