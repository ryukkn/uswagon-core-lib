import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthSnackbarContainerComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.errorClass = '';
        this.successClass = '';
        this.hiddenClass = '';
        this.timer = 2000;
        this.isInfinite = false;
    }
    getSnackbarFeedback() {
        const feedback = this.API.snackbarFeedback;
        if (feedback !== undefined && (!this.isInfinite && !feedback.isInfinite)) {
            // Set a timer to reset the snackbar feedback after 2 seconds
            setTimeout(() => {
                this.API.snackbarFeedback = undefined;
            }, this.timer);
        }
        return feedback;
    }
}
UswagonAuthSnackbarContainerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarContainerComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthSnackbarContainerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthSnackbarContainerComponent, selector: "uswagon-auth-snackbar-container", inputs: { class: "class", errorClass: "errorClass", successClass: "successClass", hiddenClass: "hiddenClass", timer: "timer", isInfinite: "isInfinite" }, ngImport: i0, template: "<div [hidden]=\"getSnackbarFeedback()==undefined && hiddenClass.trim()==''\" class=\"{{getSnackbarFeedback() == undefined ? hiddenClass :'uswagon-snackbar-container ' + class+' '+getSnackbarFeedback()?.type == 'error'? errorClass : successClass}}\">\n   <ng-content></ng-content>\n</div>", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarContainerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-snackbar-container', template: "<div [hidden]=\"getSnackbarFeedback()==undefined && hiddenClass.trim()==''\" class=\"{{getSnackbarFeedback() == undefined ? hiddenClass :'uswagon-snackbar-container ' + class+' '+getSnackbarFeedback()?.type == 'error'? errorClass : successClass}}\">\n   <ng-content></ng-content>\n</div>" }]
        }], ctorParameters: function () { return [{ type: i1.UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }], errorClass: [{
                type: Input
            }], successClass: [{
                type: Input
            }], hiddenClass: [{
                type: Input
            }], timer: [{
                type: Input
            }], isInfinite: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRhaW5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGFpbmVyL3Vzd2Fnb24tYXV0aC1zbmFja2Jhci1jb250YWluZXIuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRhaW5lci91c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGFpbmVyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFRakQsTUFBTSxPQUFPLHFDQUFxQztJQU9oRCxZQUFvQixHQUFzQjtRQUF0QixRQUFHLEdBQUgsR0FBRyxDQUFtQjtRQU5qQyxVQUFLLEdBQVMsRUFBRSxDQUFDO1FBQ2pCLGVBQVUsR0FBUyxFQUFFLENBQUM7UUFDdEIsaUJBQVksR0FBUyxFQUFFLENBQUM7UUFDeEIsZ0JBQVcsR0FBVSxFQUFFLENBQUM7UUFDeEIsVUFBSyxHQUFVLElBQUksQ0FBQztRQUNwQixlQUFVLEdBQVcsS0FBSyxDQUFDO0lBQ1EsQ0FBQztJQUM3QyxtQkFBbUI7UUFDakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUUzQyxJQUFJLFFBQVEsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDeEUsNkRBQTZEO1lBQzdELFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7WUFDeEMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNoQjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7O21JQW5CVSxxQ0FBcUM7dUhBQXJDLHFDQUFxQyxpT0NSbEQsaVNBRU07NEZETU8scUNBQXFDO2tCQUxqRCxTQUFTOytCQUNFLGlDQUFpQzt5R0FLbEMsS0FBSztzQkFBYixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVXN3YWdvbkF1dGhTZXJ2aWNlIH0gZnJvbSAnLi4vdXN3YWdvbi1hdXRoLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd1c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGFpbmVyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3Vzd2Fnb24tYXV0aC1zbmFja2Jhci1jb250YWluZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGFpbmVyLmNvbXBvbmVudC5jc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQXV0aFNuYWNrYmFyQ29udGFpbmVyQ29tcG9uZW50IHtcbiAgQElucHV0KCkgY2xhc3M6c3RyaW5nID0nJztcbiAgQElucHV0KCkgZXJyb3JDbGFzczpzdHJpbmcgPScnO1xuICBASW5wdXQoKSBzdWNjZXNzQ2xhc3M6c3RyaW5nID0nJztcbiAgQElucHV0KCkgaGlkZGVuQ2xhc3M6c3RyaW5nID0gJyc7XG4gIEBJbnB1dCgpIHRpbWVyOm51bWJlciA9IDIwMDA7XG4gIEBJbnB1dCgpIGlzSW5maW5pdGU6Ym9vbGVhbiA9IGZhbHNlO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIEFQSTpVc3dhZ29uQXV0aFNlcnZpY2Upe31cbiAgZ2V0U25hY2tiYXJGZWVkYmFjaygpe1xuICAgIGNvbnN0IGZlZWRiYWNrID0gdGhpcy5BUEkuc25hY2tiYXJGZWVkYmFjaztcbiAgXG4gICAgaWYgKGZlZWRiYWNrICE9PSB1bmRlZmluZWQgJiYgKCF0aGlzLmlzSW5maW5pdGUgJiYgIWZlZWRiYWNrLmlzSW5maW5pdGUpKSB7XG4gICAgICAvLyBTZXQgYSB0aW1lciB0byByZXNldCB0aGUgc25hY2tiYXIgZmVlZGJhY2sgYWZ0ZXIgMiBzZWNvbmRzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5BUEkuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgIH0sIHRoaXMudGltZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBmZWVkYmFjaztcbiAgfVxufVxuIiwiPGRpdiBbaGlkZGVuXT1cImdldFNuYWNrYmFyRmVlZGJhY2soKT09dW5kZWZpbmVkICYmIGhpZGRlbkNsYXNzLnRyaW0oKT09JydcIiBjbGFzcz1cInt7Z2V0U25hY2tiYXJGZWVkYmFjaygpID09IHVuZGVmaW5lZCA/IGhpZGRlbkNsYXNzIDondXN3YWdvbi1zbmFja2Jhci1jb250YWluZXIgJyArIGNsYXNzKycgJytnZXRTbmFja2JhckZlZWRiYWNrKCk/LnR5cGUgPT0gJ2Vycm9yJz8gZXJyb3JDbGFzcyA6IHN1Y2Nlc3NDbGFzc319XCI+XG4gICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG48L2Rpdj4iXX0=