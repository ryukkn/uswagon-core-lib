import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/router";
export class UswagonAuthService {
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
       *  registrationTable: 'teachers', // can be undefined login
       *  loginTable: ['teachers', 'administrators', 'students']
       *  redirect:{
       *    'students': '/student',
       *    'teachers': '/teacher',
       *    'administrators': '/admin',
       *   }
       * })
       *
     **/
    initialize(config) {
        this.config = config;
        if (this.config.authMessages == undefined) {
            this.config.authMessages = {};
        }
        this.authForm = {};
        const role = this.accountLoggedIn();
        if (role != null) {
            this.router.navigate([this.config?.redirect[role]]);
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
                        catch {
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
        if (!this.accountLoggedIn()) {
            return;
        }
        this.usedStorage.clear();
        this.snackbarFeedback = undefined;
        this.snackbarFeedback = this.snackbarFeedback = {
            'type': 'success',
            'message': this.config?.authMessages.loggedOut ?? 'Account has been logged out.',
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
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        for (var [key, obj] of Object.entries(body)) {
            if (key == 'values') {
                for (var [field, value] of Object.entries(obj)) {
                    obj[field] = value ?? '';
                }
            }
        }
        const headers = new HttpHeaders({
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
        const salt = new Date().getTime();
        return this.http.post(this.config?.api + '?' + salt, JSON.stringify(Object.assign({
            API_KEY: this.config?.apiKey,
            Method: method,
        }, body)), { headers });
    }
    async hash(encrypt) {
        const response = await firstValueFrom(this.post('get_hash', { encrypt: encrypt }));
        if (response.success) {
            return response.output;
        }
        else {
            return null;
        }
    }
    async checkDuplicates(tables, values) {
        const response = await firstValueFrom(this.post('check_duplicates', { 'tables': tables, 'values': values }));
        if (response.success) {
            return response.output;
        }
        else {
            return null;
        }
    }
    async register() {
        if (this.loading) {
            return;
        }
        if (this.config?.registrationTable == undefined) {
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
        // check duplicates
        const newDate = new Date().getTime().toString();
        var visID;
        if (this.config?.visibleID) {
            visID = `${this.config.visibleID}-` + newDate.substring(4, 7) + '-' + newDate.substring(7, 13);
        }
        const authFields = Object.keys(this.authForm);
        var values = {};
        for (let field of authFields) {
            let value = this.authForm[field].value;
            if (this.authForm[field].encrypted) {
                const hash = await this.hash(value);
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
            if (this.authForm[field].unique) {
                const hasDuplicate = await this.checkDuplicates(this.config.loginTable, { [field]: this.authForm[field].value });
                if (hasDuplicate != null) {
                    if (hasDuplicate) {
                        this.snackbarFeedback = {
                            type: 'error',
                            message: `${field.toUpperCase()} already exists.`,
                        };
                        return;
                    }
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
            this.loading = false;
            this.snackbarFeedback = undefined;
            if (data.success) {
                // show proper snackbar
                if (this.config?.verification) {
                    // wait for verification
                    this.snackbarFeedback = {
                        type: 'success',
                        message: this.config?.authMessages.forVerification ?? 'Please wait for account verification...'
                    };
                }
                else {
                    // successfully registered!`
                    this.snackbarFeedback = {
                        type: 'success',
                        message: this.config?.authMessages.registered ?? 'Registration was successful, you may now login with your credentials'
                    };
                    this.clearForm();
                }
            }
            else {
                alert(data.output);
            }
        });
    }
    closeSnackbar() {
        this.snackbarFeedback = undefined;
    }
    login() {
        if (this.loading) {
            return;
        }
        if (this.config?.loginTable == undefined) {
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
            this.loading = false;
            this.snackbarFeedback = undefined;
            this.snackbarFeedback = data.success ? {
                type: 'success',
                message: this.config?.authMessages.loggedIn ?? 'Login Successful!'
            } : {
                type: 'error',
                message: data.output
            };
            if (data.success) {
                const user = data.output;
                this.usedStorage.setItem('logged_in', user.role);
                this.usedStorage.setItem('user_info', JSON.stringify(user));
                this.router.navigate([this.config?.redirect[user.role]]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUFvQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQWxDaEIsZ0JBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBRXBFLFlBQU8sR0FBVyxLQUFLLENBQUM7UUFDeEIsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFDbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVB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LENBQUM7Z0JBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxRDtpQkFBSTtnQkFFSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUc7b0JBQ3RCLElBQUksRUFBRSxPQUFPO29CQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTTtpQkFDckIsQ0FBQzthQUNIO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFTCxDQUFDOztnSEF4WVUsa0JBQWtCO29IQUFsQixrQkFBa0IsY0FGakIsTUFBTTs0RkFFUCxrQkFBa0I7a0JBSDlCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgIEF1dGhDb25maWcsIEF1dGhGb3JtLCBBdXRoVmFsaWRhdG9yLCBTbmFja2JhckZlZWRiYWNrLEF1dGhNZXNzYWdlcyB9IGZyb20gJy4vdHlwZXMvdXN3YWdvbi1hdXRoLnR5cGVzJztcbmltcG9ydCB7IGZpcnN0VmFsdWVGcm9tIH0gZnJvbSAncnhqcyc7XG5cblxuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQXV0aFNlcnZpY2Uge1xuXG4gIHB1YmxpYyBzbmFja2JhckZlZWRiYWNrPzpTbmFja2JhckZlZWRiYWNrO1xuXG4gIHByaXZhdGUgdXNlZFN0b3JhZ2UgPSB0aGlzLmlzTG9jYWxTdG9yYWdlKCkgPyBsb2NhbFN0b3JhZ2UgOiBzZXNzaW9uU3RvcmFnZTtcbiAgcHJpdmF0ZSBjb25maWc6QXV0aENvbmZpZ3x1bmRlZmluZWQ7XG4gIHByaXZhdGUgbG9hZGluZzpib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgYXV0aEZvcm06QXV0aEZvcm0gPSB7fTtcbiAgcHJpdmF0ZSBlbWFpbE5vdGlmaWNhdGlvbjpib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgdmFsaWRhdG9yczpBdXRoVmFsaWRhdG9yID0ge1xuICAgIGVtYWlsOiB7XG4gICAgICBwYXR0ZXJuOiAnXltcXFxcdy0uXStAW1xcXFx3LV0rXFxcXC5bYS16QS1aXXsyLH0oWy5dW2EtekEtWl17Mix9KSokJyxcbiAgICAgIG1lc3NhZ2U6ICdFbWFpbCBpcyBub3QgdmFsaWQuJ1xuICAgIH0sXG4gICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgcGF0dGVybjogJ14oPz0uKlthLXpdKSg/PS4qW0EtWl0pKD89LipcXFxcZCkoPz0uKlshQCMkJV4mKl0pW0EtWmEtelxcXFxkIUAjJCVeJipdezgsfSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMgbG9uZyBhbmQgaW5jbHVkZSB1cHBlcmNhc2UsIGxvd2VyY2FzZSwgbnVtYmVyLCBhbmQgc3BlY2lhbCBjaGFyYWN0ZXIuJ1xuICAgIH0sXG4gICAgcGhvbmU6IHtcbiAgICAgICAgcGF0dGVybjogJ14oXFxcXCtcXFxcZHsxLDN9XFxcXHM/KT9cXFxcKD9cXFxcZHszfVxcXFwpP1stXFxcXHNdP1xcXFxkezN9Wy1cXFxcc10/XFxcXGR7NH0kJyxcbiAgICAgICAgbWVzc2FnZTogJ1Bob25lIG51bWJlciBtdXN0IGJlIGluIGEgdmFsaWQgZm9ybWF0LidcbiAgICB9LFxuICAgIHVzZXJuYW1lOiB7XG4gICAgICBwYXR0ZXJuOiAnXlthLXpBLVowLTldezMsMTV9JCcsXG4gICAgICBtZXNzYWdlOiAnVXNlcm5hbWUgbXVzdCBiZSAzLTE1IGNoYXJhY3RlcnMgbG9uZyBhbmQgY2FuIG9ubHkgY29udGFpbiBsZXR0ZXJzIGFuZCBudW1iZXJzLidcbiAgICB9LFxuICAgIGNyZWRpdENhcmQ6IHtcbiAgICAgICAgcGF0dGVybjogJ14oPzo0WzAtOV17MTJ9KD86WzAtOV17M30pP3w1WzEtNV1bMC05XXsxNH18Nig/OjAxMXw1WzAtOV17Mn0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXw3WzAtOV17MTV9KSQnLFxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBjcmVkaXQgY2FyZCBudW1iZXIuJ1xuICAgIH0sXG4gICAgcG9zdGFsQ29kZToge1xuICAgICAgcGF0dGVybjogJ15cXFxcZHs1fSgtXFxcXGR7NH0pPyQnLFxuICAgICAgbWVzc2FnZTogJ1Bvc3RhbCBjb2RlIG11c3QgYmUgaW4gdGhlIGZvcm1hdCAxMjM0NSBvciAxMjM0NS02Nzg5LidcbiAgICB9LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICApIHsgfVxuICBcbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB0aGUgc2VydmljZSBmb3IgdGhlIHByb2plY3RcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gY29uZmlndXJhdGlvbiB0aGF0IHBvaW50cyB0aGUgc2VydmljZSB0byBpdHMgYXBwcm9wcmlhdGUgc2VydmVyXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLmF1dGguaW5pdGlhbGl6ZSh7XG4gICAgICogIGFwaTplbnZpcm9ubWVudC5hcGksXG4gICAgICogIGFwaUtleTogZW52aXJvbm1lbnQuYXBpS2V5LFxuICAgICAqICByZWdpc3RyYXRpb25UYWJsZTogJ3RlYWNoZXJzJywgLy8gY2FuIGJlIHVuZGVmaW5lZCBsb2dpblxuICAgICAqICBsb2dpblRhYmxlOiBbJ3RlYWNoZXJzJywgJ2FkbWluaXN0cmF0b3JzJywgJ3N0dWRlbnRzJ11cbiAgICAgKiAgcmVkaXJlY3Q6e1xuICAgICAqICAgICdzdHVkZW50cyc6ICcvc3R1ZGVudCcsXG4gICAgICogICAgJ3RlYWNoZXJzJzogJy90ZWFjaGVyJyxcbiAgICAgKiAgICAnYWRtaW5pc3RyYXRvcnMnOiAnL2FkbWluJyxcbiAgICAgKiAgIH1cbiAgICAgKiB9KVxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemUoY29uZmlnOkF1dGhDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIGlmKHRoaXMuY29uZmlnLmF1dGhNZXNzYWdlcyA9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5jb25maWcuYXV0aE1lc3NhZ2VzID0ge307XG4gICAgfVxuICAgIHRoaXMuYXV0aEZvcm0gPSB7fTtcbiAgICBjb25zdCByb2xlID0gdGhpcy5hY2NvdW50TG9nZ2VkSW4oKTtcbiAgICBpZihyb2xlIT1udWxsKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3Rbcm9sZV1dKTtcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUlucHV0RmllbGRzKCk6Ym9vbGVhbntcbiAgICB2YXIgaGFzRXJyb3JzID0gZmFsc2U7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICBjb25zdCB7IHZhbHVlLCB2YWxpZGF0b3IsIHJlcXVpcmVkIH0gPSB0aGlzLmF1dGhGb3JtW2tleV07XG4gICAgICBpZihyZXF1aXJlZCAmJiB2YWx1ZS50cmltKCkgPT0nJyl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkISc7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkYXRvciBpcyBub3QgY3VzdG9tXG4gICAgICAgICAgaWYodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9ICBuZXcgUmVnRXhwKHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICBpZighaXNWYWxpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IGAke2tleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zbGljZSgxKX0gaXMgbm90IGEgdmFsaWQgaW5wdXQuYDtcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdDdXN0b20gdmFsaWRhdG9yIHNob3VsZCBiZSBvbiByZWdleCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5wYXR0ZXJuKTtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLm1lc3NhZ2U7XG4gICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIHJldHVybiAhaGFzRXJyb3JzO1xuICB9XG5cbiAgY2xlYXJGb3JtKCl7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvbGUgPSB0aGlzLmF1dGguYWNjb3VudExvZ2dlZEluKClcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IHJvbGUgb2YgdXNlciBpZiBhdXRoZW50aWNhdGVkLCBudWxsIGlmIHVuYXV0aGVudGljYXRlZFxuICAgKiovXG4gIGFjY291bnRMb2dnZWRJbigpIHtcbiAgICByZXR1cm4gdGhpcy51c2VkU3RvcmFnZS5nZXRJdGVtKCdsb2dnZWRfaW4nKTtcbiAgfVxuXG4gIGxvZ291dCgpIHtcbiAgICBpZiAoIXRoaXMuYWNjb3VudExvZ2dlZEluKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy51c2VkU3RvcmFnZS5jbGVhcigpO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J3N1Y2Nlc3MnLFxuICAgICAgJ21lc3NhZ2UnOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5sb2dnZWRPdXQgPz8gJ0FjY291bnQgaGFzIGJlZW4gbG9nZ2VkIG91dC4nLFxuICAgIH1cbiAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy8nXSk7XG4gIH1cblxuXG4gIGdldEF1dGhGaWVsZChrZXk6c3RyaW5nKXtcbiAgICByZXR1cm4gdGhpcy5hdXRoRm9ybVtrZXldO1xuICB9XG4gIFxuICBpbml0aWFsaXplRm9ybUZpZWxkKGtleTpzdHJpbmcsIHJlcXVpcmVkOmJvb2xlYW4gLCB1bmlxdWU6Ym9vbGVhbiwgdHlwZTpzdHJpbmcsIGFsaWFzZXM/OnN0cmluZ1tdLCBlbmNyeXB0ZWQ/OmJvb2xlYW4sdmFsaWRhdG9yPzpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XT0ge3ZhbHVlOicnLCB2YWxpZGF0b3I6dmFsaWRhdG9yLCByZXF1aXJlZDpyZXF1aXJlZCwgdHlwZTp0eXBlLCBhbGlhc2VzOmFsaWFzZXMsZW5jcnlwdGVkOmVuY3J5cHRlZCx1bmlxdWU6dW5pcXVlfTtcbiAgfVxuXG4gIGhhbmRsZUZvcm1WYWx1ZShrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgaXNMb2NhbFN0b3JhZ2UoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdG9yYWdlJyk7XG4gICAgcmV0dXJuIHN0b3JhZ2UgPT0gJ2xvY2FsJztcbiAgICBcbiAgfVxuXG4gIGdldFNhdmVkRW1haWwoKSB7XG4gICAgY29uc3QgZW1haWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmVtZW1iZXInKTtcbiAgICByZXR1cm4gZW1haWw7XG4gIH1cblxuICB1c2VMb2NhbFN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnbG9jYWwnKTtcbiAgfVxuXG4gIHVzZVNlc3Npb25TdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ3Nlc3Npb24nKTtcbiAgfVxuXG4gIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIG9ial0gb2YgT2JqZWN0LmVudHJpZXM8YW55Pihib2R5KSkge1xuICAgICAgaWYgKGtleSA9PSAndmFsdWVzJykge1xuICAgICAgICBmb3IgKHZhciBbZmllbGQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgb2JqW2ZpZWxkXSA9IHZhbHVlID8/ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoe1xuICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9KTtcbiAgICBjb25zdCBzYWx0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PGFueT4oXG4gICAgICB0aGlzLmNvbmZpZz8uYXBpICsgJz8nICsgc2FsdCxcbiAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEFQSV9LRVk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICBNZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIHsgaGVhZGVycyB9XG4gICAgKTtcbiAgfVxuICBhc3luYyBoYXNoKGVuY3J5cHQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLnBvc3QoJ2dldF9oYXNoJywge2VuY3J5cHQ6IGVuY3J5cHR9KSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjaGVja0R1cGxpY2F0ZXModGFibGVzOnN0cmluZ1tdLCB2YWx1ZXM6e1trZXk6c3RyaW5nXTpzdHJpbmd9KXtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnY2hlY2tfZHVwbGljYXRlcycseyd0YWJsZXMnOiB0YWJsZXMsICd2YWx1ZXMnOnZhbHVlc30pKVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG5cblxuICBhc3luYyByZWdpc3RlcigpIHtcbiAgICBpZih0aGlzLmxvYWRpbmcpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZz8ucmVnaXN0cmF0aW9uVGFibGUgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdSZWdpc3RyYXRpb24gdGFibGUgbXVzdCBiZSBpbml0aWFsaXplZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighdGhpcy52YWxpZGF0ZUlucHV0RmllbGRzKCkpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICd0eXBlJzonbmV1dHJhbCcsXG4gICAgICAnbWVzc2FnZSc6J0xvYWRpbmcuLi4nLFxuICAgICAgaXNJbmZpbml0ZTp0cnVlLFxuICAgIH1cblxuICAgIC8vIGNoZWNrIGR1cGxpY2F0ZXNcbiAgICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoKTtcbiAgICB2YXIgdmlzSUQ7XG4gICAgaWYodGhpcy5jb25maWc/LnZpc2libGVJRCl7XG4gICAgICB2aXNJRCA9IGAke3RoaXMuY29uZmlnLnZpc2libGVJRH0tYCArIG5ld0RhdGUuc3Vic3RyaW5nKDQsIDcpICsgJy0nICsgbmV3RGF0ZS5zdWJzdHJpbmcoNywgMTMpO1xuICAgIH1cbiAgICBjb25zdCBhdXRoRmllbGRzID0gT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSk7XG5cbiAgICB2YXIgdmFsdWVzOmFueSA9e307XG5cbiAgICBmb3IobGV0IGZpZWxkIG9mIGF1dGhGaWVsZHMpe1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5hdXRoRm9ybVtmaWVsZF0udmFsdWU7XG4gICAgICBpZih0aGlzLmF1dGhGb3JtW2ZpZWxkXS5lbmNyeXB0ZWQpe1xuICAgICAgICBjb25zdCBoYXNoID0gYXdhaXQgdGhpcy5oYXNoKHZhbHVlKTtcbiAgICAgICAgaWYoaGFzaCl7XG4gICAgICAgICAgdmFsdWUgPSBoYXNoXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHRyeSBhZ2FpbiBsYXRlci4uLicsXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYodGhpcy5hdXRoRm9ybVtmaWVsZF0udW5pcXVlKXtcbiAgICAgICAgY29uc3QgaGFzRHVwbGljYXRlID0gYXdhaXQgdGhpcy5jaGVja0R1cGxpY2F0ZXModGhpcy5jb25maWcubG9naW5UYWJsZSwge1tmaWVsZF06IHRoaXMuYXV0aEZvcm1bZmllbGRdLnZhbHVlfSlcbiAgICAgICAgaWYoaGFzRHVwbGljYXRlICE9IG51bGwpe1xuICAgICAgICAgIGlmKGhhc0R1cGxpY2F0ZSl7XG4gICAgICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke2ZpZWxkLnRvVXBwZXJDYXNlKCl9IGFscmVhZHkgZXhpc3RzLmAsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdTb21ldGhpbmcgd2VudCB3cm9uZywgdHJ5IGFnYWluIGxhdGVyLi4uJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAgIFxuICAgICAgdmFsdWVzW2ZpZWxkXSA9dmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHBvc3RPYmplY3QgPSBcbiAgICAgICBPYmplY3QuYXNzaWduKHZpc0lEICE9IG51bGwgPyB7dmlzaWJsZWlkOnZpc0lEfTp7fSwgdGhpcy5jb25maWcudmVyaWZpY2F0aW9uID8ge3ZlcmlmaWVkOmZhbHNlfTp7fSwge2FjY291bnRUeXBlOiB0aGlzLmNvbmZpZy5yZWdpc3RyYXRpb25UYWJsZX0sXG4gICAgICAgIHZhbHVlc1xuICAgICAgICk7IFxuICAgICAgIFxuICAgIHRoaXMucG9zdCgncmVnaXN0ZXInLCBcbiAgICAgIHtkYXRhOkpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpfSxcbiAgICApLnN1YnNjcmliZSgoZGF0YTphbnkpPT57XG4gICAgICB0aGlzLmxvYWRpbmcgPWZhbHNlO1xuICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgICAgLy8gc2hvdyBwcm9wZXIgc25hY2tiYXJcbiAgICAgICAgaWYodGhpcy5jb25maWc/LnZlcmlmaWNhdGlvbil7XG4gICAgICAgICAgLy8gd2FpdCBmb3IgdmVyaWZpY2F0aW9uXG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEuZm9yVmVyaWZpY2F0aW9uID8/ICdQbGVhc2Ugd2FpdCBmb3IgYWNjb3VudCB2ZXJpZmljYXRpb24uLi4nXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXsgIFxuICAgICAgICAgIC8vIHN1Y2Nlc3NmdWxseSByZWdpc3RlcmVkIWBcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5yZWdpc3RlcmVkID8/ICdSZWdpc3RyYXRpb24gd2FzIHN1Y2Nlc3NmdWwsIHlvdSBtYXkgbm93IGxvZ2luIHdpdGggeW91ciBjcmVkZW50aWFscydcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jbGVhckZvcm0oKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIGFsZXJ0KGRhdGEub3V0cHV0KVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2xvc2VTbmFja2Jhcigpe1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgfVxuICBcbiAgbG9naW4oKSB7XG4gICAgaWYodGhpcy5sb2FkaW5nKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYodGhpcy5jb25maWc/LmxvZ2luVGFibGUgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdMb2dpbiB0YWJsZSBtdXN0IGJlIGluaXRpYWxpemVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBjaGVjayBpZiB1c2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIGFyZSBwcmVzZW50XG4gICAgaWYodGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddPT1udWxsIHx8IHRoaXMuYXV0aEZvcm1bJ3Bhc3N3b3JkJ10gPT0gbnVsbCl7XG4gICAgICBhbGVydCgnUGxlYXNlIGluaXRpYWxpemUgaWRlbnRpZmllciBhbmQgcGFzc3dvcmQgZmllbGRzIHVzaW5nIFtuYW1lXT1cImZpZWxkXCInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZih0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlcyA9PSB1bmRlZmluZWQgfHwgdGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddLmFsaWFzZXMubGVuZ3RoIDw9MCl7XG4gICAgICBhbGVydChcIklkZW50aWZpZXIgZmllbGQgbXVzdCBiZSBpbml0aWFsaXplZCB3aXRoIGFsaWFzZXM9W2FsaWFzZXNdXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLnZhbGlkYXRlSW5wdXRGaWVsZHMoKSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgJ3R5cGUnOiduZXV0cmFsJyxcbiAgICAgICdtZXNzYWdlJzonTG9hZGluZy4uLicsXG4gICAgICBpc0luZmluaXRlOnRydWUsXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBvc3QoJ2xvZ2luJywge1xuICAgICAgaWRlbnRpZmllclZhbHVlOiB0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10udmFsdWUsXG4gICAgICBwYXNzd29yZDogdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXS52YWx1ZSxcbiAgICAgIHRhYmxlczogdGhpcy5jb25maWcubG9naW5UYWJsZSxcbiAgICAgIGlkZW50aWZpZXJUeXBlczp0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlc1xuICAgIH0pLnN1YnNjcmliZSgoZGF0YTphbnkpID0+IHtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gZGF0YS5zdWNjZXNzID8ge1xuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLmxvZ2dlZEluID8/ICdMb2dpbiBTdWNjZXNzZnVsISdcbiAgICAgIH0gOiB7XG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgIG1lc3NhZ2U6ZGF0YS5vdXRwdXRcbiAgICAgIH07XG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIGNvbnN0IHVzZXIgPSBkYXRhLm91dHB1dDtcbiAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgICdsb2dnZWRfaW4nLFxuICAgICAgICAgIHVzZXIucm9sZVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oJ3VzZXJfaW5mbycsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMuY29uZmlnPy5yZWRpcmVjdFt1c2VyLnJvbGVdXSk7XG4gICAgICB9ZWxzZXtcblxuICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiBkYXRhLm91dHB1dFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH1cbn1cbiJdfQ==