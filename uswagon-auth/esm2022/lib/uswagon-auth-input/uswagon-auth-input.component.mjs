import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthInputComponent {
    constructor(API) {
        this.API = API;
        this.required = false;
        this.type = 'text';
        this.unique = false;
        this.encrypted = false;
        this.class = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            alert('Uswagon Input Component must have a [name]="value" property');
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        this.API.initializeFormField(this.name, this.required, this.unique, this.type, this.aliases, this.encrypted, this.validator);
    }
    getInput() {
        return this.API.getAuthField(this.name).value;
    }
    handleInput(event) {
        this.API.handleFormValue(this.name, event.target.value);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthInputComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonAuthInputComponent, selector: "uswagon-auth-input", inputs: { name: "name", required: "required", validator: "validator", type: "type", unique: "unique", aliases: "aliases", encrypted: "encrypted", class: "class" }, ngImport: i0, template: "<input [value]=\"getInput()\" [class]=\"class + ' uswagon-auth-input'\" [type]=\"type\" (change)=\"handleInput($event)\">", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-input', template: "<input [value]=\"getInput()\" [class]=\"class + ' uswagon-auth-input'\" [type]=\"type\" (change)=\"handleInput($event)\">" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { name: [{
                type: Input
            }], required: [{
                type: Input
            }], validator: [{
                type: Input
            }], type: [{
                type: Input
            }], unique: [{
                type: Input
            }], aliases: [{
                type: Input
            }], encrypted: [{
                type: Input
            }], class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLWlucHV0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1pbnB1dC91c3dhZ29uLWF1dGgtaW5wdXQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLWlucHV0L3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7O0FBUXpELE1BQU0sT0FBTyx5QkFBeUI7SUFTcEMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFQakMsYUFBUSxHQUFXLEtBQUssQ0FBQztRQUV6QixTQUFJLEdBQVUsTUFBTSxDQUFDO1FBQ3JCLFdBQU0sR0FBVyxLQUFLLENBQUM7UUFFdkIsY0FBUyxHQUFXLEtBQUssQ0FBQztRQUMxQixVQUFLLEdBQVUsRUFBRSxDQUFDO0lBQ2lCLENBQUM7SUFDN0MsUUFBUTtRQUNOLElBQUcsSUFBSSxDQUFDLElBQUksSUFBRSxTQUFTLEVBQUMsQ0FBQztZQUN2QixLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQTtZQUNwRSxNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7UUFDaEYsQ0FBQztRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlILENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLENBQUMsS0FBSyxDQUFBO0lBQ2hELENBQUM7SUFFRCxXQUFXLENBQUMsS0FBVTtRQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUQsQ0FBQzsrR0F4QlUseUJBQXlCO21HQUF6Qix5QkFBeUIsOE5DUnRDLDJIQUFpSDs7NEZEUXBHLHlCQUF5QjtrQkFMckMsU0FBUzsrQkFDRSxvQkFBb0I7dUZBS3JCLElBQUk7c0JBQVosS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndXN3YWdvbi1hdXRoLWlucHV0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhJbnB1dENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIG5hbWU6c3RyaW5nIHwgdW5kZWZpbmVkO1xuICBASW5wdXQoKSByZXF1aXJlZDpib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHZhbGlkYXRvcj86c3RyaW5nO1xuICBASW5wdXQoKSB0eXBlOnN0cmluZyA9ICd0ZXh0JztcbiAgQElucHV0KCkgdW5pcXVlOmJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgYWxpYXNlcz86c3RyaW5nW107XG4gIEBJbnB1dCgpIGVuY3J5cHRlZDpib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGNsYXNzOnN0cmluZyA9ICcnO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIEFQSTpVc3dhZ29uQXV0aFNlcnZpY2Upe31cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgaWYodGhpcy5uYW1lPT11bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ1Vzd2Fnb24gSW5wdXQgQ29tcG9uZW50IG11c3QgaGF2ZSBhIFtuYW1lXT1cInZhbHVlXCIgcHJvcGVydHknKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc3dhZ29uIElucHV0IENvbXBvbmVudCBtdXN0IGhhdmUgYSBbbmFtZV09XCJ2YWx1ZVwiIHByb3BlcnR5JylcbiAgICB9XG4gICAgdGhpcy5BUEkuaW5pdGlhbGl6ZUZvcm1GaWVsZCh0aGlzLm5hbWUsIHRoaXMucmVxdWlyZWQsdGhpcy51bmlxdWUsdGhpcy50eXBlLCB0aGlzLmFsaWFzZXMsIHRoaXMuZW5jcnlwdGVkICwgdGhpcy52YWxpZGF0b3IpO1xuICB9XG5cbiAgZ2V0SW5wdXQoKXtcbiAgICByZXR1cm4gdGhpcy5BUEkuZ2V0QXV0aEZpZWxkKHRoaXMubmFtZSEpLnZhbHVlXG4gIH1cblxuICBoYW5kbGVJbnB1dChldmVudDogYW55KSB7XG4gICAgdGhpcy5BUEkuaGFuZGxlRm9ybVZhbHVlKHRoaXMubmFtZSEsIGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgfVxufVxuIiwiPGlucHV0IFt2YWx1ZV09XCJnZXRJbnB1dCgpXCIgW2NsYXNzXT1cImNsYXNzICsgJyB1c3dhZ29uLWF1dGgtaW5wdXQnXCIgW3R5cGVdPVwidHlwZVwiIChjaGFuZ2UpPVwiaGFuZGxlSW5wdXQoJGV2ZW50KVwiPiJdfQ==