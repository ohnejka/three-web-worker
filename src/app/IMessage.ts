import { Handlers } from './Handlers';

export interface IMessage {
  type: Handlers;
  data: any;
}

export interface ISize {
  type: Handlers;
  width: number;
  height: number;
}

