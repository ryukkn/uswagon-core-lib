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
    async initialize(config) {
        this.config = config;
        if (this.config.authMessages == undefined) {
            this.config.authMessages = {};
        }
        this.authForm = {};
        if (!this.config.authType) {
            this.config.authType = 'default';
        }
        if (this.config.authType == 'jwt') {
            await this.decodeJWT();
        }
        const role = this.accountLoggedIn();
        if (role != null) {
            this.router.navigate([this.config?.redirect[role]]);
        }
        else {
            if (this.config.authType == 'jwt') {
                if (this.refreshInterval) {
                    clearInterval(this.refreshInterval);
                }
                this.refreshInterval = setInterval(async () => {
                    await this.refreshJWT();
                }, (3600 / 2) * 1000);
            }
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
        if (this.config?.authType == 'default') {
            this.role = this.usedStorage.getItem('logged_in');
        }
        return this.role;
    }
    logout() {
        if (!this.accountLoggedIn()) {
            return;
        }
        this.role = null;
        this.user = null;
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
        if (this.config?.authType == 'default') {
            const user = this.usedStorage.getItem('user_info');
            if (user != null) {
                this.user = JSON.parse(user);
            }
        }
        return this.user;
    }
    async decodeJWT() {
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
                this.user = response.output.data;
                this.role = this.user.role;
                await this.refreshJWT();
            }
            else {
                throw new Error(response.output);
            }
        }
    }
    async refreshJWT() {
        if (!this.config) {
            alert('Config is not initialized');
            return;
        }
        const jwtToken = this.usedStorage.getItem('user_info');
        if (jwtToken != null) {
            const response = await this.post('refresh', {
                token: jwtToken
            });
            if (!response.success) {
                throw new Error(response.output);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUF5QzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXhDakIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUd2QixnQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFFcEUsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFLbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVB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QVcsQ0FBQyxDQUFDO1FBQ3ZELElBQUcsUUFBUSxJQUFJLElBQUksRUFBQyxDQUFDO1lBQ25CLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQzFDLEtBQUssRUFBRSxRQUFRO2FBQ2hCLENBQUMsQ0FBQztZQUNILElBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFDLENBQUM7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQzsrR0EvZ0JVLGtCQUFrQjttSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07OzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyAgQXV0aENvbmZpZywgQXV0aEZvcm0sIEF1dGhWYWxpZGF0b3IsIFNuYWNrYmFyRmVlZGJhY2ssQXV0aE1lc3NhZ2VzIH0gZnJvbSAnLi90eXBlcy91c3dhZ29uLWF1dGgudHlwZXMnO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoU2VydmljZSB7XG5cbiAgcHVibGljIHNuYWNrYmFyRmVlZGJhY2s/OlNuYWNrYmFyRmVlZGJhY2s7XG4gIHB1YmxpYyBsb2FkaW5nOmJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIHJlZnJlc2hJbnRlcnZhbDphbnk7XG4gIHByaXZhdGUgdXNlZFN0b3JhZ2UgPSB0aGlzLmlzTG9jYWxTdG9yYWdlKCkgPyBsb2NhbFN0b3JhZ2UgOiBzZXNzaW9uU3RvcmFnZTtcbiAgcHJpdmF0ZSBjb25maWc6QXV0aENvbmZpZ3x1bmRlZmluZWQ7XG4gIHByaXZhdGUgYXV0aEZvcm06QXV0aEZvcm0gPSB7fTtcbiAgcHJpdmF0ZSBlbWFpbE5vdGlmaWNhdGlvbjpib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgdGltZW91dDphbnk7XG4gIHByaXZhdGUgdXNlcjphbnk7XG4gIHByaXZhdGUgcm9sZTphbnk7XG5cbiAgcHJpdmF0ZSB2YWxpZGF0b3JzOkF1dGhWYWxpZGF0b3IgPSB7XG4gICAgZW1haWw6IHtcbiAgICAgIHBhdHRlcm46ICdeW1xcXFx3LS5dK0BbXFxcXHctXStcXFxcLlthLXpBLVpdezIsfShbLl1bYS16QS1aXXsyLH0pKiQnLFxuICAgICAgbWVzc2FnZTogJ0VtYWlsIGlzIG5vdCB2YWxpZC4nXG4gICAgfSxcbiAgICBwYXNzd29yZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/PS4qW2Etel0pKD89LipbQS1aXSkoPz0uKlxcXFxkKSg/PS4qWyFAIyQlXiYqXSlbQS1aYS16XFxcXGQhQCMkJV4mKl17OCx9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nIGFuZCBpbmNsdWRlIHVwcGVyY2FzZSwgbG93ZXJjYXNlLCBudW1iZXIsIGFuZCBzcGVjaWFsIGNoYXJhY3Rlci4nXG4gICAgfSxcbiAgICBwaG9uZToge1xuICAgICAgICBwYXR0ZXJuOiAnXihcXFxcK1xcXFxkezEsM31cXFxccz8pP1xcXFwoP1xcXFxkezN9XFxcXCk/Wy1cXFxcc10/XFxcXGR7M31bLVxcXFxzXT9cXFxcZHs0fSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGhvbmUgbnVtYmVyIG11c3QgYmUgaW4gYSB2YWxpZCBmb3JtYXQuJ1xuICAgIH0sXG4gICAgdXNlcm5hbWU6IHtcbiAgICAgIHBhdHRlcm46ICdeW2EtekEtWjAtOV17MywxNX0kJyxcbiAgICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IGJlIDMtMTUgY2hhcmFjdGVycyBsb25nIGFuZCBjYW4gb25seSBjb250YWluIGxldHRlcnMgYW5kIG51bWJlcnMuJ1xuICAgIH0sXG4gICAgY3JlZGl0Q2FyZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XXsyfSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fDdbMC05XXsxNX0pJCcsXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGNyZWRpdCBjYXJkIG51bWJlci4nXG4gICAgfSxcbiAgICBwb3N0YWxDb2RlOiB7XG4gICAgICBwYXR0ZXJuOiAnXlxcXFxkezV9KC1cXFxcZHs0fSk/JCcsXG4gICAgICBtZXNzYWdlOiAnUG9zdGFsIGNvZGUgbXVzdCBiZSBpbiB0aGUgZm9ybWF0IDEyMzQ1IG9yIDEyMzQ1LTY3ODkuJ1xuICAgIH0sXG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG4gIFxuICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZXJ2aWNlIGZvciB0aGUgcHJvamVjdFxuICAgICAqIEBwYXJhbSBjb25maWcgLSBjb25maWd1cmF0aW9uIHRoYXQgcG9pbnRzIHRoZSBzZXJ2aWNlIHRvIGl0cyBhcHByb3ByaWF0ZSBzZXJ2ZXJcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuYXV0aC5pbml0aWFsaXplKHtcbiAgICAgKiAgYXBpOmVudmlyb25tZW50LmFwaSxcbiAgICAgKiAgYXBpS2V5OiBlbnZpcm9ubWVudC5hcGlLZXksXG4gICAgICogIGFwcDogJ3Rlc3QtYXBwJyxcbiAgICAgKiAgcmVnaXN0cmF0aW9uVGFibGU6ICd0ZWFjaGVycycsIC8vIGNhbiBiZSB1bmRlZmluZWQgbG9naW5cbiAgICAgKiAgbG9naW5UYWJsZTogWyd0ZWFjaGVycycsICdhZG1pbmlzdHJhdG9ycycsICdzdHVkZW50cyddXG4gICAgICogIHJlZGlyZWN0OntcbiAgICAgKiAgICAnc3R1ZGVudHMnOiAnL3N0dWRlbnQnLFxuICAgICAqICAgICd0ZWFjaGVycyc6ICcvdGVhY2hlcicsXG4gICAgICogICAgJ2FkbWluaXN0cmF0b3JzJzogJy9hZG1pbicsXG4gICAgICogICB9XG4gICAgICogfSlcbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBpbml0aWFsaXplKGNvbmZpZzpBdXRoQ29uZmlnKXtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICBpZih0aGlzLmNvbmZpZy5hdXRoTWVzc2FnZXMgPT0gdW5kZWZpbmVkKXtcbiAgICAgIHRoaXMuY29uZmlnLmF1dGhNZXNzYWdlcyA9IHt9O1xuICAgIH1cbiAgICB0aGlzLmF1dGhGb3JtID0ge307XG4gICAgaWYoIXRoaXMuY29uZmlnLmF1dGhUeXBlKXtcbiAgICAgIHRoaXMuY29uZmlnLmF1dGhUeXBlID0gJ2RlZmF1bHQnO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZy5hdXRoVHlwZSA9PSAnand0Jyl7XG4gICAgICBhd2FpdCB0aGlzLmRlY29kZUpXVCgpO1xuICAgIH1cbiAgICBjb25zdCByb2xlID0gdGhpcy5hY2NvdW50TG9nZ2VkSW4oKTtcbiAgICBpZihyb2xlIT1udWxsKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3Rbcm9sZV1dKTtcbiAgICB9ZWxzZXtcbiAgICAgIFxuICAgICAgaWYodGhpcy5jb25maWcuYXV0aFR5cGUgPT0gJ2p3dCcpe1xuICAgICAgICBpZih0aGlzLnJlZnJlc2hJbnRlcnZhbCl7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnJlZnJlc2hJbnRlcnZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PntcbiAgICAgICAgICBhd2FpdCB0aGlzLnJlZnJlc2hKV1QoKTtcbiAgICAgICAgfSwoMzYwMC8yKSAqIDEwMDApXG4gICAgICB9XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWc/LnJlZGlyZWN0W3JvbGVdXSk7XG4gICAgICBcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUlucHV0RmllbGRzKCk6Ym9vbGVhbntcbiAgICB2YXIgaGFzRXJyb3JzID0gZmFsc2U7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICBjb25zdCB7IHZhbHVlLCB2YWxpZGF0b3IsIHJlcXVpcmVkIH0gPSB0aGlzLmF1dGhGb3JtW2tleV07XG4gICAgICBpZihyZXF1aXJlZCAmJiB2YWx1ZS50cmltKCkgPT0nJyl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkISc7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkYXRvciBpcyBub3QgY3VzdG9tXG4gICAgICAgICAgaWYodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9ICBuZXcgUmVnRXhwKHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICBpZighaXNWYWxpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IGAke2tleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zbGljZSgxKX0gaXMgbm90IGEgdmFsaWQgaW5wdXQuYDtcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdDdXN0b20gdmFsaWRhdG9yIHNob3VsZCBiZSBvbiByZWdleCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5wYXR0ZXJuKTtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLm1lc3NhZ2U7XG4gICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIHJldHVybiAhaGFzRXJyb3JzO1xuICB9XG5cbiAgY2xlYXJGb3JtKCl7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvbGUgPSB0aGlzLmF1dGguYWNjb3VudExvZ2dlZEluKClcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IHJvbGUgb2YgdXNlciBpZiBhdXRoZW50aWNhdGVkLCBudWxsIGlmIHVuYXV0aGVudGljYXRlZFxuICAgKiovXG4gIGFjY291bnRMb2dnZWRJbigpIHtcbiAgICBpZih0aGlzLmNvbmZpZz8uYXV0aFR5cGUgPT0gJ2RlZmF1bHQnKXtcbiAgICAgIHRoaXMucm9sZSA9IHRoaXMudXNlZFN0b3JhZ2UuZ2V0SXRlbSgnbG9nZ2VkX2luJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJvbGU7XG4gIH1cblxuICBsb2dvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmFjY291bnRMb2dnZWRJbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucm9sZSA9IG51bGw7XG4gICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICB0aGlzLnVzZWRTdG9yYWdlLmNsZWFyKCk7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICd0eXBlJzonc3VjY2VzcycsXG4gICAgICAnbWVzc2FnZSc6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLmxvZ2dlZE91dCA/PyAnQWNjb3VudCBoYXMgYmVlbiBsb2dnZWQgb3V0LicsXG4gICAgfVxuICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnLyddKTtcbiAgfVxuXG5cbiAgZ2V0QXV0aEZpZWxkKGtleTpzdHJpbmcpe1xuICAgIHJldHVybiB0aGlzLmF1dGhGb3JtW2tleV07XG4gIH1cbiAgXG4gIGluaXRpYWxpemVGb3JtRmllbGQoa2V5OnN0cmluZywgcmVxdWlyZWQ6Ym9vbGVhbiAsIHVuaXF1ZTpib29sZWFuLCB0eXBlOnN0cmluZywgYWxpYXNlcz86c3RyaW5nW10sIGVuY3J5cHRlZD86Ym9vbGVhbix2YWxpZGF0b3I/OnN0cmluZyl7XG4gICAgdGhpcy5hdXRoRm9ybVtrZXldPSB7dmFsdWU6JycsIHZhbGlkYXRvcjp2YWxpZGF0b3IsIHJlcXVpcmVkOnJlcXVpcmVkLCB0eXBlOnR5cGUsIGFsaWFzZXM6YWxpYXNlcyxlbmNyeXB0ZWQ6ZW5jcnlwdGVkLHVuaXF1ZTp1bmlxdWV9O1xuICB9XG5cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5hdXRoRm9ybVtrZXldLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBpc0xvY2FsU3RvcmFnZSgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0b3JhZ2UnKTtcbiAgICByZXR1cm4gc3RvcmFnZSA9PSAnbG9jYWwnO1xuICAgIFxuICB9XG5cbiAgZ2V0U2F2ZWRFbWFpbCgpIHtcbiAgICBjb25zdCBlbWFpbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZW1lbWJlcicpO1xuICAgIHJldHVybiBlbWFpbDtcbiAgfVxuXG4gIHVzZUxvY2FsU3RvcmFnZSgpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RvcmFnZScsICdsb2NhbCcpO1xuICB9XG5cbiAgdXNlU2Vzc2lvblN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnc2Vzc2lvbicpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbmNyeXB0UmVxdWVzdChwbGFpbnRleHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qga2V5U3RyaW5nID0gJ0FIUzg1NzY1OThQSU9VTkEyMTQ4NDI3ODAzMDltcHFiSCc7XG4gICAgY29uc3Qga2V5ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGtleVN0cmluZy5zbGljZSgwLCAzMikpOyAvLyBVc2Ugb25seSB0aGUgZmlyc3QgMzIgY2hhcmFjdGVycyBmb3IgQUVTLTI1NlxuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxNikpOyAvLyBHZW5lcmF0ZSByYW5kb20gSVYgKDE2IGJ5dGVzIGZvciBBRVMpXG5cbiAgICAvLyBJbXBvcnQgdGhlIGtleVxuICAgIGNvbnN0IGNyeXB0b0tleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBrZXksXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJyB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICk7XG5cbiAgICAvLyBFbmNyeXB0IHRoZSBwbGFpbnRleHRcbiAgICBjb25zdCBlbmNvZGVkUGxhaW50ZXh0ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHBsYWludGV4dCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBpdjogaXYgfSxcbiAgICAgIGNyeXB0b0tleSxcbiAgICAgIGVuY29kZWRQbGFpbnRleHRcbiAgICApO1xuXG4gICAgLy8gQ29tYmluZSBJViBhbmQgY2lwaGVydGV4dCwgdGhlbiBlbmNvZGUgdG8gYmFzZTY0XG4gICAgY29uc3QgY29tYmluZWQgPSBuZXcgVWludDhBcnJheShpdi5ieXRlTGVuZ3RoICsgY2lwaGVydGV4dC5ieXRlTGVuZ3RoKTtcbiAgICBjb21iaW5lZC5zZXQoaXYsIDApO1xuICAgIGNvbWJpbmVkLnNldChuZXcgVWludDhBcnJheShjaXBoZXJ0ZXh0KSwgaXYuYnl0ZUxlbmd0aCk7XG5cbiAgICAvLyBDb252ZXJ0IHRvIGJhc2U2NFxuICAgIHJldHVybiBidG9hKFN0cmluZy5mcm9tQ2hhckNvZGUoLi4uY29tYmluZWQpKTtcbiAgfVxuXG4gIGFzeW5jIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIG9ial0gb2YgT2JqZWN0LmVudHJpZXM8YW55Pihib2R5KSkge1xuICAgICAgaWYgKGtleSA9PSAndmFsdWVzJykge1xuICAgICAgICBmb3IgKHZhciBbZmllbGQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgaWYodmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBvYmpbZmllbGRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHtcbiAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSk7XG4gICAgY29uc3Qgc2FsdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBUElfS0VZOiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgQXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgTWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5XG4gICAgICAgIClcbiAgICAgICk7XG5cbiAgICBjb25zdCBlbmNyeXB0ZWQgPSBhd2FpdCB0aGlzLmVuY3J5cHRSZXF1ZXN0KGpzb25TdHJpbmcpO1xuICAgIHJldHVybiBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLmh0dHAucG9zdDxhbnk+KFxuICAgICAgdGhpcy5jb25maWc/LmFwaSArICc/JyArIHNhbHQsXG4gICAgICBlbmNyeXB0ZWQsXG4gICAgICB7IGhlYWRlcnMgfVxuICAgICkpO1xuICB9XG5cbiAgYXN5bmMgaGFzaChlbmNyeXB0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCdnZXRfaGFzaCcsIHtlbmNyeXB0OiBlbmNyeXB0fSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrRHVwbGljYXRlcyh0YWJsZXM6c3RyaW5nW10sIHZhbHVlczp7W2tleTpzdHJpbmddOnN0cmluZ30pe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wb3N0KCdjaGVja19kdXBsaWNhdGVzJyx7J3RhYmxlcyc6IHRhYmxlcywgJ3ZhbHVlcyc6dmFsdWVzfSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuXG5cblxuICBhc3luYyByZWdpc3RlcigpIHtcbiAgICBpZih0aGlzLmxvYWRpbmcpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZz8ucmVnaXN0cmF0aW9uVGFibGUgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdSZWdpc3RyYXRpb24gdGFibGUgbXVzdCBiZSBpbml0aWFsaXplZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighdGhpcy52YWxpZGF0ZUlucHV0RmllbGRzKCkpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICd0eXBlJzonbmV1dHJhbCcsXG4gICAgICAnbWVzc2FnZSc6J0xvYWRpbmcuLi4nLFxuICAgICAgaXNJbmZpbml0ZTp0cnVlLFxuICAgIH1cblxuICAgIC8vIGNoZWNrIGR1cGxpY2F0ZXNcbiAgICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoKTtcbiAgICB2YXIgdmlzSUQ7XG4gICAgaWYodGhpcy5jb25maWc/LnZpc2libGVJRCl7XG4gICAgICB2aXNJRCA9IGAke3RoaXMuY29uZmlnLnZpc2libGVJRH0tYCArIG5ld0RhdGUuc3Vic3RyaW5nKDQsIDcpICsgJy0nICsgbmV3RGF0ZS5zdWJzdHJpbmcoNywgMTMpO1xuICAgIH1cbiAgICBjb25zdCBhdXRoRmllbGRzID0gT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSk7XG5cbiAgICB2YXIgdmFsdWVzOmFueSA9e307XG5cbiAgICBmb3IobGV0IGZpZWxkIG9mIGF1dGhGaWVsZHMpe1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5hdXRoRm9ybVtmaWVsZF0udmFsdWU7XG4gICAgICBpZih0aGlzLmF1dGhGb3JtW2ZpZWxkXS5lbmNyeXB0ZWQpe1xuICAgICAgICBjb25zdCBoYXNoID0gYXdhaXQgdGhpcy5oYXNoKHZhbHVlKTtcbiAgICAgICAgaWYoaGFzaCl7XG4gICAgICAgICAgdmFsdWUgPSBoYXNoXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHRyeSBhZ2FpbiBsYXRlci4uLicsXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYodGhpcy5hdXRoRm9ybVtmaWVsZF0udW5pcXVlKXtcbiAgICAgICAgY29uc3QgaGFzRHVwbGljYXRlID0gYXdhaXQgdGhpcy5jaGVja0R1cGxpY2F0ZXModGhpcy5jb25maWcubG9naW5UYWJsZSwge1tmaWVsZF06IHRoaXMuYXV0aEZvcm1bZmllbGRdLnZhbHVlfSlcbiAgICAgICAgaWYoaGFzRHVwbGljYXRlICE9IG51bGwpe1xuICAgICAgICAgIGlmKGhhc0R1cGxpY2F0ZSl7XG4gICAgICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke2ZpZWxkLnRvVXBwZXJDYXNlKCl9IGFscmVhZHkgZXhpc3RzLmAsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdTb21ldGhpbmcgd2VudCB3cm9uZywgdHJ5IGFnYWluIGxhdGVyLi4uJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAgIFxuICAgICAgdmFsdWVzW2ZpZWxkXSA9dmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHBvc3RPYmplY3QgPSBcbiAgICAgICBPYmplY3QuYXNzaWduKHZpc0lEICE9IG51bGwgPyB7dmlzaWJsZWlkOnZpc0lEfTp7fSwgdGhpcy5jb25maWcudmVyaWZpY2F0aW9uID8ge3ZlcmlmaWVkOmZhbHNlfTp7fSwge2FjY291bnRUeXBlOiB0aGlzLmNvbmZpZy5yZWdpc3RyYXRpb25UYWJsZX0sXG4gICAgICAgIHZhbHVlc1xuICAgICAgICk7IFxuICAgICAgIFxuICAgIHRoaXMucG9zdCgncmVnaXN0ZXInLCBcbiAgICAgIHtkYXRhOkpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpfSxcbiAgICApLnRoZW4oKGRhdGE6YW55KT0+e1xuICAgICAgdGhpcy5sb2FkaW5nID1mYWxzZTtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICAgIC8vIHNob3cgcHJvcGVyIHNuYWNrYmFyXG4gICAgICAgIGlmKHRoaXMuY29uZmlnPy52ZXJpZmljYXRpb24pe1xuICAgICAgICAgIC8vIHdhaXQgZm9yIHZlcmlmaWNhdGlvblxuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLmZvclZlcmlmaWNhdGlvbiA/PyAnUGxlYXNlIHdhaXQgZm9yIGFjY291bnQgdmVyaWZpY2F0aW9uLi4uJ1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7ICBcbiAgICAgICAgICAvLyBzdWNjZXNzZnVsbHkgcmVnaXN0ZXJlZCFgXG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEucmVnaXN0ZXJlZCA/PyAnUmVnaXN0cmF0aW9uIHdhcyBzdWNjZXNzZnVsLCB5b3UgbWF5IG5vdyBsb2dpbiB3aXRoIHlvdXIgY3JlZGVudGlhbHMnXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuY2xlYXJGb3JtKCk7XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBhbGVydChkYXRhLm91dHB1dClcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU25hY2tiYXIoKXtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gIH1cbiAgXG4gIGxvZ2luKCkge1xuICAgIGlmKHRoaXMubG9hZGluZyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKHRoaXMuY29uZmlnPy5sb2dpblRhYmxlID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnTG9naW4gdGFibGUgbXVzdCBiZSBpbml0aWFsaXplZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gY2hlY2sgaWYgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIGZpZWxkcyBhcmUgcHJlc2VudFxuICAgIGlmKHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXT09bnVsbCB8fCB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddID09IG51bGwpe1xuICAgICAgYWxlcnQoJ1BsZWFzZSBpbml0aWFsaXplIGlkZW50aWZpZXIgYW5kIHBhc3N3b3JkIGZpZWxkcyB1c2luZyBbbmFtZV09XCJmaWVsZFwiJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYodGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddLmFsaWFzZXMgPT0gdW5kZWZpbmVkIHx8IHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzLmxlbmd0aCA8PTApe1xuICAgICAgYWxlcnQoXCJJZGVudGlmaWVyIGZpZWxkIG11c3QgYmUgaW5pdGlhbGl6ZWQgd2l0aCBhbGlhc2VzPVthbGlhc2VzXVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighdGhpcy52YWxpZGF0ZUlucHV0RmllbGRzKCkpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J25ldXRyYWwnLFxuICAgICAgJ21lc3NhZ2UnOidMb2FkaW5nLi4uJyxcbiAgICAgIGlzSW5maW5pdGU6dHJ1ZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucG9zdCgnbG9naW4nLCB7XG4gICAgICBhdXRoVHlwZTogdGhpcy5jb25maWcuYXV0aFR5cGUsXG4gICAgICBpZGVudGlmaWVyVmFsdWU6IHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS52YWx1ZSxcbiAgICAgIHBhc3N3b3JkOiB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddLnZhbHVlLFxuICAgICAgdGFibGVzOiB0aGlzLmNvbmZpZy5sb2dpblRhYmxlLFxuICAgICAgaWRlbnRpZmllclR5cGVzOnRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzXG4gICAgfSkudGhlbigoZGF0YTphbnkpID0+IHtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IGRhdGEuc3VjY2VzcyA/IHtcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5sb2dnZWRJbiA/PyAnTG9naW4gU3VjY2Vzc2Z1bCEnXG4gICAgICB9IDoge1xuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICBtZXNzYWdlOmRhdGEub3V0cHV0XG4gICAgICB9O1xuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICBjb25zdCB1c2VyID0gZGF0YS5vdXRwdXQ7XG4gICAgICAgIGlmKHRoaXMuY29uZmlnPy5yZWRpcmVjdFt1c2VyLnJvbGVdPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogXCJUaGlzIHVzZXIgaXMgbm90IGF1dGhvcml6ZWQuXCJcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBkZWxheVxuICAgICAgICBpZih0aGlzLnRpbWVvdXQpe1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICBcbiAgICAgICAgICBpZih0aGlzLmNvbmZpZz8uYXV0aFR5cGUgPT0gJ2p3dCcpe1xuICAgICAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKCd1c2VyX2luZm8nLCB1c2VyLnRva2VuKTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICAgICAgJ2xvZ2dlZF9pbicsXG4gICAgICAgICAgICAgIHVzZXIucm9sZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbSgndXNlcl9pbmZvJywgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWc/LnJlZGlyZWN0W3VzZXIucm9sZV1dKTtcbiAgICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfSx0aGlzLmNvbmZpZz8ubG9naW5UaW1lb3V0ID8/IDE1MDApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gYWxlcnQoZGF0YS5vdXRwdXQpXG4gICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIG1lc3NhZ2U6IGRhdGEub3V0cHV0XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0VXNlcigpe1xuICAgIGlmKHRoaXMuY29uZmlnPy5hdXRoVHlwZSA9PSAnZGVmYXVsdCcpe1xuICAgICAgY29uc3QgdXNlciA9IHRoaXMudXNlZFN0b3JhZ2UuZ2V0SXRlbSgndXNlcl9pbmZvJyk7XG4gICAgICBpZih1c2VyICE9IG51bGwpe1xuICAgICAgICB0aGlzLnVzZXIgPSBKU09OLnBhcnNlKHVzZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy51c2VyO1xuICB9XG5cbiAgYXN5bmMgZGVjb2RlSldUKCl7XG4gICAgaWYoIXRoaXMuY29uZmlnKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgaXMgbm90IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgand0VG9rZW4gPSB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ3VzZXJfaW5mbycpO1xuICAgIGlmKGp3dFRva2VuICE9IG51bGwpe1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnBvc3QoJ3Byb3RlY3RlZCcsIHtcbiAgICAgICAgdG9rZW46IGp3dFRva2VuXG4gICAgICB9KTtcbiAgICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgICB0aGlzLnVzZXIgPSAgcmVzcG9uc2Uub3V0cHV0LmRhdGE7XG4gICAgICAgIHRoaXMucm9sZSA9IHRoaXMudXNlci5yb2xlO1xuICAgICAgICBhd2FpdCB0aGlzLnJlZnJlc2hKV1QoKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uub3V0cHV0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyByZWZyZXNoSldUKCl7XG4gICAgaWYoIXRoaXMuY29uZmlnKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgaXMgbm90IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgand0VG9rZW4gPSB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ3VzZXJfaW5mbycpO1xuICAgIGlmKGp3dFRva2VuICE9IG51bGwpe1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnBvc3QoJ3JlZnJlc2gnLCB7XG4gICAgICAgIHRva2VuOiBqd3RUb2tlblxuICAgICAgfSk7XG4gICAgICBpZighcmVzcG9uc2Uuc3VjY2Vzcyl7IFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uub3V0cHV0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG59XG4iXX0=