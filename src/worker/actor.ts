import WebWorker from 'web-worker:./worker';

const rnd = () => Math.random().toString(36).substring(2);

import type { MessageData, SubClasses } from './worker';

export class Actor {
    subClass: any;
    worker: Worker;
    handlers: Map<string, {
        'res': (value: any) => void,
        'rej': (value: Error) => void
    }>;

    constructor(subClass: SubClasses, args: Array<any>) {
        const id = rnd();
        this.worker = new WebWorker();
        this.handlers = new Map();

        // Tell the worker to create the class
        this.worker.postMessage({
            type: 'init',
            id: id,
            command: subClass,
            message: args
        } as MessageData);

        // Listen for any messages back from the worker
        this.worker.onmessage = (event: any) => {
            const data = event.data as MessageData;
            const handler = this.handlers.get(data.id);
            if (handler) {
                if (data.type === 'response') {
                    handler.res(data.message);
                }
                if (data.type === 'error') {
                    const error = data.error || new Error(`Unknown error with $this.subClass`);
                    handler.rej(error);
                }
            }
        };
    }

    exec(command: string, args: Array<any> = []): Promise<any> {
        return new Promise((res, rej) => {
            const id = rnd() + '-' + command;
            this.handlers.set(id, {'res': res, 'rej': rej });

            // Tell the worker to run the command
            this.worker.postMessage({
                type: 'exec',
                id: id,
                command: command,
                message: args
            } as MessageData);
        })
    }
};