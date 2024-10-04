import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonAuthSnackbarContentComponent {
    private API;
    class: string;
    errorClass: string;
    successClass: string;
    constructor(API: UswagonAuthService);
    getSnackbarFeedback(): import("uswagon-auth").SnackbarFeedback | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthSnackbarContentComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonAuthSnackbarContentComponent, "uswagon-auth-snackbar-content", never, { "class": "class"; "errorClass": "errorClass"; "successClass": "successClass"; }, {}, never, never, false, never>;
}
