import { __awaiter } from 'tslib';
import * as i1 from '@angular/common/http';
import { HttpHeaders, HttpClientModule } from '@angular/common/http';
import * as i0 from '@angular/core';
import { Injectable, Component, Input, NgModule } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as i2 from '@angular/router';

class UswagonAuthService {
    constructor(http, router) {
        this.http = http;
        this.router = router;
        this.usedStorage = this.isLocalStorage() ? localStorage : sessionStorage;
        this.loading = false;
        this.authForm = {};
        this.emailNotification = false;
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
    /**
       * Initialize the service for the project
       * @param config - configuration that points the service to its appropriate server
       *
       * @example
       * this.auth.initialize({
       *  api:environment.api,
       *  apiKey: environment.apiKey,
       * })
       *
     **/
    initialize(config) {
        var _a;
        this.config = config;
        if (this.config.authMessages == undefined) {
            this.config.authMessages = {};
        }
        this.authForm = {};
        const role = this.accountLoggedIn();
        if (role != null) {
            this.router.navigate([(_a = this.config) === null || _a === void 0 ? void 0 : _a.redirect[role]]);
        }
    }
    validateInputFields() {
        var hasErrors = false;
        for (const key of Object.keys(this.authForm)) {
            const { value, validator, required } = this.authForm[key];
            if (required && value.trim() == '') {
                this.authForm[key].error = 'This field is required!';
                hasErrors = true;
            }
            else {
                if (validator) {
                    // check if validator is not custom
                    if (this.validators[validator] == null) {
                        try {
                            const regex = new RegExp(validator);
                            const isValid = regex.test(value);
                            if (!isValid) {
                                this.authForm[key].error = `${key.charAt(0).toUpperCase() + key.slice(1)} is not a valid input.`;
                                hasErrors = true;
                            }
                            else {
                                this.authForm[key].error = undefined;
                            }
                        }
                        catch (_a) {
                            alert('Custom validator should be on regex');
                            return false;
                        }
                    }
                    const regex = new RegExp(this.validators[validator].pattern);
                    const isValid = regex.test(value);
                    if (!isValid) {
                        this.authForm[key].error = this.validators[validator].message;
                        hasErrors = true;
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
        return !hasErrors;
    }
    clearForm() {
        for (const key of Object.keys(this.authForm)) {
            this.authForm[key].value = '';
            this.authForm[key].error = undefined;
        }
    }
    /**
       * Check if user is authenticated
       *
       * @example
       * const role = this.auth.accountLoggedIn()
       *
       * OUTPUT: role of user if authenticated, null if unauthenticated
     **/
    accountLoggedIn() {
        return this.usedStorage.getItem('logged_in');
    }
    logout() {
        var _a, _b;
        if (!this.accountLoggedIn()) {
            return;
        }
        this.usedStorage.clear();
        this.snackbarFeedback = undefined;
        this.snackbarFeedback = this.snackbarFeedback = {
            'type': 'success',
            'message': (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.authMessages.loggedOut) !== null && _b !== void 0 ? _b : 'Account has been logged out.',
        };
        this.router.navigate(['/']);
    }
    getAuthField(key) {
        return this.authForm[key];
    }
    initializeFormField(key, required, unique, type, aliases, encrypted, validator) {
        this.authForm[key] = { value: '', validator: validator, required: required, type: type, aliases: aliases, encrypted: encrypted, unique: unique };
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
            alert('Config must be initialized, try service.initialize(config)');
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
    hash(encrypt) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield firstValueFrom(this.post('get_hash', { encrypt: encrypt }));
            if (response.success) {
                return response.output;
            }
            else {
                return null;
            }
        });
    }
    register() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loading) {
                return;
            }
            if (((_a = this.config) === null || _a === void 0 ? void 0 : _a.registrationTable) == undefined) {
                alert('Registration table must be initialized.');
                return;
            }
            if (!this.validateInputFields()) {
                return;
            }
            this.loading = true;
            this.snackbarFeedback = {
                'type': 'neutral',
                'message': 'Loading...',
                isInfinite: true,
            };
            const newDate = new Date().getTime().toString();
            var visID;
            if ((_b = this.config) === null || _b === void 0 ? void 0 : _b.visibleID) {
                visID = `${this.config.visibleID}-` + newDate.substring(4, 7) + '-' + newDate.substring(7, 13);
            }
            const authFields = Object.keys(this.authForm);
            var values = {};
            for (let field of authFields) {
                let value = this.authForm[field].value;
                if (this.authForm[field].encrypted) {
                    const hash = yield this.hash(value);
                    if (hash) {
                        value = hash;
                    }
                    else {
                        this.snackbarFeedback = {
                            type: 'error',
                            message: 'Something went wrong, try again later...',
                        };
                        return;
                    }
                }
                values[field] = value;
            }
            const postObject = Object.assign(visID != null ? { visibleid: visID } : {}, this.config.verification ? { verified: false } : {}, { accountType: this.config.registrationTable }, values);
            this.post('register', { data: JSON.stringify(postObject) }).subscribe((data) => {
                var _a, _b, _c, _d, _e;
                this.loading = false;
                this.snackbarFeedback = undefined;
                if (data.success) {
                    // show proper snackbar
                    if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.verification) {
                        // wait for verification
                        this.snackbarFeedback = {
                            type: 'success',
                            message: (_c = (_b = this.config) === null || _b === void 0 ? void 0 : _b.authMessages.forVerification) !== null && _c !== void 0 ? _c : 'Please wait for account verification...'
                        };
                    }
                    else {
                        // successfully registered!`
                        this.snackbarFeedback = {
                            type: 'success',
                            message: (_e = (_d = this.config) === null || _d === void 0 ? void 0 : _d.authMessages.registered) !== null && _e !== void 0 ? _e : 'Registration was successful, you may now login with your credentials'
                        };
                        this.clearForm();
                    }
                }
                else {
                    alert(data.output);
                }
            });
        });
    }
    closeSnackbar() {
        this.snackbarFeedback = undefined;
    }
    login() {
        var _a;
        if (this.loading) {
            return;
        }
        if (((_a = this.config) === null || _a === void 0 ? void 0 : _a.loginTable) == undefined) {
            alert('Login table must be initialized.');
            return;
        }
        // check if username and password fields are present
        if (this.authForm['identifier'] == null || this.authForm['password'] == null) {
            alert('Please initialize identifier and password fields using [name]="field"');
            return;
        }
        if (this.authForm['identifier'].aliases == undefined || this.authForm['identifier'].aliases.length <= 0) {
            alert("Identifier field must be initialized with aliases=[aliases]");
            return;
        }
        if (!this.validateInputFields()) {
            return;
        }
        this.loading = true;
        this.snackbarFeedback = {
            'type': 'neutral',
            'message': 'Loading...',
            isInfinite: true,
        };
        return this.post('login', {
            identifierValue: this.authForm['identifier'].value,
            password: this.authForm['password'].value,
            tables: this.config.loginTable,
            identifierTypes: this.authForm['identifier'].aliases
        }).subscribe((data) => {
            var _a, _b, _c;
            this.loading = false;
            this.snackbarFeedback = undefined;
            this.snackbarFeedback = data.success ? {
                type: 'success',
                message: (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.authMessages.loggedIn) !== null && _b !== void 0 ? _b : 'Login Successful!'
            } : {
                type: 'error',
                message: data.output
            };
            if (data.success) {
                const user = data.output;
                this.usedStorage.setItem('logged_in', user.role);
                this.usedStorage.setItem('user_info', JSON.stringify(user));
                this.router.navigate([(_c = this.config) === null || _c === void 0 ? void 0 : _c.redirect[user.role]]);
            }
            else {
                this.snackbarFeedback = {
                    type: 'error',
                    message: data.output
                };
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
    login() {
        this.API.login();
    }
}
UswagonLoginButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLoginButtonComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonLoginButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonLoginButtonComponent, selector: "uswagon-login-button", inputs: { class: "class" }, ngImport: i0, template: "<button [class]=\"class + ' uswagon-login-button'\" (click)=\"login()\">\n    <ng-content></ng-content>\n</button>\n\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLoginButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-login-button', template: "<button [class]=\"class + ' uswagon-login-button'\" (click)=\"login()\">\n    <ng-content></ng-content>\n</button>\n\n" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }] } });

