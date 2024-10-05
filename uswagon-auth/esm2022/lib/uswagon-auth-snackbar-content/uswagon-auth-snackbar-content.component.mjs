import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthSnackbarContentComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.errorClass = '';
        this.successClass = '';
    }
    getSnackbarFeedback() {
        return this.API.snackbarFeedback;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthSnackbarContentComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonAuthSnackbarContentComponent, selector: "uswagon-auth-snackbar-content", inputs: { class: "class", errorClass: "errorClass", successClass: "successClass" }, ngImport: i0, template: "<div [class]=\"'uswagon-snackbar-content '+ class + ' ' + getSnackbarFeedback()?.type == 'error'? errorClass : successClass\">\n    {{getSnackbarFeedback()?.message}}\n</div>\n", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthSnackbarContentComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-snackbar-content', template: "<div [class]=\"'uswagon-snackbar-content '+ class + ' ' + getSnackbarFeedback()?.type == 'error'? errorClass : successClass\">\n    {{getSnackbarFeedback()?.message}}\n</div>\n" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { class: [{
                type: Input
            }], errorClass: [{
                type: Input
            }], successClass: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRlbnQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRlbnQvdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRlbnQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRlbnQvdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRlbnQuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVFqRCxNQUFNLE9BQU8sbUNBQW1DO0lBSTlDLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBSGpDLFVBQUssR0FBUyxFQUFFLENBQUM7UUFDakIsZUFBVSxHQUFTLEVBQUUsQ0FBQztRQUN0QixpQkFBWSxHQUFTLEVBQUUsQ0FBQztJQUNXLENBQUM7SUFDN0MsbUJBQW1CO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztJQUNuQyxDQUFDOytHQVBVLG1DQUFtQzttR0FBbkMsbUNBQW1DLHlKQ1JoRCxrTEFHQTs7NEZES2EsbUNBQW1DO2tCQUwvQyxTQUFTOytCQUNFLCtCQUErQjt1RkFLaEMsS0FBSztzQkFBYixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVzd2Fnb25BdXRoU2VydmljZSB9IGZyb20gJy4uL3Vzd2Fnb24tYXV0aC5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRlbnQnLFxuICB0ZW1wbGF0ZVVybDogJy4vdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNvbnRlbnQuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLWF1dGgtc25hY2tiYXItY29udGVudC5jb21wb25lbnQuY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhTbmFja2JhckNvbnRlbnRDb21wb25lbnQge1xuICBASW5wdXQoKSBjbGFzczpzdHJpbmcgPScnO1xuICBASW5wdXQoKSBlcnJvckNsYXNzOnN0cmluZyA9Jyc7XG4gIEBJbnB1dCgpIHN1Y2Nlc3NDbGFzczpzdHJpbmcgPScnO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIEFQSTpVc3dhZ29uQXV0aFNlcnZpY2Upe31cbiAgZ2V0U25hY2tiYXJGZWVkYmFjaygpe1xuICAgIHJldHVybiB0aGlzLkFQSS5zbmFja2JhckZlZWRiYWNrO1xuICB9XG59XG4iLCI8ZGl2IFtjbGFzc109XCIndXN3YWdvbi1zbmFja2Jhci1jb250ZW50ICcrIGNsYXNzICsgJyAnICsgZ2V0U25hY2tiYXJGZWVkYmFjaygpPy50eXBlID09ICdlcnJvcic/IGVycm9yQ2xhc3MgOiBzdWNjZXNzQ2xhc3NcIj5cbiAgICB7e2dldFNuYWNrYmFyRmVlZGJhY2soKT8ubWVzc2FnZX19XG48L2Rpdj5cbiJdfQ==