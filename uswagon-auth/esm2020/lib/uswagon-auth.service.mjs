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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXN3YWdvbi1hdXRoLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy91c3dhZ29uLWF1dGgvc3JjL2xpYi91c3dhZ29uLWF1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQVMzQyxNQUFNLE9BQU8sa0JBQWtCO0lBa0M3QixZQUNVLElBQWdCLEVBQ2hCLE1BQWM7UUFEZCxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFsQ2hCLGdCQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUVwRSxZQUFPLEdBQVcsS0FBSyxDQUFDO1FBQ3hCLHFCQUFnQixHQUFVLEVBQUUsQ0FBQztRQUM3QixhQUFRLEdBQVksRUFBRSxDQUFDO1FBQ3ZCLGVBQVUsR0FBaUI7WUFDakMsS0FBSyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxxREFBcUQ7Z0JBQzlELE9BQU8sRUFBRSxxQkFBcUI7YUFDL0I7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLDBFQUEwRTtnQkFDbkYsT0FBTyxFQUFFLDhHQUE4RzthQUMxSDtZQUNELEtBQUssRUFBRTtnQkFDSCxPQUFPLEVBQUUsOERBQThEO2dCQUN2RSxPQUFPLEVBQUUseUNBQXlDO2FBQ3JEO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxxQkFBcUI7Z0JBQzlCLE9BQU8sRUFBRSxpRkFBaUY7YUFDM0Y7WUFDRCxVQUFVLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLG9JQUFvSTtnQkFDN0ksT0FBTyxFQUFFLDZCQUE2QjthQUN6QztZQUNELFVBQVUsRUFBRTtnQkFDVixPQUFP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QUNYLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUNuQyxDQUFDO2dCQUNGLElBQUksT0FBTyxHQUFFLFNBQVMsQ0FBQztnQkFDdkIsUUFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTtvQkFDbkQsS0FBSyxDQUFDO3dCQUNKLE9BQU8sR0FBRyxTQUFTLENBQUM7d0JBQ3BCLE1BQU07b0JBQ1IsS0FBSyxDQUFDO3dCQUNKLE9BQU8sR0FBRyxTQUFTLENBQUM7d0JBQ3BCLE1BQU07b0JBQ1IsS0FBSyxDQUFDO3dCQUNKLE9BQU8sR0FBRyxPQUFPLENBQUM7d0JBQ2xCLE1BQU07aUJBQ1Q7Z0JBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEQ7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7O2dIQXZMVSxrQkFBa0I7b0hBQWxCLGtCQUFrQixjQUZqQixNQUFNOzRGQUVQLGtCQUFrQjtrQkFIOUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyAgQXV0aENvbmZpZywgQXV0aEZvcm0sIEF1dGhWYWxpZGF0b3IgfSBmcm9tICcuL3R5cGVzL3Vzd2Fnb24tYXV0aC50eXBlcyc7XG5cblxuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBVc3dhZ29uQXV0aFNlcnZpY2Uge1xuXG4gIHByaXZhdGUgdXNlZFN0b3JhZ2UgPSB0aGlzLmlzTG9jYWxTdG9yYWdlKCkgPyBsb2NhbFN0b3JhZ2UgOiBzZXNzaW9uU3RvcmFnZTtcbiAgcHJpdmF0ZSBjb25maWc6QXV0aENvbmZpZ3x1bmRlZmluZWQ7XG4gIHByaXZhdGUgbG9hZGluZzpib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgc25hY2tiYXJGZWVkYmFjazpzdHJpbmcgPSAnJztcbiAgcHJpdmF0ZSBhdXRoRm9ybTpBdXRoRm9ybSA9IHt9O1xuICBwcml2YXRlIHZhbGlkYXRvcnM6QXV0aFZhbGlkYXRvciA9IHtcbiAgICBlbWFpbDoge1xuICAgICAgcGF0dGVybjogJ15bXFxcXHctLl0rQFtcXFxcdy1dK1xcXFwuW2EtekEtWl17Mix9KFsuXVthLXpBLVpdezIsfSkqJCcsXG4gICAgICBtZXNzYWdlOiAnRW1haWwgaXMgbm90IHZhbGlkLidcbiAgICB9LFxuICAgIHBhc3N3b3JkOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKD89LipbYS16XSkoPz0uKltBLVpdKSg/PS4qXFxcXGQpKD89LipbIUAjJCVeJipdKVtBLVphLXpcXFxcZCFAIyQlXiYqXXs4LH0kJyxcbiAgICAgICAgbWVzc2FnZTogJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcgYW5kIGluY2x1ZGUgdXBwZXJjYXNlLCBsb3dlcmNhc2UsIG51bWJlciwgYW5kIHNwZWNpYWwgY2hhcmFjdGVyLidcbiAgICB9LFxuICAgIHBob25lOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKFxcXFwrXFxcXGR7MSwzfVxcXFxzPyk/XFxcXCg/XFxcXGR7M31cXFxcKT9bLVxcXFxzXT9cXFxcZHszfVstXFxcXHNdP1xcXFxkezR9JCcsXG4gICAgICAgIG1lc3NhZ2U6ICdQaG9uZSBudW1iZXIgbXVzdCBiZSBpbiBhIHZhbGlkIGZvcm1hdC4nXG4gICAgfSxcbiAgICB1c2VybmFtZToge1xuICAgICAgcGF0dGVybjogJ15bYS16QS1aMC05XXszLDE1fSQnLFxuICAgICAgbWVzc2FnZTogJ1VzZXJuYW1lIG11c3QgYmUgMy0xNSBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNhbiBvbmx5IGNvbnRhaW4gbGV0dGVycyBhbmQgbnVtYmVycy4nXG4gICAgfSxcbiAgICBjcmVkaXRDYXJkOiB7XG4gICAgICAgIHBhdHRlcm46ICdeKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldezJ9KVswLTldezEyfXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18N1swLTldezE1fSkkJyxcbiAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgY3JlZGl0IGNhcmQgbnVtYmVyLidcbiAgICB9LFxuICAgIHBvc3RhbENvZGU6IHtcbiAgICAgIHBhdHRlcm46ICdeXFxcXGR7NX0oLVxcXFxkezR9KT8kJyxcbiAgICAgIG1lc3NhZ2U6ICdQb3N0YWwgY29kZSBtdXN0IGJlIGluIHRoZSBmb3JtYXQgMTIzNDUgb3IgMTIzNDUtNjc4OS4nXG4gIH0sXG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICkgeyB9XG5cbiAgaW5pdGlhbGl6ZShjb25maWc6QXV0aENvbmZpZyl7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5hdXRoRm9ybSA9IHt9O1xuICB9XG5cbiAgdmFsaWRhdGVJbnB1dEZpZWxkcygpe1xuICAgIGZvcihjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModGhpcy5hdXRoRm9ybSkpe1xuICAgICAgY29uc3QgeyB2YWx1ZSwgdmFsaWRhdG9yLCByZXF1aXJlZCB9ID0gdGhpcy5hdXRoRm9ybVtrZXldO1xuICAgICAgaWYocmVxdWlyZWQgJiYgdmFsdWUudHJpbSgpID09Jycpe1xuICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCEnO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgICAgICAvLyBjaGVjayBpZiB2YWxpZGF0b3IgaXMgbm90IGN1c3RvbVxuICAgICAgICAgIGlmKHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdID09IG51bGwpe1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSAgbmV3IFJlZ0V4cCh2YWxpZGF0b3IpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IHJlZ2V4LnRlc3QodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgaWYoIWlzVmFsaWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSBgJHtrZXkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBrZXkuc2xpY2UoMSl9IGlzIG5vdCBhIHZhbGlkIGlucHV0LmA7XG4gICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSB2YWxpZGF0b3Igc2hvdWxkIGJlIG9uIHJlZ2V4JylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnZhbGlkYXRvcnNbdmFsaWRhdG9yXS5wYXR0ZXJuKTtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcmVnZXgudGVzdCh2YWx1ZSk7XG4gICAgICAgICAgXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aEZvcm1ba2V5XS5lcnJvciA9IHRoaXMudmFsaWRhdG9yc1t2YWxpZGF0b3JdLm1lc3NhZ2U7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmF1dGhGb3JtW2tleV0uZXJyb3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRoRm9ybVtrZXldLmVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICB9XG4gIH1cblxuICBnZXRBdXRoRmllbGQoa2V5OnN0cmluZyl7XG4gICAgcmV0dXJuIHRoaXMuYXV0aEZvcm1ba2V5XTtcbiAgfVxuICBcbiAgaW5pdGlhbGl6ZUZvcm1GaWVsZChrZXk6c3RyaW5nLCByZXF1aXJlZDpib29sZWFuICwgdHlwZTpzdHJpbmcgLHZhbGlkYXRvcj86c3RyaW5nKXtcbiAgICB0aGlzLmF1dGhGb3JtW2tleV09IHt2YWx1ZTonJywgdmFsaWRhdG9yOnZhbGlkYXRvciwgcmVxdWlyZWQ6cmVxdWlyZWQsIHR5cGU6dHlwZX07XG4gIH1cblxuICBoYW5kbGVGb3JtVmFsdWUoa2V5OnN0cmluZywgdmFsdWU6c3RyaW5nKXtcbiAgICB0aGlzLmF1dGhGb3JtW2tleV0udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGlzTG9jYWxTdG9yYWdlKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RvcmFnZScpO1xuICAgIHJldHVybiBzdG9yYWdlID09ICdsb2NhbCc7XG4gICAgXG4gIH1cblxuICBnZXRTYXZlZEVtYWlsKCkge1xuICAgIGNvbnN0IGVtYWlsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JlbWVtYmVyJyk7XG4gICAgcmV0dXJuIGVtYWlsO1xuICB9XG5cbiAgdXNlTG9jYWxTdG9yYWdlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yYWdlJywgJ2xvY2FsJyk7XG4gIH1cblxuICB1c2VTZXNzaW9uU3RvcmFnZSgpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RvcmFnZScsICdzZXNzaW9uJyk7XG4gIH1cblxuICBwb3N0KG1ldGhvZDogc3RyaW5nLCBib2R5OiB7fSkge1xuICAgIGlmKHRoaXMuY29uZmlnID09IHVuZGVmaW5lZCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmZpZyBtdXN0IGJlIGluaXRpYWxpemVkLCB0cnkgc2VydmljZS5pbml0aWFsaXplKGNvbmZpZyknKTtcbiAgICB9XG4gICAgZm9yICh2YXIgW2tleSwgb2JqXSBvZiBPYmplY3QuZW50cmllczxhbnk+KGJvZHkpKSB7XG4gICAgICBpZiAoa2V5ID09ICd2YWx1ZXMnKSB7XG4gICAgICAgIGZvciAodmFyIFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICBvYmpbZmllbGRdID0gdmFsdWUgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICAgIGNvbnN0IHNhbHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8YW55PihcbiAgICAgIHRoaXMuY29uZmlnPy5hcGkgKyAnPycgKyBzYWx0LFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge1xuICAgICAgICAgICAgQVBJX0tFWTogdGhpcy5jb25maWc/LmFwaUtleSxcbiAgICAgICAgICAgIE1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgeyBoZWFkZXJzIH1cbiAgICApO1xuICB9XG5cblxuICBsb2dpbigpIHtcbiAgICAvLyBjaGVjayBpZiB1c2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIGFyZSBwcmVzZW50XG4gICAgaWYodGhpcy5hdXRoRm9ybVsndXNlcm5hbWUnXT09bnVsbCB8fCB0aGlzLmF1dGhGb3JtWydwYXNzd29yZCddID09IG51bGwpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgaW5pdGlhbGl6ZSB1c2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIHVzaW5nIFtuYW1lXT1cImZpZWxkXCInKVxuICAgIH1cbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLnBvc3QoJ2xvZ2luJywge1xuICAgICAgVXNlcm5hbWU6IHRoaXMuYXV0aEZvcm1bJ3VzZXJuYW1lJ10udmFsdWUsXG4gICAgICBQYXNzd29yZDogdGhpcy5hdXRoRm9ybVsncGFzc3dvcmQnXS52YWx1ZSxcbiAgICB9KS5zdWJzY3JpYmUoKGRhdGE6YW55KSA9PiB7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuc25hY2tiYXJGZWVkYmFjayA9IGRhdGEuc3VjY2VzcyA/ICdMb2dpbiBTdWNjZXNzZnVsIScgOiBkYXRhLm91dHB1dDtcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgICdsb2dnZWRfaW4nLFxuICAgICAgICAgIGRhdGEub3V0cHV0LmFjY291bnRUeXBlLnRvU3RyaW5nKClcbiAgICAgICAgKTtcbiAgICAgICAgdmFyIGFjY291bnQgPSdzdHVkZW50JztcbiAgICAgICAgc3dpdGNoKHBhcnNlSW50KGRhdGEub3V0cHV0LmFjY291bnRUeXBlLnRvU3RyaW5nKCkpKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYWNjb3VudCA9ICdzdHVkZW50JztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGFjY291bnQgPSAndGVhY2hlcic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBhY2NvdW50ID0gJ2FkbWluJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXIgPSBkYXRhLm91dHB1dDtcbiAgICAgICAgdGhpcy51c2VkU3RvcmFnZS5zZXRJdGVtKCd1c2VyX2luZm8nLCBKU09OLnN0cmluZ2lmeSh1c2VyKSk7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZz8ucmVkaXJlY3RbYWNjb3VudF1dKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG59XG4iXX0=