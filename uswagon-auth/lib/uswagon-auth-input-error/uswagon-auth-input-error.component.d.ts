import { OnInit } from '@angular/core';
import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonAuthInputErrorComponent implements OnInit {
    private API;
    name: string | undefined;
    class: string;
    hiddenClass: string;
    constructor(API: UswagonAuthService);
    ngOnInit(): void;
    hasError(): boolean;
    getErrorMessage(): string | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthInputErrorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonAuthInputErrorComponent, "uswagon-auth-input-error", never, { "name": { "alias": "name"; "required": false; }; "class": { "alias": "class"; "required": false; }; "hiddenClass": { "alias": "hiddenClass"; "required": false; }; }, {}, never, ["*"], false, never>;
}
