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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthService, deps: [{ token: i1.HttpClient }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: UswagonAuthService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: i2.Router }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBT3RDLE1BQU0sT0FBTyxrQkFBa0I7SUFvQzdCLFlBQ1UsSUFBZ0IsRUFDaEIsTUFBYztRQURkLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQWxDaEIsZ0JBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBRXBFLFlBQU8sR0FBVyxLQUFLLENBQUM7UUFDeEIsYUFBUSxHQUFZLEVBQUUsQ0FBQztRQUN2QixzQkFBaUIsR0FBVyxLQUFLLENBQUM7UUFDbEMsZUFBVSxHQUFpQjtZQUNqQyxLQUFLLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLHFEQUFxRDtnQkFDOUQsT0FBTyxFQUFFLHFCQUFxQjthQUMvQjtZQUNELFFBQVEsRUFBRTtnQkFDTixPQUFPLEVBQUUsMEVBQTBFO2dCQUNuRixPQUFPLEVBQUUsOEdBQThHO2FBQzFIO1lBQ0QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSw4REFBOEQ7Z0JBQ3ZFLE9BQU8sRUFBRSx5Q0FBeUM7YUFDckQ7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsT0FBTyxFQUFFLGlGQUFpRjthQUMzRjtZQUNELFVBQVUsRUFBRTtnQkFDUixPQUFPLEVBQUUsb0lBQW9JO2dCQUM3SSxPQUFPLEVB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Q2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBYSxDQUFDLFFBQVEsSUFBSSxtQkFBbUI7YUFDcEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0YsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsT0FBTyxFQUFDLElBQUksQ0FBQyxNQUFNO2FBQ3BCLENBQUM7WUFDRixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQ3RCLFdBQVcsRUFDWCxJQUFJLENBQUMsSUFBSSxDQUNWLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELENBQUM7aUJBQUksQ0FBQztnQkFFSixJQUFJLENBQUMsZ0JBQWdCLEdBQUc7b0JBQ3RCLElBQUksRUFBRSxPQUFPO29CQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTTtpQkFDckIsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7K0dBeFlVLGtCQUFrQjttSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07OzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyAgQXV0aENvbmZpZywgQXV0aEZvcm0sIEF1dGhWYWxpZGF0b3IsIFNuYWNrYmFyRmVlZGJhY2ssQXV0aE1lc3NhZ2VzIH0gZnJvbSAnLi90eXBlcy91c3dhZ29uLWF1dGgudHlwZXMnO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICdyeGpzJztcblxuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoU2VydmljZSB7XG5cbiAgcHVibGljIHNuYWNrYmFyRmVlZGJhY2s/OlNuYWNrYmFyRmVlZGJhY2s7XG5cbiAgcHJpdmF0ZSB1c2VkU3RvcmFnZSA9IHRoaXMuaXNMb2NhbFN0b3JhZ2UoKSA/IGxvY2FsU3RvcmFnZSA6IHNlc3Npb25TdG9yYWdlO1xuICBwcml2YXRlIGNvbmZpZzpBdXRoQ29uZmlnfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBsb2FkaW5nOmJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBhdXRoRm9ybTpBdXRoRm9ybSA9IHt9O1xuICBwcml2YXRlIGVtYWlsTm90aWZpY2F0aW9uOmJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSB2YWxpZGF0b3JzOkF1dGhWYWxpZGF0b3IgPSB7XG4gICAgZW1haWw6IHtcbiAgICAgIHBhdHRlcm46ICdeW1xcXFx3LS5dK0BbXFxcXHctXStcXFxcLlthLXpBLVpdezIsfShbLl1bYS16QS1aXXsyLH0pKiQnLFxuICAgICAgbWVzc2FnZTogJ0VtYWlsIGlzIG5vdCB2YWxpZC4nXG4gICAgfSxcbiAgICBwYXNzd29yZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/PS4qW2Etel0pKD89LipbQS1aXSkoPz0uKlxcXFxkKSg/PS4qWyFAIyQlXiYqXSlbQS1aYS16XFxcXGQhQCMkJV4mKl17OCx9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nIGFuZCBpbmNsdWRlIHVwcGVyY2FzZSwgbG93ZXJjYXNlLCBudW1iZXIsIGFuZCBzcGVjaWFsIGNoYXJhY3Rlci4nXG4gICAgfSxcbiAgICBwaG9uZToge1xuICAgICAgICBwYXR0ZXJuOiAnXihcXFxcK1xcXFxkezEsM31cXFxccz8pP1xcXFwoP1xcXFxkezN9XFxcXCk/Wy1cXFxcc10/XFxcXGR7M31bLVxcXFxzXT9cXFxcZHs0fSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGhvbmUgbnVtYmVyIG11c3QgYmUgaW4gYSB2YWxpZCBmb3JtYXQuJ1xuICAgIH0sXG4gICAgdXNlcm5hbWU6IHtcbiAgICAgIHBhdHRlcm46ICdeW2EtekEtWjAtOV17MywxNX0kJyxcbiAgICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IGJlIDMtMTUgY2hhcmFjdGVycyBsb25nIGFuZCBjYW4gb25seSBjb250YWluIGxldHRlcnMgYW5kIG51bWJlcnMuJ1xuICAgIH0sXG4gICAgY3JlZGl0Q2FyZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XXsyfSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fDdbMC05XXsxNX0pJCcsXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGNyZWRpdCBjYXJkIG51bWJlci4nXG4gICAgfSxcbiAgICBwb3N0YWxDb2RlOiB7XG4gICAgICBwYXR0ZXJuOiAnXlxcXFxkezV9KC1cXFxcZHs0fSk/JCcsXG4gICAgICBtZXNzYWdlOiAnUG9zdGFsIGNvZGUgbXVzdCBiZSBpbiB0aGUgZm9ybWF0IDEyMzQ1IG9yIDEyMzQ1LTY3ODkuJ1xuICAgIH0sXG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG4gIFxuICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZXJ2aWNlIGZvciB0aGUgcHJvamVjdFxuICAgICAqIEBwYXJhbSBjb25maWcgLSBjb25maWd1cmF0aW9uIHRoYXQgcG9pbnRzIHRoZSBzZXJ2aWNlIHRvIGl0cyBhcHByb3ByaWF0ZSBzZXJ2ZXJcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRoaXMuYXV0aC5pbml0aWFsaXplKHtcbiAgICAgKiAgYXBpOmVudmlyb25tZW50LmFwaSxcbiAgICAgKiAgYXBpS2V5OiBlbnZpcm9ubWVudC5hcGlLZXksXG4gICAgICogIHJlZ2lzdHJhdGlvblRhYmxlOiAndGVhY2hlcnMnLCAvLyBjYW4gYmUgdW5kZWZpbmVkIGxvZ2luXG4gICAgICogIGxvZ2luVGFibGU6IFsndGVhY2hlcnMnLCAnYWRtaW5pc3RyYXRvcnMnLCAnc3R1ZGVudHMnXVxuICAgICAqICByZWRpcmVjdDp7XG4gICAgICogICAgJ3N0dWRlbnRzJzogJy9zdHVkZW50JyxcbiAgICAgKiAgICAndGVhY2hlcnMnOiAnL3RlYWNoZXInLFxuICAgICAqICAgICdhZG1pbmlzdHJhdG9ycyc6ICcvYWRtaW4nLFxuICAgICAqICAgfVxuICAgICAqIH0pXG4gICAgICogXG4gICAqKi9cbiAgaW5pdGlhbGl6ZShjb25maWc6QXV0aENvbmZpZyl7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgaWYodGhpcy5jb25maWcuYXV0aE1lc3NhZ2VzID09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLmNvbmZpZy5hdXRoTWVzc2FnZXMgPSB7fTtcbiAgICB9XG4gICAgdGhpcy5hdXRoRm9ybSA9IHt9O1xuICAgIGNvbnN0IHJvbGUgPSB0aGlzLmFjY291bnRMb2dnZWRJbigpO1xuICAgIGlmKHJvbGUhPW51bGwpe1xuICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMuY29uZmlnPy5yZWRpcmVjdFtyb2xlXV0pO1xuICAgIH1cbiAgfVxuXG4gIHZhbGlkYXRlSW5wdXRGaWVsZHMoKTpib29sZWFue1xuICAgIHZhciBoYXNFcnJvcnMgPSBmYWxzZTtcbiAgICBmb3IoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMuYXV0aEZvcm0pKXtcbiAgICAgIGNvbnN0IHsgdmFsdWUsIHZhbGlkYXRvciwgcmVxdWlyZWQgfSA9IHRoaXMuYXV0aEZvcm1ba2V5XTtcbiAgICAgIGlmKHJlcXVpcmVkICYmIHZhbHVlLnRyaW0oKSA9PScnKXtcbiAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQhJztcbiAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICAgICAgLy8gY2hlY2sgaWYgdmFsaWRhdG9yIGlzIG5vdCBjdXN0b21cbiAgICAgICAgICBpZih0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXSA9PSBudWxsKXtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gIG5ldyBSZWdFeHAodmFsaWRhdG9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSByZWdleC50ZXN0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGlmKCFpc1ZhbGlkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gYCR7a2V5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsga2V5LnNsaWNlKDEpfSBpcyBub3QgYSB2YWxpZCBpbnB1dC5gO1xuICAgICAgICAgICAgICAgICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ0N1c3RvbSB2YWxpZGF0b3Igc2hvdWxkIGJlIG9uIHJlZ2V4Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLnBhdHRlcm4pO1xuICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSByZWdleC50ZXN0KHZhbHVlKTtcbiAgICAgICAgICBcblxuICAgICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0ubWVzc2FnZTtcbiAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICB9XG4gICAgcmV0dXJuICFoYXNFcnJvcnM7XG4gIH1cblxuICBjbGVhckZvcm0oKXtcbiAgICBmb3IoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMuYXV0aEZvcm0pKXtcbiAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLnZhbHVlID0gJyc7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbiAgXG4gIC8qKlxuICAgICAqIENoZWNrIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuICAgICAqIFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9sZSA9IHRoaXMuYXV0aC5hY2NvdW50TG9nZ2VkSW4oKVxuICAgICAqIFxuICAgICAqIE9VVFBVVDogcm9sZSBvZiB1c2VyIGlmIGF1dGhlbnRpY2F0ZWQsIG51bGwgaWYgdW5hdXRoZW50aWNhdGVkXG4gICAqKi9cbiAgYWNjb3VudExvZ2dlZEluKCkge1xuICAgIHJldHVybiB0aGlzLnVzZWRTdG9yYWdlLmdldEl0ZW0oJ2xvZ2dlZF9pbicpO1xuICB9XG5cbiAgbG9nb3V0KCkge1xuICAgIGlmICghdGhpcy5hY2NvdW50TG9nZ2VkSW4oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVzZWRTdG9yYWdlLmNsZWFyKCk7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICd0eXBlJzonc3VjY2VzcycsXG4gICAgICAnbWVzc2FnZSc6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLmxvZ2dlZE91dCA/PyAnQWNjb3VudCBoYXMgYmVlbiBsb2dnZWQgb3V0LicsXG4gICAgfVxuICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnLyddKTtcbiAgfVxuXG5cbiAgZ2V0QXV0aEZpZWxkKGtleTpzdHJpbmcpe1xuICAgIHJldHVybiB0aGlzLmF1dGhGb3JtW2tleV07XG4gIH1cbiAgXG4gIGluaXRpYWxpemVGb3JtRmllbGQoa2V5OnN0cmluZywgcmVxdWlyZWQ6Ym9vbGVhbiAsIHVuaXF1ZTpib29sZWFuLCB0eXBlOnN0cmluZywgYWxpYXNlcz86c3RyaW5nW10sIGVuY3J5cHRlZD86Ym9vbGVhbix2YWxpZGF0b3I/OnN0cmluZyl7XG4gICAgdGhpcy5hdXRoRm9ybVtrZXldPSB7dmFsdWU6JycsIHZhbGlkYXRvcjp2YWxpZGF0b3IsIHJlcXVpcmVkOnJlcXVpcmVkLCB0eXBlOnR5cGUsIGFsaWFzZXM6YWxpYXNlcyxlbmNyeXB0ZWQ6ZW5jcnlwdGVkLHVuaXF1ZTp1bmlxdWV9O1xuICB9XG5cbiAgaGFuZGxlRm9ybVZhbHVlKGtleTpzdHJpbmcsIHZhbHVlOnN0cmluZyl7XG4gICAgdGhpcy5hdXRoRm9ybVtrZXldLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBpc0xvY2FsU3RvcmFnZSgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0b3JhZ2UnKTtcbiAgICByZXR1cm4gc3RvcmFnZSA9PSAnbG9jYWwnO1xuICAgIFxuICB9XG5cbiAgZ2V0U2F2ZWRFbWFpbCgpIHtcbiAgICBjb25zdCBlbWFpbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZW1lbWJlcicpO1xuICAgIHJldHVybiBlbWFpbDtcbiAgfVxuXG4gIHVzZUxvY2FsU3RvcmFnZSgpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RvcmFnZScsICdsb2NhbCcpO1xuICB9XG5cbiAgdXNlU2Vzc2lvblN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnc2Vzc2lvbicpO1xuICB9XG5cbiAgcG9zdChtZXRob2Q6IHN0cmluZywgYm9keToge30pIHtcbiAgICBpZih0aGlzLmNvbmZpZyA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgZm9yICh2YXIgW2tleSwgb2JqXSBvZiBPYmplY3QuZW50cmllczxhbnk+KGJvZHkpKSB7XG4gICAgICBpZiAoa2V5ID09ICd2YWx1ZXMnKSB7XG4gICAgICAgIGZvciAodmFyIFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICBvYmpbZmllbGRdID0gdmFsdWUgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApO1xuICB9XG4gIGFzeW5jIGhhc2goZW5jcnlwdDpzdHJpbmcpe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZpcnN0VmFsdWVGcm9tKHRoaXMucG9zdCgnZ2V0X2hhc2gnLCB7ZW5jcnlwdDogZW5jcnlwdH0pKVxuICAgIGlmKHJlc3BvbnNlLnN1Y2Nlc3Mpe1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm91dHB1dDtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrRHVwbGljYXRlcyh0YWJsZXM6c3RyaW5nW10sIHZhbHVlczp7W2tleTpzdHJpbmddOnN0cmluZ30pe1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmlyc3RWYWx1ZUZyb20odGhpcy5wb3N0KCdjaGVja19kdXBsaWNhdGVzJyx7J3RhYmxlcyc6IHRhYmxlcywgJ3ZhbHVlcyc6dmFsdWVzfSkpXG4gICAgaWYocmVzcG9uc2Uuc3VjY2Vzcyl7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub3V0cHV0O1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cblxuXG4gIGFzeW5jIHJlZ2lzdGVyKCkge1xuICAgIGlmKHRoaXMubG9hZGluZyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKHRoaXMuY29uZmlnPy5yZWdpc3RyYXRpb25UYWJsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ1JlZ2lzdHJhdGlvbiB0YWJsZSBtdXN0IGJlIGluaXRpYWxpemVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLnZhbGlkYXRlSW5wdXRGaWVsZHMoKSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgJ3R5cGUnOiduZXV0cmFsJyxcbiAgICAgICdtZXNzYWdlJzonTG9hZGluZy4uLicsXG4gICAgICBpc0luZmluaXRlOnRydWUsXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgZHVwbGljYXRlc1xuICAgIGNvbnN0IG5ld0RhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygpO1xuICAgIHZhciB2aXNJRDtcbiAgICBpZih0aGlzLmNvbmZpZz8udmlzaWJsZUlEKXtcbiAgICAgIHZpc0lEID0gYCR7dGhpcy5jb25maWcudmlzaWJsZUlEfS1gICsgbmV3RGF0ZS5zdWJzdHJpbmcoNCwgNykgKyAnLScgKyBuZXdEYXRlLnN1YnN0cmluZyg3LCAxMyk7XG4gICAgfVxuICAgIGNvbnN0IGF1dGhGaWVsZHMgPSBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKTtcblxuICAgIHZhciB2YWx1ZXM6YW55ID17fTtcblxuICAgIGZvcihsZXQgZmllbGQgb2YgYXV0aEZpZWxkcyl7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLmF1dGhGb3JtW2ZpZWxkXS52YWx1ZTtcbiAgICAgIGlmKHRoaXMuYXV0aEZvcm1bZmllbGRdLmVuY3J5cHRlZCl7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBhd2FpdCB0aGlzLmhhc2godmFsdWUpO1xuICAgICAgICBpZihoYXNoKXtcbiAgICAgICAgICB2YWx1ZSA9IGhhc2hcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdTb21ldGhpbmcgd2VudCB3cm9uZywgdHJ5IGFnYWluIGxhdGVyLi4uJyxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZih0aGlzLmF1dGhGb3JtW2ZpZWxkXS51bmlxdWUpe1xuICAgICAgICBjb25zdCBoYXNEdXBsaWNhdGUgPSBhd2FpdCB0aGlzLmNoZWNrRHVwbGljYXRlcyh0aGlzLmNvbmZpZy5sb2dpblRhYmxlLCB7W2ZpZWxkXTogdGhpcy5hdXRoRm9ybVtmaWVsZF0udmFsdWV9KVxuICAgICAgICBpZihoYXNEdXBsaWNhdGUgIT0gbnVsbCl7XG4gICAgICAgICAgaWYoaGFzRHVwbGljYXRlKXtcbiAgICAgICAgICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYCR7ZmllbGQudG9VcHBlckNhc2UoKX0gYWxyZWFkeSBleGlzdHMuYCxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nLCB0cnkgYWdhaW4gbGF0ZXIuLi4nLFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICAgXG4gICAgICB2YWx1ZXNbZmllbGRdID12YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgcG9zdE9iamVjdCA9IFxuICAgICAgIE9iamVjdC5hc3NpZ24odmlzSUQgIT0gbnVsbCA/IHt2aXNpYmxlaWQ6dmlzSUR9Ont9LCB0aGlzLmNvbmZpZy52ZXJpZmljYXRpb24gPyB7dmVyaWZpZWQ6ZmFsc2V9Ont9LCB7YWNjb3VudFR5cGU6IHRoaXMuY29uZmlnLnJlZ2lzdHJhdGlvblRhYmxlfSxcbiAgICAgICAgdmFsdWVzXG4gICAgICAgKTsgXG4gICAgICAgXG4gICAgdGhpcy5wb3N0KCdyZWdpc3RlcicsIFxuICAgICAge2RhdGE6SlNPTi5zdHJpbmdpZnkocG9zdE9iamVjdCl9LFxuICAgICkuc3Vic2NyaWJlKChkYXRhOmFueSk9PntcbiAgICAgIHRoaXMubG9hZGluZyA9ZmFsc2U7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICBpZihkYXRhLnN1Y2Nlc3Mpe1xuICAgICAgICAvLyBzaG93IHByb3BlciBzbmFja2JhclxuICAgICAgICBpZih0aGlzLmNvbmZpZz8udmVyaWZpY2F0aW9uKXtcbiAgICAgICAgICAvLyB3YWl0IGZvciB2ZXJpZmljYXRpb25cbiAgICAgICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpZz8uYXV0aE1lc3NhZ2VzIS5mb3JWZXJpZmljYXRpb24gPz8gJ1BsZWFzZSB3YWl0IGZvciBhY2NvdW50IHZlcmlmaWNhdGlvbi4uLidcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNleyAgXG4gICAgICAgICAgLy8gc3VjY2Vzc2Z1bGx5IHJlZ2lzdGVyZWQhYFxuICAgICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnPy5hdXRoTWVzc2FnZXMhLnJlZ2lzdGVyZWQgPz8gJ1JlZ2lzdHJhdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgeW91IG1heSBub3cgbG9naW4gd2l0aCB5b3VyIGNyZWRlbnRpYWxzJ1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNsZWFyRm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYWxlcnQoZGF0YS5vdXRwdXQpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVNuYWNrYmFyKCl7XG4gICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gdW5kZWZpbmVkO1xuICB9XG4gIFxuICBsb2dpbigpIHtcbiAgICBpZih0aGlzLmxvYWRpbmcpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbmZpZz8ubG9naW5UYWJsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgYWxlcnQoJ0xvZ2luIHRhYmxlIG11c3QgYmUgaW5pdGlhbGl6ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNoZWNrIGlmIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBmaWVsZHMgYXJlIHByZXNlbnRcbiAgICBpZih0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ109PW51bGwgfHwgdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXSA9PSBudWxsKXtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgaW5pdGlhbGl6ZSBpZGVudGlmaWVyIGFuZCBwYXNzd29yZCBmaWVsZHMgdXNpbmcgW25hbWVdPVwiZmllbGRcIicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzID09IHVuZGVmaW5lZCB8fCB0aGlzLmF1dGhGb3JtWydpZGVudGlmaWVyJ10uYWxpYXNlcy5sZW5ndGggPD0wKXtcbiAgICAgIGFsZXJ0KFwiSWRlbnRpZmllciBmaWVsZCBtdXN0IGJlIGluaXRpYWxpemVkIHdpdGggYWxpYXNlcz1bYWxpYXNlc11cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIXRoaXMudmFsaWRhdGVJbnB1dEZpZWxkcygpKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB7XG4gICAgICAndHlwZSc6J25ldXRyYWwnLFxuICAgICAgJ21lc3NhZ2UnOidMb2FkaW5nLi4uJyxcbiAgICAgIGlzSW5maW5pdGU6dHJ1ZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucG9zdCgnbG9naW4nLCB7XG4gICAgICBpZGVudGlmaWVyVmFsdWU6IHRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS52YWx1ZSxcbiAgICAgIHBhc3N3b3JkOiB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddLnZhbHVlLFxuICAgICAgdGFibGVzOiB0aGlzLmNvbmZpZy5sb2dpblRhYmxlLFxuICAgICAgaWRlbnRpZmllclR5cGVzOnRoaXMuYXV0aEZvcm1bJ2lkZW50aWZpZXInXS5hbGlhc2VzXG4gICAgfSkuc3Vic2NyaWJlKChkYXRhOmFueSkgPT4ge1xuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNuYWNrYmFyRmVlZGJhY2sgPSBkYXRhLnN1Y2Nlc3MgPyB7XG4gICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgbWVzc2FnZTogdGhpcy5jb25maWc/LmF1dGhNZXNzYWdlcyEubG9nZ2VkSW4gPz8gJ0xvZ2luIFN1Y2Nlc3NmdWwhJ1xuICAgICAgfSA6IHtcbiAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgbWVzc2FnZTpkYXRhLm91dHB1dFxuICAgICAgfTtcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGRhdGEub3V0cHV0O1xuICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgJ2xvZ2dlZF9pbicsXG4gICAgICAgICAgdXNlci5yb2xlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMudXNlZFN0b3JhZ2Uuc2V0SXRlbSgndXNlcl9pbmZvJywgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWc/LnJlZGlyZWN0W3VzZXIucm9sZV1dKTtcbiAgICAgIH1lbHNle1xuXG4gICAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIG1lc3NhZ2U6IGRhdGEub3V0cHV0XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfVxufVxuIl19