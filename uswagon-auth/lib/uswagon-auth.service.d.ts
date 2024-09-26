import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthConfig } from './types/uswagon-auth.types';
import * as i0 from "@angular/core";
export declare class UswagonAuthService {
    private http;
    private router;
    private usedStorage;
    private config;
    private loading;
    private snackbarFeedback;
    private authForm;
    private validators;
    constructor(http: HttpClient, router: Router);
    initialize(config: AuthConfig): void;
    validateInputFields(): void;
    getAuthField(key: string): import("./types/uswagon-auth.types").AuthFormField;
    initializeFormField(key: string, required: boolean, type: string, validator?: string): void;
    handleFormValue(key: string, value: string): void;
    isLocalStorage(): boolean;
    getSavedEmail(): string | null;
    useLocalStorage(): void;
    useSessionStorage(): void;
    post(method: string, body: {}): import("rxjs").Observable<any>;
    login(): import("rxjs").Subscription;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UswagonAuthService>;
}
