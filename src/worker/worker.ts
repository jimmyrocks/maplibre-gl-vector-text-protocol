import { Converter } from '../converter';

export interface MessageData {
  'type': 'response' | 'error' | 'init' | 'exec' | 'get' | 'init_response',
  'id': string,
  'message': Array<any>,
  'error'?: Error,
  'command': string
}

const subClasses = ['Converter'] as const
export type SubClasses = typeof subClasses[number];
const libraries: { [_: string]: any } = {
  'Converter': Converter
};

let subClass: any;

self.addEventListener('message', e => {
  const data = (e.data || e) as MessageData;

  const post = (id: string, err: Error | undefined, res?: any, type?: string) => {
    postMessage({
      type: type ? type : (err ? 'error' : 'response'),
      id: id,
      message: res,
      error: err
    } as MessageData)
  }

  const commands = {
    'init': (msg: MessageData) => {
      const { id, command, message } = msg;
      subClass = new libraries[command](message[0], message[1]);
      post(id, undefined, undefined, 'init_response')
    },
    'get': function (msg: MessageData) {
      const { id, command } = msg;
      if (subClass && subClass[command]) {
        post(id, undefined, subClass[command]);
      } else {
        post(id, undefined, undefined);
      }
    },
    'exec': function (msg: MessageData) {
      const { id, command, message } = msg;

      if (subClass && subClass[command] && typeof subClass[command] === 'function') {
        const cmd = (subClass[command] as () => Promise<any>)
          .apply(subClass, message as []);

        if (!!cmd && typeof cmd.then === 'function') {
          // It's a promise, so wait for it
          cmd
            .then(res => post(id, undefined, res))
            .catch(e => post(id, e));
        } else {
          // Not a promise, just return it
          post(id, undefined, cmd);
        }
      } else {
        // Error
        console.log(id, command, message, process);
        post(id, new Error(`command "${command}" not found`));
      }
    }
  };

  if (commands[data.type as 'init' | 'exec' | 'get']) {
    commands[data.type as 'init' | 'exec' | 'get'](data)
  }
});
