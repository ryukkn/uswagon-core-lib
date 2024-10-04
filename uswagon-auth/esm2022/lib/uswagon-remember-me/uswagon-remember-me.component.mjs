import { Component } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonRememberMeComponent {
    constructor(API) {
        this.API = API;
        this.persistent = this.API.isLocalStorage();
    }
    togglePersistentLogin() {
        this.persistent = !this.persistent;
        if (this.persistent) {
            this.API.useLocalStorage();
        }
        else {
            this.API.useSessionStorage();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonRememberMeComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonRememberMeComponent, selector: "lib-uswagon-remember-me", ngImport: i0, template: "<input type=\"checkbox\" [value]=\"persistent\" (click)=\"togglePersistentLogin()\">\n", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonRememberMeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-uswagon-remember-me', template: "<input type=\"checkbox\" [value]=\"persistent\" (click)=\"togglePersistentLogin()\">\n" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1yZW1lbWJlci1tZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLXJlbWVtYmVyLW1lL3Vzd2Fnb24tcmVtZW1iZXItbWUuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1yZW1lbWJlci1tZS91c3dhZ29uLXJlbWVtYmVyLW1lLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVExQyxNQUFNLE9BQU8sMEJBQTBCO0lBQ3JDLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBQzFDLGVBQVUsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBREgsQ0FBQztJQUU3QyxxQkFBcUI7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QixDQUFDO2FBQUssQ0FBQztZQUNMLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0gsQ0FBQzsrR0FWVSwwQkFBMEI7bUdBQTFCLDBCQUEwQiwrRENSdkMsd0ZBQ0E7OzRGRE9hLDBCQUEwQjtrQkFMdEMsU0FBUzsrQkFDRSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXVzd2Fnb24tcmVtZW1iZXItbWUnLFxuICB0ZW1wbGF0ZVVybDogJy4vdXN3YWdvbi1yZW1lbWJlci1tZS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3Vzd2Fnb24tcmVtZW1iZXItbWUuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25SZW1lbWJlck1lQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBBUEk6VXN3YWdvbkF1dGhTZXJ2aWNlKXt9XG4gIHBlcnNpc3RlbnQ6Ym9vbGVhbiA9IHRoaXMuQVBJLmlzTG9jYWxTdG9yYWdlKCk7XG4gIHRvZ2dsZVBlcnNpc3RlbnRMb2dpbigpe1xuICAgIHRoaXMucGVyc2lzdGVudCA9ICF0aGlzLnBlcnNpc3RlbnQ7XG4gICAgaWYodGhpcy5wZXJzaXN0ZW50KXtcbiAgICAgIHRoaXMuQVBJLnVzZUxvY2FsU3RvcmFnZSgpO1xuICAgIH0gZWxzZXtcbiAgICAgIHRoaXMuQVBJLnVzZVNlc3Npb25TdG9yYWdlKCk7XG4gICAgfVxuICB9XG5cbn1cbiIsIjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBbdmFsdWVdPVwicGVyc2lzdGVudFwiIChjbGljayk9XCJ0b2dnbGVQZXJzaXN0ZW50TG9naW4oKVwiPlxuIl19