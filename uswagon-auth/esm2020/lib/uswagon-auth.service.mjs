import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/router";
export class UswagonAuthService {
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
                            if (!isValid) {
                                this.authForm[key].error = `${key.charAt(0).toUpperCase() + key.slice(1)} is not a valid input.`;
                            }
                            else {
                                this.authForm[key].error = undefined;
                            }
                            return;
                        }
                        catch {
                            console.error('Custom validator should be on regex');
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
        if (this.config == undefined) {
            console.error('Config must be initialized, try service.initialize(config)');
            throw new Error('Config must be initialized, try service.initialize(config)');
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
    login() {
        // check if username and password fields are present
        if (this.authForm['username'] == null || this.authForm['password'] == null) {
            console.error('Please initialize username and password fields using [name]="field"');
            throw new Error('Please initialize username and password fields using [name]="field"');
        }
        this.loading = true;
        return this.post('login', {
            Username: this.authForm['username'].value,
            Password: this.authForm['password'].value,
        }).subscribe((data) => {
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
                this.router.navigate([this.config?.redirect[account]]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQVMzQyxNQUFNLE9BQU8sa0JBQWtCO0lBa0M3QixZQUNVLElBQWdCLEVBQ2hCLE1BQWM7UUFEZCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFsQ2hCLGdCQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUVwRSxZQUFPLEdBQVcsS0FBSyxDQUFDO1FBQ3hCLHFCQUFnQixHQUFVLEVBQUUsQ0FBQztRQUM3QixhQUFRLEdBQVksRUFBRSxDQUFDO1FBQ3ZCLGVBQVUsR0FBaUI7WUFDakMsS0FBSyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxxREFBcUQ7Z0JBQzlELE9BQU8sRUFBRSxxQkFBcUI7YUFDL0I7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLDBFQUEwRTtnQkFDbkYsT0FBTyxFQUFFLDhHQUE4RzthQUMxSDtZQUNELEtBQUssRUFBRTtnQkFDSCxPQUFPLEVBQUUsOERBQThEO2dCQUN2RSxPQUFPLEVBQUUseUNBQXlDO2FBQ3JEO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxxQkFBcUI7Z0JBQzlCLE9BQU8sRUFBRSxpRkFBaUY7YUFDM0Y7WUFDRCxVQUFVLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLG9JQUFvSTtnQkFDN0ksT0FBTyxFQUFFLDZCQUE2QjthQUN6QztZQUNELFVBQVUsRUFBRTtnQkFDVixPQUFP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QUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3pFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQ3RCLFdBQVcsRUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FDbkMsQ0FBQztnQkFDRixJQUFJLE9BQU8sR0FBRSxTQUFTLENBQUM7Z0JBQ3ZCLFFBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7b0JBQ25ELEtBQUssQ0FBQzt3QkFDSixPQUFPLEdBQUcsU0FBUyxDQUFDO3dCQUNwQixNQUFNO29CQUNSLEtBQUssQ0FBQzt3QkFDSixPQUFPLEdBQUcsU0FBUyxDQUFDO3dCQUNwQixNQUFNO29CQUNSLEtBQUssQ0FBQzt3QkFDSixPQUFPLEdBQUcsT0FBTyxDQUFDO3dCQUNsQixNQUFNO2lCQUNUO2dCQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hEO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFTCxDQUFDOztnSEExTFUsa0JBQWtCO29IQUFsQixrQkFBa0IsY0FGakIsTUFBTTs0RkFFUCxrQkFBa0I7a0JBSDlCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgIEF1dGhDb25maWcsIEF1dGhGb3JtLCBBdXRoVmFsaWRhdG9yIH0gZnJvbSAnLi90eXBlcy91c3dhZ29uLWF1dGgudHlwZXMnO1xuXG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgVXN3YWdvbkF1dGhTZXJ2aWNlIHtcblxuICBwcml2YXRlIHVzZWRTdG9yYWdlID0gdGhpcy5pc0xvY2FsU3RvcmFnZSgpID8gbG9jYWxTdG9yYWdlIDogc2Vzc2lvblN0b3JhZ2U7XG4gIHByaXZhdGUgY29uZmlnOkF1dGhDb25maWd8dW5kZWZpbmVkO1xuICBwcml2YXRlIGxvYWRpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIHNuYWNrYmFyRmVlZGJhY2s6c3RyaW5nID0gJyc7XG4gIHByaXZhdGUgYXV0aEZvcm06QXV0aEZvcm0gPSB7fTtcbiAgcHJpdmF0ZSB2YWxpZGF0b3JzOkF1dGhWYWxpZGF0b3IgPSB7XG4gICAgZW1haWw6IHtcbiAgICAgIHBhdHRlcm46ICdeW1xcXFx3LS5dK0BbXFxcXHctXStcXFxcLlthLXpBLVpdezIsfShbLl1bYS16QS1aXXsyLH0pKiQnLFxuICAgICAgbWVzc2FnZTogJ0VtYWlsIGlzIG5vdCB2YWxpZC4nXG4gICAgfSxcbiAgICBwYXNzd29yZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/PS4qW2Etel0pKD89LipbQS1aXSkoPz0uKlxcXFxkKSg/PS4qWyFAIyQlXiYqXSlbQS1aYS16XFxcXGQhQCMkJV4mKl17OCx9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nIGFuZCBpbmNsdWRlIHVwcGVyY2FzZSwgbG93ZXJjYXNlLCBudW1iZXIsIGFuZCBzcGVjaWFsIGNoYXJhY3Rlci4nXG4gICAgfSxcbiAgICBwaG9uZToge1xuICAgICAgICBwYXR0ZXJuOiAnXihcXFxcK1xcXFxkezEsM31cXFxccz8pP1xcXFwoP1xcXFxkezN9XFxcXCk/Wy1cXFxcc10/XFxcXGR7M31bLVxcXFxzXT9cXFxcZHs0fSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGhvbmUgbnVtYmVyIG11c3QgYmUgaW4gYSB2YWxpZCBmb3JtYXQuJ1xuICAgIH0sXG4gICAgdXNlcm5hbWU6IHtcbiAgICAgIHBhdHRlcm46ICdeW2EtekEtWjAtOV17MywxNX0kJyxcbiAgICAgIG1lc3NhZ2U6ICdVc2VybmFtZSBtdXN0IGJlIDMtMTUgY2hhcmFjdGVycyBsb25nIGFuZCBjYW4gb25seSBjb250YWluIGxldHRlcnMgYW5kIG51bWJlcnMuJ1xuICAgIH0sXG4gICAgY3JlZGl0Q2FyZDoge1xuICAgICAgICBwYXR0ZXJuOiAnXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XXsyfSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fDdbMC05XXsxNX0pJCcsXG4gICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGNyZWRpdCBjYXJkIG51bWJlci4nXG4gICAgfSxcbiAgICBwb3N0YWxDb2RlOiB7XG4gICAgICBwYXR0ZXJuOiAnXlxcXFxkezV9KC1cXFxcZHs0fSk/JCcsXG4gICAgICBtZXNzYWdlOiAnUG9zdGFsIGNvZGUgbXVzdCBiZSBpbiB0aGUgZm9ybWF0IDEyMzQ1IG9yIDEyMzQ1LTY3ODkuJ1xuICB9LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICApIHsgfVxuXG4gIGluaXRpYWxpemUoY29uZmlnOkF1dGhDb25maWcpe1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuYXV0aEZvcm0gPSB7fTtcbiAgfVxuXG4gIHZhbGlkYXRlSW5wdXRGaWVsZHMoKXtcbiAgICBmb3IoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRoaXMuYXV0aEZvcm0pKXtcbiAgICAgIGNvbnN0IHsgdmFsdWUsIHZhbGlkYXRvciwgcmVxdWlyZWQgfSA9IHRoaXMuYXV0aEZvcm1ba2V5XTtcbiAgICAgIGlmKHJlcXVpcmVkICYmIHZhbHVlLnRyaW0oKSA9PScnKXtcbiAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQhJztcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICAgICAgLy8gY2hlY2sgaWYgdmFsaWRhdG9yIGlzIG5vdCBjdXN0b21cbiAgICAgICAgICBpZih0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXSA9PSBudWxsKXtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gIG5ldyBSZWdFeHAodmFsaWRhdG9yKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSByZWdleC50ZXN0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGlmKCFpc1ZhbGlkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gYCR7a2V5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsga2V5LnNsaWNlKDEpfSBpcyBub3QgYSB2YWxpZCBpbnB1dC5gO1xuICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ3VzdG9tIHZhbGlkYXRvciBzaG91bGQgYmUgb24gcmVnZXgnKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSB2YWxpZGF0b3Igc2hvdWxkIGJlIG9uIHJlZ2V4JylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5wYXR0ZXJuKTtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLm1lc3NhZ2U7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICB9XG4gIH1cblxuICBnZXRBdXRoRmllbGQoa2V5OnN0cmluZyl7XG4gICAgcmV0dXJuIHRoaXMuYXV0aEZvcm1ba2V5XTtcbiAgfVxuICBcbiAgaW5pdGlhbGl6ZUZvcm1GaWVsZChrZXk6c3RyaW5nLCByZXF1aXJlZDpib29sZWFuICwgdHlwZTpzdHJpbmcgLHZhbGlkYXRvcj86c3RyaW5nKXtcbiAgICB0aGlzLmF1dGhGb3JtW2tleV09IHt2YWx1ZTonJywgdmFsaWRhdG9yOnZhbGlkYXRvciwgcmVxdWlyZWQ6cmVxdWlyZWQsIHR5cGU6dHlwZX07XG4gIH1cblxuICBoYW5kbGVGb3JtVmFsdWUoa2V5OnN0cmluZywgdmFsdWU6c3RyaW5nKXtcbiAgICB0aGlzLmF1dGhGb3JtW2tleV0udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGlzTG9jYWxTdG9yYWdlKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RvcmFnZScpO1xuICAgIHJldHVybiBzdG9yYWdlID09ICdsb2NhbCc7XG4gICAgXG4gIH1cblxuICBnZXRTYXZlZEVtYWlsKCkge1xuICAgIGNvbnN0IGVtYWlsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JlbWVtYmVyJyk7XG4gICAgcmV0dXJuIGVtYWlsO1xuICB9XG5cbiAgdXNlTG9jYWxTdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ2xvY2FsJyk7XG4gIH1cblxuICB1c2VTZXNzaW9uU3RvcmFnZSgpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RvcmFnZScsICdzZXNzaW9uJyk7XG4gIH1cblxuICBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICBjb25zb2xlLmVycm9yKCdDb25maWcgbXVzdCBiZSBpbml0aWFsaXplZCwgdHJ5IHNlcnZpY2UuaW5pdGlhbGl6ZShjb25maWcpJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgZm9yICh2YXIgW2tleSwgb2JqXSBvZiBPYmplY3QuZW50cmllczxhbnk+KGJvZHkpKSB7XG4gICAgICBpZiAoa2V5ID09ICd2YWx1ZXMnKSB7XG4gICAgICAgIGZvciAodmFyIFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICBvYmpbZmllbGRdID0gdmFsdWUgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApO1xuICB9XG5cblxuICBsb2dpbigpIHtcbiAgICAvLyBjaGVjayBpZiB1c2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIGFyZSBwcmVzZW50XG4gICAgaWYodGhpcy5hdXRoRm9ybVsndXNlcm5hbWUnXT09bnVsbCB8fCB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddID09IG51bGwpe1xuICAgICAgY29uc29sZS5lcnJvcignUGxlYXNlIGluaXRpYWxpemUgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIGZpZWxkcyB1c2luZyBbbmFtZV09XCJmaWVsZFwiJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBpbml0aWFsaXplIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBmaWVsZHMgdXNpbmcgW25hbWVdPVwiZmllbGRcIicpXG4gICAgfVxuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMucG9zdCgnbG9naW4nLCB7XG4gICAgICBVc2VybmFtZTogdGhpcy5hdXRoRm9ybVsndXNlcm5hbWUnXS52YWx1ZSxcbiAgICAgIFBhc3N3b3JkOiB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddLnZhbHVlLFxuICAgIH0pLnN1YnNjcmliZSgoZGF0YTphbnkpID0+IHtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5zbmFja2JhckZlZWRiYWNrID0gZGF0YS5zdWNjZXNzID8gJ0xvZ2luIFN1Y2Nlc3NmdWwhJyA6IGRhdGEub3V0cHV0O1xuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgICAgJ2xvZ2dlZF9pbicsXG4gICAgICAgICAgZGF0YS5vdXRwdXQuYWNjb3VudFR5cGUudG9TdHJpbmcoKVxuICAgICAgICApO1xuICAgICAgICB2YXIgYWNjb3VudCA9J3N0dWRlbnQnO1xuICAgICAgICBzd2l0Y2gocGFyc2VJbnQoZGF0YS5vdXRwdXQuYWNjb3VudFR5cGUudG9TdHJpbmcoKSkpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBhY2NvdW50ID0gJ3N0dWRlbnQnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgYWNjb3VudCA9ICd0ZWFjaGVyJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGFjY291bnQgPSAnYWRtaW4nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlciA9IGRhdGEub3V0cHV0O1xuICAgICAgICB0aGlzLnVzZWRTdG9yYWdlLnNldEl0ZW0oJ3VzZXJfaW5mbycsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMuY29uZmlnPy5yZWRpcmVjdFthY2NvdW50XV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH1cbn1cbiJdfQ==