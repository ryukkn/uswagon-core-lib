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
            console.error('Uswagon Input Component must have a [name]="value" property');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLWlucHV0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1pbnB1dC91c3dhZ29uLWF1dGgtaW5wdXQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLWlucHV0L3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7O0FBUXpELE1BQU0sT0FBTyx5QkFBeUI7SUFNcEMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFKakMsYUFBUSxHQUFXLEtBQUssQ0FBQztRQUV6QixTQUFJLEdBQVUsTUFBTSxDQUFDO1FBQ3JCLFVBQUssR0FBVSxFQUFFLENBQUM7SUFDaUIsQ0FBQztJQUM3QyxRQUFRO1FBQ04sSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFFLFNBQVMsRUFBQztZQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7WUFDNUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFBO1NBQy9FO1FBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFVO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMxRCxDQUFDOzt1SEFqQlUseUJBQXlCOzJHQUF6Qix5QkFBeUIsZ0tDUnRDLDJDQUFxQzs0RkRReEIseUJBQXlCO2tCQUxyQyxTQUFTOytCQUNFLG9CQUFvQjt5R0FLckIsSUFBSTtzQkFBWixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBVc3dhZ29uQXV0aFNlcnZpY2UgfSBmcm9tICcuLi91c3dhZ29uLWF1dGguc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3Vzd2Fnb24tYXV0aC1pbnB1dCcsXG4gIHRlbXBsYXRlVXJsOiAnLi91c3dhZ29uLWF1dGgtaW5wdXQuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLWF1dGgtaW5wdXQuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoSW5wdXRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBASW5wdXQoKSBuYW1lOnN0cmluZyB8IHVuZGVmaW5lZDtcbiAgQElucHV0KCkgcmVxdWlyZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSB2YWxpZGF0b3I/OnN0cmluZztcbiAgQElucHV0KCkgdHlwZTpzdHJpbmcgPSAndGV4dCc7XG4gIEBJbnB1dCgpIGNsYXNzOnN0cmluZyA9ICcnO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIEFQSTpVc3dhZ29uQXV0aFNlcnZpY2Upe31cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgaWYodGhpcy5uYW1lPT11bmRlZmluZWQpe1xuICAgICAgY29uc29sZS5lcnJvcignVXN3YWdvbiBJbnB1dCBDb21wb25lbnQgbXVzdCBoYXZlIGEgW25hbWVdPVwidmFsdWVcIiBwcm9wZXJ0eScpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vzd2Fnb24gSW5wdXQgQ29tcG9uZW50IG11c3QgaGF2ZSBhIFtuYW1lXT1cInZhbHVlXCIgcHJvcGVydHknKVxuICAgIH1cbiAgICB0aGlzLkFQSS5pbml0aWFsaXplRm9ybUZpZWxkKHRoaXMubmFtZSwgdGhpcy5yZXF1aXJlZCx0aGlzLnR5cGUgLCB0aGlzLnZhbGlkYXRvcik7XG4gIH1cblxuICBoYW5kbGVJbnB1dChldmVudDogYW55KSB7XG4gICAgdGhpcy5BUEkuaGFuZGxlRm9ybVZhbHVlKHRoaXMubmFtZSEsIGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgfVxufVxuIiwiPGlucHV0IFtjbGFzc109XCJjbGFzc1wiIFt0eXBlXT1cInR5cGVcIj4iXX0=