import * as i0 from '@angular/core';
import { Injectable, Component, NgModule } from '@angular/core';

class UswagonAuthService {
    constructor() { }
}
UswagonAuthService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
UswagonAuthService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: function () { return []; } });

class UswagonAuthComponent {
}
UswagonAuthComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthComponent, selector: "lib-uswagon-auth", ngImport: i0, template: `
    <p>
      uswagon-auth works!
    </p>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-uswagon-auth', template: `
    <p>
      uswagon-auth works!
    </p>
  ` }]
        }] });

class UswagonAuthModule {
}
UswagonAuthModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
UswagonAuthModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, declarations: [UswagonAuthComponent], exports: [UswagonAuthComponent] });
UswagonAuthModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        UswagonAuthComponent
                    ],
                    imports: [],
                    exports: [
                        UswagonAuthComponent
                    ]
                }]
        }] });

/*
 * Public API Surface of uswagon-auth
 */

/**
 * Generated bundle index. Do not edit.
 */

export { UswagonAuthComponent, UswagonAuthModule, UswagonAuthService };
//# sourceMappingURL=uswagon-auth.mjs.map
