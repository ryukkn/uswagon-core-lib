import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonRememberMeComponent {
    private API;
    constructor(API: UswagonAuthService);
    persistent: boolean;
    togglePersistentLogin(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonRememberMeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonRememberMeComponent, "lib-uswagon-remember-me", never, {}, {}, never, never, false, never>;
}
