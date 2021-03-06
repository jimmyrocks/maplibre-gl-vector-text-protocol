export interface MessageData {
    'type': 'response' | 'error' | 'init' | 'exec' | 'get' | 'init_response';
    'id': string;
    'message': Array<any>;
    'error'?: Error;
    'command': string;
}
declare const subClasses: readonly ["Converter"];
export declare type SubClasses = typeof subClasses[number];
export {};
