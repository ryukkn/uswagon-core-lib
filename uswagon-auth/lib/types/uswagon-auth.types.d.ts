export interface AuthRedirect {
    [role: string]: string;
}
export interface AuthMessages {
    loggedIn?: string;
    loggedOut?: string;
    registered?: string;
    forVerification?: string;
}
export interface SnackbarFeedback {
    type: 'success' | 'error' | 'neutral';
    isInfinite?: boolean;
    message: string;
}
export interface AuthFormField {
    value: any;
    required: boolean;
    unique: boolean;
    type: string;
    error?: string;
    validator?: string;
    encrypted?: boolean;
    aliases?: string[];
}
export interface AuthForm {
    [key: string]: AuthFormField;
}
export interface AuthConfig {
    api: string;
    apiKey: string;
    verification?: boolean;
    loginTable?: string[];
    registrationTable?: string;
    redirect: AuthRedirect;
    visibleID?: string;
    authMessages?: AuthMessages;
}
interface AuthValidatorConfig {
    pattern: string;
    message: string;
}
export interface AuthValidator {
    [key: string]: AuthValidatorConfig;
}
export {};
