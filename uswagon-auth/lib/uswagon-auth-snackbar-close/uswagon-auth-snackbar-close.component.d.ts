import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonAuthSnackbarCloseComponent {
    private API;
    class: string;
    errorClass: string;
    successClass: string;
    constructor(API: UswagonAuthService);
    getSnackbarFeedback(): import("uswagon-auth").SnackbarFeedback | undefined;
    close(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthSnackbarCloseComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonAuthSnackbarCloseComponent, "uswagon-auth-snackbar-close", never, { "class": { "alias": "class"; "required": false; }; "errorClass": { "alias": "errorClass"; "required": false; }; "successClass": { "alias": "successClass"; "required": false; }; }, {}, never, never, false, never>;
}
