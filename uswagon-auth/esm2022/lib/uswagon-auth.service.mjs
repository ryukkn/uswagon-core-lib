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
       *  app: 'test-app',
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
            App: this.config?.app
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
                // alert(data.output)
                this.snackbarFeedback = {
                    type: 'error',
                    message: data.output
                };
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthService, deps: [{ token: i1.HttpClient }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: i2.Router }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUFvQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQWxDaEIsZ0JBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBRXBFLFlBQU8sR0FBVyxLQUFLLENBQUM7UUFDeEIsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFDbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVB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cG9ydCB7IEh0dHBDbGllbnQsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7ICBBdXRoQ29uZmlnLCBBdXRoRm9ybSwgQXV0aFZhbGlkYXRvciwgU25hY2tiYXJGZWVkYmFjayxBdXRoTWVzc2FnZXMgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tYXV0aC50eXBlcyc7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMnO1xuXG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhTZXJ2aWNlIHtcblxuICBwdWJsaWMgc25hY2tiYXJGZWVkYmFjaz86U25hY2tiYXJGZWVkYmFjaztcblxuICBwcml2YXRlIHVzZWRTdG9yYWdlID0gdGhpcy5pc0xvY2FsU3RvcmFnZSgpID8gbG9jYWxTdG9yYWdlIDogc2Vzc2lvblN0b3JhZ2U7XG4gIHByaXZhdGUgY29uZmlnOkF1dGhDb25maWd8dW5kZWZpbmVkO1xuICBwcml2YXRlIGxvYWRpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIGF1dGhGb3JtOkF1dGhGb3JtID0ge307XG4gIHByaXZhdGUgZW1haWxOb3RpZmljYXRpb246Ym9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIHZhbGlkYXRvcnM6QXV0aFZhbGlkYXRvciA9IHtcbiAgICBlbWFpbDoge1xuICAgICAgcGF0dGVybjogJ15bXFxcXHctLl0rQFtcXFxcdy1dK1xcXFwuW2EtekEtWl17Mix9KFsuXVthLXpBLVpdezIsfSkqJCcsXG4gICAgICBtZXNzYWdlOiAnRW1haWwgaXMgbm90IHZhbGlkLidcbiAgICB9LFxuICAgIHBhc3N3b3JkOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKD89LipbYS16XSkoPz0uKltBLVpdKSg/PS4qXFxcXGQpKD89LipbIUAjJCVeJipdKVtBLVphLXpcXFxcZCFAIyQlXiYqXXs4LH0kJyxcbiAgICAgICAgbWVzc2FnZTogJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcgYW5kIGluY2x1ZGUgdXBwZXJjYXNlLCBsb3dlcmNhc2UsIG51bWJlciwgYW5kIHNwZWNpYWwgY2hhcmFjdGVyLidcbiAgICB9LFxuICAgIHBob25lOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKFxcXFwrXFxcXGR7MSwzfVxcXFxzPyk/XFxcXCg/XFxcXGR7M31cXFxcKT9bLVxcXFxzXT9cXFxcZHszfVstXFxcXHNdP1xcXFxkezR9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQaG9uZSBudW1iZXIgbXVzdCBiZSBpbiBhIHZhbGlkIGZvcm1hdC4nXG4gICAgfSxcbiAgICB1c2VybmFtZToge1xuICAgICAgcGF0dGVybjogJ15bYS16QS1aMC05XXszLDE1fSQnLFxuICAgICAgbWVzc2FnZTogJ1VzZXJuYW1lIG11c3QgYmUgMy0xNSBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNhbiBvbmx5IGNvbnRhaW4gbGV0dGVycyBhbmQgbnVtYmVycy4nXG4gICAgfSxcbiAgICBjcmVkaXRDYXJkOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldezJ9KVswLTldezEyfXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18N1swLTldezE1fSkkJyxcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgY3JlZGl0IGNhcmQgbnVtYmVyLidcbiAgICB9LFxuICAgIHBvc3RhbENvZGU6IHtcbiAgICAgIHBhdHRlcm46ICdeXFxcXGR7NX0oLVxcXFxkezR9KT8kJyxcbiAgICAgIG1lc3NhZ2U6ICdQb3N0YWwgY29kZSBtdXN0IGJlIGluIHRoZSBmb3JtYXQgMTIzNDUgb3IgMTIzNDUtNjc4OS4nXG4gICAgfSxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgKSB7IH1cbiAgXG4gIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHNlcnZpY2UgZm9yIHRoZSBwcm9qZWN0XG4gICAgICogQHBhcmFtIGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gdGhhdCBwb2ludHMgdGhlIHNlcnZpY2UgdG8gaXRzIGFwcHJvcHJpYXRlIHNlcnZlclxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5hdXRoLmluaXRpYWxpemUoe1xuICAgICAqICBhcGk6ZW52aXJvbm1lbnQuYXBpLFxuICAgICAqICBhcGlLZXk6IGVudmlyb25tZW50LmFwaUtleSxcbiAgICAgKiAgYXBwOiAndGVzdC1hcHAnLFxuICAgICAqICByZWdpc3RyYXRpb25UYWJsZTogJ3RlYWNoZXJzJywgLy8gY2FuIGJlIHVuZGVmaW5lZCBsb2dpblxuICAgICAqICBsb2dpblRhYmxlOiBbJ3RlYWNoZXJzJywgJ2FkbWluaXN0cmF0b3JzJywgJ3N0dWRlbnRzJ11cbiAgICAgKiAgcmVkaXJlY3Q6e1xuICAgICAqICAgICdzdHVkZW50cyc6ICcvc3R1ZGVudCcsXG4gICAgICogICAgJ3RlYWNoZXJzJzogJy90ZWFjaGVyJyxcbiAgICAgKiAgICAnYWRtaW5pc3RyYXRvcnMnOiAnL2FkbWluJyxcbiAgICAgKiAgIH1cbiAgICAgKiB9KVxuICAgICAqIFxuICAgKiovXG4gIGluaXRpYWxpemUoY29uZmlnOkF1dGhDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIGlmKHRoaXMuY29uZmlnLmF1dGhNZXNzYWdlcyA9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5jb25maWcuYXV0aE1lc3NhZ2VzID0ge307XG4gICAgfVxuICAgIHRoaXMuYXV0aEZvcm0gPSB7fTtcbiAgICBjb25zdCByb2xlID0gdGhpcy5hY2NvdW50TG9nZ2VkSW4oKTtcbiAgICBpZihyb2xlIT1udWxsKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3Rbcm9sZV1dKTtcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUlucHV0RmllbGRzKCk6Ym9vbGVhbntcbiAgICB2YXIgaGFzRXJyb3JzID0gZmFsc2U7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICBjb25zdCB7IHZhbHVlLCB2YWxpZGF0b3IsIHJlcXVpcmVkIH0gPSB0aGlzLmF1dGhGb3JtW2tleV07XG4gICAgICBpZihyZXF1aXJlZCAmJiB2YWx1ZS50cmltKCkgPT0nJyl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkISc7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkYXRvciBpcyBub3QgY3VzdG9tXG4gICAgICAgICAgaWYodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9ICBuZXcgUmVnRXhwKHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICBpZighaXNWYWxpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IGAke2tleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zbGljZSgxKX0gaXMgbm90IGEgdmFsaWQgaW5wdXQuYDtcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdDdXN0b20gdmFsaWRhdG9yIHNob3VsZCBiZSBvbiByZWdleCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5wYXR0ZXJuKTtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLm1lc3NhZ2U7XG4gICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIHJldHVybiAhaGFzRXJyb3JzO1xuICB9XG5cbiAgY2xlYXJGb3JtKCl7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvbGUgPSB0aGlzLmF1dGguYWNjb3VudExvZ2dlZEluKClcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IHJvbGUgb2YgdXNlciBpZiBhdXRoZW50aWNhdGVkLCBudWxsIGlmIHVuYXV0aGVudGljYXRlZFxuICAgKiovXG4gIGFjY291bnRMb2dnZWRJbigpIHtcbiAgICByZXR1cm4gdGhpcy51c2VkU3RvcmFnZS5nZXRJdGVtKCdsb2dnZWRfaW4nKTtcbiAgfVxuXG4gIGxvZ291dCgpIHtcbiAgICBpZiAoIXRoaXMuYWNjb3VudExvZ2dlZEluKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy51c2VkU3RvcmFnZS5jbGVhcigpO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J3N1Y2Nlc3MnLFxuICAgICAgJ21lc3NhZ2UnOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5sb2dnZWRPdXQgPz8gJ0FjY291bnQgaGFzIGJlZW4gbG9nZ2VkIG91dC4nLFxuICAgIH1cbiAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy8nXSk7XG4gIH1cblxuXG4gIGdldEF1dGhGaWVsZChrZXk6c3RyaW5nKXtcbiAgICByZXR1cm4gdGhpcy5hdXRoRm9ybVtrZXldO1xuICB9XG4gIFxuICBpbml0aWFsaXplRm9ybUZpZWxkKGtleTpzdHJpbmcsIHJlcXVpcmVkOmJvb2xlYW4gLCB1bmlxdWU6Ym9vbGVhbiwgdHlwZTpzdHJpbmcsIGFsaWFzZXM/OnN0cmluZ1tdLCBlbmNyeXB0ZWQ/OmJvb2xlYW4sdmFsaWRhdG9yPzpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XT0ge3ZhbHVlOicnLCB2YWxpZGF0b3I6dmFsaWRhdG9yLCByZXF1aXJlZDpyZXF1aXJlZCwgdHlwZTp0eXBlLCBhbGlhc2VzOmFsaWFzZXMsZW5jcnlwdGVkOmVuY3J5cHRlZCx1bmlxdWU6dW5pcXVlfTtcbiAgfVxuXG4gIGhhbmRsZUZvcm1WYWx1ZShrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgaXNMb2NhbFN0b3JhZ2UoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdG9yYWdlJyk7XG4gICAgcmV0dXJuIHN0b3JhZ2UgPT0gJ2xvY2FsJztcbiAgICBcbiAgfVxuXG4gIGdldFNhdmVkRW1haWwoKSB7XG4gICAgY29uc3QgZW1haWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmVtZW1iZXInKTtcbiAgICByZXR1cm4gZW1haWw7XG4gIH1cblxuICB1c2VMb2NhbFN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnbG9jYWwnKTtcbiAgfVxuXG4gIHVzZVNlc3Npb25TdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ3Nlc3Npb24nKTtcbiAgfVxuXG4gIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIG9ial0gb2YgT2JqZWN0LmVudHJpZXM8YW55Pihib2R5KSkge1xuICAgICAgaWYgKGtleSA9PSAndmFsdWVzJykge1xuICAgICAgICBmb3IgKHZhciBbZmllbGQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgb2JqW2ZpZWxkXSA9IHZhbHVlID8/ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoe1xuICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9KTtcbiAgICBjb25zdCBzYWx0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PGFueT4oXG4gICAgICB0aGlzLmNvbmZpZz8uYXBpICsgJz8nICsgc2FsdCxcbiAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEFQSV9LRVk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICBNZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIEFwcDogdGhpcy5jb25maWc/LmFwcFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApO1xuICB9XG4gIGFzeW5jIGhhc2goZW5jcnlwdDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZ2V0X2hhc2gnLCB7ZW5jcnlwdDogZW5jcnlwdH0pKVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrRHVwbGljYXRlcyh0YWJsZXM6c3RyaW5nW10sIHZhbHVlczp7W2tleTpzdHJpbmddOnN0cmluZ30pe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdjaGVja19kdXBsaWNhdGVzJyx7J3RhYmxlcyc6IHRhYmxlcywgJ3ZhbHVlcyc6dmFsdWVzfSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cblxuXG4gIGFzeW5jIHJlZ2lzdGVyKCkge1xuICAgIGlmKHRoaXMubG9hZGluZyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKHRoaXMuY29uZmlnPy5yZWdpc3RyYXRpb25UYWJsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ1JlZ2lzdHJhdGlvbiB0YWJsZSBtdXN0IGJlIGluaXRpYWxpemVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLnZhbGlkYXRlSW5wdXRGaWVsZHMoKSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgJ3R5cGUnOiduZXV0cmFsJyxcbiAgICAgICdtZXNzYWdlJzonTG9hZGluZy4uLicsXG4gICAgICBpc0luZmluaXRlOnRydWUsXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgZHVwbGljYXRlc1xuICAgIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygpO1xuICAgIHZhciB2aXNJRDtcbiAgICBpZih0aGlzLmNvbmZpZz8udmlzaWJsZUlEKXtcbiAgICAgIHZpc0lEID0gYCR7dGhpcy5jb25maWcudmlzaWJsZUlEfS1gICsgbmV3RGF0ZS5zdWJzdHJpbmcoNCwgNykgKyAnLScgKyBuZXdEYXRlLnN1YnN0cmluZyg3LCAxMyk7XG4gICAgfVxuICAgIGNvbnN0IGF1dGhGaWVsZHMgPSBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKTtcblxuICAgIHZhciB2YWx1ZXM6YW55ID17fTtcblxuICAgIGZvcihsZXQgZmllbGQgb2YgYXV0aEZpZWxkcyl7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLmF1dGhGb3JtW2ZpZWxkXS52YWx1ZTtcbiAgICAgIGlmKHRoaXMuYXV0aEZvcm1bZmllbGRdLmVuY3J5cHRlZCl7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBhd2FpdCB0aGlzLmhhc2godmFsdWUpO1xuICAgICAgICBpZihoYXNoKXtcbiAgICAgICAgICB2YWx1ZSA9IGhhc2hcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdTb21ldGhpbmcgd2VudCB3cm9uZywgdHJ5IGFnYWluIGxhdGVyLi4uJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZih0aGlzLmF1dGhGb3JtW2ZpZWxkXS51bmlxdWUpe1xuICAgICAgICBjb25zdCBoYXNEdXBsaWNhdGUgPSBhd2FpdCB0aGlzLmNoZWNrRHVwbGljYXRlcyh0aGlzLmNvbmZpZy5sb2dpblRhYmxlLCB7W2ZpZWxkXTogdGhpcy5hdXRoRm9ybVtmaWVsZF0udmFsdWV9KVxuICAgICAgICBpZihoYXNEdXBsaWNhdGUgIT0gbnVsbCl7XG4gICAgICAgICAgaWYoaGFzRHVwbGljYXRlKXtcbiAgICAgICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYCR7ZmllbGQudG9VcHBlckNhc2UoKX0gYWxyZWFkeSBleGlzdHMuYCxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nLCB0cnkgYWdhaW4gbGF0ZXIuLi4nLFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICAgXG4gICAgICB2YWx1ZXNbZmllbGRdID12YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgcG9zdE9iamVjdCA9IFxuICAgICAgIE9iamVjdC5hc3NpZ24odmlzSUQgIT0gbnVsbCA/IHt2aXNpYmxlaWQ6dmlzSUR9Ont9LCB0aGlzLmNvbmZpZy52ZXJpZmljYXRpb24gPyB7dmVyaWZpZWQ6ZmFsc2V9Ont9LCB7YWNjb3VudFR5cGU6IHRoaXMuY29uZmlnLnJlZ2lzdHJhdGlvblRhYmxlfSxcbiAgICAgICAgdmFsdWVzXG4gICAgICAgKTsgXG4gICAgICAgXG4gICAgdGhpcy5wb3N0KCdyZWdpc3RlcicsIFxuICAgICAge2RhdGE6SlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCl9LFxuICAgICkuc3Vic2NyaWJlKChkYXRhOmFueSk9PntcbiAgICAgIHRoaXMubG9hZGluZyA9ZmFsc2U7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAgICAvLyBzaG93IHByb3BlciBzbmFja2JhclxuICAgICAgICBpZih0aGlzLmNvbmZpZz8udmVyaWZpY2F0aW9uKXtcbiAgICAgICAgICAvLyB3YWl0IGZvciB2ZXJpZmljYXRpb25cbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5mb3JWZXJpZmljYXRpb24gPz8gJ1BsZWFzZSB3YWl0IGZvciBhY2NvdW50IHZlcmlmaWNhdGlvbi4uLidcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNleyAgXG4gICAgICAgICAgLy8gc3VjY2Vzc2Z1bGx5IHJlZ2lzdGVyZWQhYFxuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLnJlZ2lzdGVyZWQgPz8gJ1JlZ2lzdHJhdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgeW91IG1heSBub3cgbG9naW4gd2l0aCB5b3VyIGNyZWRlbnRpYWxzJ1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNsZWFyRm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYWxlcnQoZGF0YS5vdXRwdXQpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVNuYWNrYmFyKCl7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICB9XG4gIFxuICBsb2dpbigpIHtcbiAgICBpZih0aGlzLmxvYWRpbmcpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZz8ubG9naW5UYWJsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0xvZ2luIHRhYmxlIG11c3QgYmUgaW5pdGlhbGl6ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNoZWNrIGlmIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBmaWVsZHMgYXJlIHByZXNlbnRcbiAgICBpZih0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ109PW51bGwgfHwgdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXSA9PSBudWxsKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSBpZGVudGlmaWVyIGFuZCBwYXNzd29yZCBmaWVsZHMgdXNpbmcgW25hbWVdPVwiZmllbGRcIicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzID09IHVuZGVmaW5lZCB8fCB0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlcy5sZW5ndGggPD0wKXtcbiAgICAgIGFsZXJ0KFwiSWRlbnRpZmllciBmaWVsZCBtdXN0IGJlIGluaXRpYWxpemVkIHdpdGggYWxpYXNlcz1bYWxpYXNlc11cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIXRoaXMudmFsaWRhdGVJbnB1dEZpZWxkcygpKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J25ldXRyYWwnLFxuICAgICAgJ21lc3NhZ2UnOidMb2FkaW5nLi4uJyxcbiAgICAgIGlzSW5maW5pdGU6dHJ1ZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucG9zdCgnbG9naW4nLCB7XG4gICAgICBpZGVudGlmaWVyVmFsdWU6IHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS52YWx1ZSxcbiAgICAgIHBhc3N3b3JkOiB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddLnZhbHVlLFxuICAgICAgdGFibGVzOiB0aGlzLmNvbmZpZy5sb2dpblRhYmxlLFxuICAgICAgaWRlbnRpZmllclR5cGVzOnRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzXG4gICAgfSkuc3Vic2NyaWJlKChkYXRhOmFueSkgPT4ge1xuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSBkYXRhLnN1Y2Nlc3MgPyB7XG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEubG9nZ2VkSW4gPz8gJ0xvZ2luIFN1Y2Nlc3NmdWwhJ1xuICAgICAgfSA6IHtcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgbWVzc2FnZTpkYXRhLm91dHB1dFxuICAgICAgfTtcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGRhdGEub3V0cHV0O1xuICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgJ2xvZ2dlZF9pbicsXG4gICAgICAgICAgdXNlci5yb2xlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbSgndXNlcl9pbmZvJywgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWc/LnJlZGlyZWN0W3VzZXIucm9sZV1dKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyBhbGVydChkYXRhLm91dHB1dClcbiAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgbWVzc2FnZTogZGF0YS5vdXRwdXRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG59XG4iXX0=