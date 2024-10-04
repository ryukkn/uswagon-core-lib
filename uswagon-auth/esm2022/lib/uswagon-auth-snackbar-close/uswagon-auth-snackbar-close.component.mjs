import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonAuthSnackbarCloseComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.errorClass = '';
        this.successClass = '';
    }
    getSnackbarFeedback() {
        return this.API.snackbarFeedback;
    }
    close() {
        return this.API.closeSnackbar();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: UswagonAuthSnackbarCloseComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: UswagonAuthSnackbarCloseComponent, selector: "uswagon-auth-snackbar-close", inputs: { class: "class", errorClass: "errorClass", successClass: "successClass" }, ngImport: i0, template: "<button   [class]=\"'uswagon-snackbar-close '+ class +' '+ getSnackbarFeedback()?.type == 'error'? errorClass : successClass\" (click)=\"close()\">x</button>", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: UswagonAuthSnackbarCloseComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-snackbar-close', template: "<button   [class]=\"'uswagon-snackbar-close '+ class +' '+ getSnackbarFeedback()?.type == 'error'? errorClass : successClass\" (click)=\"close()\">x</button>" }]
        }], ctorParameters: function () { return [{ type: i1.UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }], errorClass: [{
                type: Input
            }], successClass: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNsb3NlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3Vzd2Fnb24tYXV0aC9zcmMvbGliL3Vzd2Fnb24tYXV0aC1zbmFja2Jhci1jbG9zZS91c3dhZ29uLWF1dGgtc25hY2tiYXItY2xvc2UuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1hdXRoLXNuYWNrYmFyLWNsb3NlL3Vzd2Fnb24tYXV0aC1zbmFja2Jhci1jbG9zZS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBUWpELE1BQU0sT0FBTyxpQ0FBaUM7SUFJNUMsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFIakMsVUFBSyxHQUFVLEVBQUUsQ0FBQztRQUNsQixlQUFVLEdBQVMsRUFBRSxDQUFDO1FBQ3RCLGlCQUFZLEdBQVMsRUFBRSxDQUFDO0lBQ1csQ0FBQztJQUM3QyxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLO1FBQ0gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7K0dBWFUsaUNBQWlDO21HQUFqQyxpQ0FBaUMsdUpDUjlDLCtKQUF5Sjs7NEZEUTVJLGlDQUFpQztrQkFMN0MsU0FBUzsrQkFDRSw2QkFBNkI7eUdBSzlCLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBVc3dhZ29uQXV0aFNlcnZpY2UgfSBmcm9tICcuLi91c3dhZ29uLWF1dGguc2VydmljZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3Vzd2Fnb24tYXV0aC1zbmFja2Jhci1jbG9zZScsXG4gIHRlbXBsYXRlVXJsOiAnLi91c3dhZ29uLWF1dGgtc25hY2tiYXItY2xvc2UuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi91c3dhZ29uLWF1dGgtc25hY2tiYXItY2xvc2UuY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoU25hY2tiYXJDbG9zZUNvbXBvbmVudCB7XG4gIEBJbnB1dCgpIGNsYXNzOnN0cmluZyA9ICcnO1xuICBASW5wdXQoKSBlcnJvckNsYXNzOnN0cmluZyA9Jyc7XG4gIEBJbnB1dCgpIHN1Y2Nlc3NDbGFzczpzdHJpbmcgPScnO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIEFQSTpVc3dhZ29uQXV0aFNlcnZpY2Upe31cbiAgZ2V0U25hY2tiYXJGZWVkYmFjaygpe1xuICAgIHJldHVybiB0aGlzLkFQSS5zbmFja2JhckZlZWRiYWNrO1xuICB9XG5cbiAgY2xvc2UoKXtcbiAgICByZXR1cm4gdGhpcy5BUEkuY2xvc2VTbmFja2JhcigpO1xuICB9XG59XG4iLCI8YnV0dG9uICAgW2NsYXNzXT1cIid1c3dhZ29uLXNuYWNrYmFyLWNsb3NlICcrIGNsYXNzICsnICcrIGdldFNuYWNrYmFyRmVlZGJhY2soKT8udHlwZSA9PSAnZXJyb3InPyBlcnJvckNsYXNzIDogc3VjY2Vzc0NsYXNzXCIgKGNsaWNrKT1cImNsb3NlKClcIj54PC9idXR0b24+Il19