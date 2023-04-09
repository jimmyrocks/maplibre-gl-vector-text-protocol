import type { SubClasses } from './worker';
export declare class Actor {
    subClass: any;
    worker: Worker;
    handlers: Map<string, {
        'resolve': (value: any) => void;
        'reject': (value: Error) => void;
    }>;
    initId: string;
    _: Record<string, Function> | undefined;
    /**
     * Creates a new instance of the `Actor` class.
     * @param subClass - The name of the subclass.
     * @param args - The arguments to pass to the subclass constructor.
     */
    constructor(subClass: SubClasses, args: Array<any>);
    /**
     * Waits for the initialization of the object to complete and returns the resulting object.
     * @returns A promise that resolves with the initialized object.
     */
    onLoad(): Promise<any>;
    /**
     * returns a Promise for a given command that will be executed in a worker.
     * @param command - The command to execute.
     * @returns A Promise that resolves with the result of the command execution or rejects with an error.
     */
    exec(command: string): (...args: any[]) => Promise<any>;
    /**
     * Returns a Promise that resolves with the result of a command sent to a Web Worker.
     * @param command - The command to send to the Web Worker.
     * @returns A Promise that resolves with the result of the command.
     */
    get(command: string): Promise<any>;
}