class UswagonAuthInputComponent {
    constructor(API) {
        this.API = API;
        this.required = false;
        this.type = 'text';
        this.unique = false;
        this.encrypted = false;
        this.class = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            alert('Uswagon Input Component must have a [name]="value" property');
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        this.API.initializeFormField(this.name, this.required, this.unique, this.type, this.aliases, this.encrypted, this.validator);
    }
    getInput() {
        return this.API.getAuthField(this.name).value;
    }
    handleInput(event) {
        this.API.handleFormValue(this.name, event.target.value);
    }
}
UswagonAuthInputComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthInputComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthInputComponent, selector: "uswagon-auth-input", inputs: { name: "name", required: "required", validator: "validator", type: "type", unique: "unique", aliases: "aliases", encrypted: "encrypted", class: "class" }, ngImport: i0, template: "<input [value]=\"getInput()\" [class]=\"class + ' uswagon-auth-input'\" [type]=\"type\" (change)=\"handleInput($event)\">", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-input', template: "<input [value]=\"getInput()\" [class]=\"class + ' uswagon-auth-input'\" [type]=\"type\" (change)=\"handleInput($event)\">" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { name: [{
                type: Input
            }], required: [{
                type: Input
            }], validator: [{
                type: Input
            }], type: [{
                type: Input
            }], unique: [{
                type: Input
            }], aliases: [{
                type: Input
            }], encrypted: [{
                type: Input
            }], class: [{
                type: Input
            }] } });

class UswagonAuthInputErrorComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.hiddenClass = '';
    }
    ngOnInit() {
        if (this.name == undefined) {
            alert('Uswagon Input Component must have a [name]="value" property');
            throw new Error('Uswagon Input Component must have a [name]="value" property');
        }
        const field = this.API.getAuthField(this.name);
        if (field == null) {
            alert('Uswagon Input Error Component must be connected to a text field with [name]="value" property');
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
UswagonAuthInputErrorComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthInputErrorComponent, selector: "uswagon-auth-input-error", inputs: { name: "name", class: "class", hiddenClass: "hiddenClass" }, ngImport: i0, template: "<div [hidden]=\"!hasError() && hiddenClass.trim() != ''\" [class]=\"class + ' uswagon-auth-input-error'\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthInputErrorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-input-error', template: "<div [hidden]=\"!hasError() && hiddenClass.trim() != ''\" [class]=\"class + ' uswagon-auth-input-error'\">{{getErrorMessage()}}\n    <ng-content></ng-content>\n</div>\n" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { name: [{
                type: Input
            }], class: [{
                type: Input
            }], hiddenClass: [{
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
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    register() {
        this.API.register();
    }
}
UswagonRegisterButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonRegisterButtonComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonRegisterButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonRegisterButtonComponent, selector: "uswagon-register-button", inputs: { class: "class" }, ngImport: i0, template: "<button [class]=\"class\" (click)=\"register()\">\n    <ng-content></ng-content>\n</button>", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonRegisterButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-register-button', template: "<button [class]=\"class\" (click)=\"register()\">\n    <ng-content></ng-content>\n</button>" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }] } });

class UswagonAuthSnackbarCloseComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.errorClass = '';
        this.successClass = '';
    }
    getSnackbarFeedback() {
        return this.API.snackbarFeedback;
    }
    close() {
        return this.API.closeSnackbar();
    }
}
UswagonAuthSnackbarCloseComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarCloseComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthSnackbarCloseComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthSnackbarCloseComponent, selector: "uswagon-auth-snackbar-close", inputs: { class: "class", errorClass: "errorClass", successClass: "successClass" }, ngImport: i0, template: "<button   [class]=\"'uswagon-snackbar-close '+ class +' '+ getSnackbarFeedback()?.type == 'error'? errorClass : successClass\" (click)=\"close()\">x</button>", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarCloseComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-snackbar-close', template: "<button   [class]=\"'uswagon-snackbar-close '+ class +' '+ getSnackbarFeedback()?.type == 'error'? errorClass : successClass\" (click)=\"close()\">x</button>" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }], errorClass: [{
                type: Input
            }], successClass: [{
                type: Input
            }] } });

class UswagonAuthSnackbarContainerComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.errorClass = '';
        this.successClass = '';
        this.hiddenClass = '';
        this.timer = 2000;
        this.isInfinite = false;
    }
    getSnackbarFeedback() {
        const feedback = this.API.snackbarFeedback;
        if (feedback !== undefined && (!this.isInfinite && !feedback.isInfinite)) {
            // Set a timer to reset the snackbar feedback after 2 seconds
            setTimeout(() => {
                this.API.snackbarFeedback = undefined;
            }, this.timer);
        }
        return feedback;
    }
}
UswagonAuthSnackbarContainerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarContainerComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthSnackbarContainerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthSnackbarContainerComponent, selector: "uswagon-auth-snackbar-container", inputs: { class: "class", errorClass: "errorClass", successClass: "successClass", hiddenClass: "hiddenClass", timer: "timer", isInfinite: "isInfinite" }, ngImport: i0, template: "<div [hidden]=\"getSnackbarFeedback()==undefined && hiddenClass.trim()==''\" class=\"{{getSnackbarFeedback() == undefined ? hiddenClass :'uswagon-snackbar-container ' + class+' '+getSnackbarFeedback()?.type == 'error'? errorClass : successClass}}\">\n   <ng-content></ng-content>\n</div>", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarContainerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-snackbar-container', template: "<div [hidden]=\"getSnackbarFeedback()==undefined && hiddenClass.trim()==''\" class=\"{{getSnackbarFeedback() == undefined ? hiddenClass :'uswagon-snackbar-container ' + class+' '+getSnackbarFeedback()?.type == 'error'? errorClass : successClass}}\">\n   <ng-content></ng-content>\n</div>" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }], errorClass: [{
                type: Input
            }], successClass: [{
                type: Input
            }], hiddenClass: [{
                type: Input
            }], timer: [{
                type: Input
            }], isInfinite: [{
                type: Input
            }] } });

class UswagonAuthSnackbarContentComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
        this.errorClass = '';
        this.successClass = '';
    }
    getSnackbarFeedback() {
        return this.API.snackbarFeedback;
    }
}
UswagonAuthSnackbarContentComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarContentComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonAuthSnackbarContentComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonAuthSnackbarContentComponent, selector: "uswagon-auth-snackbar-content", inputs: { class: "class", errorClass: "errorClass", successClass: "successClass" }, ngImport: i0, template: "<div [class]=\"'uswagon-snackbar-content '+ class + getSnackbarFeedback()?.type == 'error'? errorClass : successClass\">\n    {{getSnackbarFeedback()?.message}}\n</div>\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthSnackbarContentComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-auth-snackbar-content', template: "<div [class]=\"'uswagon-snackbar-content '+ class + getSnackbarFeedback()?.type == 'error'? errorClass : successClass\">\n    {{getSnackbarFeedback()?.message}}\n</div>\n" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }], errorClass: [{
                type: Input
            }], successClass: [{
                type: Input
            }] } });

class UswagonLogoutButtonComponent {
    constructor(API) {
        this.API = API;
        this.class = '';
    }
    logout() {
        this.API.logout();
    }
}
UswagonLogoutButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLogoutButtonComponent, deps: [{ token: UswagonAuthService }], target: i0.ɵɵFactoryTarget.Component });
UswagonLogoutButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: UswagonLogoutButtonComponent, selector: "uswagon-logout-button", inputs: { class: "class" }, ngImport: i0, template: "<button [class]=\"class + ' uswagon-logout-button'\" (click)=\"logout()\">\n    <ng-content></ng-content>\n</button>\n\n", styles: [""] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonLogoutButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'uswagon-logout-button', template: "<button [class]=\"class + ' uswagon-logout-button'\" (click)=\"logout()\">\n    <ng-content></ng-content>\n</button>\n\n" }]
        }], ctorParameters: function () { return [{ type: UswagonAuthService }]; }, propDecorators: { class: [{
                type: Input
            }] } });

class UswagonAuthModule {
}
UswagonAuthModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
UswagonAuthModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.10", ngImport: i0, type: UswagonAuthModule, declarations: [UswagonLoginButtonComponent,
        UswagonRegisterButtonComponent,
        UswagonAuthInputComponent,
        UswagonRememberMeComponent,
        UswagonAuthInputErrorComponent,
        UswagonAuthSnackbarContentComponent,
        UswagonAuthSnackbarContainerComponent,
        UswagonAuthSnackbarCloseComponent,
        UswagonLogoutButtonComponent], imports: [HttpClientModule], exports: [UswagonLogoutButtonComponent,
        UswagonAuthSnackbarContentComponent,
        UswagonAuthSnackbarContainerComponent,
        UswagonAuthSnackbarCloseComponent,
        UswagonLoginButtonComponent,
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
                        UswagonAuthSnackbarContentComponent,
                        UswagonAuthSnackbarContainerComponent,
                        UswagonAuthSnackbarCloseComponent,
                        UswagonLogoutButtonComponent,
                    ],
                    imports: [
                        HttpClientModule
                    ],
                    exports: [
                        UswagonLogoutButtonComponent,
                        UswagonAuthSnackbarContentComponent,
                        UswagonAuthSnackbarContainerComponent,
                        UswagonAuthSnackbarCloseComponent,
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

export { UswagonAuthInputComponent, UswagonAuthInputErrorComponent, UswagonAuthModule, UswagonAuthService, UswagonAuthSnackbarCloseComponent, UswagonAuthSnackbarContainerComponent, UswagonAuthSnackbarContentComponent, UswagonLoginButtonComponent, UswagonLogoutButtonComponent, UswagonRegisterButtonComponent, UswagonRememberMeComponent };
//# sourceMappingURL=uswagon-auth.mjs.map
