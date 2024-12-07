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
                return response.output.data;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUFzQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXJDakIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUV2QixnQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFFcEUsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFHbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVB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eyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyAgQXV0aENvbmZpZywgQXV0aEZvcm0sIEF1dGhWYWxpZGF0b3IsIFNuYWNrYmFyRmVlZGJhY2ssQXV0aE1lc3NhZ2VzIH0gZnJvbSAnLi90eXBlcy91c3dhZ29uLWF1dGgudHlwZXMnO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoU2VydmljZSB7XG5cbiAgcHVibGljIHNuYWNrYmFyRmVlZGJhY2s/OlNuYWNrYmFyRmVlZGJhY2s7XG4gIHB1YmxpYyBsb2FkaW5nOmJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIHVzZWRTdG9yYWdlID0gdGhpcy5pc0xvY2FsU3RvcmFnZSgpID8gbG9jYWxTdG9yYWdlIDogc2Vzc2lvblN0b3JhZ2U7XG4gIHByaXZhdGUgY29uZmlnOkF1dGhDb25maWd8dW5kZWZpbmVkO1xuICBwcml2YXRlIGF1dGhGb3JtOkF1dGhGb3JtID0ge307XG4gIHByaXZhdGUgZW1haWxOb3RpZmljYXRpb246Ym9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIHRpbWVvdXQ6YW55O1xuXG4gIHByaXZhdGUgdmFsaWRhdG9yczpBdXRoVmFsaWRhdG9yID0ge1xuICAgIGVtYWlsOiB7XG4gICAgICBwYXR0ZXJuOiAnXltcXFxcdy0uXStAW1xcXFx3LV0rXFxcXC5bYS16QS1aXXsyLH0oWy5dW2EtekEtWl17Mix9KSokJyxcbiAgICAgIG1lc3NhZ2U6ICdFbWFpbCBpcyBub3QgdmFsaWQuJ1xuICAgIH0sXG4gICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgcGF0dGVybjogJ14oPz0uKlthLXpdKSg/PS4qW0EtWl0pKD89LipcXFxcZCkoPz0uKlshQCMkJV4mKl0pW0EtWmEtelxcXFxkIUAjJCVeJipdezgsfSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMgbG9uZyBhbmQgaW5jbHVkZSB1cHBlcmNhc2UsIGxvd2VyY2FzZSwgbnVtYmVyLCBhbmQgc3BlY2lhbCBjaGFyYWN0ZXIuJ1xuICAgIH0sXG4gICAgcGhvbmU6IHtcbiAgICAgICAgcGF0dGVybjogJ14oXFxcXCtcXFxcZHsxLDN9XFxcXHM/KT9cXFxcKD9cXFxcZHszfVxcXFwpP1stXFxcXHNdP1xcXFxkezN9Wy1cXFxcc10/XFxcXGR7NH0kJyxcbiAgICAgICAgbWVzc2FnZTogJ1Bob25lIG51bWJlciBtdXN0IGJlIGluIGEgdmFsaWQgZm9ybWF0LidcbiAgICB9LFxuICAgIHVzZXJuYW1lOiB7XG4gICAgICBwYXR0ZXJuOiAnXlthLXpBLVowLTldezMsMTV9JCcsXG4gICAgICBtZXNzYWdlOiAnVXNlcm5hbWUgbXVzdCBiZSAzLTE1IGNoYXJhY3RlcnMgbG9uZyBhbmQgY2FuIG9ubHkgY29udGFpbiBsZXR0ZXJzIGFuZCBudW1iZXJzLidcbiAgICB9LFxuICAgIGNyZWRpdENhcmQ6IHtcbiAgICAgICAgcGF0dGVybjogJ14oPzo0WzAtOV17MTJ9KD86WzAtOV17M30pP3w1WzEtNV1bMC05XXsxNH18Nig/OjAxMXw1WzAtOV17Mn0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXw3WzAtOV17MTV9KSQnLFxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBjcmVkaXQgY2FyZCBudW1iZXIuJ1xuICAgIH0sXG4gICAgcG9zdGFsQ29kZToge1xuICAgICAgcGF0dGVybjogJ15cXFxcZHs1fSgtXFxcXGR7NH0pPyQnLFxuICAgICAgbWVzc2FnZTogJ1Bvc3RhbCBjb2RlIG11c3QgYmUgaW4gdGhlIGZvcm1hdCAxMjM0NSBvciAxMjM0NS02Nzg5LidcbiAgICB9LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICApIHsgfVxuICBcbiAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB0aGUgc2VydmljZSBmb3IgdGhlIHByb2plY3RcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gY29uZmlndXJhdGlvbiB0aGF0IHBvaW50cyB0aGUgc2VydmljZSB0byBpdHMgYXBwcm9wcmlhdGUgc2VydmVyXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0aGlzLmF1dGguaW5pdGlhbGl6ZSh7XG4gICAgICogIGFwaTplbnZpcm9ubWVudC5hcGksXG4gICAgICogIGFwaUtleTogZW52aXJvbm1lbnQuYXBpS2V5LFxuICAgICAqICBhcHA6ICd0ZXN0LWFwcCcsXG4gICAgICogIHJlZ2lzdHJhdGlvblRhYmxlOiAndGVhY2hlcnMnLCAvLyBjYW4gYmUgdW5kZWZpbmVkIGxvZ2luXG4gICAgICogIGxvZ2luVGFibGU6IFsndGVhY2hlcnMnLCAnYWRtaW5pc3RyYXRvcnMnLCAnc3R1ZGVudHMnXVxuICAgICAqICByZWRpcmVjdDp7XG4gICAgICogICAgJ3N0dWRlbnRzJzogJy9zdHVkZW50JyxcbiAgICAgKiAgICAndGVhY2hlcnMnOiAnL3RlYWNoZXInLFxuICAgICAqICAgICdhZG1pbmlzdHJhdG9ycyc6ICcvYWRtaW4nLFxuICAgICAqICAgfVxuICAgICAqIH0pXG4gICAgICogXG4gICAqKi9cbiAgaW5pdGlhbGl6ZShjb25maWc6QXV0aENvbmZpZyl7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgaWYodGhpcy5jb25maWcuYXV0aE1lc3NhZ2VzID09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLmNvbmZpZy5hdXRoTWVzc2FnZXMgPSB7fTtcbiAgICB9XG4gICAgdGhpcy5hdXRoRm9ybSA9IHt9O1xuICAgIGlmKCF0aGlzLmNvbmZpZy5hdXRoVHlwZSl7XG4gICAgICB0aGlzLmNvbmZpZy5hdXRoVHlwZSA9ICdkZWZhdWx0JztcbiAgICB9XG4gICAgY29uc3Qgcm9sZSA9IHRoaXMuYWNjb3VudExvZ2dlZEluKCk7XG4gICAgaWYocm9sZSE9bnVsbCl7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWc/LnJlZGlyZWN0W3JvbGVdXSk7XG4gICAgfVxuICB9XG5cbiAgdmFsaWRhdGVJbnB1dEZpZWxkcygpOmJvb2xlYW57XG4gICAgdmFyIGhhc0Vycm9ycyA9IGZhbHNlO1xuICAgIGZvcihjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSkpe1xuICAgICAgY29uc3QgeyB2YWx1ZSwgdmFsaWRhdG9yLCByZXF1aXJlZCB9ID0gdGhpcy5hdXRoRm9ybVtrZXldO1xuICAgICAgaWYocmVxdWlyZWQgJiYgdmFsdWUudHJpbSgpID09Jycpe1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCEnO1xuICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgICAgICAvLyBjaGVjayBpZiB2YWxpZGF0b3IgaXMgbm90IGN1c3RvbVxuICAgICAgICAgIGlmKHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdID09IG51bGwpe1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSAgbmV3IFJlZ0V4cCh2YWxpZGF0b3IpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IHJlZ2V4LnRlc3QodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgaWYoIWlzVmFsaWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSBgJHtrZXkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBrZXkuc2xpY2UoMSl9IGlzIG5vdCBhIHZhbGlkIGlucHV0LmA7XG4gICAgICAgICAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnQ3VzdG9tIHZhbGlkYXRvciBzaG91bGQgYmUgb24gcmVnZXgnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0ucGF0dGVybik7XG4gICAgICAgICAgY29uc3QgaXNWYWxpZCA9IHJlZ2V4LnRlc3QodmFsdWUpO1xuICAgICAgICAgIFxuXG4gICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5tZXNzYWdlO1xuICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgICByZXR1cm4gIWhhc0Vycm9ycztcbiAgfVxuXG4gIGNsZWFyRm9ybSgpe1xuICAgIGZvcihjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSkpe1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0udmFsdWUgPSAnJztcbiAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuICBcbiAgLyoqXG4gICAgICogQ2hlY2sgaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkXG4gICAgICogXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCByb2xlID0gdGhpcy5hdXRoLmFjY291bnRMb2dnZWRJbigpXG4gICAgICogXG4gICAgICogT1VUUFVUOiByb2xlIG9mIHVzZXIgaWYgYXV0aGVudGljYXRlZCwgbnVsbCBpZiB1bmF1dGhlbnRpY2F0ZWRcbiAgICoqL1xuICBhY2NvdW50TG9nZ2VkSW4oKSB7XG4gICAgcmV0dXJuIHRoaXMudXNlZFN0b3JhZ2UuZ2V0SXRlbSgnbG9nZ2VkX2luJyk7XG4gIH1cblxuICBsb2dvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmFjY291bnRMb2dnZWRJbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudXNlZFN0b3JhZ2UuY2xlYXIoKTtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgJ3R5cGUnOidzdWNjZXNzJyxcbiAgICAgICdtZXNzYWdlJzogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEubG9nZ2VkT3V0ID8/ICdBY2NvdW50IGhhcyBiZWVuIGxvZ2dlZCBvdXQuJyxcbiAgICB9XG4gICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWycvJ10pO1xuICB9XG5cblxuICBnZXRBdXRoRmllbGQoa2V5OnN0cmluZyl7XG4gICAgcmV0dXJuIHRoaXMuYXV0aEZvcm1ba2V5XTtcbiAgfVxuICBcbiAgaW5pdGlhbGl6ZUZvcm1GaWVsZChrZXk6c3RyaW5nLCByZXF1aXJlZDpib29sZWFuICwgdW5pcXVlOmJvb2xlYW4sIHR5cGU6c3RyaW5nLCBhbGlhc2VzPzpzdHJpbmdbXSwgZW5jcnlwdGVkPzpib29sZWFuLHZhbGlkYXRvcj86c3RyaW5nKXtcbiAgICB0aGlzLmF1dGhGb3JtW2tleV09IHt2YWx1ZTonJywgdmFsaWRhdG9yOnZhbGlkYXRvciwgcmVxdWlyZWQ6cmVxdWlyZWQsIHR5cGU6dHlwZSwgYWxpYXNlczphbGlhc2VzLGVuY3J5cHRlZDplbmNyeXB0ZWQsdW5pcXVlOnVuaXF1ZX07XG4gIH1cblxuICBoYW5kbGVGb3JtVmFsdWUoa2V5OnN0cmluZywgdmFsdWU6c3RyaW5nKXtcbiAgICB0aGlzLmF1dGhGb3JtW2tleV0udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGlzTG9jYWxTdG9yYWdlKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RvcmFnZScpO1xuICAgIHJldHVybiBzdG9yYWdlID09ICdsb2NhbCc7XG4gICAgXG4gIH1cblxuICBnZXRTYXZlZEVtYWlsKCkge1xuICAgIGNvbnN0IGVtYWlsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JlbWVtYmVyJyk7XG4gICAgcmV0dXJuIGVtYWlsO1xuICB9XG5cbiAgdXNlTG9jYWxTdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ2xvY2FsJyk7XG4gIH1cblxuICB1c2VTZXNzaW9uU3RvcmFnZSgpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RvcmFnZScsICdzZXNzaW9uJyk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuY3J5cHRSZXF1ZXN0KHBsYWludGV4dDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBrZXlTdHJpbmcgPSAnQUhTODU3NjU5OFBJT1VOQTIxNDg0Mjc4MDMwOW1wcWJIJztcbiAgICBjb25zdCBrZXkgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoa2V5U3RyaW5nLnNsaWNlKDAsIDMyKSk7IC8vIFVzZSBvbmx5IHRoZSBmaXJzdCAzMiBjaGFyYWN0ZXJzIGZvciBBRVMtMjU2XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDE2KSk7IC8vIEdlbmVyYXRlIHJhbmRvbSBJViAoMTYgYnl0ZXMgZm9yIEFFUylcblxuICAgIC8vIEltcG9ydCB0aGUga2V5XG4gICAgY29uc3QgY3J5cHRvS2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIGtleSxcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnIH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZW5jcnlwdCddXG4gICAgKTtcblxuICAgIC8vIEVuY3J5cHQgdGhlIHBsYWludGV4dFxuICAgIGNvbnN0IGVuY29kZWRQbGFpbnRleHQgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUocGxhaW50ZXh0KTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2OiBpdiB9LFxuICAgICAgY3J5cHRvS2V5LFxuICAgICAgZW5jb2RlZFBsYWludGV4dFxuICAgICk7XG5cbiAgICAvLyBDb21iaW5lIElWIGFuZCBjaXBoZXJ0ZXh0LCB0aGVuIGVuY29kZSB0byBiYXNlNjRcbiAgICBjb25zdCBjb21iaW5lZCA9IG5ldyBVaW50OEFycmF5KGl2LmJ5dGVMZW5ndGggKyBjaXBoZXJ0ZXh0LmJ5dGVMZW5ndGgpO1xuICAgIGNvbWJpbmVkLnNldChpdiwgMCk7XG4gICAgY29tYmluZWQuc2V0KG5ldyBVaW50OEFycmF5KGNpcGhlcnRleHQpLCBpdi5ieXRlTGVuZ3RoKTtcblxuICAgIC8vIENvbnZlcnQgdG8gYmFzZTY0XG4gICAgcmV0dXJuIGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZSguLi5jb21iaW5lZCkpO1xuICB9XG5cbiAgYXN5bmMgcG9zdChtZXRob2Q6IHN0cmluZywgYm9keToge30pIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgZm9yICh2YXIgW2tleSwgb2JqXSBvZiBPYmplY3QuZW50cmllczxhbnk+KGJvZHkpKSB7XG4gICAgICBpZiAoa2V5ID09ICd2YWx1ZXMnKSB7XG4gICAgICAgIGZvciAodmFyIFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICBpZih2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGVsZXRlIG9ialtmaWVsZF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoe1xuICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9KTtcbiAgICBjb25zdCBzYWx0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgY29uc3QganNvblN0cmluZyA9IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEFQSV9LRVk6IHRoaXMuY29uZmlnPy5hcGlLZXksXG4gICAgICAgICAgICBBcHA6IHRoaXMuY29uZmlnPy5hcHAsXG4gICAgICAgICAgICBNZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKTtcblxuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IHRoaXMuZW5jcnlwdFJlcXVlc3QoanNvblN0cmluZyk7XG4gICAgcmV0dXJuIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMuaHR0cC5wb3N0PGFueT4oXG4gICAgICB0aGlzLmNvbmZpZz8uYXBpICsgJz8nICsgc2FsdCxcbiAgICAgIGVuY3J5cHRlZCxcbiAgICAgIHsgaGVhZGVycyB9XG4gICAgKSk7XG4gIH1cblxuICBhc3luYyBoYXNoKGVuY3J5cHQ6c3RyaW5nKXtcbiAgICBjb25zdCByZXNwb25zZSA9ICBhd2FpdCB0aGlzLnBvc3QoJ2dldF9oYXNoJywge2VuY3J5cHQ6IGVuY3J5cHR9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY2hlY2tEdXBsaWNhdGVzKHRhYmxlczpzdHJpbmdbXSwgdmFsdWVzOntba2V5OnN0cmluZ106c3RyaW5nfSl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnBvc3QoJ2NoZWNrX2R1cGxpY2F0ZXMnLHsndGFibGVzJzogdGFibGVzLCAndmFsdWVzJzp2YWx1ZXN9KVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmVyIEVycm9yJyk7XG4gICAgfVxuICB9XG5cblxuXG4gIGFzeW5jIHJlZ2lzdGVyKCkge1xuICAgIGlmKHRoaXMubG9hZGluZyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKHRoaXMuY29uZmlnPy5yZWdpc3RyYXRpb25UYWJsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ1JlZ2lzdHJhdGlvbiB0YWJsZSBtdXN0IGJlIGluaXRpYWxpemVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLnZhbGlkYXRlSW5wdXRGaWVsZHMoKSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgJ3R5cGUnOiduZXV0cmFsJyxcbiAgICAgICdtZXNzYWdlJzonTG9hZGluZy4uLicsXG4gICAgICBpc0luZmluaXRlOnRydWUsXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgZHVwbGljYXRlc1xuICAgIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygpO1xuICAgIHZhciB2aXNJRDtcbiAgICBpZih0aGlzLmNvbmZpZz8udmlzaWJsZUlEKXtcbiAgICAgIHZpc0lEID0gYCR7dGhpcy5jb25maWcudmlzaWJsZUlEfS1gICsgbmV3RGF0ZS5zdWJzdHJpbmcoNCwgNykgKyAnLScgKyBuZXdEYXRlLnN1YnN0cmluZyg3LCAxMyk7XG4gICAgfVxuICAgIGNvbnN0IGF1dGhGaWVsZHMgPSBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKTtcblxuICAgIHZhciB2YWx1ZXM6YW55ID17fTtcblxuICAgIGZvcihsZXQgZmllbGQgb2YgYXV0aEZpZWxkcyl7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLmF1dGhGb3JtW2ZpZWxkXS52YWx1ZTtcbiAgICAgIGlmKHRoaXMuYXV0aEZvcm1bZmllbGRdLmVuY3J5cHRlZCl7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBhd2FpdCB0aGlzLmhhc2godmFsdWUpO1xuICAgICAgICBpZihoYXNoKXtcbiAgICAgICAgICB2YWx1ZSA9IGhhc2hcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdTb21ldGhpbmcgd2VudCB3cm9uZywgdHJ5IGFnYWluIGxhdGVyLi4uJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZih0aGlzLmF1dGhGb3JtW2ZpZWxkXS51bmlxdWUpe1xuICAgICAgICBjb25zdCBoYXNEdXBsaWNhdGUgPSBhd2FpdCB0aGlzLmNoZWNrRHVwbGljYXRlcyh0aGlzLmNvbmZpZy5sb2dpblRhYmxlLCB7W2ZpZWxkXTogdGhpcy5hdXRoRm9ybVtmaWVsZF0udmFsdWV9KVxuICAgICAgICBpZihoYXNEdXBsaWNhdGUgIT0gbnVsbCl7XG4gICAgICAgICAgaWYoaGFzRHVwbGljYXRlKXtcbiAgICAgICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYCR7ZmllbGQudG9VcHBlckNhc2UoKX0gYWxyZWFkeSBleGlzdHMuYCxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nLCB0cnkgYWdhaW4gbGF0ZXIuLi4nLFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICAgXG4gICAgICB2YWx1ZXNbZmllbGRdID12YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgcG9zdE9iamVjdCA9IFxuICAgICAgIE9iamVjdC5hc3NpZ24odmlzSUQgIT0gbnVsbCA/IHt2aXNpYmxlaWQ6dmlzSUR9Ont9LCB0aGlzLmNvbmZpZy52ZXJpZmljYXRpb24gPyB7dmVyaWZpZWQ6ZmFsc2V9Ont9LCB7YWNjb3VudFR5cGU6IHRoaXMuY29uZmlnLnJlZ2lzdHJhdGlvblRhYmxlfSxcbiAgICAgICAgdmFsdWVzXG4gICAgICAgKTsgXG4gICAgICAgXG4gICAgdGhpcy5wb3N0KCdyZWdpc3RlcicsIFxuICAgICAge2RhdGE6SlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCl9LFxuICAgICkudGhlbigoZGF0YTphbnkpPT57XG4gICAgICB0aGlzLmxvYWRpbmcgPWZhbHNlO1xuICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgaWYoZGF0YS5zdWNjZXNzKXtcbiAgICAgICAgLy8gc2hvdyBwcm9wZXIgc25hY2tiYXJcbiAgICAgICAgaWYodGhpcy5jb25maWc/LnZlcmlmaWNhdGlvbil7XG4gICAgICAgICAgLy8gd2FpdCBmb3IgdmVyaWZpY2F0aW9uXG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEuZm9yVmVyaWZpY2F0aW9uID8/ICdQbGVhc2Ugd2FpdCBmb3IgYWNjb3VudCB2ZXJpZmljYXRpb24uLi4nXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXsgIFxuICAgICAgICAgIC8vIHN1Y2Nlc3NmdWxseSByZWdpc3RlcmVkIWBcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5yZWdpc3RlcmVkID8/ICdSZWdpc3RyYXRpb24gd2FzIHN1Y2Nlc3NmdWwsIHlvdSBtYXkgbm93IGxvZ2luIHdpdGggeW91ciBjcmVkZW50aWFscydcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jbGVhckZvcm0oKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIGFsZXJ0KGRhdGEub3V0cHV0KVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2xvc2VTbmFja2Jhcigpe1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgfVxuICBcbiAgbG9naW4oKSB7XG4gICAgaWYodGhpcy5sb2FkaW5nKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYodGhpcy5jb25maWc/LmxvZ2luVGFibGUgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdMb2dpbiB0YWJsZSBtdXN0IGJlIGluaXRpYWxpemVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBjaGVjayBpZiB1c2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIGFyZSBwcmVzZW50XG4gICAgaWYodGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddPT1udWxsIHx8IHRoaXMuYXV0aEZvcm1bJ3Bhc3N3b3JkJ10gPT0gbnVsbCl7XG4gICAgICBhbGVydCgnUGxlYXNlIGluaXRpYWxpemUgaWRlbnRpZmllciBhbmQgcGFzc3dvcmQgZmllbGRzIHVzaW5nIFtuYW1lXT1cImZpZWxkXCInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZih0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlcyA9PSB1bmRlZmluZWQgfHwgdGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddLmFsaWFzZXMubGVuZ3RoIDw9MCl7XG4gICAgICBhbGVydChcIklkZW50aWZpZXIgZmllbGQgbXVzdCBiZSBpbml0aWFsaXplZCB3aXRoIGFsaWFzZXM9W2FsaWFzZXNdXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLnZhbGlkYXRlSW5wdXRGaWVsZHMoKSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICd0eXBlJzonbmV1dHJhbCcsXG4gICAgICAnbWVzc2FnZSc6J0xvYWRpbmcuLi4nLFxuICAgICAgaXNJbmZpbml0ZTp0cnVlLFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wb3N0KCdsb2dpbicsIHtcbiAgICAgIGF1dGhUeXBlOiB0aGlzLmNvbmZpZy5hdXRoVHlwZSxcbiAgICAgIGlkZW50aWZpZXJWYWx1ZTogdGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddLnZhbHVlLFxuICAgICAgcGFzc3dvcmQ6IHRoaXMuYXV0aEZvcm1bJ3Bhc3N3b3JkJ10udmFsdWUsXG4gICAgICB0YWJsZXM6IHRoaXMuY29uZmlnLmxvZ2luVGFibGUsXG4gICAgICBpZGVudGlmaWVyVHlwZXM6dGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddLmFsaWFzZXNcbiAgICB9KS50aGVuKChkYXRhOmFueSkgPT4ge1xuICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gZGF0YS5zdWNjZXNzID8ge1xuICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLmxvZ2dlZEluID8/ICdMb2dpbiBTdWNjZXNzZnVsISdcbiAgICAgIH0gOiB7XG4gICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgIG1lc3NhZ2U6ZGF0YS5vdXRwdXRcbiAgICAgIH07XG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIGNvbnN0IHVzZXIgPSBkYXRhLm91dHB1dDtcbiAgICAgICAgaWYodGhpcy5jb25maWc/LnJlZGlyZWN0W3VzZXIucm9sZV09PSB1bmRlZmluZWQpe1xuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiBcIlRoaXMgdXNlciBpcyBub3QgYXV0aG9yaXplZC5cIlxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRkIGRlbGF5XG4gICAgICAgIGlmKHRoaXMudGltZW91dCl7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgIFxuICAgICAgICAgIGlmKHRoaXMuY29uZmlnPy5hdXRoVHlwZSA9PSAnand0Jyl7XG4gICAgICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oJ3VzZXJfaW5mbycsIHVzZXIudG9rZW4pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgICAgICAnbG9nZ2VkX2luJyxcbiAgICAgICAgICAgICAgdXNlci5yb2xlXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKCd1c2VyX2luZm8nLCBKU09OLnN0cmluZ2lmeSh1c2VyKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3RbdXNlci5yb2xlXV0pO1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9LHRoaXMuY29uZmlnPy5sb2dpblRpbWVvdXQgPz8gMTUwMClcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyBhbGVydChkYXRhLm91dHB1dClcbiAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgbWVzc2FnZTogZGF0YS5vdXRwdXRcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRVc2VyKCl7XG4gICAgY29uc3QgdXNlciA9IHRoaXMudXNlZFN0b3JhZ2UuZ2V0SXRlbSgndXNlcl9pbmZvJyk7XG4gICAgaWYodXNlciAhPSBudWxsKXtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHVzZXIpO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgand0VXNlcigpe1xuICAgIGlmKCF0aGlzLmNvbmZpZyl7XG4gICAgICBhbGVydCgnQ29uZmlnIGlzIG5vdCBpbml0aWFsaXplZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGp3dFRva2VuID0gdGhpcy51c2VkU3RvcmFnZS5nZXRJdGVtKCd1c2VyX2luZm8nKTtcbiAgICBpZihqd3RUb2tlbiAhPSBudWxsKXtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wb3N0KCdwcm90ZWN0ZWQnLCB7XG4gICAgICAgIHRva2VuOiBqd3RUb2tlblxuICAgICAgfSk7XG4gICAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dC5kYXRhO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5vdXRwdXQpO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cblxufVxuIl19