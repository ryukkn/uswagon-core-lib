import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../uswagon-auth.service";
export class UswagonRegisterButtonComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    register() {
        this.API.register();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonRegisterButtonComponent, deps: [{ token: i1.UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: UswagonRegisterButtonComponent, selector: "uswagon-register-button", inputs: { class: "class" }, ngImport: i0, template: "<button [class]=\"class\" (click)=\"register()\">\n    <ng-content></ng-content>\n</button>", styles: [""] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonRegisterButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-register-button', template: "<button [class]=\"class\" (click)=\"register()\">\n    <ng-content></ng-content>\n</button>" }]
        }], ctorParameters: () => [{ type: i1.UswagonAuthService }], propDecorators: { class: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1yZWdpc3Rlci1idXR0b24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1yZWdpc3Rlci1idXR0b24vdXN3YWdvbi1yZWdpc3Rlci1idXR0b24uY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvdXN3YWdvbi1hdXRoL3NyYy9saWIvdXN3YWdvbi1yZWdpc3Rlci1idXR0b24vdXN3YWdvbi1yZWdpc3Rlci1idXR0b24uY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQVNqRCxNQUFNLE9BQU8sOEJBQThCO0lBR3pDLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBRmpDLFVBQUssR0FBUyxFQUFFLENBQUM7SUFFa0IsQ0FBQztJQUc3QyxRQUFRO1FBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN0QixDQUFDOytHQVJVLDhCQUE4QjttR0FBOUIsOEJBQThCLDJGQ1QzQyw2RkFFUzs7NEZET0ksOEJBQThCO2tCQUwxQyxTQUFTOytCQUNFLHlCQUF5Qjt1RkFLMUIsS0FBSztzQkFBYixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVXN3YWdvbkF1dGhTZXJ2aWNlIH0gZnJvbSAnLi4vdXN3YWdvbi1hdXRoLnNlcnZpY2UnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3Vzd2Fnb24tcmVnaXN0ZXItYnV0dG9uJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3Vzd2Fnb24tcmVnaXN0ZXItYnV0dG9uLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdXN3YWdvbi1yZWdpc3Rlci1idXR0b24uY29tcG9uZW50LmNzcyddXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25SZWdpc3RlckJ1dHRvbkNvbXBvbmVudCB7XG4gIEBJbnB1dCgpIGNsYXNzOnN0cmluZyA9Jyc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBBUEk6VXN3YWdvbkF1dGhTZXJ2aWNlKXt9XG4gIFxuXG4gIHJlZ2lzdGVyKCl7XG4gICAgdGhpcy5BUEkucmVnaXN0ZXIoKTtcbiAgfVxufVxuIiwiPGJ1dHRvbiBbY2xhc3NdPVwiY2xhc3NcIiAoY2xpY2spPVwicmVnaXN0ZXIoKVwiPlxuICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbjwvYnV0dG9uPiJdfQ==