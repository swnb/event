type time = number

export class Throttle {
	public static create = (timeGap: time) => new Throttle(timeGap)

	private gap: time
	private timeStamp: time

	constructor(timeGap: time) {
		this.gap = timeGap
		this.timeStamp = Date.now()
	}

	public get realse() {
		const now = Date.now()
		if (now - this.timeStamp >= this.gap) {
			this.timeStamp = now
			return true
		}

		return false
	}
}
