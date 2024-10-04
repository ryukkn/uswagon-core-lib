import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonAuthSnackbarContainerComponent {
    private API;
    class: string;
    errorClass: string;
    successClass: string;
    hiddenClass: string;
    timer: number;
    isInfinite: boolean;
    constructor(API: UswagonAuthService);
    getSnackbarFeedback(): import("uswagon-auth").SnackbarFeedback | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthSnackbarContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonAuthSnackbarContainerComponent, "uswagon-auth-snackbar-container", never, { "class": "class"; "errorClass": "errorClass"; "successClass": "successClass"; "hiddenClass": "hiddenClass"; "timer": "timer"; "isInfinite": "isInfinite"; }, {}, never, ["*"], false, never>;
}
