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
        this.loading = false;
        this.usedStorage = this.isLocalStorage() ? localStorage : sessionStorage;
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
        if (!this.config.authType) {
            this.config.authType = 'default';
        }
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
    async encryptRequest(plaintext) {
        const keyString = 'AHS8576598PIOUNA214842780309mpqbH';
        const key = new TextEncoder().encode(keyString.slice(0, 32)); // Use only the first 32 characters for AES-256
        const iv = crypto.getRandomValues(new Uint8Array(16)); // Generate random IV (16 bytes for AES)
        // Import the key
        const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt']);
        // Encrypt the plaintext
        const encodedPlaintext = new TextEncoder().encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, cryptoKey, encodedPlaintext);
        // Combine IV and ciphertext, then encode to base64
        const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertext), iv.byteLength);
        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    }
    async post(method, body) {
        if (this.config == undefined) {
            alert('Config must be initialized, try service.initialize(config)');
        }
        for (var [key, obj] of Object.entries(body)) {
            if (key == 'values') {
                for (var [field, value] of Object.entries(obj)) {
                    if (value == null || value == undefined) {
                        delete obj[field];
                    }
                }
            }
        }
        const headers = new HttpHeaders({
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        });
        const salt = new Date().getTime();
        const jsonString = JSON.stringify(Object.assign({
            API_KEY: this.config?.apiKey,
            App: this.config?.app,
            Method: method,
        }, body));
        const encrypted = await this.encryptRequest(jsonString);
        return await firstValueFrom(this.http.post(this.config?.api + '?' + salt, encrypted, { headers }));
    }
    async hash(encrypt) {
        const response = await this.post('get_hash', { encrypt: encrypt });
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Server Error');
        }
    }
    async checkDuplicates(tables, values) {
        const response = await this.post('check_duplicates', { 'tables': tables, 'values': values });
        if (response.success) {
            return response.output;
        }
        else {
            throw new Error('Server Error');
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
        this.post('register', { data: JSON.stringify(postObject) }).then((data) => {
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
        this.snackbarFeedback = undefined;
        this.snackbarFeedback = {
            'type': 'neutral',
            'message': 'Loading...',
            isInfinite: true,
        };
        return this.post('login', {
            authType: this.config.authType,
            identifierValue: this.authForm['identifier'].value,
            password: this.authForm['password'].value,
            tables: this.config.loginTable,
            identifierTypes: this.authForm['identifier'].aliases
        }).then((data) => {
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
                if (this.config?.redirect[user.role] == undefined) {
                    this.snackbarFeedback = {
                        type: 'error',
                        message: "This user is not authorized."
                    };
                    this.loading = false;
                }
                // add delay
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(() => {
                    if (this.config?.authType == 'jwt') {
                        this.usedStorage.setItem('user_info', user.token);
                    }
                    else {
                        this.usedStorage.setItem('logged_in', user.role);
                        this.usedStorage.setItem('user_info', JSON.stringify(user));
                    }
                    this.router.navigate([this.config?.redirect[user.role]]);
                    this.loading = false;
                }, this.config?.loginTimeout ?? 1500);
            }
            else {
                // alert(data.output)
                this.snackbarFeedback = {
                    type: 'error',
                    message: data.output
                };
                this.loading = false;
            }
        });
    }
    getUser() {
        const user = this.usedStorage.getItem('user_info');
        if (user != null) {
            return JSON.parse(user);
        }
        else {
            return null;
        }
    }
    async jwtUser() {
        if (!this.config) {
            alert('Config is not initialized');
            return;
        }
        const jwtToken = this.usedStorage.getItem('user_info');
        if (jwtToken != null) {
            const response = await this.post('protected', {
                token: jwtToken
            });
            if (response.success) {
                return response.output;
            }
            else {
                throw new Error(response.output);
            }
        }
        else {
            return null;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUFzQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXJDakIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUV2QixnQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFFcEUsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFHbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVB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bnQsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7ICBBdXRoQ29uZmlnLCBBdXRoRm9ybSwgQXV0aFZhbGlkYXRvciwgU25hY2tiYXJGZWVkYmFjayxBdXRoTWVzc2FnZXMgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tYXV0aC50eXBlcyc7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMnO1xuXG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhTZXJ2aWNlIHtcblxuICBwdWJsaWMgc25hY2tiYXJGZWVkYmFjaz86U25hY2tiYXJGZWVkYmFjaztcbiAgcHVibGljIGxvYWRpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgdXNlZFN0b3JhZ2UgPSB0aGlzLmlzTG9jYWxTdG9yYWdlKCkgPyBsb2NhbFN0b3JhZ2UgOiBzZXNzaW9uU3RvcmFnZTtcbiAgcHJpdmF0ZSBjb25maWc6QXV0aENvbmZpZ3x1bmRlZmluZWQ7XG4gIHByaXZhdGUgYXV0aEZvcm06QXV0aEZvcm0gPSB7fTtcbiAgcHJpdmF0ZSBlbWFpbE5vdGlmaWNhdGlvbjpib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgdGltZW91dDphbnk7XG5cbiAgcHJpdmF0ZSB2YWxpZGF0b3JzOkF1dGhWYWxpZGF0b3IgPSB7XG4gICAgZW1haWw6IHtcbiAgICAgIHBhdHRlcm46ICdeW1xcXFx3LS5dK0BbXFxcXHctXStcXFxcLlthLXpBLVpdezIsfShbLl1bYS16QS1aXXsyLH0pKiQnLFxuICAgICAgbWVzc2FnZTogJ0VtYWlsIGlzIG5vdCB2YWxpZC4nXG4gICAgfSxcbiAgICBwYXNzd29yZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/PS4qW2Etel0pKD89LipbQS1aXSkoPz0uKlxcXFxkKSg/PS4qWyFAIyQlXiYqXSlbQS1aYS16XFxcXGQhQCMkJV4mKl17OCx9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nIGFuZCBpbmNsdWRlIHVwcGVyY2FzZSwgbG93ZXJjYXNlLCBudW1iZXIsIGFuZCBzcGVjaWFsIGNoYXJhY3Rlci4nXG4gICAgfSxcbiAgICBwaG9uZToge1xuICAgICAgICBwYXR0ZXJuOiAnXihcXFxcK1xcXFxkezEsM31cXFxccz8pP1xcXFwoP1xcXFxkezN9XFxcXCk/Wy1cXFxcc10/XFxcXGR7M31bLVxcXFxzXT9cXFxcZHs0fSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGhvbmUgbnVtYmVyIG11c3QgYmUgaW4gYSB2YWxpZCBmb3JtYXQuJ1xuICAgIH0sXG4gICAgdXNlcm5hbWU6IHtcbiAgICAgIHBhdHRlcm46ICdeW2EtekEtWjAtOV17MywxNX0kJyxcbiAgICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IGJlIDMtMTUgY2hhcmFjdGVycyBsb25nIGFuZCBjYW4gb25seSBjb250YWluIGxldHRlcnMgYW5kIG51bWJlcnMuJ1xuICAgIH0sXG4gICAgY3JlZGl0Q2FyZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XXsyfSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fDdbMC05XXsxNX0pJCcsXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGNyZWRpdCBjYXJkIG51bWJlci4nXG4gICAgfSxcbiAgICBwb3N0YWxDb2RlOiB7XG4gICAgICBwYXR0ZXJuOiAnXlxcXFxkezV9KC1cXFxcZHs0fSk/JCcsXG4gICAgICBtZXNzYWdlOiAnUG9zdGFsIGNvZGUgbXVzdCBiZSBpbiB0aGUgZm9ybWF0IDEyMzQ1IG9yIDEyMzQ1LTY3ODkuJ1xuICAgIH0sXG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG4gIFxuICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZXJ2aWNlIGZvciB0aGUgcHJvamVjdFxuICAgICAqIEBwYXJhbSBjb25maWcgLSBjb25maWd1cmF0aW9uIHRoYXQgcG9pbnRzIHRoZSBzZXJ2aWNlIHRvIGl0cyBhcHByb3ByaWF0ZSBzZXJ2ZXJcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuYXV0aC5pbml0aWFsaXplKHtcbiAgICAgKiAgYXBpOmVudmlyb25tZW50LmFwaSxcbiAgICAgKiAgYXBpS2V5OiBlbnZpcm9ubWVudC5hcGlLZXksXG4gICAgICogIGFwcDogJ3Rlc3QtYXBwJyxcbiAgICAgKiAgcmVnaXN0cmF0aW9uVGFibGU6ICd0ZWFjaGVycycsIC8vIGNhbiBiZSB1bmRlZmluZWQgbG9naW5cbiAgICAgKiAgbG9naW5UYWJsZTogWyd0ZWFjaGVycycsICdhZG1pbmlzdHJhdG9ycycsICdzdHVkZW50cyddXG4gICAgICogIHJlZGlyZWN0OntcbiAgICAgKiAgICAnc3R1ZGVudHMnOiAnL3N0dWRlbnQnLFxuICAgICAqICAgICd0ZWFjaGVycyc6ICcvdGVhY2hlcicsXG4gICAgICogICAgJ2FkbWluaXN0cmF0b3JzJzogJy9hZG1pbicsXG4gICAgICogICB9XG4gICAgICogfSlcbiAgICAgKiBcbiAgICoqL1xuICBpbml0aWFsaXplKGNvbmZpZzpBdXRoQ29uZmlnKXtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICBpZih0aGlzLmNvbmZpZy5hdXRoTWVzc2FnZXMgPT0gdW5kZWZpbmVkKXtcbiAgICAgIHRoaXMuY29uZmlnLmF1dGhNZXNzYWdlcyA9IHt9O1xuICAgIH1cbiAgICB0aGlzLmF1dGhGb3JtID0ge307XG4gICAgaWYoIXRoaXMuY29uZmlnLmF1dGhUeXBlKXtcbiAgICAgIHRoaXMuY29uZmlnLmF1dGhUeXBlID0gJ2RlZmF1bHQnO1xuICAgIH1cbiAgICBjb25zdCByb2xlID0gdGhpcy5hY2NvdW50TG9nZ2VkSW4oKTtcbiAgICBpZihyb2xlIT1udWxsKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3Rbcm9sZV1dKTtcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUlucHV0RmllbGRzKCk6Ym9vbGVhbntcbiAgICB2YXIgaGFzRXJyb3JzID0gZmFsc2U7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICBjb25zdCB7IHZhbHVlLCB2YWxpZGF0b3IsIHJlcXVpcmVkIH0gPSB0aGlzLmF1dGhGb3JtW2tleV07XG4gICAgICBpZihyZXF1aXJlZCAmJiB2YWx1ZS50cmltKCkgPT0nJyl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkISc7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkYXRvciBpcyBub3QgY3VzdG9tXG4gICAgICAgICAgaWYodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9ICBuZXcgUmVnRXhwKHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICBpZighaXNWYWxpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IGAke2tleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zbGljZSgxKX0gaXMgbm90IGEgdmFsaWQgaW5wdXQuYDtcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdDdXN0b20gdmFsaWRhdG9yIHNob3VsZCBiZSBvbiByZWdleCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5wYXR0ZXJuKTtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLm1lc3NhZ2U7XG4gICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIHJldHVybiAhaGFzRXJyb3JzO1xuICB9XG5cbiAgY2xlYXJGb3JtKCl7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvbGUgPSB0aGlzLmF1dGguYWNjb3VudExvZ2dlZEluKClcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IHJvbGUgb2YgdXNlciBpZiBhdXRoZW50aWNhdGVkLCBudWxsIGlmIHVuYXV0aGVudGljYXRlZFxuICAgKiovXG4gIGFjY291bnRMb2dnZWRJbigpIHtcbiAgICByZXR1cm4gdGhpcy51c2VkU3RvcmFnZS5nZXRJdGVtKCdsb2dnZWRfaW4nKTtcbiAgfVxuXG4gIGxvZ291dCgpIHtcbiAgICBpZiAoIXRoaXMuYWNjb3VudExvZ2dlZEluKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy51c2VkU3RvcmFnZS5jbGVhcigpO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J3N1Y2Nlc3MnLFxuICAgICAgJ21lc3NhZ2UnOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5sb2dnZWRPdXQgPz8gJ0FjY291bnQgaGFzIGJlZW4gbG9nZ2VkIG91dC4nLFxuICAgIH1cbiAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy8nXSk7XG4gIH1cblxuXG4gIGdldEF1dGhGaWVsZChrZXk6c3RyaW5nKXtcbiAgICByZXR1cm4gdGhpcy5hdXRoRm9ybVtrZXldO1xuICB9XG4gIFxuICBpbml0aWFsaXplRm9ybUZpZWxkKGtleTpzdHJpbmcsIHJlcXVpcmVkOmJvb2xlYW4gLCB1bmlxdWU6Ym9vbGVhbiwgdHlwZTpzdHJpbmcsIGFsaWFzZXM/OnN0cmluZ1tdLCBlbmNyeXB0ZWQ/OmJvb2xlYW4sdmFsaWRhdG9yPzpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XT0ge3ZhbHVlOicnLCB2YWxpZGF0b3I6dmFsaWRhdG9yLCByZXF1aXJlZDpyZXF1aXJlZCwgdHlwZTp0eXBlLCBhbGlhc2VzOmFsaWFzZXMsZW5jcnlwdGVkOmVuY3J5cHRlZCx1bmlxdWU6dW5pcXVlfTtcbiAgfVxuXG4gIGhhbmRsZUZvcm1WYWx1ZShrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgaXNMb2NhbFN0b3JhZ2UoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdG9yYWdlJyk7XG4gICAgcmV0dXJuIHN0b3JhZ2UgPT0gJ2xvY2FsJztcbiAgICBcbiAgfVxuXG4gIGdldFNhdmVkRW1haWwoKSB7XG4gICAgY29uc3QgZW1haWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmVtZW1iZXInKTtcbiAgICByZXR1cm4gZW1haWw7XG4gIH1cblxuICB1c2VMb2NhbFN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnbG9jYWwnKTtcbiAgfVxuXG4gIHVzZVNlc3Npb25TdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ3Nlc3Npb24nKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5jcnlwdFJlcXVlc3QocGxhaW50ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGtleVN0cmluZyA9ICdBSFM4NTc2NTk4UElPVU5BMjE0ODQyNzgwMzA5bXBxYkgnO1xuICAgIGNvbnN0IGtleSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShrZXlTdHJpbmcuc2xpY2UoMCwgMzIpKTsgLy8gVXNlIG9ubHkgdGhlIGZpcnN0IDMyIGNoYXJhY3RlcnMgZm9yIEFFUy0yNTZcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTYpKTsgLy8gR2VuZXJhdGUgcmFuZG9tIElWICgxNiBieXRlcyBmb3IgQUVTKVxuXG4gICAgLy8gSW1wb3J0IHRoZSBrZXlcbiAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAga2V5LFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydlbmNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gRW5jcnlwdCB0aGUgcGxhaW50ZXh0XG4gICAgY29uc3QgZW5jb2RlZFBsYWludGV4dCA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShwbGFpbnRleHQpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXY6IGl2IH0sXG4gICAgICBjcnlwdG9LZXksXG4gICAgICBlbmNvZGVkUGxhaW50ZXh0XG4gICAgKTtcblxuICAgIC8vIENvbWJpbmUgSVYgYW5kIGNpcGhlcnRleHQsIHRoZW4gZW5jb2RlIHRvIGJhc2U2NFxuICAgIGNvbnN0IGNvbWJpbmVkID0gbmV3IFVpbnQ4QXJyYXkoaXYuYnl0ZUxlbmd0aCArIGNpcGhlcnRleHQuYnl0ZUxlbmd0aCk7XG4gICAgY29tYmluZWQuc2V0KGl2LCAwKTtcbiAgICBjb21iaW5lZC5zZXQobmV3IFVpbnQ4QXJyYXkoY2lwaGVydGV4dCksIGl2LmJ5dGVMZW5ndGgpO1xuXG4gICAgLy8gQ29udmVydCB0byBiYXNlNjRcbiAgICByZXR1cm4gYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNvbWJpbmVkKSk7XG4gIH1cblxuICBhc3luYyBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBvYmpdIG9mIE9iamVjdC5lbnRyaWVzPGFueT4oYm9keSkpIHtcbiAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlcycpIHtcbiAgICAgICAgZm9yICh2YXIgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgIGlmKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkZWxldGUgb2JqW2ZpZWxkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBjb25zdCBqc29uU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIEFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApO1xuXG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgdGhpcy5lbmNyeXB0UmVxdWVzdChqc29uU3RyaW5nKTtcbiAgICByZXR1cm4gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgZW5jcnlwdGVkLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApKTtcbiAgfVxuXG4gIGFzeW5jIGhhc2goZW5jcnlwdDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IHRoaXMucG9zdCgnZ2V0X2hhc2gnLCB7ZW5jcnlwdDogZW5jcnlwdH0pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjaGVja0R1cGxpY2F0ZXModGFibGVzOnN0cmluZ1tdLCB2YWx1ZXM6e1trZXk6c3RyaW5nXTpzdHJpbmd9KXtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucG9zdCgnY2hlY2tfZHVwbGljYXRlcycseyd0YWJsZXMnOiB0YWJsZXMsICd2YWx1ZXMnOnZhbHVlc30pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcbiAgICB9XG4gIH1cblxuXG5cbiAgYXN5bmMgcmVnaXN0ZXIoKSB7XG4gICAgaWYodGhpcy5sb2FkaW5nKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYodGhpcy5jb25maWc/LnJlZ2lzdHJhdGlvblRhYmxlID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnUmVnaXN0cmF0aW9uIHRhYmxlIG11c3QgYmUgaW5pdGlhbGl6ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIXRoaXMudmFsaWRhdGVJbnB1dEZpZWxkcygpKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J25ldXRyYWwnLFxuICAgICAgJ21lc3NhZ2UnOidMb2FkaW5nLi4uJyxcbiAgICAgIGlzSW5maW5pdGU6dHJ1ZSxcbiAgICB9XG5cbiAgICAvLyBjaGVjayBkdXBsaWNhdGVzXG4gICAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLnRvU3RyaW5nKCk7XG4gICAgdmFyIHZpc0lEO1xuICAgIGlmKHRoaXMuY29uZmlnPy52aXNpYmxlSUQpe1xuICAgICAgdmlzSUQgPSBgJHt0aGlzLmNvbmZpZy52aXNpYmxlSUR9LWAgKyBuZXdEYXRlLnN1YnN0cmluZyg0LCA3KSArICctJyArIG5ld0RhdGUuc3Vic3RyaW5nKDcsIDEzKTtcbiAgICB9XG4gICAgY29uc3QgYXV0aEZpZWxkcyA9IE9iamVjdC5rZXlzKHRoaXMuYXV0aEZvcm0pO1xuXG4gICAgdmFyIHZhbHVlczphbnkgPXt9O1xuXG4gICAgZm9yKGxldCBmaWVsZCBvZiBhdXRoRmllbGRzKXtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMuYXV0aEZvcm1bZmllbGRdLnZhbHVlO1xuICAgICAgaWYodGhpcy5hdXRoRm9ybVtmaWVsZF0uZW5jcnlwdGVkKXtcbiAgICAgICAgY29uc3QgaGFzaCA9IGF3YWl0IHRoaXMuaGFzaCh2YWx1ZSk7XG4gICAgICAgIGlmKGhhc2gpe1xuICAgICAgICAgIHZhbHVlID0gaGFzaFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nLCB0cnkgYWdhaW4gbGF0ZXIuLi4nLFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuYXV0aEZvcm1bZmllbGRdLnVuaXF1ZSl7XG4gICAgICAgIGNvbnN0IGhhc0R1cGxpY2F0ZSA9IGF3YWl0IHRoaXMuY2hlY2tEdXBsaWNhdGVzKHRoaXMuY29uZmlnLmxvZ2luVGFibGUsIHtbZmllbGRdOiB0aGlzLmF1dGhGb3JtW2ZpZWxkXS52YWx1ZX0pXG4gICAgICAgIGlmKGhhc0R1cGxpY2F0ZSAhPSBudWxsKXtcbiAgICAgICAgICBpZihoYXNEdXBsaWNhdGUpe1xuICAgICAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgJHtmaWVsZC50b1VwcGVyQ2FzZSgpfSBhbHJlYWR5IGV4aXN0cy5gLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHRyeSBhZ2FpbiBsYXRlci4uLicsXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgICBcbiAgICAgIHZhbHVlc1tmaWVsZF0gPXZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBwb3N0T2JqZWN0ID0gXG4gICAgICAgT2JqZWN0LmFzc2lnbih2aXNJRCAhPSBudWxsID8ge3Zpc2libGVpZDp2aXNJRH06e30sIHRoaXMuY29uZmlnLnZlcmlmaWNhdGlvbiA/IHt2ZXJpZmllZDpmYWxzZX06e30sIHthY2NvdW50VHlwZTogdGhpcy5jb25maWcucmVnaXN0cmF0aW9uVGFibGV9LFxuICAgICAgICB2YWx1ZXNcbiAgICAgICApOyBcbiAgICAgICBcbiAgICB0aGlzLnBvc3QoJ3JlZ2lzdGVyJywgXG4gICAgICB7ZGF0YTpKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KX0sXG4gICAgKS50aGVuKChkYXRhOmFueSk9PntcbiAgICAgIHRoaXMubG9hZGluZyA9ZmFsc2U7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAgICAvLyBzaG93IHByb3BlciBzbmFja2JhclxuICAgICAgICBpZih0aGlzLmNvbmZpZz8udmVyaWZpY2F0aW9uKXtcbiAgICAgICAgICAvLyB3YWl0IGZvciB2ZXJpZmljYXRpb25cbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5mb3JWZXJpZmljYXRpb24gPz8gJ1BsZWFzZSB3YWl0IGZvciBhY2NvdW50IHZlcmlmaWNhdGlvbi4uLidcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNleyAgXG4gICAgICAgICAgLy8gc3VjY2Vzc2Z1bGx5IHJlZ2lzdGVyZWQhYFxuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLnJlZ2lzdGVyZWQgPz8gJ1JlZ2lzdHJhdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgeW91IG1heSBub3cgbG9naW4gd2l0aCB5b3VyIGNyZWRlbnRpYWxzJ1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNsZWFyRm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYWxlcnQoZGF0YS5vdXRwdXQpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVNuYWNrYmFyKCl7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICB9XG4gIFxuICBsb2dpbigpIHtcbiAgICBpZih0aGlzLmxvYWRpbmcpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZz8ubG9naW5UYWJsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0xvZ2luIHRhYmxlIG11c3QgYmUgaW5pdGlhbGl6ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNoZWNrIGlmIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBmaWVsZHMgYXJlIHByZXNlbnRcbiAgICBpZih0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ109PW51bGwgfHwgdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXSA9PSBudWxsKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSBpZGVudGlmaWVyIGFuZCBwYXNzd29yZCBmaWVsZHMgdXNpbmcgW25hbWVdPVwiZmllbGRcIicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzID09IHVuZGVmaW5lZCB8fCB0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlcy5sZW5ndGggPD0wKXtcbiAgICAgIGFsZXJ0KFwiSWRlbnRpZmllciBmaWVsZCBtdXN0IGJlIGluaXRpYWxpemVkIHdpdGggYWxpYXNlcz1bYWxpYXNlc11cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIXRoaXMudmFsaWRhdGVJbnB1dEZpZWxkcygpKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgJ3R5cGUnOiduZXV0cmFsJyxcbiAgICAgICdtZXNzYWdlJzonTG9hZGluZy4uLicsXG4gICAgICBpc0luZmluaXRlOnRydWUsXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBvc3QoJ2xvZ2luJywge1xuICAgICAgYXV0aFR5cGU6IHRoaXMuY29uZmlnLmF1dGhUeXBlLFxuICAgICAgaWRlbnRpZmllclZhbHVlOiB0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10udmFsdWUsXG4gICAgICBwYXNzd29yZDogdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXS52YWx1ZSxcbiAgICAgIHRhYmxlczogdGhpcy5jb25maWcubG9naW5UYWJsZSxcbiAgICAgIGlkZW50aWZpZXJUeXBlczp0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlc1xuICAgIH0pLnRoZW4oKGRhdGE6YW55KSA9PiB7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSBkYXRhLnN1Y2Nlc3MgPyB7XG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEubG9nZ2VkSW4gPz8gJ0xvZ2luIFN1Y2Nlc3NmdWwhJ1xuICAgICAgfSA6IHtcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgbWVzc2FnZTpkYXRhLm91dHB1dFxuICAgICAgfTtcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGRhdGEub3V0cHV0O1xuICAgICAgICBpZih0aGlzLmNvbmZpZz8ucmVkaXJlY3RbdXNlci5yb2xlXT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiVGhpcyB1c2VyIGlzIG5vdCBhdXRob3JpemVkLlwiXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgZGVsYXlcbiAgICAgICAgaWYodGhpcy50aW1lb3V0KXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgXG4gICAgICAgICAgaWYodGhpcy5jb25maWc/LmF1dGhUeXBlID09ICdqd3QnKXtcbiAgICAgICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbSgndXNlcl9pbmZvJywgdXNlci50b2tlbik7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgICAgICdsb2dnZWRfaW4nLFxuICAgICAgICAgICAgICB1c2VyLnJvbGVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oJ3VzZXJfaW5mbycsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMuY29uZmlnPy5yZWRpcmVjdFt1c2VyLnJvbGVdXSk7XG4gICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIH0sdGhpcy5jb25maWc/LmxvZ2luVGltZW91dCA/PyAxNTAwKVxuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIGFsZXJ0KGRhdGEub3V0cHV0KVxuICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiBkYXRhLm91dHB1dFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFVzZXIoKXtcbiAgICBjb25zdCB1c2VyID0gdGhpcy51c2VkU3RvcmFnZS5nZXRJdGVtKCd1c2VyX2luZm8nKTtcbiAgICBpZih1c2VyICE9IG51bGwpe1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UodXNlcik7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBqd3RVc2VyKCl7XG4gICAgaWYoIXRoaXMuY29uZmlnKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgaXMgbm90IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgand0VG9rZW4gPSB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ3VzZXJfaW5mbycpO1xuICAgIGlmKGp3dFRva2VuICE9IG51bGwpe1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnBvc3QoJ3Byb3RlY3RlZCcsIHtcbiAgICAgICAgdG9rZW46IGp3dFRva2VuXG4gICAgICB9KTtcbiAgICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5vdXRwdXQpO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cblxufVxuIl19