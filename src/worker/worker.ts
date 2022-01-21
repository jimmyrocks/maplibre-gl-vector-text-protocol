import { Converter } from '../converter';

export interface MessageData {
  'type': 'response' | 'error' | 'init' | 'exec',
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

let process: any;

self.addEventListener('message', e => {
  const data = (e.data || e) as MessageData;

  // {type: 'init', args: 'This instance was created in a worker'}
  const commands = {
    'init': (msg: MessageData) => {
      process = new libraries[msg.command](msg.message[0], msg.message[1]);
    },
    'exec': function (msg: MessageData) {
      const { id, command, message } = msg;

      if (process && process[command]) {
        (process[command] as () => Promise<any>)
          .apply(process, message as [])
          // SUCCESS
          .then(res => postMessage({
            type: 'response',
            id: id,
            message: res
          } as MessageData))
          // Error
          .catch(e => postMessage({
            type: 'error',
            id: id,
            error: e as Error
          } as MessageData));
      } else {
        // Error
        console.log(id, command, message, process);
        postMessage({
          type: 'error',
          id: id,
          error: new Error(`command "${command}" not found`)
        });
      }
    }
  };

  if (commands[data.type as 'init' | 'exec']) {
    commands[data.type as 'init' | 'exec'](data)
  }

});
