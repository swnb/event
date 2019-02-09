# power-event ![](https://travis-ci.com/swnb/event.svg?branch=master) ![](https://coveralls.io/repos/github/swnb/event/badge.svg?branch=master) ![](https://img.shields.io/bundlephobia/minzip/power-event.svg?style=flat) ![](https://img.shields.io/github/license/swnb/event.svg?style=flat)

## how to use it

### install

```bash
yarn add power-event;
```

or

```bash
npm install power-event;
```

### base usage

> module a.ts

```typescript
import Event from 'power-event';

const a = Event.space();
// you can use symbol as event name
a.on('eventName', (message1, message2) => {
	console.log(message1, message2); // print mes1 mes2 when b emit
});
```

> module b.ts

```typescript
import Event from 'power-event';
const b = Event.space();
b.emit('eventName', 'mes1', 'mes2');
```

> index.ts

```typescript
import 'a.ts';
import 'b.ts';
// you can see something in console.log
```

### rm listener

> module a.ts

```typescript
import Event from 'power-event';

const a = Event.space();
// you can use symbol as event name
const rmListener = a.on('eventName', (message1, message2) => {
	console.log(message1, message2); // never reach
});

rmListener(); // rm listener
```

> module b.ts

```typescript
import Event from 'power-event';
const b = Event.space();
b.emit('eventName', 'mes1', 'mes2');
```

### once and onceOnly

> module a.ts

```typescript
import Event from 'power-event';

const a = Event.space();
// you can use symbol as event name
a.once('e1', (message1, message2) => {
	console.log(message1, message2); // only emit once
});

a.onceOnly(['e1', 'e2', 'e3'], (message1, message2) => {
	console.log(message1, message2); // only emit once
});
```

> module b.ts

```typescript
import Event from 'power-event';

const b = Event.space();
b.emit('e1', 'mes1', 'mes2');
b.emit('e1', 'mes1', 'mes2');

b.emit('e2', 'mes1', 'mes2');
b.emit('e3', 'mes1', 'mes2');
b.emit('e4', 'mes1', 'mes2');
```

### emitTimeout and setThrottleEmit

> module a.ts

```typescript
import Event from 'power-event';

const a = Event.space();
// you can use symbol as event name
a.on('e1', (message1, message2) => {
	console.log(message1, message2); // print mes1 mes2 one second after
});

a.on('e2', () => {
	console.log('e2 emited'); // callback will be called only once at second
});
```

> module b.ts

```typescript
import { Event } from '../src/index';
const b = Event.space();
b.emitTimeout('e1', 1000, 'mes1', 'mes2');

b.setThrottleEmit('e2', 1000);
setInterval(b.emit, 10, 'e2');
```
