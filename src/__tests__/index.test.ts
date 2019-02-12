import Event from '../index';

const localSetInterval = setInterval;
const localSetTimeout = setTimeout;
const localClearInterval = clearInterval;

test("listen emit", () => {
	const a = Event.space();
	const b = Event.space();

	const mes1 = Symbol();
	const mes2 = Symbol();

	a.on('message', (messgae1, message2) => {
		expect(messgae1).toBe(mes1);
		expect(message2).toBe(mes2);
	})
	b.emit('message', mes1, mes2);
	b.on('message', (messgae1, message2) => {
		expect(messgae1).toBe(mes1);
		expect(message2).toBe(mes2);
	})
	a.emit('message', mes1, mes2);
})

test("revieve event once", () => {
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	let count = 0;
	const cb = () => count++;
	a.once("message", cb);
	b.emit('message');
	b.emit('message');
	b.emit('message');
	expect(count).toBe(1);
})


test("listEventNames", () => {
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	b.on('name', () => null);
	expect(a.listEventNames()).toContain('name');
})

test("listenerCount", () => {
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	b.on('name', () => null);
	b.on('name', () => null);
	expect(a.listenerCount('name')).toBe(2);
})

test("onceOnly", () => {
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	let count = 0;
	a.onceOnly(["e1", "e1", "e3"], () => count++);
	b.emit('e1');
	b.emit('e2');
	b.emit('e3');
	expect(count).toBe(1);
})

test("emitTimeout", () => {
	jest.useFakeTimers();
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	const callback = jest.fn();
	a.emitTimeout('after1second', 1000, "message"); // do nothing because there is no register
	b.on('after1second', (message) => {
		expect(message).toBe("message");
		callback()
	});
	a.emitTimeout('after1second', 1000, "message")
	expect(callback).not.toBeCalled();
	jest.runAllTimers();
	// Now our callback should have been called!
	expect(callback).toBeCalled();
	expect(callback).toHaveBeenCalledTimes(1);
})

test("throttleEmit", done => {
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	const callback = jest.fn();
	b.on('event-name', (message) => {
		localClearInterval(timeId);
		expect(message).toBe("message2");
		callback();
		done()
	});
	a.setThrottleEmit("event-name", 100);
	const timeId = localSetInterval(() => {
		a.emit("event-name", "message2");
	}, 200);
})

test("throttleEmit real slow", done => {
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	const callback = jest.fn();
	b.on('event-name', (message) => {
		expect(message).toBe("message2");
		callback();

	});
	a.setThrottleEmit("event-name", 200);
	const timeId = localSetInterval(() => {
		a.emit("event-name", "message2");
	}, 50);
	localSetTimeout(() => {
		localClearInterval(timeId);
		expect(callback).toBeCalledTimes(4)
		done();
	}, 1000);
})

test("clear", () => {
	const eventSpace = Symbol();
	const a = Event.space(eventSpace);
	const b = Event.space(eventSpace);
	a.on('1', () => null)
	a.on('2', () => null)
	a.on('2', () => null)
	a.clear('2');
	expect(a.listenerCount('2')).toBe(0);
	expect(a.listenerCount('1')).toBe(1);
	a.clear();
	expect(a.listenerCount('2')).toBe(0);
	expect(a.listenerCount('1')).toBe(0);
})
