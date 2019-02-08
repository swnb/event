import { Throttle } from '../utils/throttle';

export type Callback = (arg?: any) => void;
type SpaceType = symbol | number | string;
type Register = Map<symbol, Callback>;
type EventType = string | symbol;
type EventMap = Map<EventType, Register>;
type Throttlers = Map<EventType, Throttle>;

export interface InterfaceEventCenter {
  space: (namespace: SpaceType) => InterfaceEventCenter;
  on: (event: EventType, fn: Callback) => () => boolean;
  throttleOn: (event: EventType, time: number, fn: Callback) => () => boolean;
  emit: (event: EventType, ...arg: any) => InterfaceEventCenter;
  throttleEmit: (event: EventType, time: number, ...arg: any) => InterfaceEventCenter;
  emitTimeout: (event: EventType, time: number, ...arg: any) => () => void;
  once: (event: EventType, fn: Callback) => () => boolean;
  onceOnly: (events: EventType[], fn: Callback) => () => void;
  clear: (event?: EventType) => void;
  listEventNames: () => EventType[];
  listenerCount: (even: EventType) => number;
}

const defaultSpace = Symbol();

export class Event implements InterfaceEventCenter {
  public static create = () => new Event();
  // choose space with space name
  public static space = (namespace: SpaceType = defaultSpace) => {
    const instances = Event.instances;
    let instance: InterfaceEventCenter;
    if (!instances.has(namespace)) {
      instance = Event.create();
      instances.set(namespace, instance);
    } else {
      instance = instances.get(namespace) as InterfaceEventCenter;
    }
    return instance;
  };
  private static instances: Map<SpaceType, InterfaceEventCenter> = new Map();

  private eventMap: EventMap = new Map();

  private throttlers: Throttlers = new Map();

  // redirect namespace when instance is create
  public space = (namespace?: SpaceType) => Event.space(namespace);

  public on = (event: EventType, fn: Callback) => {
    const register = this.getRegister(event);
    const key = Symbol();
    register.set(key, fn);
    return () => register.delete(key);
  };

  public throttleOn = (event: EventType, time: number, fn: Callback) => {
    const register = this.getRegister(event);
    const key = Symbol();
    const throttler = Throttle.create(time);
    register.set(key, (...arg: any) => {
      if (throttler.realse) {
        fn(...arg);
      }
    });
    return () => register.delete(key);
  };

  public once = (event: EventType, fn: Callback) => {
    const register = this.getRegister(event);
    const key = Symbol();
    const rmRegister = () => register.delete(key);
    register.set(key, (...arg: any) => {
      rmRegister();
      fn(...arg);
    });
    return rmRegister;
  };

  public onceOnly = (events: EventType[], fn: Callback) => {
    const rmList = events.map(event => {
      const register = this.getRegister(event);
      const key = Symbol();
      const cb = (...arg: any) => {
        rmList.forEach(rm => rm());
        fn(...arg);
      };
      register.set(key, cb);
      return () => register.delete(key);
    });
    return () => void rmList.forEach(rm => rm());
  };

  public emit = (event: EventType, ...arg: any) => {
    const register = this.getRegister(event);
    if (register.size === 0) {
      return this;
    }

    register.forEach(fn => void fn(...arg));
    return this;
  };

  public throttleEmit = (event: EventType, time: number, ...arg: any) => {
    const register = this.getRegister(event);
    const throttle = this.getThrottler(event, time);
    if (throttle.realse) {
      register.forEach(fn => void fn(...arg));
    }
    return this;
  };

  public emitTimeout = (event: EventType, time: number, ...arg: any) => {
    const register = this.getRegister(event);
    if (register.size === 0) {
      return () => void 0;
    }

    const timeID = setTimeout(() => void register.forEach(fn => void fn(...arg)), time);
    return () => clearTimeout(timeID);
  };

  public listEventNames = () => Array.from(this.eventMap.keys());

  public listenerCount = (event: EventType) => this.getRegister(event).size;

  public clear = (event?: EventType) => {
    if (event) {
      this.getRegister(event).clear();
    } else {
      this.eventMap.clear();
    }
  };

  private getRegister(event: EventType): Register {
    let register: Register;
    if (this.eventMap.has(event)) {
      register = this.eventMap.get(event) as Register;
    } else {
      register = new Map();
      this.eventMap.set(event, register);
    }
    return register;
  }

  private getThrottler(event: EventType, time: number): Throttle {
    let throttle: Throttle;
    if (this.throttlers.has(event)) {
      throttle = this.throttlers.get(event) as Throttle;
    } else {
      throttle = Throttle.create(time);
      this.throttlers.set(event, throttle);
    }
    return throttle;
  }
}
