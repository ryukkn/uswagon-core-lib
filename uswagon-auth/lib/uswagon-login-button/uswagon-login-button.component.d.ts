import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonLoginButtonComponent {
    private API;
    class: string;
    constructor(API: UswagonAuthService);
    login(): void;
    isLoading(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonLoginButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonLoginButtonComponent, "uswagon-login-button", never, { "class": { "alias": "class"; "required": false; }; }, {}, never, ["*"], false, never>;
}
