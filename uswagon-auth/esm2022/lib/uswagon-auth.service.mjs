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
        await this.decodeJWT();
        const role = this.accountLoggedIn();
        if (role != null) {
            this.router.navigate([this.config?.redirect[role]]);
        }
        else {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
            this.refreshInterval = setInterval(async () => {
                await this.refreshJWT();
            }, (3600 / 2) * 1000);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUF5QzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXhDakIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUd2QixnQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFFcEUsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFLbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVBQUUsNkJBQTZCO2FBQ3pDO1lBQ0QsVUFBVSxFQUFFO2dCQUNWLE9BQU8sRUFBRSxvQkFBb0I7Z0JBQzdCLE9BQU8sRUFBRSx3REFBd0Q7YUFDbEU7U0FDRixDQUFDO0lBS0UsQ0FBQztJQUVMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFrQkk7SUFDSixLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWlCO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksU0FBUyxFQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDbkMsQ0FBQztRQUNELE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQyxJQUFHLElBQUksSUFBRSxJQUFJLEVBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7YUFBSSxDQUFDO1lBQ0osSUFBRyxJQUFJLENBQUMsZUFBZSxFQUFDLENBQUM7Z0JBQ3ZCLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUM1QyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMxQixDQUFDLEVBQUMsQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDcEIsQ0FBQztJQUNILENBQUM7SUFFRCxtQkFBbUI7UUFDakIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLEtBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQztZQUMzQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFELElBQUcsUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBRyxFQUFFLEVBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcseUJBQXlCLENBQUM7Z0JBQ3JELFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQztpQkFBSSxDQUFDO2dCQUNKLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ2QsbUNBQW1DO29CQUNuQyxJQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxFQUFDLENBQUM7d0JBQ25DLElBQUksQ0FBQzs0QkFDRCxNQUFNLEtBQUssR0FBSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDckMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDbEMsSUFBRyxDQUFDLE9BQU8sRUFBQyxDQUFDO2dDQUNYLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQztnQ0FDakcsU0FBUyxHQUFHLElBQUksQ0FBQzs0QkFDbkIsQ0FBQztpQ0FBSSxDQUFDO2dDQUNKLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQzs0QkFDdkMsQ0FBQzt3QkFDTCxDQUFDO3dCQUFDLE1BQU0sQ0FBQzs0QkFDUCxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQzs0QkFDN0MsT0FBTyxLQUFLLENBQUM7d0JBQ2YsQ0FBQztvQkFFTCxDQUFDO29CQUVELE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBR2xDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQzt3QkFDOUQsU0FBUyxHQUFHLElBQUksQ0FBQztvQkFDbkIsQ0FBQzt5QkFBSSxDQUFDO3dCQUNKLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztvQkFDdkMsQ0FBQztnQkFDSCxDQUFDO3FCQUFNLENBQUM7b0JBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO2dCQUN6QyxDQUFDO1lBQ0gsQ0FBQztRQUVILENBQUM7UUFDRCxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxTQUFTO1FBQ1AsS0FBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDekMsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7OztRQU9JO0lBQ0osZUFBZTtRQUNiLElBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLElBQUksU0FBUyxFQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO1lBQzVCLE9BQU87UUFDVCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUc7WUFDOUMsTUFBTSxFQUFDLFNBQVM7WUFDaEIsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBYSxDQUFDLFNBQVMsSUFBSSw4QkFBOEI7U0FDbEYsQ0FBQTtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBR0QsWUFBWSxDQUFDLEdBQVU7UUFDckIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxHQUFVLEVBQUUsUUFBZ0IsRUFBRyxNQUFjLEVBQUUsSUFBVyxFQUFFLE9BQWlCLEVBQUUsU0FBa0IsRUFBQyxTQUFpQjtRQUNySSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFFLEVBQUMsS0FBSyxFQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxDQUFDO0lBQ3ZJLENBQUM7SUFFRCxlQUFlLENBQUMsR0FBVSxFQUFFLEtBQVk7UUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ25DLENBQUM7SUFFRCxjQUFjO1FBQ1osTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRCxPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUM7SUFFNUIsQ0FBQztJQUVELGFBQWE7UUFDWCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELGVBQWU7UUFDYixZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBaUI7UUFDNUMsTUFBTSxTQUFTLEdBQUcsbUNBQW1DLENBQUM7UUFDdEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLCtDQUErQztRQUM3RyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyx3Q0FBd0M7UUFFL0YsaUJBQWlCO1FBQ2pCLE1BQU0sU0FBUyxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQzdDLEtBQUssRUFDTCxHQUFHLEVBQ0gsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQ25CLEtBQUssRUFDTCxDQUFDLFNBQVMsQ0FBQyxDQUNaLENBQUM7UUFFRix3QkFBd0I7UUFDeEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3RCxNQUFNLFVBQVUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUM1QyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMzQixTQUFTLEVBQ1QsZ0JBQWdCLENBQ2pCLENBQUM7UUFFRixtREFBbUQ7UUFDbkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFeEQsb0JBQW9CO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQWMsRUFBRSxJQUFRO1FBQ2pDLElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUMsQ0FBQztZQUMzQixLQUFLLENBQUMsNERBQTRELENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqRCxJQUFJLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDcEIsS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDL0MsSUFBRyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQzt3QkFDdkMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BCLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUM7WUFDOUIsa0JBQWtCLEVBQUUsZ0JBQWdCO1lBQ3BDLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUM3QixNQUFNLENBQUMsTUFBTSxDQUNYO1lBQ0UsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTTtZQUM1QixHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHO1lBQ3JCLE1BQU0sRUFBRSxNQUFNO1NBQ2YsRUFDRCxJQUFJLENBQ0wsQ0FDRixDQUFDO1FBRUosTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ3hDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQzdCLFNBQVMsRUFDVCxFQUFFLE9BQU8sRUFBRSxDQUNaLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWM7UUFDdkIsTUFBTSxRQUFRLEdBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFBO1FBQ2pFLElBQUcsUUFBUSxDQUFDLE9BQU8sRUFBQyxDQUFDO1lBQ25CLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUN6QixDQUFDO2FBQUksQ0FBQztZQUNKLE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQWUsRUFBRSxNQUE0QjtRQUNqRSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFBO1FBQ3hGLElBQUcsUUFBUSxDQUFDLE9BQU8sRUFBQyxDQUFDO1lBQ25CLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUN6QixDQUFDO2FBQUksQ0FBQztZQUNKLE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNILENBQUM7SUFJRCxLQUFLLENBQUMsUUFBUTtRQUNaLElBQUcsSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDO1lBQ2YsT0FBTztRQUNULENBQUM7UUFDRCxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLElBQUksU0FBUyxFQUFDLENBQUM7WUFDOUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7WUFDakQsT0FBTztRQUNULENBQUM7UUFFRCxJQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUMsQ0FBQztZQUM5QixPQUFPO1FBQ1QsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRztZQUN0QixNQUFNLEVBQUMsU0FBUztZQUNoQixTQUFTLEVBQUMsWUFBWTtZQUN0QixVQUFVLEVBQUMsSUFBSTtTQUNoQixDQUFBO1FBRUQsbUJBQW1CO1FBQ25CLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEQsSUFBSSxLQUFLLENBQUM7UUFDVixJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLENBQUM7WUFDekIsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakcsQ0FBQztRQUNELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTlDLElBQUksTUFBTSxHQUFNLEVBQUUsQ0FBQztRQUVuQixLQUFJLElBQUksS0FBSyxJQUFJLFVBQVUsRUFBQyxDQUFDO1lBQzNCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3ZDLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUMsQ0FBQztnQkFDakMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwQyxJQUFHLElBQUksRUFBQyxDQUFDO29CQUNQLEtBQUssR0FBRyxJQUFJLENBQUE7Z0JBQ2QsQ0FBQztxQkFBSSxDQUFDO29CQUNKLElBQUksQ0FBQyxnQkFBZ0IsR0FBRzt3QkFDdEIsSUFBSSxFQUFFLE9BQU87d0JBQ2IsT0FBTyxFQUFFLDBDQUEwQztxQkFDcEQsQ0FBQTtvQkFDRCxPQUFPO2dCQUNULENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDO2dCQUM5QixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQTtnQkFDOUcsSUFBRyxZQUFZLElBQUksSUFBSSxFQUFDLENBQUM7b0JBQ3ZCLElBQUcsWUFBWSxFQUFDLENBQUM7d0JBQ2IsSUFBSSxDQUFDLGdCQUFnQixHQUFHOzRCQUN0QixJQUFJLEVBQUUsT0FBTzs0QkFDYixPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLGtCQUFrQjt5QkFDbEQsQ0FBQTt3QkFDRCxPQUFPO29CQUNYLENBQUM7Z0JBQ0gsQ0FBQztxQkFBSSxDQUFDO29CQUNKLElBQUksQ0FBQyxnQkFBZ0IsR0FBRzt3QkFDdEIsSUFBSSxFQUFFLE9BQU87d0JBQ2IsT0FBTyxFQUFFLDBDQUEwQztxQkFDcEQsQ0FBQTtvQkFDRCxPQUFPO2dCQUNULENBQUM7WUFDSCxDQUFDO1lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFFLEtBQUssQ0FBQztRQUN2QixDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQ2IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxLQUFLLEVBQUMsQ0FBQSxDQUFDLENBQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxLQUFLLEVBQUMsQ0FBQSxDQUFDLENBQUEsRUFBRSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUMsRUFDL0ksTUFBTSxDQUNOLENBQUM7UUFFTCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDbEIsRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBQyxDQUNsQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQVEsRUFBQyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUUsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7WUFDbEMsSUFBRyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7Z0JBQ2YsdUJBQXVCO2dCQUN2QixJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFDLENBQUM7b0JBQzVCLHdCQUF3QjtvQkFDeEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHO3dCQUN0QixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFhLENBQUMsZUFBZSxJQUFJLHlDQUF5QztxQkFDakcsQ0FBQTtnQkFDSCxDQUFDO3FCQUFJLENBQUM7b0JBQ0osNEJBQTRCO29CQUM1QixJQUFJLENBQUMsZ0JBQWdCLEdBQUc7d0JBQ3RCLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLFlBQWEsQ0FBQyxVQUFVLElBQUksc0VBQXNFO3FCQUN6SCxDQUFBO29CQUNELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQztZQUNILENBQUM7aUJBQUksQ0FBQztnQkFDSixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3BCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsS0FBSztRQUNILElBQUcsSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDO1lBQ2YsT0FBTztRQUNULENBQUM7UUFDRCxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBQyxDQUFDO1lBQ3ZDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1lBQzFDLE9BQU87UUFDVCxDQUFDO1FBQ0Qsb0RBQW9EO1FBQ3BELElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUN6RSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztZQUMvRSxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBRyxDQUFDLEVBQUMsQ0FBQztZQUNyRyxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztZQUNyRSxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBQyxDQUFDO1lBQzlCLE9BQU87UUFDVCxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUc7WUFDdEIsTUFBTSxFQUFDLFNBQVM7WUFDaEIsU0FBUyxFQUFDLFlBQVk7WUFDdEIsVUFBVSxFQUFDLElBQUk7U0FDaEIsQ0FBQTtRQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDeEIsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUM5QixlQUFlLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLO1lBQ2xELFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUs7WUFDekMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVTtZQUM5QixlQUFlLEVBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPO1NBQ3BELENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFRLEVBQUUsRUFBRTtZQUNuQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBYSxDQUFDLFFBQVEsSUFBSSxtQkFBbUI7YUFDcEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0YsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsT0FBTyxFQUFDLElBQUksQ0FBQyxNQUFNO2FBQ3BCLENBQUM7WUFDRixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDekIsSUFBRyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUcsU0FBUyxFQUFDLENBQUM7b0JBQy9DLElBQUksQ0FBQyxnQkFBZ0IsR0FBRzt3QkFDdEIsSUFBSSxFQUFFLE9BQU87d0JBQ2IsT0FBTyxFQUFFLDhCQUE4QjtxQkFDeEMsQ0FBQztvQkFDRixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCxZQUFZO2dCQUNaLElBQUcsSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDO29CQUNmLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdCLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRSxFQUFFO29CQUU1QixJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxJQUFJLEtBQUssRUFBQyxDQUFDO3dCQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNwRCxDQUFDO3lCQUFJLENBQUM7d0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQ3RCLFdBQVcsRUFDWCxJQUFJLENBQUMsSUFBSSxDQUNWLENBQUM7d0JBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDOUQsQ0FBQztvQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUN2QixDQUFDLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLElBQUksSUFBSSxDQUFDLENBQUE7WUFDdEMsQ0FBQztpQkFBSSxDQUFDO2dCQUNKLHFCQUFxQjtnQkFDckIsSUFBSSxDQUFDLGdCQUFnQixHQUFHO29CQUN0QixJQUFJLEVBQUUsT0FBTztvQkFDYixPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU07aUJBQ3JCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDdkIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxJQUFJLFNBQVMsRUFBQyxDQUFDO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25ELElBQUcsSUFBSSxJQUFJLElBQUksRUFBQyxDQUFDO2dCQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFDYixJQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDO1lBQ2YsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDbkMsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RCxJQUFHLFFBQVEsSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUNuQixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUM1QyxLQUFLLEVBQUUsUUFBUTthQUNoQixDQUFDLENBQUM7WUFDSCxJQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUMsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLElBQUksR0FBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDM0IsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUIsQ0FBQztpQkFBSSxDQUFDO2dCQUNKLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVO1FBQ2QsSUFBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQztZQUNmLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ25DLE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkQsSUFBRyxRQUFRLElBQUksSUFBSSxFQUFDLENBQUM7WUFDbkIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDMUMsS0FBSyxFQUFFLFFBQVE7YUFDaEIsQ0FBQyxDQUFDO1lBQ0gsSUFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUMsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDOytHQXhnQlUsa0JBQWtCO21IQUFsQixrQkFBa0IsY0FGakIsTUFBTTs7NEZBRVAsa0JBQWtCO2tCQUg5QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7ICBBdXRoQ29uZmlnLCBBdXRoRm9ybSwgQXV0aFZhbGlkYXRvciwgU25hY2tiYXJGZWVkYmFjayxBdXRoTWVzc2FnZXMgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tYXV0aC50eXBlcyc7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMnO1xuXG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhTZXJ2aWNlIHtcblxuICBwdWJsaWMgc25hY2tiYXJGZWVkYmFjaz86U25hY2tiYXJGZWVkYmFjaztcbiAgcHVibGljIGxvYWRpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgcmVmcmVzaEludGVydmFsOmFueTtcbiAgcHJpdmF0ZSB1c2VkU3RvcmFnZSA9IHRoaXMuaXNMb2NhbFN0b3JhZ2UoKSA/IGxvY2FsU3RvcmFnZSA6IHNlc3Npb25TdG9yYWdlO1xuICBwcml2YXRlIGNvbmZpZzpBdXRoQ29uZmlnfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBhdXRoRm9ybTpBdXRoRm9ybSA9IHt9O1xuICBwcml2YXRlIGVtYWlsTm90aWZpY2F0aW9uOmJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSB0aW1lb3V0OmFueTtcbiAgcHJpdmF0ZSB1c2VyOmFueTtcbiAgcHJpdmF0ZSByb2xlOmFueTtcblxuICBwcml2YXRlIHZhbGlkYXRvcnM6QXV0aFZhbGlkYXRvciA9IHtcbiAgICBlbWFpbDoge1xuICAgICAgcGF0dGVybjogJ15bXFxcXHctLl0rQFtcXFxcdy1dK1xcXFwuW2EtekEtWl17Mix9KFsuXVthLXpBLVpdezIsfSkqJCcsXG4gICAgICBtZXNzYWdlOiAnRW1haWwgaXMgbm90IHZhbGlkLidcbiAgICB9LFxuICAgIHBhc3N3b3JkOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKD89LipbYS16XSkoPz0uKltBLVpdKSg/PS4qXFxcXGQpKD89LipbIUAjJCVeJipdKVtBLVphLXpcXFxcZCFAIyQlXiYqXXs4LH0kJyxcbiAgICAgICAgbWVzc2FnZTogJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcgYW5kIGluY2x1ZGUgdXBwZXJjYXNlLCBsb3dlcmNhc2UsIG51bWJlciwgYW5kIHNwZWNpYWwgY2hhcmFjdGVyLidcbiAgICB9LFxuICAgIHBob25lOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKFxcXFwrXFxcXGR7MSwzfVxcXFxzPyk/XFxcXCg/XFxcXGR7M31cXFxcKT9bLVxcXFxzXT9cXFxcZHszfVstXFxcXHNdP1xcXFxkezR9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQaG9uZSBudW1iZXIgbXVzdCBiZSBpbiBhIHZhbGlkIGZvcm1hdC4nXG4gICAgfSxcbiAgICB1c2VybmFtZToge1xuICAgICAgcGF0dGVybjogJ15bYS16QS1aMC05XXszLDE1fSQnLFxuICAgICAgbWVzc2FnZTogJ1VzZXJuYW1lIG11c3QgYmUgMy0xNSBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNhbiBvbmx5IGNvbnRhaW4gbGV0dGVycyBhbmQgbnVtYmVycy4nXG4gICAgfSxcbiAgICBjcmVkaXRDYXJkOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldezJ9KVswLTldezEyfXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18N1swLTldezE1fSkkJyxcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgY3JlZGl0IGNhcmQgbnVtYmVyLidcbiAgICB9LFxuICAgIHBvc3RhbENvZGU6IHtcbiAgICAgIHBhdHRlcm46ICdeXFxcXGR7NX0oLVxcXFxkezR9KT8kJyxcbiAgICAgIG1lc3NhZ2U6ICdQb3N0YWwgY29kZSBtdXN0IGJlIGluIHRoZSBmb3JtYXQgMTIzNDUgb3IgMTIzNDUtNjc4OS4nXG4gICAgfSxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgKSB7IH1cbiAgXG4gIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHNlcnZpY2UgZm9yIHRoZSBwcm9qZWN0XG4gICAgICogQHBhcmFtIGNvbmZpZyAtIGNvbmZpZ3VyYXRpb24gdGhhdCBwb2ludHMgdGhlIHNlcnZpY2UgdG8gaXRzIGFwcHJvcHJpYXRlIHNlcnZlclxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdGhpcy5hdXRoLmluaXRpYWxpemUoe1xuICAgICAqICBhcGk6ZW52aXJvbm1lbnQuYXBpLFxuICAgICAqICBhcGlLZXk6IGVudmlyb25tZW50LmFwaUtleSxcbiAgICAgKiAgYXBwOiAndGVzdC1hcHAnLFxuICAgICAqICByZWdpc3RyYXRpb25UYWJsZTogJ3RlYWNoZXJzJywgLy8gY2FuIGJlIHVuZGVmaW5lZCBsb2dpblxuICAgICAqICBsb2dpblRhYmxlOiBbJ3RlYWNoZXJzJywgJ2FkbWluaXN0cmF0b3JzJywgJ3N0dWRlbnRzJ11cbiAgICAgKiAgcmVkaXJlY3Q6e1xuICAgICAqICAgICdzdHVkZW50cyc6ICcvc3R1ZGVudCcsXG4gICAgICogICAgJ3RlYWNoZXJzJzogJy90ZWFjaGVyJyxcbiAgICAgKiAgICAnYWRtaW5pc3RyYXRvcnMnOiAnL2FkbWluJyxcbiAgICAgKiAgIH1cbiAgICAgKiB9KVxuICAgICAqIFxuICAgKiovXG4gIGFzeW5jIGluaXRpYWxpemUoY29uZmlnOkF1dGhDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIGlmKHRoaXMuY29uZmlnLmF1dGhNZXNzYWdlcyA9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5jb25maWcuYXV0aE1lc3NhZ2VzID0ge307XG4gICAgfVxuICAgIHRoaXMuYXV0aEZvcm0gPSB7fTtcbiAgICBpZighdGhpcy5jb25maWcuYXV0aFR5cGUpe1xuICAgICAgdGhpcy5jb25maWcuYXV0aFR5cGUgPSAnZGVmYXVsdCc7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZGVjb2RlSldUKCk7XG4gICAgY29uc3Qgcm9sZSA9IHRoaXMuYWNjb3VudExvZ2dlZEluKCk7XG4gICAgaWYocm9sZSE9bnVsbCl7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWc/LnJlZGlyZWN0W3JvbGVdXSk7XG4gICAgfWVsc2V7XG4gICAgICBpZih0aGlzLnJlZnJlc2hJbnRlcnZhbCl7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5yZWZyZXNoSW50ZXJ2YWwpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PntcbiAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoSldUKCk7XG4gICAgICB9LCgzNjAwLzIpICogMTAwMClcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUlucHV0RmllbGRzKCk6Ym9vbGVhbntcbiAgICB2YXIgaGFzRXJyb3JzID0gZmFsc2U7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICBjb25zdCB7IHZhbHVlLCB2YWxpZGF0b3IsIHJlcXVpcmVkIH0gPSB0aGlzLmF1dGhGb3JtW2tleV07XG4gICAgICBpZihyZXF1aXJlZCAmJiB2YWx1ZS50cmltKCkgPT0nJyl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkISc7XG4gICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkYXRvciBpcyBub3QgY3VzdG9tXG4gICAgICAgICAgaWYodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9ICBuZXcgUmVnRXhwKHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICBpZighaXNWYWxpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IGAke2tleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zbGljZSgxKX0gaXMgbm90IGEgdmFsaWQgaW5wdXQuYDtcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdDdXN0b20gdmFsaWRhdG9yIHNob3VsZCBiZSBvbiByZWdleCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5wYXR0ZXJuKTtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLm1lc3NhZ2U7XG4gICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIHJldHVybiAhaGFzRXJyb3JzO1xuICB9XG5cbiAgY2xlYXJGb3JtKCl7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIFxuICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvbGUgPSB0aGlzLmF1dGguYWNjb3VudExvZ2dlZEluKClcbiAgICAgKiBcbiAgICAgKiBPVVRQVVQ6IHJvbGUgb2YgdXNlciBpZiBhdXRoZW50aWNhdGVkLCBudWxsIGlmIHVuYXV0aGVudGljYXRlZFxuICAgKiovXG4gIGFjY291bnRMb2dnZWRJbigpIHtcbiAgICBpZih0aGlzLmNvbmZpZz8uYXV0aFR5cGUgPT0gJ2RlZmF1bHQnKXtcbiAgICAgIHRoaXMucm9sZSA9IHRoaXMudXNlZFN0b3JhZ2UuZ2V0SXRlbSgnbG9nZ2VkX2luJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJvbGU7XG4gIH1cblxuICBsb2dvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmFjY291bnRMb2dnZWRJbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucm9sZSA9IG51bGw7XG4gICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICB0aGlzLnVzZWRTdG9yYWdlLmNsZWFyKCk7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICd0eXBlJzonc3VjY2VzcycsXG4gICAgICAnbWVzc2FnZSc6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLmxvZ2dlZE91dCA/PyAnQWNjb3VudCBoYXMgYmVlbiBsb2dnZWQgb3V0LicsXG4gICAgfVxuICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnLyddKTtcbiAgfVxuXG5cbiAgZ2V0QXV0aEZpZWxkKGtleTpzdHJpbmcpe1xuICAgIHJldHVybiB0aGlzLmF1dGhGb3JtW2tleV07XG4gIH1cbiAgXG4gIGluaXRpYWxpemVGb3JtRmllbGQoa2V5OnN0cmluZywgcmVxdWlyZWQ6Ym9vbGVhbiAsIHVuaXF1ZTpib29sZWFuLCB0eXBlOnN0cmluZywgYWxpYXNlcz86c3RyaW5nW10sIGVuY3J5cHRlZD86Ym9vbGVhbix2YWxpZGF0b3I/OnN0cmluZyl7XG4gICAgdGhpcy5hdXRoRm9ybVtrZXldPSB7dmFsdWU6JycsIHZhbGlkYXRvcjp2YWxpZGF0b3IsIHJlcXVpcmVkOnJlcXVpcmVkLCB0eXBlOnR5cGUsIGFsaWFzZXM6YWxpYXNlcyxlbmNyeXB0ZWQ6ZW5jcnlwdGVkLHVuaXF1ZTp1bmlxdWV9O1xuICB9XG5cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5hdXRoRm9ybVtrZXldLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBpc0xvY2FsU3RvcmFnZSgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0b3JhZ2UnKTtcbiAgICByZXR1cm4gc3RvcmFnZSA9PSAnbG9jYWwnO1xuICAgIFxuICB9XG5cbiAgZ2V0U2F2ZWRFbWFpbCgpIHtcbiAgICBjb25zdCBlbWFpbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZW1lbWJlcicpO1xuICAgIHJldHVybiBlbWFpbDtcbiAgfVxuXG4gIHVzZUxvY2FsU3RvcmFnZSgpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RvcmFnZScsICdsb2NhbCcpO1xuICB9XG5cbiAgdXNlU2Vzc2lvblN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnc2Vzc2lvbicpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbmNyeXB0UmVxdWVzdChwbGFpbnRleHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qga2V5U3RyaW5nID0gJ0FIUzg1NzY1OThQSU9VTkEyMTQ4NDI3ODAzMDltcHFiSCc7XG4gICAgY29uc3Qga2V5ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGtleVN0cmluZy5zbGljZSgwLCAzMikpOyAvLyBVc2Ugb25seSB0aGUgZmlyc3QgMzIgY2hhcmFjdGVycyBmb3IgQUVTLTI1NlxuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxNikpOyAvLyBHZW5lcmF0ZSByYW5kb20gSVYgKDE2IGJ5dGVzIGZvciBBRVMpXG5cbiAgICAvLyBJbXBvcnQgdGhlIGtleVxuICAgIGNvbnN0IGNyeXB0b0tleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBrZXksXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJyB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICk7XG5cbiAgICAvLyBFbmNyeXB0IHRoZSBwbGFpbnRleHRcbiAgICBjb25zdCBlbmNvZGVkUGxhaW50ZXh0ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHBsYWludGV4dCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBpdjogaXYgfSxcbiAgICAgIGNyeXB0b0tleSxcbiAgICAgIGVuY29kZWRQbGFpbnRleHRcbiAgICApO1xuXG4gICAgLy8gQ29tYmluZSBJViBhbmQgY2lwaGVydGV4dCwgdGhlbiBlbmNvZGUgdG8gYmFzZTY0XG4gICAgY29uc3QgY29tYmluZWQgPSBuZXcgVWludDhBcnJheShpdi5ieXRlTGVuZ3RoICsgY2lwaGVydGV4dC5ieXRlTGVuZ3RoKTtcbiAgICBjb21iaW5lZC5zZXQoaXYsIDApO1xuICAgIGNvbWJpbmVkLnNldChuZXcgVWludDhBcnJheShjaXBoZXJ0ZXh0KSwgaXYuYnl0ZUxlbmd0aCk7XG5cbiAgICAvLyBDb252ZXJ0IHRvIGJhc2U2NFxuICAgIHJldHVybiBidG9hKFN0cmluZy5mcm9tQ2hhckNvZGUoLi4uY29tYmluZWQpKTtcbiAgfVxuXG4gIGFzeW5jIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIG9ial0gb2YgT2JqZWN0LmVudHJpZXM8YW55Pihib2R5KSkge1xuICAgICAgaWYgKGtleSA9PSAndmFsdWVzJykge1xuICAgICAgICBmb3IgKHZhciBbZmllbGQsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgaWYodmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBvYmpbZmllbGRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHtcbiAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSk7XG4gICAgY29uc3Qgc2FsdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIGNvbnN0IGpzb25TdHJpbmcgPSBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBUElfS0VZOiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgQXBwOiB0aGlzLmNvbmZpZz8uYXBwLFxuICAgICAgICAgICAgTWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5XG4gICAgICAgIClcbiAgICAgICk7XG5cbiAgICBjb25zdCBlbmNyeXB0ZWQgPSBhd2FpdCB0aGlzLmVuY3J5cHRSZXF1ZXN0KGpzb25TdHJpbmcpO1xuICAgIHJldHVybiBhd2FpdCBmaXJzdFZhbHVlRnJvbSh0aGlzLmh0dHAucG9zdDxhbnk+KFxuICAgICAgdGhpcy5jb25maWc/LmFwaSArICc/JyArIHNhbHQsXG4gICAgICBlbmNyeXB0ZWQsXG4gICAgICB7IGhlYWRlcnMgfVxuICAgICkpO1xuICB9XG5cbiAgYXN5bmMgaGFzaChlbmNyeXB0OnN0cmluZyl7XG4gICAgY29uc3QgcmVzcG9uc2UgPSAgYXdhaXQgdGhpcy5wb3N0KCdnZXRfaGFzaCcsIHtlbmNyeXB0OiBlbmNyeXB0fSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrRHVwbGljYXRlcyh0YWJsZXM6c3RyaW5nW10sIHZhbHVlczp7W2tleTpzdHJpbmddOnN0cmluZ30pe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wb3N0KCdjaGVja19kdXBsaWNhdGVzJyx7J3RhYmxlcyc6IHRhYmxlcywgJ3ZhbHVlcyc6dmFsdWVzfSlcbiAgICBpZihyZXNwb25zZS5zdWNjZXNzKXtcbiAgICAgIHJldHVybiByZXNwb25zZS5vdXRwdXQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBFcnJvcicpO1xuICAgIH1cbiAgfVxuXG5cblxuICBhc3luYyByZWdpc3RlcigpIHtcbiAgICBpZih0aGlzLmxvYWRpbmcpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZz8ucmVnaXN0cmF0aW9uVGFibGUgPT0gdW5kZWZpbmVkKXtcbiAgICAgIGFsZXJ0KCdSZWdpc3RyYXRpb24gdGFibGUgbXVzdCBiZSBpbml0aWFsaXplZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighdGhpcy52YWxpZGF0ZUlucHV0RmllbGRzKCkpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICd0eXBlJzonbmV1dHJhbCcsXG4gICAgICAnbWVzc2FnZSc6J0xvYWRpbmcuLi4nLFxuICAgICAgaXNJbmZpbml0ZTp0cnVlLFxuICAgIH1cblxuICAgIC8vIGNoZWNrIGR1cGxpY2F0ZXNcbiAgICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoKTtcbiAgICB2YXIgdmlzSUQ7XG4gICAgaWYodGhpcy5jb25maWc/LnZpc2libGVJRCl7XG4gICAgICB2aXNJRCA9IGAke3RoaXMuY29uZmlnLnZpc2libGVJRH0tYCArIG5ld0RhdGUuc3Vic3RyaW5nKDQsIDcpICsgJy0nICsgbmV3RGF0ZS5zdWJzdHJpbmcoNywgMTMpO1xuICAgIH1cbiAgICBjb25zdCBhdXRoRmllbGRzID0gT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSk7XG5cbiAgICB2YXIgdmFsdWVzOmFueSA9e307XG5cbiAgICBmb3IobGV0IGZpZWxkIG9mIGF1dGhGaWVsZHMpe1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5hdXRoRm9ybVtmaWVsZF0udmFsdWU7XG4gICAgICBpZih0aGlzLmF1dGhGb3JtW2ZpZWxkXS5lbmNyeXB0ZWQpe1xuICAgICAgICBjb25zdCBoYXNoID0gYXdhaXQgdGhpcy5oYXNoKHZhbHVlKTtcbiAgICAgICAgaWYoaGFzaCl7XG4gICAgICAgICAgdmFsdWUgPSBoYXNoXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcsIHRyeSBhZ2FpbiBsYXRlci4uLicsXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYodGhpcy5hdXRoRm9ybVtmaWVsZF0udW5pcXVlKXtcbiAgICAgICAgY29uc3QgaGFzRHVwbGljYXRlID0gYXdhaXQgdGhpcy5jaGVja0R1cGxpY2F0ZXModGhpcy5jb25maWcubG9naW5UYWJsZSwge1tmaWVsZF06IHRoaXMuYXV0aEZvcm1bZmllbGRdLnZhbHVlfSlcbiAgICAgICAgaWYoaGFzRHVwbGljYXRlICE9IG51bGwpe1xuICAgICAgICAgIGlmKGhhc0R1cGxpY2F0ZSl7XG4gICAgICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke2ZpZWxkLnRvVXBwZXJDYXNlKCl9IGFscmVhZHkgZXhpc3RzLmAsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdTb21ldGhpbmcgd2VudCB3cm9uZywgdHJ5IGFnYWluIGxhdGVyLi4uJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAgIFxuICAgICAgdmFsdWVzW2ZpZWxkXSA9dmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHBvc3RPYmplY3QgPSBcbiAgICAgICBPYmplY3QuYXNzaWduKHZpc0lEICE9IG51bGwgPyB7dmlzaWJsZWlkOnZpc0lEfTp7fSwgdGhpcy5jb25maWcudmVyaWZpY2F0aW9uID8ge3ZlcmlmaWVkOmZhbHNlfTp7fSwge2FjY291bnRUeXBlOiB0aGlzLmNvbmZpZy5yZWdpc3RyYXRpb25UYWJsZX0sXG4gICAgICAgIHZhbHVlc1xuICAgICAgICk7IFxuICAgICAgIFxuICAgIHRoaXMucG9zdCgncmVnaXN0ZXInLCBcbiAgICAgIHtkYXRhOkpTT04uc3RyaW5naWZ5KHBvc3RPYmplY3QpfSxcbiAgICApLnRoZW4oKGRhdGE6YW55KT0+e1xuICAgICAgdGhpcy5sb2FkaW5nID1mYWxzZTtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICAgIC8vIHNob3cgcHJvcGVyIHNuYWNrYmFyXG4gICAgICAgIGlmKHRoaXMuY29uZmlnPy52ZXJpZmljYXRpb24pe1xuICAgICAgICAgIC8vIHdhaXQgZm9yIHZlcmlmaWNhdGlvblxuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLmZvclZlcmlmaWNhdGlvbiA/PyAnUGxlYXNlIHdhaXQgZm9yIGFjY291bnQgdmVyaWZpY2F0aW9uLi4uJ1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7ICBcbiAgICAgICAgICAvLyBzdWNjZXNzZnVsbHkgcmVnaXN0ZXJlZCFgXG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEucmVnaXN0ZXJlZCA/PyAnUmVnaXN0cmF0aW9uIHdhcyBzdWNjZXNzZnVsLCB5b3UgbWF5IG5vdyBsb2dpbiB3aXRoIHlvdXIgY3JlZGVudGlhbHMnXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuY2xlYXJGb3JtKCk7XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBhbGVydChkYXRhLm91dHB1dClcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU25hY2tiYXIoKXtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gIH1cbiAgXG4gIGxvZ2luKCkge1xuICAgIGlmKHRoaXMubG9hZGluZyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKHRoaXMuY29uZmlnPy5sb2dpblRhYmxlID09IHVuZGVmaW5lZCl7XG4gICAgICBhbGVydCgnTG9naW4gdGFibGUgbXVzdCBiZSBpbml0aWFsaXplZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gY2hlY2sgaWYgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIGZpZWxkcyBhcmUgcHJlc2VudFxuICAgIGlmKHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXT09bnVsbCB8fCB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddID09IG51bGwpe1xuICAgICAgYWxlcnQoJ1BsZWFzZSBpbml0aWFsaXplIGlkZW50aWZpZXIgYW5kIHBhc3N3b3JkIGZpZWxkcyB1c2luZyBbbmFtZV09XCJmaWVsZFwiJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYodGhpcy5hdXRoRm9ybVsnaWRlbnRpZmllciddLmFsaWFzZXMgPT0gdW5kZWZpbmVkIHx8IHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzLmxlbmd0aCA8PTApe1xuICAgICAgYWxlcnQoXCJJZGVudGlmaWVyIGZpZWxkIG11c3QgYmUgaW5pdGlhbGl6ZWQgd2l0aCBhbGlhc2VzPVthbGlhc2VzXVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZighdGhpcy52YWxpZGF0ZUlucHV0RmllbGRzKCkpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J25ldXRyYWwnLFxuICAgICAgJ21lc3NhZ2UnOidMb2FkaW5nLi4uJyxcbiAgICAgIGlzSW5maW5pdGU6dHJ1ZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucG9zdCgnbG9naW4nLCB7XG4gICAgICBhdXRoVHlwZTogdGhpcy5jb25maWcuYXV0aFR5cGUsXG4gICAgICBpZGVudGlmaWVyVmFsdWU6IHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS52YWx1ZSxcbiAgICAgIHBhc3N3b3JkOiB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddLnZhbHVlLFxuICAgICAgdGFibGVzOiB0aGlzLmNvbmZpZy5sb2dpblRhYmxlLFxuICAgICAgaWRlbnRpZmllclR5cGVzOnRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzXG4gICAgfSkudGhlbigoZGF0YTphbnkpID0+IHtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IGRhdGEuc3VjY2VzcyA/IHtcbiAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5sb2dnZWRJbiA/PyAnTG9naW4gU3VjY2Vzc2Z1bCEnXG4gICAgICB9IDoge1xuICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICBtZXNzYWdlOmRhdGEub3V0cHV0XG4gICAgICB9O1xuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICBjb25zdCB1c2VyID0gZGF0YS5vdXRwdXQ7XG4gICAgICAgIGlmKHRoaXMuY29uZmlnPy5yZWRpcmVjdFt1c2VyLnJvbGVdPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogXCJUaGlzIHVzZXIgaXMgbm90IGF1dGhvcml6ZWQuXCJcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBkZWxheVxuICAgICAgICBpZih0aGlzLnRpbWVvdXQpe1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICBcbiAgICAgICAgICBpZih0aGlzLmNvbmZpZz8uYXV0aFR5cGUgPT0gJ2p3dCcpe1xuICAgICAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKCd1c2VyX2luZm8nLCB1c2VyLnRva2VuKTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICAgICAgJ2xvZ2dlZF9pbicsXG4gICAgICAgICAgICAgIHVzZXIucm9sZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbSgndXNlcl9pbmZvJywgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWc/LnJlZGlyZWN0W3VzZXIucm9sZV1dKTtcbiAgICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfSx0aGlzLmNvbmZpZz8ubG9naW5UaW1lb3V0ID8/IDE1MDApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gYWxlcnQoZGF0YS5vdXRwdXQpXG4gICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIG1lc3NhZ2U6IGRhdGEub3V0cHV0XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0VXNlcigpe1xuICAgIGlmKHRoaXMuY29uZmlnPy5hdXRoVHlwZSA9PSAnZGVmYXVsdCcpe1xuICAgICAgY29uc3QgdXNlciA9IHRoaXMudXNlZFN0b3JhZ2UuZ2V0SXRlbSgndXNlcl9pbmZvJyk7XG4gICAgICBpZih1c2VyICE9IG51bGwpe1xuICAgICAgICB0aGlzLnVzZXIgPSBKU09OLnBhcnNlKHVzZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy51c2VyO1xuICB9XG5cbiAgYXN5bmMgZGVjb2RlSldUKCl7XG4gICAgaWYoIXRoaXMuY29uZmlnKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgaXMgbm90IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgand0VG9rZW4gPSB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ3VzZXJfaW5mbycpO1xuICAgIGlmKGp3dFRva2VuICE9IG51bGwpe1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnBvc3QoJ3Byb3RlY3RlZCcsIHtcbiAgICAgICAgdG9rZW46IGp3dFRva2VuXG4gICAgICB9KTtcbiAgICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgICB0aGlzLnVzZXIgPSAgcmVzcG9uc2Uub3V0cHV0LmRhdGE7XG4gICAgICAgIHRoaXMucm9sZSA9IHRoaXMudXNlci5yb2xlO1xuICAgICAgICBhd2FpdCB0aGlzLnJlZnJlc2hKV1QoKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uub3V0cHV0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyByZWZyZXNoSldUKCl7XG4gICAgaWYoIXRoaXMuY29uZmlnKXtcbiAgICAgIGFsZXJ0KCdDb25maWcgaXMgbm90IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgand0VG9rZW4gPSB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ3VzZXJfaW5mbycpO1xuICAgIGlmKGp3dFRva2VuICE9IG51bGwpe1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnBvc3QoJ3JlZnJlc2gnLCB7XG4gICAgICAgIHRva2VuOiBqd3RUb2tlblxuICAgICAgfSk7XG4gICAgICBpZighcmVzcG9uc2Uuc3VjY2Vzcyl7IFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uub3V0cHV0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG59XG4iXX0=