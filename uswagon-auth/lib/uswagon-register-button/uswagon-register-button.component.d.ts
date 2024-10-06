import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonRegisterButtonComponent {
    private API;
    class: string;
    constructor(API: UswagonAuthService);
    register(): void;
    isLoading(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonRegisterButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonRegisterButtonComponent, "uswagon-register-button", never, { "class": { "alias": "class"; "required": false; }; }, {}, never, ["*"], false, never>;
}
