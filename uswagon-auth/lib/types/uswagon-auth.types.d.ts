export interface AuthRedirect {
    [role: string]: string;
}
export interface AuthFormField {
    value: any;
    required: boolean;
    type: string;
    error?: string;
    validator?: string;
}
export interface AuthForm {
    [key: string]: AuthFormField;
}
export interface AuthConfig {
    api: string;
    apiKey: string;
    usertable: string[];
    redirect: AuthRedirect;
}
interface AuthValidatorConfig {
    pattern: string;
    message: string;
}
export interface AuthValidator {
    [key: string]: AuthValidatorConfig;
}
export {};
