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
    initId: string;
    _: {} | undefined;

    constructor(subClass: SubClasses, args: Array<any>) {
        this.initId = rnd() + '-' + subClass;

        this.worker = new WebWorker();
        this.handlers = new Map();

        // Listen for any messages back from the worker
        this.worker.onmessage = (event: any) => {
            const data = event.data as MessageData;
            const handler = this.handlers.get(data.id);
            const that = this;

            if (handler) {
                if (data.type === 'response') {
                    handler.res(data.message);
                }
                if (data.type === 'error') {
                    const error = data.error || new Error(`Unknown error with ${this.subClass}`);
                    handler.rej(error);
                }
                if (data.type === 'init_response') {
                    this._ = Object.keys(data.message)
                        .map(key => {
                            const isFn = typeof data.message[key as any];
                            const subFunction = function () {
                                return isFn ?
                                    (that.exec(key) as any)(...arguments) :
                                    that.get(key);
                            };
                            return [key, subFunction];
                        })
                        .reduce((a, c) => ({ ...a, ...{ [c[0] as string]: c[1] } }), {});
                    handler.res(this._);
                }
            }
        };

        // Tell the worker to create the class
        this.worker.postMessage({
            type: 'init',
            id: this.initId,
            command: subClass,
            message: args
        } as MessageData);
    }

    onLoad() {
        return new Promise((res) => {
            (this._ === undefined) ?
                this.handlers.set(this.initId, { 'res': res, 'rej': res }) :
                res(this._);
        })
    }

    exec(command: string) {
        const that = this;
        return function (): Promise<any> {
            return new Promise((res, rej) => {
                const id = rnd() + '-' + command;
                that.handlers.set(id, { 'res': res, 'rej': rej });

                // Tell the worker to run the command
                that.worker.postMessage({
                    type: 'exec',
                    id: id,
                    command: command,
                    message: [...arguments]
                } as MessageData);
            })
        };
    }

    get(command: string): Promise<any> {
        return new Promise((res, rej) => {
            const id = rnd() + '-' + command;
            this.handlers.set(id, { 'res': res, 'rej': rej });

            // Tell the worker to run the command
            this.worker.postMessage({
                type: 'get',
                id: id,
                command: command,
                message: []
            } as MessageData);
        })
    }
};