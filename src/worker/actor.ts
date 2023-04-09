import WebWorker from 'web-worker:./worker';

const randomString = () => Math.random().toString(36).substring(2);

import type { MessageData, SubClasses } from './worker';

export class Actor {
    subClass: any;
    worker: Worker;
    handlers: Map<string, {
        'resolve': (value: any) => void,
        'reject': (value: Error) => void
    }>;
    initId: string;
    _: Record<string, Function> | undefined;

    /**
     * Creates a new instance of the `Actor` class.
     * @param subClass - The name of the subclass.
     * @param args - The arguments to pass to the subclass constructor.
     */
    constructor(subClass: SubClasses, args: Array<any>) {
        // Generate a random initialization ID
        this.initId = randomString() + '-' + subClass;

        // Create a new Web Worker and a new Map for handlers
        this.worker = new WebWorker();
        this.handlers = new Map();

        // Listen for messages from the worker
        this.worker.onmessage = (event: any) => {
            const data = event.data as MessageData;
            const handler = this.handlers.get(data.id);
            const that = this;

            if (handler) {
                // Handle responses from the worker
                if (data.type === 'response') {
                    handler.resolve(data.message);
                }
                // Handle errors from the worker
                if (data.type === 'error') {
                    const error = data.error || new Error(`Unknown error with ${subClass}`);
                    handler.reject(error);
                }
                // Handle initialization responses from the worker
                if (data.type === 'init_response') {
                    this._ = Object.keys(data.message)
                        .map(key => {
                            const isFn = typeof data.message[key as any] === 'function';
                            const subFunction = function () {
                                return isFn ? (that.exec(key))(...arguments) : that.get(key);
                            };
                            return [key, subFunction];
                        })
                        .reduce((a, c) => ({ ...a, ...{ [c[0] as string]: c[1] } }), {});
                    handler.resolve(this._);
                }
            }
        };

        // Tell the worker to initialize the subclass
        this.worker.postMessage({
            type: 'init',
            id: this.initId,
            command: subClass,
            message: args
        } as MessageData);
    }

    /**
     * Waits for the initialization of the object to complete and returns the resulting object.
     * @returns A promise that resolves with the initialized object.
     */
    onLoad(): Promise<any> {
        return new Promise((resolve) => {
            // If initialization is still in progress, add a new handler for the initialization result
            if (this._ === undefined) {
                this.handlers.set(this.initId, { resolve, 'reject': resolve });
            } else {
                // Otherwise, immediately resolve the promise with the initialized object
                resolve(this._);
            }
        });
    }


    /**
     * returns a Promise for a given command that will be executed in a worker.
     * @param command - The command to execute.
     * @returns A Promise that resolves with the result of the command execution or rejects with an error.
     */
    exec(command: string): (...args: any[]) => Promise<any> {
        // Keep track of this class
        const that = this;

        // Return a function that returns a Promise
        return function (...args: any[]): Promise<any> {
            return new Promise((resolve, reject) => {
                const id = randomString() + '-' + command;

                // Set up the resolve and reject handlers for the Promise
                that.handlers.set(id, { resolve, reject });

                // Tell the worker to run the command with the provided arguments
                that.worker.postMessage({
                    type: 'exec',
                    id: id,
                    command: command,
                    message: [...args]
                } as MessageData);
            });
        };
    }

    /**
     * Returns a Promise that resolves with the result of a command sent to a Web Worker.
     * @param command - The command to send to the Web Worker.
     * @returns A Promise that resolves with the result of the command.
     */
    get(command: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // Generate a unique ID for this request
            const id = randomString() + '-' + command;

            // Store the resolve and reject functions for later use
            this.handlers.set(id, { resolve, reject });

            // Send the command to the worker
            this.worker.postMessage({
                type: 'get',
                id,
                command,
                message: [],
            } as MessageData);
        });
    }
};