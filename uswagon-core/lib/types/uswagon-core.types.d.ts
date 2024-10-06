export interface CoreConfig {
    api: string;
    nodeserver: string;
    socket: string;
    server: string;
    apiKey: string;
}
export interface SnackbarCoreFeedback {
    type: 'success' | 'error' | 'neutral' | 'warning';
    message: string;
}
export interface CoreForm {
    [key: string]: string;
}
export interface CoreCreateObject {
    tables: string;
    values: {
        [key: string]: any;
    };
}
export interface CoreReadObject {
    tables: string;
    selectors: string[];
    conditions: string;
}
export interface CoreUpdateObject {
    tables: string;
    values: {
        [key: string]: any;
    };
    conditions: string;
}
export interface CoreDeleteObject {
    tables: string;
    conditions: string;
}
export interface CoreResponse {
    success: boolean;
    output: any;
}
