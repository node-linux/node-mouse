import EventEmitter from 'events';

export type Events = { [key: string]: any };

export default class IO<EventMap extends Events> {

    on: <T extends keyof EventMap>(event: T, callback: EventMap[T]) => IO<EventMap>;
    once: <T extends keyof EventMap>(event: T, callback: EventMap[T]) => IO<EventMap>;

    off: () => void;

    constructor(emit: { emit: <T extends keyof EventMap>(name: T, data: EventMap[T]) => void }) {
        const emitter = new EventEmitter();

        emit.emit = <T extends keyof EventMap>(name: T, data: EventMap[T]) => ['string', 'symbol'].includes(typeof name) ? emitter.emit(name as string | symbol, data) : null;

        this.on = function <T extends keyof EventMap>(this: IO<EventMap>, event: T, callback: EventMap[T]): IO<EventMap> {
            if (typeof event === 'string' || typeof event === 'symbol') {
                emitter.on(event, callback);

                this.off = () => emitter.off(event, callback);
                return this;
            }
            throw `Expected string or number.`;
        }.bind(this);

        this.once = function <T extends keyof EventMap>(this: IO<EventMap>, event: T, callback: EventMap[T]): IO<EventMap> {
            if (typeof event === 'string' || typeof event === 'symbol') {
                emitter.once(event, callback);

                this.off = () => emitter.off(event, callback);
                return this;
            }
            throw `Expected string or number.`;
        }.bind(this);
    }
}