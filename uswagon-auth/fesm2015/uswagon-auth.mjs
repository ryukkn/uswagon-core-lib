import * as i1 from '@angular/common/http';
import { HttpHeaders, HttpClientModule } from '@angular/common/http';
import * as i0 from '@angular/core';
import { Injectable, Component, Input, NgModule } from '@angular/core';
import * as i2 from '@angular/router';

class UswagonAuthService {
    constructor(http, router) {
        this.http = http;
        this.router = router;
        this.usedStorage = this.isLocalStorage() ? localStorage : sessionStorage;
        this.loading = false;
        this.snackbarFeedback = '';
        this.authForm = {};
        this.validators = {
            email: {
                pattern: '^[\\w-.]+@[\\w-]+\\.[a-zA-Z]{2,}([.][a-zA-Z]{2,})*$',
                message: 'Email is not valid.'
            },
            password: {
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$',
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            },
            phone: {
                pattern: '^(\\+\\d{1,3}\\s?)?\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}$',
                message: 'Phone number must be in a valid format.'
            },
            username: {
                pattern: '^[a-zA-Z0-9]{3,15}$',
                message: 'Username must be 3-15 characters long and can only contain letters and numbers.'
            },
            creditCard: {
                pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|7[0-9]{15})$',
                message: 'Invalid credit card number.'
            },
            postalCode: {
                pattern: '^\\d{5}(-\\d{4})?$',
                message: 'Postal code must be in the format 12345 or 12345-6789.'
            },
        };
    }
    initialize(config) {
        this.config = config;
        this.authForm = {};
    }
    validateInputFields() {
        for (const key of Object.keys(this.authForm)) {
            const { value, validator, required } = this.authForm[key];
            if (required && value.trim() == '') {
                this.authForm[key].error = 'This field is required!';
            }
            else {
                if (validator) {
                    // check if validator is not custom
                    if (this.validators[validator] == null) {
                        try {
                            const regex = new RegExp(validator);
                            const isValid = regex.test(value);
                            this.authForm[key].error = `${key.charAt(0).toUpperCase() + key.slice(1)} is not a valid input.`;
                            return;
                        }
                        catch (_a) {
                            throw new Error('Custom validator should be on regex');
                        }
                    }
                    const regex = new RegExp(this.validators[validator].pattern);
                    const isValid = regex.test(value);
                    if (!isValid) {
                        this.authForm[key].error = this.validators[validator].message;
                    }
                    else {
                        this.authForm[key].error = undefined;
                    }
                }
                else {
                    this.authForm[key].error = undefined;
                }
            }
        }
    }
    getAuthField(key) {
        return this.authForm[key];
    }
    initializeFormField(key, required, type, validator) {
        this.authForm[key] = { value: '', validator: validator, required: required, type: type };
    }
    handleFormValue(key, value) {
        this.authForm[key].value = value;
    }
    isLocalStorage() {
        const storage = localStorage.getItem('storage');
        return storage == 'local';
    }
    getSavedEmail() {
        const email = localStorage.getItem('remember');
        return email;
    }
    useLocalStorage() {
        localStorage.setItem('storage', 'local');
    }
    useSessionStorage() {
        localStorage.setItem('storage', 'session');
    }
    post(method, body) {
        var _a, _b;
        if (this.config == undefined) {
            throw new Error('Config must be initialized, try service.initialize(config)');
        }
        for (var [key, obj] of Object.entries(body)) {
            if (key == 'values') {
                for (var [field, value] of Object.entries(obj)) {
                    obj[field] = value !== null && value !== void 0 ? value : '';
                }
            }
        }
        const headers = new HttpHeaders({
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
        const salt = new Date().getTime();
        return this.http.post(((_a = this.config) === null || _a === void 0 ? void 0 : _a.api) + '?' + salt, JSON.stringify(Object.assign({
            API_KEY: (_b = this.config) === null || _b === void 0 ? void 0 : _b.apiKey,
            Method: method,
        }, body)), { headers });
    }
    login() {
        // check if username and password fields are present
        if (this.authForm['username'] == null || this.authForm['password'] == null) {
            throw new Error('Please initialize username and password fields using [name]="field"');
        }
        this.loading = true;
        return this.post('login', {
            Username: this.authForm['username'].value,
            Password: this.authForm['password'].value,
        }).subscribe((data) => {
            var _a;
            this.loading = false;
            this.snackbarFeedback = data.success ? 'Login Successful!' : data.output;
            if (data.success) {
                this.usedStorage.setItem('logged_in', data.output.accountType.toString());
                var account = 'student';
                switch (parseInt(data.output.accountType.toString())) {
                    case 0:
                        account = 'student';
                        break;
                    case 1:
                        account = 'teacher';
                        break;
                    case 2:
                        account = 'admin';
                        break;
                }
                const user = data.output;
                this.usedStorage.setItem('user_info', JSON.stringify(user));
                this.router.navigate([(_a = this.config) === null || _a === void 0 ? void 0 : _a.redirect[account]]);
            }
        });
    }
}
UswagonAuthService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthService, deps: [{ token: i1.HttpClient }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable });
UswagonAuthService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: function () { return [{ type: i1.HttpClient }, { type: i2.Router }]; } });

class UswagonLoginButtonComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    login(username, password) {
        this.API.login();
    }
}
UswagonLoginButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLoginButtonComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonLoginButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonLoginButtonComponent, selector: "uswagon-login-button", inputs: { class: "class" }, ngImport: i0, template: "<button [class]=\"class\">\n    <ng-content></ng-content>\n</button>", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLoginButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-login-button', template: "<button [class]=\"class\">\n    <ng-content></ng-content>\n</button>" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }] } });

class UswagonAuthInputComponent {
    constructor(API) {
        this.API = API;
        this.required = false;
        this.type = 'text';
        this.class = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        this.API.initializeFormField(this.name, this.required, this.type, this.validator);
    }
    handleInput(event) {
        this.API.handleFormValue(this.name, event.target.value);
    }
}
UswagonAuthInputComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthInputComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthInputComponent, selector: "uswagon-auth-input", inputs: { name: "name", required: "required", validator: "validator", type: "type", class: "class" }, ngImport: i0, template: "<input [class]=\"class\" [type]=\"type\">", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-input', template: "<input [class]=\"class\" [type]=\"type\">" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { name: [{
                type: Input
            }], required: [{
                type: Input
            }], validator: [{
                type: Input
            }], type: [{
                type: Input
            }], class: [{
                type: Input
            }] } });

class UswagonAuthInputErrorComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        const field = this.API.getAuthField(this.name);
        if (field == null) {
            throw new Error('Uswagon Input Error Component must be connected to a text field with [name]="value" property');
        }
    }
    hasError() {
        return this.API.getAuthField(this.name).error != null;
    }
    getErrorMessage() {
        return this.API.getAuthField(this.name).error;
    }
}
UswagonAuthInputErrorComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputErrorComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthInputErrorComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthInputErrorComponent, selector: "lib-uswagon-auth-input-error", inputs: { name: "name", class: "class" }, ngImport: i0, template: "<div [hidden]=\"!hasError()\" [class]=\"class\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputErrorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-uswagon-auth-input-error', template: "<div [hidden]=\"!hasError()\" [class]=\"class\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { name: [{
                type: Input
            }], class: [{
                type: Input
            }] } });

class UswagonRememberMeComponent {
    constructor(API) {
        this.API = API;
        this.persistent = this.API.isLocalStorage();
    }
    togglePersistentLogin() {
        this.persistent = !this.persistent;
        if (this.persistent) {
            this.API.useLocalStorage();
        }
        else {
            this.API.useSessionStorage();
        }
    }
}
UswagonRememberMeComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonRememberMeComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonRememberMeComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonRememberMeComponent, selector: "lib-uswagon-remember-me", ngImport: i0, template: "<input type=\"checkbox\" [value]=\"persistent\" (click)=\"togglePersistentLogin()\">\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonRememberMeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-uswagon-remember-me', template: "<input type=\"checkbox\" [value]=\"persistent\" (click)=\"togglePersistentLogin()\">\n" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; } });

class UswagonRegisterButtonComponent {
}
UswagonRegisterButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonRegisterButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
UswagonRegisterButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonRegisterButtonComponent, selector: "uswagon-register-button", ngImport: i0, template: "<p>uswagon-register-button works!</p>\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonRegisterButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-register-button', template: "<p>uswagon-register-button works!</p>\n" }]
        }] });

class UswagonAuthModule {
}
UswagonAuthModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
UswagonAuthModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, declarations: [UswagonLoginButtonComponent,
        UswagonRegisterButtonComponent,
        UswagonAuthInputComponent,
        UswagonRememberMeComponent,
        UswagonAuthInputErrorComponent], imports: [HttpClientModule], exports: [UswagonLoginButtonComponent,
        UswagonRegisterButtonComponent,
        UswagonAuthInputComponent,
        UswagonRememberMeComponent,
        UswagonAuthInputErrorComponent] });
UswagonAuthModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, imports: [HttpClientModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        UswagonLoginButtonComponent,
                        UswagonRegisterButtonComponent,
                        UswagonAuthInputComponent,
                        UswagonRememberMeComponent,
                        UswagonAuthInputErrorComponent,
                    ],
                    imports: [
                        HttpClientModule
                    ],
                    exports: [
                        UswagonLoginButtonComponent,
                        UswagonRegisterButtonComponent,
                        UswagonAuthInputComponent,
                        UswagonRememberMeComponent,
                        UswagonAuthInputErrorComponent,
                    ]
                }]
        }] });

;

/*
 * Public API Surface of uswagon-auth
 */

/**
 * Generated bundle index. Do not edit.
 */

export { UswagonAuthInputComponent, UswagonAuthInputErrorComponent, UswagonAuthModule, UswagonAuthService, UswagonLoginButtonComponent, UswagonRegisterButtonComponent, UswagonRememberMeComponent };
//# sourceMappingURL=uswagon-auth.mjs.map
