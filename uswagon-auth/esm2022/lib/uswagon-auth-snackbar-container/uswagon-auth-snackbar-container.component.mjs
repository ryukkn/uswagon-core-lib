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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthSnackbarContainerComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonAuthSnackbarContainerComponent, selector: "uswagon-auth-snackbar-container", inputs: { class: "class", errorClass: "errorClass", successClass: "successClass", hiddenClass: "hiddenClass", timer: "timer", isInfinite: "isInfinite" }, ngImport: i0, template: "<div [hidden]=\"getSnackbarFeedback()==undefined && hiddenClass.trim()==''\" class=\"{{getSnackbarFeedback() == undefined ? hiddenClass :'uswagon-snackbar-container ' + class+' '+getSnackbarFeedback()?.type == 'error'? errorClass : successClass}}\">\n   <ng-content></ng-content>\n</div>", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthSnackbarContainerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-snackbar-container', template: "<div [hidden]=\"getSnackbarFeedback()==undefined && hiddenClass.trim()==''\" class=\"{{getSnackbarFeedback() == undefined ? hiddenClass :'uswagon-snackbar-container ' + class+' '+getSnackbarFeedback()?.type == 'error'? errorClass : successClass}}\">\n   <ng-content></ng-content>\n</div>" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { class: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRhaW5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGFpbmVyL3Vzd2Fnb24tYXV0aC1zbmFja2Jhci1jb250YWluZXIuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRhaW5lci91c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGFpbmVyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFRakQsTUFBTSxPQUFPLHFDQUFxQztJQU9oRCxZQUFvQixHQUFzQjtRQUF0QixRQUFHLEdBQUgsR0FBRyxDQUFtQjtRQU5qQyxVQUFLLEdBQVMsRUFBRSxDQUFDO1FBQ2pCLGVBQVUsR0FBUyxFQUFFLENBQUM7UUFDdEIsaUJBQVksR0FBUyxFQUFFLENBQUM7UUFDeEIsZ0JBQVcsR0FBVSxFQUFFLENBQUM7UUFDeEIsVUFBSyxHQUFVLElBQUksQ0FBQztRQUNwQixlQUFVLEdBQVcsS0FBSyxDQUFDO0lBQ1EsQ0FBQztJQUM3QyxtQkFBbUI7UUFDakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUUzQyxJQUFJLFFBQVEsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUN6RSw2REFBNkQ7WUFDN0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztZQUN4QyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDOytHQW5CVSxxQ0FBcUM7bUdBQXJDLHFDQUFxQyxpT0NSbEQsaVNBRU07OzRGRE1PLHFDQUFxQztrQkFMakQsU0FBUzsrQkFDRSxpQ0FBaUM7dUZBS2xDLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRhaW5lcicsXG4gIHRlbXBsYXRlVXJsOiAnLi91c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGFpbmVyLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRhaW5lci5jb21wb25lbnQuY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhTbmFja2JhckNvbnRhaW5lckNvbXBvbmVudCB7XG4gIEBJbnB1dCgpIGNsYXNzOnN0cmluZyA9Jyc7XG4gIEBJbnB1dCgpIGVycm9yQ2xhc3M6c3RyaW5nID0nJztcbiAgQElucHV0KCkgc3VjY2Vzc0NsYXNzOnN0cmluZyA9Jyc7XG4gIEBJbnB1dCgpIGhpZGRlbkNsYXNzOnN0cmluZyA9ICcnO1xuICBASW5wdXQoKSB0aW1lcjpudW1iZXIgPSAyMDAwO1xuICBASW5wdXQoKSBpc0luZmluaXRlOmJvb2xlYW4gPSBmYWxzZTtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBBUEk6VXN3YWdvbkF1dGhTZXJ2aWNlKXt9XG4gIGdldFNuYWNrYmFyRmVlZGJhY2soKXtcbiAgICBjb25zdCBmZWVkYmFjayA9IHRoaXMuQVBJLnNuYWNrYmFyRmVlZGJhY2s7XG4gIFxuICAgIGlmIChmZWVkYmFjayAhPT0gdW5kZWZpbmVkICYmICghdGhpcy5pc0luZmluaXRlICYmICFmZWVkYmFjay5pc0luZmluaXRlKSkge1xuICAgICAgLy8gU2V0IGEgdGltZXIgdG8gcmVzZXQgdGhlIHNuYWNrYmFyIGZlZWRiYWNrIGFmdGVyIDIgc2Vjb25kc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuQVBJLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICB9LCB0aGlzLnRpbWVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmVlZGJhY2s7XG4gIH1cbn1cbiIsIjxkaXYgW2hpZGRlbl09XCJnZXRTbmFja2JhckZlZWRiYWNrKCk9PXVuZGVmaW5lZCAmJiBoaWRkZW5DbGFzcy50cmltKCk9PScnXCIgY2xhc3M9XCJ7e2dldFNuYWNrYmFyRmVlZGJhY2soKSA9PSB1bmRlZmluZWQgPyBoaWRkZW5DbGFzcyA6J3Vzd2Fnb24tc25hY2tiYXItY29udGFpbmVyICcgKyBjbGFzcysnICcrZ2V0U25hY2tiYXJGZWVkYmFjaygpPy50eXBlID09ICdlcnJvcic/IGVycm9yQ2xhc3MgOiBzdWNjZXNzQ2xhc3N9fVwiPlxuICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuPC9kaXY+Il19