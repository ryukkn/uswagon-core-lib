import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonLoginButtonComponent {
    private API;
    class: string;
    constructor(API: UswagonAuthService);
    login(username: string, password: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonLoginButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonLoginButtonComponent, "uswagon-login-button", never, { "class": "class"; }, {}, never, ["*"], false, never>;
}
