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
        alert();
        // check if username and password fields are present
        if (this.authForm['username'] == null || this.authForm['password'] == null) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQVMzQyxNQUFNLE9BQU8sa0JBQWtCO0lBa0M3QixZQUNVLElBQWdCLEVBQ2hCLE1BQWM7UUFEZCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFsQ2hCLGdCQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUVwRSxZQUFPLEdBQVcsS0FBSyxDQUFDO1FBQ3hCLHFCQUFnQixHQUFVLEVBQUUsQ0FBQztRQUM3QixhQUFRLEdBQVksRUFBRSxDQUFDO1FBQ3ZCLGVBQVUsR0FBaUI7WUFDakMsS0FBSyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxxREFBcUQ7Z0JBQzlELE9BQU8sRUFBRSxxQkFBcUI7YUFDL0I7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLDBFQUEwRTtnQkFDbkYsT0FBTyxFQUFFLDhHQUE4RzthQUMxSDtZQUNELEtBQUssRUFBRTtnQkFDSCxPQUFPLEVBQUUsOERBQThEO2dCQUN2RSxPQUFPLEVBQUUseUNBQXlDO2FBQ3JEO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxxQkFBcUI7Z0JBQzlCLE9BQU8sRUFBRSxpRkFBaUY7YUFDM0Y7WUFDRCxVQUFVLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLG9JQUFvSTtnQkFDN0ksT0FBTyxFQUFFLDZCQUE2QjthQUN6QztZQUNELFVBQVUsRUFBRTtnQkFDVixPQUFP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QUMsT0FBTyxDQUN0QixXQUFXLEVBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQ25DLENBQUM7Z0JBQ0YsSUFBSSxPQUFPLEdBQUUsU0FBUyxDQUFDO2dCQUN2QixRQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFO29CQUNuRCxLQUFLLENBQUM7d0JBQ0osT0FBTyxHQUFHLFNBQVMsQ0FBQzt3QkFDcEIsTUFBTTtvQkFDUixLQUFLLENBQUM7d0JBQ0osT0FBTyxHQUFHLFNBQVMsQ0FBQzt3QkFDcEIsTUFBTTtvQkFDUixLQUFLLENBQUM7d0JBQ0osT0FBTyxHQUFHLE9BQU8sQ0FBQzt3QkFDbEIsTUFBTTtpQkFDVDtnQkFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4RDtRQUNILENBQUMsQ0FBQyxDQUFDO0lBRUwsQ0FBQzs7Z0hBeExVLGtCQUFrQjtvSEFBbEIsa0JBQWtCLGNBRmpCLE1BQU07NEZBRVAsa0JBQWtCO2tCQUg5QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7ICBBdXRoQ29uZmlnLCBBdXRoRm9ybSwgQXV0aFZhbGlkYXRvciB9IGZyb20gJy4vdHlwZXMvdXN3YWdvbi1hdXRoLnR5cGVzJztcblxuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFVzd2Fnb25BdXRoU2VydmljZSB7XG5cbiAgcHJpdmF0ZSB1c2VkU3RvcmFnZSA9IHRoaXMuaXNMb2NhbFN0b3JhZ2UoKSA/IGxvY2FsU3RvcmFnZSA6IHNlc3Npb25TdG9yYWdlO1xuICBwcml2YXRlIGNvbmZpZzpBdXRoQ29uZmlnfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBsb2FkaW5nOmJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBzbmFja2JhckZlZWRiYWNrOnN0cmluZyA9ICcnO1xuICBwcml2YXRlIGF1dGhGb3JtOkF1dGhGb3JtID0ge307XG4gIHByaXZhdGUgdmFsaWRhdG9yczpBdXRoVmFsaWRhdG9yID0ge1xuICAgIGVtYWlsOiB7XG4gICAgICBwYXR0ZXJuOiAnXltcXFxcdy0uXStAW1xcXFx3LV0rXFxcXC5bYS16QS1aXXsyLH0oWy5dW2EtekEtWl17Mix9KSokJyxcbiAgICAgIG1lc3NhZ2U6ICdFbWFpbCBpcyBub3QgdmFsaWQuJ1xuICAgIH0sXG4gICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgcGF0dGVybjogJ14oPz0uKlthLXpdKSg/PS4qW0EtWl0pKD89LipcXFxcZCkoPz0uKlshQCMkJV4mKl0pW0EtWmEtelxcXFxkIUAjJCVeJipdezgsfSQnLFxuICAgICAgICBtZXNzYWdlOiAnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMgbG9uZyBhbmQgaW5jbHVkZSB1cHBlcmNhc2UsIGxvd2VyY2FzZSwgbnVtYmVyLCBhbmQgc3BlY2lhbCBjaGFyYWN0ZXIuJ1xuICAgIH0sXG4gICAgcGhvbmU6IHtcbiAgICAgICAgcGF0dGVybjogJ14oXFxcXCtcXFxcZHsxLDN9XFxcXHM/KT9cXFxcKD9cXFxcZHszfVxcXFwpP1stXFxcXHNdP1xcXFxkezN9Wy1cXFxcc10/XFxcXGR7NH0kJyxcbiAgICAgICAgbWVzc2FnZTogJ1Bob25lIG51bWJlciBtdXN0IGJlIGluIGEgdmFsaWQgZm9ybWF0LidcbiAgICB9LFxuICAgIHVzZXJuYW1lOiB7XG4gICAgICBwYXR0ZXJuOiAnXlthLXpBLVowLTldezMsMTV9JCcsXG4gICAgICBtZXNzYWdlOiAnVXNlcm5hbWUgbXVzdCBiZSAzLTE1IGNoYXJhY3RlcnMgbG9uZyBhbmQgY2FuIG9ubHkgY29udGFpbiBsZXR0ZXJzIGFuZCBudW1iZXJzLidcbiAgICB9LFxuICAgIGNyZWRpdENhcmQ6IHtcbiAgICAgICAgcGF0dGVybjogJ14oPzo0WzAtOV17MTJ9KD86WzAtOV17M30pP3w1WzEtNV1bMC05XXsxNH18Nig/OjAxMXw1WzAtOV17Mn0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXw3WzAtOV17MTV9KSQnLFxuICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBjcmVkaXQgY2FyZCBudW1iZXIuJ1xuICAgIH0sXG4gICAgcG9zdGFsQ29kZToge1xuICAgICAgcGF0dGVybjogJ15cXFxcZHs1fSgtXFxcXGR7NH0pPyQnLFxuICAgICAgbWVzc2FnZTogJ1Bvc3RhbCBjb2RlIG11c3QgYmUgaW4gdGhlIGZvcm1hdCAxMjM0NSBvciAxMjM0NS02Nzg5LidcbiAgfSxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgKSB7IH1cblxuICBpbml0aWFsaXplKGNvbmZpZzpBdXRoQ29uZmlnKXtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmF1dGhGb3JtID0ge307XG4gIH1cblxuICB2YWxpZGF0ZUlucHV0RmllbGRzKCl7XG4gICAgZm9yKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0aGlzLmF1dGhGb3JtKSl7XG4gICAgICBjb25zdCB7IHZhbHVlLCB2YWxpZGF0b3IsIHJlcXVpcmVkIH0gPSB0aGlzLmF1dGhGb3JtW2tleV07XG4gICAgICBpZihyZXF1aXJlZCAmJiB2YWx1ZS50cmltKCkgPT0nJyl7XG4gICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkISc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIC8vIGNoZWNrIGlmIHZhbGlkYXRvciBpcyBub3QgY3VzdG9tXG4gICAgICAgICAgaWYodGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9ICBuZXcgUmVnRXhwKHZhbGlkYXRvcik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICBpZighaXNWYWxpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IGAke2tleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zbGljZSgxKX0gaXMgbm90IGEgdmFsaWQgaW5wdXQuYDtcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIHZhbGlkYXRvciBzaG91bGQgYmUgb24gcmVnZXgnKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLnBhdHRlcm4pO1xuICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSByZWdleC50ZXN0KHZhbHVlKTtcbiAgICAgICAgICBcblxuICAgICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdGhpcy52YWxpZGF0b3JzW3ZhbGlkYXRvcl0ubWVzc2FnZTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgfVxuXG4gIGdldEF1dGhGaWVsZChrZXk6c3RyaW5nKXtcbiAgICByZXR1cm4gdGhpcy5hdXRoRm9ybVtrZXldO1xuICB9XG4gIFxuICBpbml0aWFsaXplRm9ybUZpZWxkKGtleTpzdHJpbmcsIHJlcXVpcmVkOmJvb2xlYW4gLCB0eXBlOnN0cmluZyAsdmFsaWRhdG9yPzpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XT0ge3ZhbHVlOicnLCB2YWxpZGF0b3I6dmFsaWRhdG9yLCByZXF1aXJlZDpyZXF1aXJlZCwgdHlwZTp0eXBlfTtcbiAgfVxuXG4gIGhhbmRsZUZvcm1WYWx1ZShrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmcpe1xuICAgIHRoaXMuYXV0aEZvcm1ba2V5XS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgaXNMb2NhbFN0b3JhZ2UoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdG9yYWdlJyk7XG4gICAgcmV0dXJuIHN0b3JhZ2UgPT0gJ2xvY2FsJztcbiAgICBcbiAgfVxuXG4gIGdldFNhdmVkRW1haWwoKSB7XG4gICAgY29uc3QgZW1haWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmVtZW1iZXInKTtcbiAgICByZXR1cm4gZW1haWw7XG4gIH1cblxuICB1c2VMb2NhbFN0b3JhZ2UoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0b3JhZ2UnLCAnbG9jYWwnKTtcbiAgfVxuXG4gIHVzZVNlc3Npb25TdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ3Nlc3Npb24nKTtcbiAgfVxuXG4gIHBvc3QobWV0aG9kOiBzdHJpbmcsIGJvZHk6IHt9KSB7XG4gICAgaWYodGhpcy5jb25maWcgPT0gdW5kZWZpbmVkKXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlnIG11c3QgYmUgaW5pdGlhbGl6ZWQsIHRyeSBzZXJ2aWNlLmluaXRpYWxpemUoY29uZmlnKScpO1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBvYmpdIG9mIE9iamVjdC5lbnRyaWVzPGFueT4oYm9keSkpIHtcbiAgICAgIGlmIChrZXkgPT0gJ3ZhbHVlcycpIHtcbiAgICAgICAgZm9yICh2YXIgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgIG9ialtmaWVsZF0gPSB2YWx1ZSA/PyAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHtcbiAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSk7XG4gICAgY29uc3Qgc2FsdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxhbnk+KFxuICAgICAgdGhpcy5jb25maWc/LmFwaSArICc/JyArIHNhbHQsXG4gICAgICBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBUElfS0VZOiB0aGlzLmNvbmZpZz8uYXBpS2V5LFxuICAgICAgICAgICAgTWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5XG4gICAgICAgIClcbiAgICAgICksXG4gICAgICB7IGhlYWRlcnMgfVxuICAgICk7XG4gIH1cblxuXG4gIGxvZ2luKCkge1xuICAgIGFsZXJ0KClcbiAgICAvLyBjaGVjayBpZiB1c2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIGFyZSBwcmVzZW50XG4gICAgaWYodGhpcy5hdXRoRm9ybVsndXNlcm5hbWUnXT09bnVsbCB8fCB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddID09IG51bGwpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgaW5pdGlhbGl6ZSB1c2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIHVzaW5nIFtuYW1lXT1cImZpZWxkXCInKVxuICAgIH1cbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLnBvc3QoJ2xvZ2luJywge1xuICAgICAgVXNlcm5hbWU6IHRoaXMuYXV0aEZvcm1bJ3VzZXJuYW1lJ10udmFsdWUsXG4gICAgICBQYXNzd29yZDogdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXS52YWx1ZSxcbiAgICB9KS5zdWJzY3JpYmUoKGRhdGE6YW55KSA9PiB7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IGRhdGEuc3VjY2VzcyA/ICdMb2dpbiBTdWNjZXNzZnVsIScgOiBkYXRhLm91dHB1dDtcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgICdsb2dnZWRfaW4nLFxuICAgICAgICAgIGRhdGEub3V0cHV0LmFjY291bnRUeXBlLnRvU3RyaW5nKClcbiAgICAgICAgKTtcbiAgICAgICAgdmFyIGFjY291bnQgPSdzdHVkZW50JztcbiAgICAgICAgc3dpdGNoKHBhcnNlSW50KGRhdGEub3V0cHV0LmFjY291bnRUeXBlLnRvU3RyaW5nKCkpKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYWNjb3VudCA9ICdzdHVkZW50JztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGFjY291bnQgPSAndGVhY2hlcic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBhY2NvdW50ID0gJ2FkbWluJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXIgPSBkYXRhLm91dHB1dDtcbiAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKCd1c2VyX2luZm8nLCBKU09OLnN0cmluZ2lmeSh1c2VyKSk7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3RbYWNjb3VudF1dKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG59XG4iXX0=