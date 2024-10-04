import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthInputErrorComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.hiddenClass = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            alert('Uswagon Input Component must have a [name]="value" property');
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        const field = this.API.getAuthField(this.name);
        if (field == null) {
            alert('Uswagon Input Error Component must be connected to a text field with [name]="value" property');
            throw new Error('Uswagon Input Error Component must be connected to a text field with [name]="value" property');
        }
    }
    hasError() {
        return this.API.getAuthField(this.name).error != null;
    }
    getErrorMessage() {
        return this.API.getAuthField(this.name).error;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthInputErrorComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonAuthInputErrorComponent, selector: "uswagon-auth-input-error", inputs: { name: "name", class: "class", hiddenClass: "hiddenClass" }, ngImport: i0, template: "<div [hidden]=\"!hasError() && hiddenClass.trim() != ''\" [class]=\"class + ' uswagon-auth-input-error'\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthInputErrorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-input-error', template: "<div [hidden]=\"!hasError() && hiddenClass.trim() != ''\" [class]=\"class + ' uswagon-auth-input-error'\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { name: [{
                type: Input
            }], class: [{
                type: Input
            }], hiddenClass: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLWlucHV0LWVycm9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1pbnB1dC1lcnJvci91c3dhZ29uLWF1dGgtaW5wdXQtZXJyb3IuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLWlucHV0LWVycm9yL3Vzd2Fnb24tYXV0aC1pbnB1dC1lcnJvci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7O0FBUXpELE1BQU0sT0FBTyw4QkFBOEI7SUFLekMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFGakMsVUFBSyxHQUFTLEVBQUUsQ0FBQztRQUNqQixnQkFBVyxHQUFRLEVBQUUsQ0FBQztJQUNhLENBQUM7SUFHN0MsUUFBUTtRQUNOLElBQUcsSUFBSSxDQUFDLElBQUksSUFBRSxTQUFTLEVBQUMsQ0FBQztZQUN2QixLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQTtZQUNwRSxNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7UUFDaEYsQ0FBQztRQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFHLEtBQUssSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUNoQixLQUFLLENBQUMsOEZBQThGLENBQUMsQ0FBQTtZQUNyRyxNQUFNLElBQUksS0FBSyxDQUFDLDhGQUE4RixDQUFDLENBQUE7UUFDakgsQ0FBQztJQUNILENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztJQUN6RCxDQUFDO0lBRUQsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNqRCxDQUFDOytHQTFCVSw4QkFBOEI7bUdBQTlCLDhCQUE4QixzSUNSM0MsMEtBR0E7OzRGREthLDhCQUE4QjtrQkFMMUMsU0FBUzsrQkFDRSwwQkFBMEI7dUZBTTNCLElBQUk7c0JBQVosS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVXN3YWdvbkF1dGhTZXJ2aWNlIH0gZnJvbSAnLi4vdXN3YWdvbi1hdXRoLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd1c3dhZ29uLWF1dGgtaW5wdXQtZXJyb3InLFxuICB0ZW1wbGF0ZVVybDogJy4vdXN3YWdvbi1hdXRoLWlucHV0LWVycm9yLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdXN3YWdvbi1hdXRoLWlucHV0LWVycm9yLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQXV0aElucHV0RXJyb3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBcbiAgQElucHV0KCkgbmFtZTpzdHJpbmd8dW5kZWZpbmVkO1xuICBASW5wdXQoKSBjbGFzczpzdHJpbmcgPScnO1xuICBASW5wdXQoKSBoaWRkZW5DbGFzczpzdHJpbmc9Jyc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuXG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgaWYodGhpcy5uYW1lPT11bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ1Vzd2Fnb24gSW5wdXQgQ29tcG9uZW50IG11c3QgaGF2ZSBhIFtuYW1lXT1cInZhbHVlXCIgcHJvcGVydHknKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc3dhZ29uIElucHV0IENvbXBvbmVudCBtdXN0IGhhdmUgYSBbbmFtZV09XCJ2YWx1ZVwiIHByb3BlcnR5JylcbiAgICB9XG4gICAgY29uc3QgZmllbGQgPSB0aGlzLkFQSS5nZXRBdXRoRmllbGQodGhpcy5uYW1lKVxuICAgIGlmKGZpZWxkID09IG51bGwpe1xuICAgICAgYWxlcnQoJ1Vzd2Fnb24gSW5wdXQgRXJyb3IgQ29tcG9uZW50IG11c3QgYmUgY29ubmVjdGVkIHRvIGEgdGV4dCBmaWVsZCB3aXRoIFtuYW1lXT1cInZhbHVlXCIgcHJvcGVydHknKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc3dhZ29uIElucHV0IEVycm9yIENvbXBvbmVudCBtdXN0IGJlIGNvbm5lY3RlZCB0byBhIHRleHQgZmllbGQgd2l0aCBbbmFtZV09XCJ2YWx1ZVwiIHByb3BlcnR5JylcbiAgICB9XG4gIH1cblxuICBoYXNFcnJvcigpe1xuICAgIHJldHVybiB0aGlzLkFQSS5nZXRBdXRoRmllbGQodGhpcy5uYW1lISkuZXJyb3IgIT0gbnVsbDtcbiAgfVxuXG4gIGdldEVycm9yTWVzc2FnZSgpe1xuICAgIHJldHVybiB0aGlzLkFQSS5nZXRBdXRoRmllbGQodGhpcy5uYW1lISkuZXJyb3I7XG4gIH1cblxuICBcbn1cbiIsIjxkaXYgW2hpZGRlbl09XCIhaGFzRXJyb3IoKSAmJiBoaWRkZW5DbGFzcy50cmltKCkgIT0gJydcIiBbY2xhc3NdPVwiY2xhc3MgKyAnIHVzd2Fnb24tYXV0aC1pbnB1dC1lcnJvcidcIj57e2dldEVycm9yTWVzc2FnZSgpfX1cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L2Rpdj5cbiJdfQ==