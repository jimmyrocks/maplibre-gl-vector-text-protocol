import type { SubClasses } from './worker';
export declare class Actor {
    subClass: any;
    worker: Worker;
    handlers: Map<string, {
        'res': (value: any) => void;
        'rej': (value: Error) => void;
    }>;
    constructor(subClass: SubClasses, args: Array<any>);
    exec(command: string, args?: Array<any>): Promise<any>;
}
