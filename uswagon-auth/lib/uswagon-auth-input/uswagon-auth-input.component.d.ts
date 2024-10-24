import { OnInit } from '@angular/core';
import { UswagonAuthService } from '../uswagon-auth.service';
import * as i0 from "@angular/core";
export declare class UswagonAuthInputComponent implements OnInit {
    private API;
    name: string | undefined;
    placeholder: string;
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
    static ɵcmp: i0.ɵɵComponentDeclaration<UswagonAuthInputComponent, "uswagon-auth-input", never, { "name": { "alias": "name"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "required": { "alias": "required"; "required": false; }; "validator": { "alias": "validator"; "required": false; }; "type": { "alias": "type"; "required": false; }; "unique": { "alias": "unique"; "required": false; }; "aliases": { "alias": "aliases"; "required": false; }; "encrypted": { "alias": "encrypted"; "required": false; }; "class": { "alias": "class"; "required": false; }; }, {}, never, never, false, never>;
}
