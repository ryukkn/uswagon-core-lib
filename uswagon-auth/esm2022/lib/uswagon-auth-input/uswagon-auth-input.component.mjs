import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthInputComponent {
    constructor(API) {
        this.API = API;
        this.placeholder = '';
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
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonAuthInputComponent, selector: "uswagon-auth-input", inputs: { name: "name", placeholder: "placeholder", required: "required", validator: "validator", type: "type", unique: "unique", aliases: "aliases", encrypted: "encrypted", class: "class" }, ngImport: i0, template: "<input [placeholder]=\"placeholder\" [value]=\"getInput()\" [class]=\"class + ' uswagon-auth-input'\" [type]=\"type\" (change)=\"handleInput($event)\">", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-input', template: "<input [placeholder]=\"placeholder\" [value]=\"getInput()\" [class]=\"class + ' uswagon-auth-input'\" [type]=\"type\" (change)=\"handleInput($event)\">" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { name: [{
                type: Input
            }], placeholder: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLWlucHV0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1pbnB1dC91c3dhZ29uLWF1dGgtaW5wdXQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLWlucHV0L3Vzd2Fnb24tYXV0aC1pbnB1dC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7O0FBUXpELE1BQU0sT0FBTyx5QkFBeUI7SUFVcEMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFSakMsZ0JBQVcsR0FBUyxFQUFFLENBQUM7UUFDdkIsYUFBUSxHQUFXLEtBQUssQ0FBQztRQUV6QixTQUFJLEdBQVUsTUFBTSxDQUFDO1FBQ3JCLFdBQU0sR0FBVyxLQUFLLENBQUM7UUFFdkIsY0FBUyxHQUFXLEtBQUssQ0FBQztRQUMxQixVQUFLLEdBQVUsRUFBRSxDQUFDO0lBQ2lCLENBQUM7SUFDN0MsUUFBUTtRQUNOLElBQUcsSUFBSSxDQUFDLElBQUksSUFBRSxTQUFTLEVBQUMsQ0FBQztZQUN2QixLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQTtZQUNwRSxNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7UUFDaEYsQ0FBQztRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlILENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLENBQUMsS0FBSyxDQUFBO0lBQ2hELENBQUM7SUFFRCxXQUFXLENBQUMsS0FBVTtRQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUQsQ0FBQzsrR0F6QlUseUJBQXlCO21HQUF6Qix5QkFBeUIsMFBDUnRDLHlKQUE2STs7NEZEUWhJLHlCQUF5QjtrQkFMckMsU0FBUzsrQkFDRSxvQkFBb0I7dUZBS3JCLElBQUk7c0JBQVosS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLE9BQU87c0JBQWYsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLEtBQUs7c0JBQWIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVXN3YWdvbkF1dGhTZXJ2aWNlIH0gZnJvbSAnLi4vdXN3YWdvbi1hdXRoLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd1c3dhZ29uLWF1dGgtaW5wdXQnLFxuICB0ZW1wbGF0ZVVybDogJy4vdXN3YWdvbi1hdXRoLWlucHV0LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdXN3YWdvbi1hdXRoLWlucHV0LmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQXV0aElucHV0Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQElucHV0KCkgbmFtZTpzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIEBJbnB1dCgpIHBsYWNlaG9sZGVyOnN0cmluZyA9Jyc7XG4gIEBJbnB1dCgpIHJlcXVpcmVkOmJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgdmFsaWRhdG9yPzpzdHJpbmc7XG4gIEBJbnB1dCgpIHR5cGU6c3RyaW5nID0gJ3RleHQnO1xuICBASW5wdXQoKSB1bmlxdWU6Ym9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBhbGlhc2VzPzpzdHJpbmdbXTtcbiAgQElucHV0KCkgZW5jcnlwdGVkOmJvb2xlYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgY2xhc3M6c3RyaW5nID0gJyc7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBpZih0aGlzLm5hbWU9PXVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnVXN3YWdvbiBJbnB1dCBDb21wb25lbnQgbXVzdCBoYXZlIGEgW25hbWVdPVwidmFsdWVcIiBwcm9wZXJ0eScpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vzd2Fnb24gSW5wdXQgQ29tcG9uZW50IG11c3QgaGF2ZSBhIFtuYW1lXT1cInZhbHVlXCIgcHJvcGVydHknKVxuICAgIH1cbiAgICB0aGlzLkFQSS5pbml0aWFsaXplRm9ybUZpZWxkKHRoaXMubmFtZSwgdGhpcy5yZXF1aXJlZCx0aGlzLnVuaXF1ZSx0aGlzLnR5cGUsIHRoaXMuYWxpYXNlcywgdGhpcy5lbmNyeXB0ZWQgLCB0aGlzLnZhbGlkYXRvcik7XG4gIH1cblxuICBnZXRJbnB1dCgpe1xuICAgIHJldHVybiB0aGlzLkFQSS5nZXRBdXRoRmllbGQodGhpcy5uYW1lISkudmFsdWVcbiAgfVxuXG4gIGhhbmRsZUlucHV0KGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLkFQSS5oYW5kbGVGb3JtVmFsdWUodGhpcy5uYW1lISwgZXZlbnQudGFyZ2V0LnZhbHVlKVxuICB9XG59XG4iLCI8aW5wdXQgW3BsYWNlaG9sZGVyXT1cInBsYWNlaG9sZGVyXCIgW3ZhbHVlXT1cImdldElucHV0KClcIiBbY2xhc3NdPVwiY2xhc3MgKyAnIHVzd2Fnb24tYXV0aC1pbnB1dCdcIiBbdHlwZV09XCJ0eXBlXCIgKGNoYW5nZSk9XCJoYW5kbGVJbnB1dCgkZXZlbnQpXCI+Il19