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
            console.error('Uswagon Input Component must have a [name]="value" property');
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        const field = this.API.getAuthField(this.name);
        if (field == null) {
            console.error('Uswagon Input Error Component must be connected to a text field with [name]="value" property');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLWlucHV0LWVycm9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1pbnB1dC1lcnJvci91c3dhZ29uLWF1dGgtaW5wdXQtZXJyb3IuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLWlucHV0LWVycm9yL3Vzd2Fnb24tYXV0aC1pbnB1dC1lcnJvci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7O0FBUXpELE1BQU0sT0FBTyw4QkFBOEI7SUFJekMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFEakMsVUFBSyxHQUFTLEVBQUUsQ0FBQztJQUNrQixDQUFDO0lBRzdDLFFBQVE7UUFDTixJQUFHLElBQUksQ0FBQyxJQUFJLElBQUUsU0FBUyxFQUFDO1lBQ3RCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQTtZQUM1RSxNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7U0FDL0U7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDOUMsSUFBRyxLQUFLLElBQUksSUFBSSxFQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw4RkFBOEYsQ0FBQyxDQUFBO1lBQzdHLE1BQU0sSUFBSSxLQUFLLENBQUMsOEZBQThGLENBQUMsQ0FBQTtTQUNoSDtJQUNILENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztJQUN6RCxDQUFDO0lBRUQsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNqRCxDQUFDOzs0SEF6QlUsOEJBQThCO2dIQUE5Qiw4QkFBOEIsOEdDUjNDLGdIQUdBOzRGREthLDhCQUE4QjtrQkFMMUMsU0FBUzsrQkFDRSw4QkFBOEI7eUdBTS9CLElBQUk7c0JBQVosS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXVzd2Fnb24tYXV0aC1pbnB1dC1lcnJvcicsXG4gIHRlbXBsYXRlVXJsOiAnLi91c3dhZ29uLWF1dGgtaW5wdXQtZXJyb3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLWF1dGgtaW5wdXQtZXJyb3IuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoSW5wdXRFcnJvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIFxuICBASW5wdXQoKSBuYW1lOnN0cmluZ3x1bmRlZmluZWQ7XG4gIEBJbnB1dCgpIGNsYXNzOnN0cmluZyA9Jyc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuXG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgaWYodGhpcy5uYW1lPT11bmRlZmluZWQpe1xuICAgICAgY29uc29sZS5lcnJvcignVXN3YWdvbiBJbnB1dCBDb21wb25lbnQgbXVzdCBoYXZlIGEgW25hbWVdPVwidmFsdWVcIiBwcm9wZXJ0eScpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vzd2Fnb24gSW5wdXQgQ29tcG9uZW50IG11c3QgaGF2ZSBhIFtuYW1lXT1cInZhbHVlXCIgcHJvcGVydHknKVxuICAgIH1cbiAgICBjb25zdCBmaWVsZCA9IHRoaXMuQVBJLmdldEF1dGhGaWVsZCh0aGlzLm5hbWUpXG4gICAgaWYoZmllbGQgPT0gbnVsbCl7XG4gICAgICBjb25zb2xlLmVycm9yKCdVc3dhZ29uIElucHV0IEVycm9yIENvbXBvbmVudCBtdXN0IGJlIGNvbm5lY3RlZCB0byBhIHRleHQgZmllbGQgd2l0aCBbbmFtZV09XCJ2YWx1ZVwiIHByb3BlcnR5JylcbiAgICAgIHRocm93IG5ldyBFcnJvcignVXN3YWdvbiBJbnB1dCBFcnJvciBDb21wb25lbnQgbXVzdCBiZSBjb25uZWN0ZWQgdG8gYSB0ZXh0IGZpZWxkIHdpdGggW25hbWVdPVwidmFsdWVcIiBwcm9wZXJ0eScpXG4gICAgfVxuICB9XG5cbiAgaGFzRXJyb3IoKXtcbiAgICByZXR1cm4gdGhpcy5BUEkuZ2V0QXV0aEZpZWxkKHRoaXMubmFtZSEpLmVycm9yICE9IG51bGw7XG4gIH1cblxuICBnZXRFcnJvck1lc3NhZ2UoKXtcbiAgICByZXR1cm4gdGhpcy5BUEkuZ2V0QXV0aEZpZWxkKHRoaXMubmFtZSEpLmVycm9yO1xuICB9XG5cbiAgXG59XG4iLCI8ZGl2IFtoaWRkZW5dPVwiIWhhc0Vycm9yKClcIiBbY2xhc3NdPVwiY2xhc3NcIj57e2dldEVycm9yTWVzc2FnZSgpfX1cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L2Rpdj5cbiJdfQ==