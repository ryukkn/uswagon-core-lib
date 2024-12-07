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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUF5QzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXhDakIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUd2QixnQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFFcEUsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFLbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVB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QUFTLEVBQUU7Z0JBQzFDLEtBQUssRUFBRSxRQUFRO2FBQ2hCLENBQUMsQ0FBQztZQUNILElBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFDLENBQUM7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQzsrR0E3Z0JVLGtCQUFrQjttSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07OzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyAgQXV0aENvbmZpZywgQXV0aEZvcm0sIEF1dGhWYWxpZGF0b3IsIFNuYWNrYmFyRmVlZGJhY2ssQXV0aE1lc3NhZ2VzIH0gZnJvbSAnLi90eXBlcy91c3dhZ29uLWF1dGgudHlwZXMnO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoU2VydmljZSB7XG5cbiAgcHVibGljIHNuYWNrYmFyRmVlZGJhY2s/OlNuYWNrYmFyRmVlZGJhY2s7XG4gIHB1YmxpYyBsb2FkaW5nOmJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIHJlZnJlc2hJbnRlcnZhbDphbnk7XG4gIHByaXZhdGUgdXNlZFN0b3JhZ2UgPSB0aGlzLmlzTG9jYWxTdG9yYWdlKCkgPyBsb2NhbFN0b3JhZ2UgOiBzZXNzaW9uU3RvcmFnZTtcbiAgcHJpdmF0ZSBjb25maWc6QXV0aENvbmZpZ3x1bmRlZmluZWQ7XG4gIHByaXZhdGUgYXV0aEZvcm06QXV0aEZvcm0gPSB7fTtcbiAgcHJpdmF0ZSBlbWFpbE5vdGlmaWNhdGlvbjpib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgdGltZW91dDphbnk7XG4gIHByaXZhdGUgdXNlcjphbnk7XG4gIHByaXZhdGUgcm9sZTphbnk7XG5cbiAgcHJpdmF0ZSB2YWxpZGF0b3JzOkF1dGhWYWxpZGF0b3IgPSB7XG4gICAgZW1haWw6IHtcbiAgICAgIHBhdHRlcm46ICdeW1xcXFx3LS5dK0BbXFxcXHctXStcXFxcLlthLXpBLVpdezIsfShbLl1bYS16QS1aXXsyLH0pKiQnLFxuICAgICAgbWVzc2FnZTogJ0VtYWlsIGlzIG5vdCB2YWxpZC4nXG4gICAgfSxcbiAgICBwYXNzd29yZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/PS4qW2Etel0pKD89LipbQS1aXSkoPz0uKlxcXFxkKSg/PS4qWyFAIyQlXiYqXSlbQS1aYS16XFxcXGQhQCMkJV4mKl17OCx9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nIGFuZCBpbmNsdWRlIHVwcGVyY2FzZSwgbG93ZXJjYXNlLCBudW1iZXIsIGFuZCBzcGVjaWFsIGNoYXJhY3Rlci4nXG4gICAgfSxcbiAgICBwaG9uZToge1xuICAgICAgICBwYXR0ZXJuOiAnXihcXFxcK1xcXFxkezEsM31cXFxccz8pP1xcXFwoP1xcXFxkezN9XFxcXCk/Wy1cXFxcc10/XFxcXGR7M31bLVxcXFxzXT9cXFxcZHs0fSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGhvbmUgbnVtYmVyIG11c3QgYmUgaW4gYSB2YWxpZCBmb3JtYXQuJ1xuICAgIH0sXG4gICAgdXNlcm5hbWU6IHtcbiAgICAgIHBhdHRlcm46ICdeW2EtekEtWjAtOV17MywxNX0kJyxcbiAgICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IGJlIDMtMTUgY2hhcmFjdGVycyBsb25nIGFuZCBjYW4gb25seSBjb250YWluIGxldHRlcnMgYW5kIG51bWJlcnMuJ1xuICAgIH0sXG4gICAgY3JlZGl0Q2FyZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XXsyfSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fDdbMC05XXsxNX0pJCcsXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGNyZWRpdCBjYXJkIG51bWJlci4nXG4gICAgfSxcbiAgICBwb3N0YWxDb2RlOiB7XG4gICAgICBwYXR0ZXJuOiAnXlxcXFxkezV9KC1cXFxcZHs0fSk/JCcsXG4gICAgICBtZXNzYWdlOiAnUG9zdGFsIGNvZGUgbXVzdCBiZSBpbiB0aGUgZm9ybWF0IDEyMzQ1IG9yIDEyMzQ1LTY3ODkuJ1xuICAgIH0sXG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG4gIFxuICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZXJ2aWNlIGZvciB0aGUgcHJvamVjdFxuICAgICAqIEBwYXJhbSBjb25maWcgLSBjb25maWd1cmF0aW9uIHRoYXQgcG9pbnRzIHRoZSBzZXJ2aWNlIHRvIGl0cyBhcHByb3ByaWF0ZSBzZXJ2ZXJcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuYXV0aC5pbml0aWFsaXplKHtcbiAgICAgKiAgYXBpOmVudmlyb25tZW50LmFwaSxcbiAgICAgKiAgYXBpS2V5OiBlbnZpcm9ubWVudC5hcGlLZXksXG4gICAgICogIGFwcDogJ3Rlc3QtYXBwJyxcbiAgICAgKiAgcmVnaXN0cmF0aW9uVGFibGU6ICd0ZWFjaGVycycsIC8vIGNhbiBiZSB1bmRlZmluZWQgbG9naW5cbiAgICAgKiAgbG9naW5UYWJsZTogWyd0ZWFjaGVycycsICdhZG1pbmlzdHJhdG9ycycsICdzdHVkZW50cyddXG4gICAgICogIHJlZGlyZWN0OntcbiAgICAgKiAgICAnc3R1ZGVudHMnOiAnL3N0dWRlbnQnLFxuICAgICAqICAgICd0ZWFjaGVycyc6ICcvdGVhY2hlcicsXG4gICAgICogICAgJ2FkbWluaXN0cmF0b3JzJzogJy9hZG1pbicsXG4gICAgICogICB9XG4gICAgICogfSlcbiAgICAgKiBcbiAgICoqL1xuICBhc3luYyBpbml0aWFsaXplKGNvbmZpZzpBdXRoQ29uZmlnKXtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICBpZih0aGlzLmNvbmZpZy5hdXRoTWVzc2FnZXMgPT0gdW5kZWZpbmVkKXtcbiAgICAgIHRoaXMuY29uZmlnLmF1dGhNZXNzYWdlcyA9IHt9O1xuICAgIH1cbiAgICB0aGlzLmF1dGhGb3JtID0ge307XG4gICAgaWYoIXRoaXMuY29uZmlnLmF1dGhUeXBlKXtcbiAgICAgIHRoaXMuY29uZmlnLmF1dGhUeXBlID0gJ2RlZmF1bHQnO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZy5hdXRoVHlwZSA9PSAnand0Jyl7XG4gICAgICBhd2FpdCB0aGlzLmRlY29kZUpXVCgpO1xuICAgIH1cbiAgICBjb25zdCByb2xlID0gdGhpcy5hY2NvdW50TG9nZ2VkSW4oKTtcbiAgICBpZihyb2xlIT1udWxsKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3Rbcm9sZV1dKTtcbiAgICB9ZWxzZXtcbiAgICAgIGlmKHRoaXMuY29uZmlnLmF1dGhUeXBlID09ICdqd3QnKXtcbiAgICAgICAgaWYodGhpcy5yZWZyZXNoSW50ZXJ2YWwpe1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5yZWZyZXNoSW50ZXJ2YWwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVmcmVzaEludGVydmFsID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT57XG4gICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoSldUKCk7XG4gICAgICAgIH0sKDM2MDAvMikgKiAxMDAwKVxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICB9XG5cbiAgdmFsaWRhdGVJbnB1dEZpZWxkcygpOmJvb2xlYW57XG4gICAgdmFyIGhhc0Vycm9ycyA9IGZhbHNlO1xuICAgIGZvcihjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSkpe1xuICAgICAgY29uc3QgeyB2YWx1ZSwgdmFsaWRhdG9yLCByZXF1aXJlZCB9ID0gdGhpcy5hdXRoRm9ybVtrZXldO1xuICAgICAgaWYocmVxdWlyZWQgJiYgdmFsdWUudHJpbSgpID09Jycpe1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCEnO1xuICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgICAgICAvLyBjaGVjayBpZiB2YWxpZGF0b3IgaXMgbm90IGN1c3RvbVxuICAgICAgICAgIGlmKHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdID09IG51bGwpe1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSAgbmV3IFJlZ0V4cCh2YWxpZGF0b3IpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IHJlZ2V4LnRlc3QodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgaWYoIWlzVmFsaWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSBgJHtrZXkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBrZXkuc2xpY2UoMSl9IGlzIG5vdCBhIHZhbGlkIGlucHV0LmA7XG4gICAgICAgICAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnQ3VzdG9tIHZhbGlkYXRvciBzaG91bGQgYmUgb24gcmVnZXgnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0ucGF0dGVybik7XG4gICAgICAgICAgY29uc3QgaXNWYWxpZCA9IHJlZ2V4LnRlc3QodmFsdWUpO1xuICAgICAgICAgIFxuXG4gICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5tZXNzYWdlO1xuICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgICByZXR1cm4gIWhhc0Vycm9ycztcbiAgfVxuXG4gIGNsZWFyRm9ybSgpe1xuICAgIGZvcihjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSkpe1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0udmFsdWUgPSAnJztcbiAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuICBcbiAgLyoqXG4gICAgICogQ2hlY2sgaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCByb2xlID0gdGhpcy5hdXRoLmFjY291bnRMb2dnZWRJbigpXG4gICAgICogXG4gICAgICogT1VUUFVUOiByb2xlIG9mIHVzZXIgaWYgYXV0aGVudGljYXRlZCwgbnVsbCBpZiB1bmF1dGhlbnRpY2F0ZWRcbiAgICoqL1xuICBhY2NvdW50TG9nZ2VkSW4oKSB7XG4gICAgaWYodGhpcy5jb25maWc/LmF1dGhUeXBlID09ICdkZWZhdWx0Jyl7XG4gICAgICB0aGlzLnJvbGUgPSB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ2xvZ2dlZF9pbicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yb2xlO1xuICB9XG5cbiAgbG9nb3V0KCkge1xuICAgIGlmICghdGhpcy5hY2NvdW50TG9nZ2VkSW4oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJvbGUgPSBudWxsO1xuICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgdGhpcy51c2VkU3RvcmFnZS5jbGVhcigpO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J3N1Y2Nlc3MnLFxuICAgICAgJ21lc3NhZ2UnOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5sb2dnZWRPdXQgPz8gJ0FjY291bnQgaGFzIGJlZW4gbG9nZ2VkIG91dC4nLFxuICAgIH1cbiAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy8nXSk7XG4gIH1cblxuXG4gIGdldEF1dGhGaWVsZChrZXk6c3RyaW5nKXtcbiAgICByZXR1cm4gdGhpcy5hdXRoRm9ybVtrZXldO1xuICB9XG4gIFxuICBpbml0aWFsaXplRm9ybUZpZWxkKGtleTpzdHJpbmcsIHJlcXVpcmVkOmJvb2xlYW4gLCB1bmlxdWU6Ym9vbGVhbiwgdHlwZTpzdHJpbmcsIGFsaWFzZXM/OnN0cmluZ1tdLCBlbmNyeXB0ZWQ/OmJvb2xlYW4sdmFsaWRhdG9yPzpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XT0ge3ZhbHVlOicnLCB2YWxpZGF0b3I6dmFsaWRhdG9yLCByZXF1aXJlZDpyZXF1aXJlZCwgdHlwZTp0eXBlLCBhbGlhc2VzOmFsaWFzZXMsZW5jcnlwdGVkOmVuY3J5cHRlZCx1bmlxdWU6dW5pcXVlfTtcbiAgfVxuXG4gIGhhbmRsZUZvcm1WYWx1ZShrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgaXNMb2NhbFN0b3JhZ2UoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdG9yYWdlJyk7XG4gICAgcmV0dXJuIHN0b3JhZ2UgPT0gJ2xvY2FsJztcbiAgICBcbiAgfVxuXG4gIGdldFNhdmVkRW1haWwoKSB7XG4gICAgY29uc3QgZW1haWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmVtZW1iZXInKTtcbiAgICByZXR1cm4gZW1haWw7XG4gIH1cblxuICB1c2VMb2NhbFN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnbG9jYWwnKTtcbiAgfVxuXG4gIHVzZVNlc3Npb25TdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ3Nlc3Npb24nKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5jcnlwdFJlcXVlc3QocGxhaW50ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGtleVN0cmluZyA9ICdBSFM4NTc2NTk4UElPVU5BMjE0ODQyNzgwMzA5bXBxYkgnO1xuICAgIGNvbnN0IGtleSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShrZXlTdHJpbmcuc2xpY2UoMCwgMzIpKTsgLy8gVXNlIG9ubHkgdGhlIGZpcnN0IDMyIGNoYXJhY3RlcnMgZm9yIEFFUy0yNTZcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTYpKTsgLy8gR2VuZXJhdGUgcmFuZG9tIElWICgxNiBieXRlcyBmb3IgQUVTKVxuXG4gICAgLy8gSW1wb3J0IHRoZSBrZXlcbiAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAga2V5LFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydlbmNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gRW5jcnlwdCB0aGUgcGxhaW50ZXh0XG4gICAgY29uc3QgZW5jb2RlZFBsYWludGV4dCA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShwbGFpbnRleHQpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXY6IGl2IH0sXG4gICAgICBjcnlwdG9LZXksXG4gICAgICBlbmNvZGVkUGxhaW50ZXh0XG4gICAgKTtcblxuICAgIC8vIENvbWJpbmUgSVYgYW5kIGNpcGhlcnRleHQsIHRoZW4gZW5jb2RlIHRvIGJhc2U2NFxuICAgIGNvbnN0IGNvbWJpbmVkID0gbmV3IFVpbnQ4QXJyYXkoaXYuYnl0ZUxlbmd0aCArIGNpcGhlcnRleHQuYnl0ZUxlbmd0aCk7XG4gICAgY29tYmluZWQuc2V0KGl2LCAwKTtcbiAgICBjb21iaW5lZC5zZXQobmV3IFVpbnQ4QXJyYXkoY2lwaGVydGV4dCksIGl2LmJ5dGVMZW5ndGgpO1xuXG4gICAgLy8gQ29udmVydCB0byBiYXNlNjRcbiAgICByZXR1cm4gYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmNvbWJpbmVkKSk7XG4gIH1cblxuICBhc3luYyBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBvYmpdIG9mIE9iamVjdC5lbnRyaWVzPGFueT4oYm9keSkpIHtcbiAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlcycpIHtcbiAgICAgICAgZm9yICh2YXIgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgIGlmKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkZWxldGUgb2JqW2ZpZWxkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBjb25zdCBqc29uU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIEFwcDogdGhpcy5jb25maWc/LmFwcCxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApO1xuXG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgdGhpcy5lbmNyeXB0UmVxdWVzdChqc29uU3RyaW5nKTtcbiAgICByZXR1cm4gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgZW5jcnlwdGVkLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApKTtcbiAgfVxuXG4gIGFzeW5jIGhhc2goZW5jcnlwdDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IHRoaXMucG9zdCgnZ2V0X2hhc2gnLCB7ZW5jcnlwdDogZW5jcnlwdH0pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjaGVja0R1cGxpY2F0ZXModGFibGVzOnN0cmluZ1tdLCB2YWx1ZXM6e1trZXk6c3RyaW5nXTpzdHJpbmd9KXtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucG9zdCgnY2hlY2tfZHVwbGljYXRlcycseyd0YWJsZXMnOiB0YWJsZXMsICd2YWx1ZXMnOnZhbHVlc30pXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgRXJyb3InKTtcbiAgICB9XG4gIH1cblxuXG5cbiAgYXN5bmMgcmVnaXN0ZXIoKSB7XG4gICAgaWYodGhpcy5sb2FkaW5nKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYodGhpcy5jb25maWc/LnJlZ2lzdHJhdGlvblRhYmxlID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnUmVnaXN0cmF0aW9uIHRhYmxlIG11c3QgYmUgaW5pdGlhbGl6ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIXRoaXMudmFsaWRhdGVJbnB1dEZpZWxkcygpKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J25ldXRyYWwnLFxuICAgICAgJ21lc3NhZ2UnOidMb2FkaW5nLi4uJyxcbiAgICAgIGlzSW5maW5pdGU6dHJ1ZSxcbiAgICB9XG5cbiAgICAvLyBjaGVjayBkdXBsaWNhdGVzXG4gICAgY29uc3QgbmV3RGF0ZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLnRvU3RyaW5nKCk7XG4gICAgdmFyIHZpc0lEO1xuICAgIGlmKHRoaXMuY29uZmlnPy52aXNpYmxlSUQpe1xuICAgICAgdmlzSUQgPSBgJHt0aGlzLmNvbmZpZy52aXNpYmxlSUR9LWAgKyBuZXdEYXRlLnN1YnN0cmluZyg0LCA3KSArICctJyArIG5ld0RhdGUuc3Vic3RyaW5nKDcsIDEzKTtcbiAgICB9XG4gICAgY29uc3QgYXV0aEZpZWxkcyA9IE9iamVjdC5rZXlzKHRoaXMuYXV0aEZvcm0pO1xuXG4gICAgdmFyIHZhbHVlczphbnkgPXt9O1xuXG4gICAgZm9yKGxldCBmaWVsZCBvZiBhdXRoRmllbGRzKXtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMuYXV0aEZvcm1bZmllbGRdLnZhbHVlO1xuICAgICAgaWYodGhpcy5hdXRoRm9ybVtmaWVsZF0uZW5jcnlwdGVkKXtcbiAgICAgICAgY29uc3QgaGFzaCA9IGF3YWl0IHRoaXMuaGFzaCh2YWx1ZSk7XG4gICAgICAgIGlmKGhhc2gpe1xuICAgICAgICAgIHZhbHVlID0gaGFzaFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nLCB0cnkgYWdhaW4gbGF0ZXIuLi4nLFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuYXV0aEZvcm1bZmllbGRdLnVuaXF1ZSl7XG4gICAgICAgIGNvbnN0IGhhc0R1cGxpY2F0ZSA9IGF3YWl0IHRoaXMuY2hlY2tEdXBsaWNhdGVzKHRoaXMuY29uZmlnLmxvZ2luVGFibGUsIHtbZmllbGRdOiB0aGlzLmF1dGhGb3JtW2ZpZWxkXS52YWx1ZX0pXG4gICAgICAgIGlmKGhhc0R1cGxpY2F0ZSAhPSBudWxsKXtcbiAgICAgICAgICBpZihoYXNEdXBsaWNhdGUpe1xuICAgICAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgJHtmaWVsZC50b1VwcGVyQ2FzZSgpfSBhbHJlYWR5IGV4aXN0cy5gLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHRyeSBhZ2FpbiBsYXRlci4uLicsXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgICBcbiAgICAgIHZhbHVlc1tmaWVsZF0gPXZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBwb3N0T2JqZWN0ID0gXG4gICAgICAgT2JqZWN0LmFzc2lnbih2aXNJRCAhPSBudWxsID8ge3Zpc2libGVpZDp2aXNJRH06e30sIHRoaXMuY29uZmlnLnZlcmlmaWNhdGlvbiA/IHt2ZXJpZmllZDpmYWxzZX06e30sIHthY2NvdW50VHlwZTogdGhpcy5jb25maWcucmVnaXN0cmF0aW9uVGFibGV9LFxuICAgICAgICB2YWx1ZXNcbiAgICAgICApOyBcbiAgICAgICBcbiAgICB0aGlzLnBvc3QoJ3JlZ2lzdGVyJywgXG4gICAgICB7ZGF0YTpKU09OLnN0cmluZ2lmeShwb3N0T2JqZWN0KX0sXG4gICAgKS50aGVuKChkYXRhOmFueSk9PntcbiAgICAgIHRoaXMubG9hZGluZyA9ZmFsc2U7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAgICAvLyBzaG93IHByb3BlciBzbmFja2JhclxuICAgICAgICBpZih0aGlzLmNvbmZpZz8udmVyaWZpY2F0aW9uKXtcbiAgICAgICAgICAvLyB3YWl0IGZvciB2ZXJpZmljYXRpb25cbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5mb3JWZXJpZmljYXRpb24gPz8gJ1BsZWFzZSB3YWl0IGZvciBhY2NvdW50IHZlcmlmaWNhdGlvbi4uLidcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNleyAgXG4gICAgICAgICAgLy8gc3VjY2Vzc2Z1bGx5IHJlZ2lzdGVyZWQhYFxuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLnJlZ2lzdGVyZWQgPz8gJ1JlZ2lzdHJhdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgeW91IG1heSBub3cgbG9naW4gd2l0aCB5b3VyIGNyZWRlbnRpYWxzJ1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNsZWFyRm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYWxlcnQoZGF0YS5vdXRwdXQpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVNuYWNrYmFyKCl7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICB9XG4gIFxuICBsb2dpbigpIHtcbiAgICBpZih0aGlzLmxvYWRpbmcpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZz8ubG9naW5UYWJsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0xvZ2luIHRhYmxlIG11c3QgYmUgaW5pdGlhbGl6ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNoZWNrIGlmIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBmaWVsZHMgYXJlIHByZXNlbnRcbiAgICBpZih0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ109PW51bGwgfHwgdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXSA9PSBudWxsKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSBpZGVudGlmaWVyIGFuZCBwYXNzd29yZCBmaWVsZHMgdXNpbmcgW25hbWVdPVwiZmllbGRcIicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzID09IHVuZGVmaW5lZCB8fCB0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlcy5sZW5ndGggPD0wKXtcbiAgICAgIGFsZXJ0KFwiSWRlbnRpZmllciBmaWVsZCBtdXN0IGJlIGluaXRpYWxpemVkIHdpdGggYWxpYXNlcz1bYWxpYXNlc11cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIXRoaXMudmFsaWRhdGVJbnB1dEZpZWxkcygpKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgJ3R5cGUnOiduZXV0cmFsJyxcbiAgICAgICdtZXNzYWdlJzonTG9hZGluZy4uLicsXG4gICAgICBpc0luZmluaXRlOnRydWUsXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBvc3QoJ2xvZ2luJywge1xuICAgICAgYXV0aFR5cGU6IHRoaXMuY29uZmlnLmF1dGhUeXBlLFxuICAgICAgaWRlbnRpZmllclZhbHVlOiB0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10udmFsdWUsXG4gICAgICBwYXNzd29yZDogdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXS52YWx1ZSxcbiAgICAgIHRhYmxlczogdGhpcy5jb25maWcubG9naW5UYWJsZSxcbiAgICAgIGlkZW50aWZpZXJUeXBlczp0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlc1xuICAgIH0pLnRoZW4oKGRhdGE6YW55KSA9PiB7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSBkYXRhLnN1Y2Nlc3MgPyB7XG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEubG9nZ2VkSW4gPz8gJ0xvZ2luIFN1Y2Nlc3NmdWwhJ1xuICAgICAgfSA6IHtcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgbWVzc2FnZTpkYXRhLm91dHB1dFxuICAgICAgfTtcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGRhdGEub3V0cHV0O1xuICAgICAgICBpZih0aGlzLmNvbmZpZz8ucmVkaXJlY3RbdXNlci5yb2xlXT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiVGhpcyB1c2VyIGlzIG5vdCBhdXRob3JpemVkLlwiXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgZGVsYXlcbiAgICAgICAgaWYodGhpcy50aW1lb3V0KXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgXG4gICAgICAgICAgaWYodGhpcy5jb25maWc/LmF1dGhUeXBlID09ICdqd3QnKXtcbiAgICAgICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbSgndXNlcl9pbmZvJywgdXNlci50b2tlbik7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgICAgICdsb2dnZWRfaW4nLFxuICAgICAgICAgICAgICB1c2VyLnJvbGVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oJ3VzZXJfaW5mbycsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMuY29uZmlnPy5yZWRpcmVjdFt1c2VyLnJvbGVdXSk7XG4gICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIH0sdGhpcy5jb25maWc/LmxvZ2luVGltZW91dCA/PyAxNTAwKVxuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIGFsZXJ0KGRhdGEub3V0cHV0KVxuICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiBkYXRhLm91dHB1dFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFVzZXIoKXtcbiAgICBpZih0aGlzLmNvbmZpZz8uYXV0aFR5cGUgPT0gJ2RlZmF1bHQnKXtcbiAgICAgIGNvbnN0IHVzZXIgPSB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ3VzZXJfaW5mbycpO1xuICAgICAgaWYodXNlciAhPSBudWxsKXtcbiAgICAgICAgdGhpcy51c2VyID0gSlNPTi5wYXJzZSh1c2VyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXNlcjtcbiAgfVxuXG4gIGFzeW5jIGRlY29kZUpXVCgpe1xuICAgIGlmKCF0aGlzLmNvbmZpZyl7XG4gICAgICBhbGVydCgnQ29uZmlnIGlzIG5vdCBpbml0aWFsaXplZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGp3dFRva2VuID0gdGhpcy51c2VkU3RvcmFnZS5nZXRJdGVtKCd1c2VyX2luZm8nKTtcbiAgICBpZihqd3RUb2tlbiAhPSBudWxsKXtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wb3N0KCdwcm90ZWN0ZWQnLCB7XG4gICAgICAgIHRva2VuOiBqd3RUb2tlblxuICAgICAgfSk7XG4gICAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgICAgdGhpcy51c2VyID0gIHJlc3BvbnNlLm91dHB1dC5kYXRhO1xuICAgICAgICB0aGlzLnJvbGUgPSB0aGlzLnVzZXIucm9sZTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoSldUKCk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLm91dHB1dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEpXVCgpe1xuICAgIGlmKCF0aGlzLmNvbmZpZyl7XG4gICAgICBhbGVydCgnQ29uZmlnIGlzIG5vdCBpbml0aWFsaXplZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGp3dFRva2VuID0gdGhpcy51c2VkU3RvcmFnZS5nZXRJdGVtKCd1c2VyX2luZm8nKTtcbiAgICBpZihqd3RUb2tlbiAhPSBudWxsKXtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wb3N0KCdyZWZyZXNoJywge1xuICAgICAgICB0b2tlbjogand0VG9rZW5cbiAgICAgIH0pO1xuICAgICAgaWYoIXJlc3BvbnNlLnN1Y2Nlc3MpeyBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLm91dHB1dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxufVxuIl19