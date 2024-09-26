import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthInputComponent {
    constructor(API) {
        this.API = API;
        this.required = false;
        this.type = 'text';
        this.class = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        this.API.initializeFormField(this.name, this.required, this.type, this.validator);
    }
    handleInput(event) {
        this.API.handleFormValue(this.name, event.target.value);
    }
}
UswagonAuthInputComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthInputComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthInputComponent, selector: "uswagon-auth-input", inputs: { name: "name", required: "required", validator: "validator", type: "type", class: "class" }, ngImport: i0, template: "<input [class]=\"class\" [type]=\"type\">", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-input', template: "<input [class]=\"class\" [type]=\"type\">" }]
        }], ctorParameters: function () { return [{ type: i1.UswagonAuthService }]; }, propDecorators: { name: [{
                type: Input
            }], required: [{
                type: Input
            }], validator: [{
                type: Input
            }], type: [{
                type: Input
            }], class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLWlucHV0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1pbnB1dC91c3dhZ29uLWF1dGgtaW5wdXQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLWlucHV0L3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7O0FBUXpELE1BQU0sT0FBTyx5QkFBeUI7SUFNcEMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFKakMsYUFBUSxHQUFXLEtBQUssQ0FBQztRQUV6QixTQUFJLEdBQVUsTUFBTSxDQUFDO1FBQ3JCLFVBQUssR0FBVSxFQUFFLENBQUM7SUFDaUIsQ0FBQztJQUM3QyxRQUFRO1FBQ04sSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFFLFNBQVMsRUFBQztZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7U0FDL0U7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQyxJQUFJLENBQUMsSUFBSSxFQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQVU7UUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFELENBQUM7O3VIQWhCVSx5QkFBeUI7MkdBQXpCLHlCQUF5QixnS0NSdEMsMkNBQXFDOzRGRFF4Qix5QkFBeUI7a0JBTHJDLFNBQVM7K0JBQ0Usb0JBQW9CO3lHQUtyQixJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndXN3YWdvbi1hdXRoLWlucHV0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhJbnB1dENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIG5hbWU6c3RyaW5nIHwgdW5kZWZpbmVkO1xuICBASW5wdXQoKSByZXF1aXJlZDpib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHZhbGlkYXRvcj86c3RyaW5nO1xuICBASW5wdXQoKSB0eXBlOnN0cmluZyA9ICd0ZXh0JztcbiAgQElucHV0KCkgY2xhc3M6c3RyaW5nID0gJyc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBpZih0aGlzLm5hbWU9PXVuZGVmaW5lZCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vzd2Fnb24gSW5wdXQgQ29tcG9uZW50IG11c3QgaGF2ZSBhIFtuYW1lXT1cInZhbHVlXCIgcHJvcGVydHknKVxuICAgIH1cbiAgICB0aGlzLkFQSS5pbml0aWFsaXplRm9ybUZpZWxkKHRoaXMubmFtZSwgdGhpcy5yZXF1aXJlZCx0aGlzLnR5cGUgLCB0aGlzLnZhbGlkYXRvcik7XG4gIH1cblxuICBoYW5kbGVJbnB1dChldmVudDogYW55KSB7XG4gICAgdGhpcy5BUEkuaGFuZGxlRm9ybVZhbHVlKHRoaXMubmFtZSEsIGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgfVxufVxuIiwiPGlucHV0IFtjbGFzc109XCJjbGFzc1wiIFt0eXBlXT1cInR5cGVcIj4iXX0=