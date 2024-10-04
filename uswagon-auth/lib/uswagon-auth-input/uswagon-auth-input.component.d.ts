import { OnInit } from '@angular/core';
import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonAuthInputComponent implements OnInit {
    private API;
    name: string | undefined;
    required: boolean;
    validator?: string;
    type: string;
    unique: boolean;
    aliases?: string[];
    encrypted: boolean;
    class: string;
    constructor(API: UswagonAuthService);
    ngOnInit(): void;
    getInput(): any;
    handleInput(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonAuthInputComponent, "uswagon-auth-input", never, { "name": "name"; "required": "required"; "validator": "validator"; "type": "type"; "unique": "unique"; "aliases": "aliases"; "encrypted": "encrypted"; "class": "class"; }, {}, never, never, false, never>;
}
