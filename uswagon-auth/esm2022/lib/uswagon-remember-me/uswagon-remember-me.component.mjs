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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: UswagonRememberMeComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: UswagonRememberMeComponent, selector: "lib-uswagon-remember-me", ngImport: i0, template: "<input type=\"checkbox\" [value]=\"persistent\" (click)=\"togglePersistentLogin()\">\n", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: UswagonRememberMeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-uswagon-remember-me', template: "<input type=\"checkbox\" [value]=\"persistent\" (click)=\"togglePersistentLogin()\">\n" }]
        }], ctorParameters: function () { return [{ type: i1.UswagonAuthService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1yZW1lbWJlci1tZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLXJlbWVtYmVyLW1lL3Vzd2Fnb24tcmVtZW1iZXItbWUuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1yZW1lbWJlci1tZS91c3dhZ29uLXJlbWVtYmVyLW1lLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVExQyxNQUFNLE9BQU8sMEJBQTBCO0lBQ3JDLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBQzFDLGVBQVUsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBREgsQ0FBQztJQUU3QyxxQkFBcUI7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDNUI7YUFBSztZQUNKLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUM5QjtJQUNILENBQUM7K0dBVlUsMEJBQTBCO21HQUExQiwwQkFBMEIsK0RDUnZDLHdGQUNBOzs0RkRPYSwwQkFBMEI7a0JBTHRDLFNBQVM7K0JBQ0UseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBVc3dhZ29uQXV0aFNlcnZpY2UgfSBmcm9tICcuLi91c3dhZ29uLWF1dGguc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi11c3dhZ29uLXJlbWVtYmVyLW1lJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3Vzd2Fnb24tcmVtZW1iZXItbWUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLXJlbWVtYmVyLW1lLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uUmVtZW1iZXJNZUNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgQVBJOlVzd2Fnb25BdXRoU2VydmljZSl7fVxuICBwZXJzaXN0ZW50OmJvb2xlYW4gPSB0aGlzLkFQSS5pc0xvY2FsU3RvcmFnZSgpO1xuICB0b2dnbGVQZXJzaXN0ZW50TG9naW4oKXtcbiAgICB0aGlzLnBlcnNpc3RlbnQgPSAhdGhpcy5wZXJzaXN0ZW50O1xuICAgIGlmKHRoaXMucGVyc2lzdGVudCl7XG4gICAgICB0aGlzLkFQSS51c2VMb2NhbFN0b3JhZ2UoKTtcbiAgICB9IGVsc2V7XG4gICAgICB0aGlzLkFQSS51c2VTZXNzaW9uU3RvcmFnZSgpO1xuICAgIH1cbiAgfVxuXG59XG4iLCI8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgW3ZhbHVlXT1cInBlcnNpc3RlbnRcIiAoY2xpY2spPVwidG9nZ2xlUGVyc2lzdGVudExvZ2luKClcIj5cbiJdfQ==