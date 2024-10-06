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
    timeout: any;
    getSnackbarFeedback(): import("uswagon-auth").SnackbarFeedback | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthSnackbarContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonAuthSnackbarContainerComponent, "uswagon-auth-snackbar-container", never, { "class": { "alias": "class"; "required": false; }; "errorClass": { "alias": "errorClass"; "required": false; }; "successClass": { "alias": "successClass"; "required": false; }; "hiddenClass": { "alias": "hiddenClass"; "required": false; }; "timer": { "alias": "timer"; "required": false; }; "isInfinite": { "alias": "isInfinite"; "required": false; }; }, {}, never, ["*"], false, never>;
}
