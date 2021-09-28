import fs from 'fs';

import IO from "./IO";
import keys from '../keys.json';

export type EventMap = {
    'move': [{ x: number, y: number }],
    'down': [keyof (typeof keys.BTN)],
    'up': [keyof (typeof keys.BTN)]
};

export type Event<Type extends keyof (typeof keys.EV) = keyof (typeof keys.EV)> = {
    time: Date,
    type: Type,
    code: Type extends "KEY" ? keyof (typeof keys.KEY) | keyof (typeof keys.BTN) :
        Type extends "ABS" ? keyof (typeof keys.ABS) :
            Type extends "REL" ? keyof (typeof keys.REL) :
                Type extends "MSC" ? keyof (typeof keys.MSC) :
                    Type extends "LED" ? keyof (typeof keys.LED) :
                        Type extends "SW" ? keyof (typeof keys.SW) :
                            Type extends "SND" ? keyof (typeof keys.SND) :
                                Type extends "REP" ? keyof (typeof keys.REP) : number,
    value: number
};

export const mouse: { pos: { x: number, y: number }, left: boolean, right: boolean, middle: boolean } = {
    pos: {x: 0, y: 0},
    left: false,
    middle: false,
    right: false
};

export default function open(device: string): IO<EventMap> {
    const data = fs.createReadStream(device);

    const emit: { emit: <T extends keyof EventMap>(name: T, data: EventMap[T]) => any } = {emit: null};
    const emitter = new IO<EventMap>(emit);

    const parse = function (buffer: Buffer): Event {
        const type = buffer.readInt16LE(16);
        const code = buffer.readInt16LE(18)
        const value = buffer.readInt32LE(20)

        const type_name = (Object.keys(keys.EV).find(i => keys.EV[i] === type) ?? type) as keyof (typeof keys.EV);

        return {
            time: new Date(),
            type: type_name,
            code: code,
            value: value
        };
    }

    data.on('data', function (buffer: Buffer) {
        let moved = false;

        for (let i = 0; i < buffer.length; i += 24) {
            const event = parse(buffer.slice(i, i + 24));

            if (event.type === 'REL') {
                moved = true;
                if (event.code === keys.REL.X)
                    mouse.pos.x += event.value;
                else if (event.code === keys.REL.Y)
                    mouse.pos.y += event.value;
            } else if (event.type === 'KEY') {
                if (event.value === 1) {
                    if (event.code === keys.BTN.LEFT) {
                        mouse.left = true;
                        emit.emit('down', 'LEFT');
                    } else if (event.code === keys.BTN.MIDDLE) {
                        mouse.middle = true;
                        emit.emit('down', 'MIDDLE');
                    } else if (event.code === keys.BTN.RIGHT) {
                        mouse.right = true;
                        emit.emit('down', 'RIGHT');
                    }
                } else {
                    if (event.code === keys.BTN.LEFT) {
                        mouse.left = false;
                        emit.emit('up', 'LEFT');
                    } else if (event.code === keys.BTN.MIDDLE) {
                        mouse.middle = false;
                        emit.emit('up', 'MIDDLE');
                    } else if (event.code === keys.BTN.RIGHT) {
                        mouse.right = false;
                        emit.emit('up', 'RIGHT');
                    }
                }
            }
        }

        if (moved)
            emit.emit('move', mouse.pos);
    });

    return emitter;
}