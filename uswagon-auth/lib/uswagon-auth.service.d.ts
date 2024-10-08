import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthConfig, SnackbarFeedback } from './types/uswagon-auth.types';
import * as i0 from "@angular/core";
export declare class UswagonAuthService {
    private http;
    private router;
    snackbarFeedback?: SnackbarFeedback;
    loading: boolean;
    private usedStorage;
    private config;
    private authForm;
    private emailNotification;
    private timeout;
    private validators;
    constructor(http: HttpClient, router: Router);
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
    initialize(config: AuthConfig): void;
    validateInputFields(): boolean;
    clearForm(): void;
    /**
       * Check if user is authenticated
       *
       * @example
       * const role = this.auth.accountLoggedIn()
       *
       * OUTPUT: role of user if authenticated, null if unauthenticated
     **/
    accountLoggedIn(): string | null;
    logout(): void;
    getAuthField(key: string): import("./types/uswagon-auth.types").AuthFormField;
    initializeFormField(key: string, required: boolean, unique: boolean, type: string, aliases?: string[], encrypted?: boolean, validator?: string): void;
    handleFormValue(key: string, value: string): void;
    isLocalStorage(): boolean;
    getSavedEmail(): string | null;
    useLocalStorage(): void;
    useSessionStorage(): void;
    post(method: string, body: {}): import("rxjs").Observable<any>;
    hash(encrypt: string): Promise<any>;
    checkDuplicates(tables: string[], values: {
        [key: string]: string;
    }): Promise<any>;
    register(): Promise<void>;
    closeSnackbar(): void;
    login(): import("rxjs").Subscription | undefined;
    getUser(): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<UswagonAuthService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UswagonAuthService>;
}
