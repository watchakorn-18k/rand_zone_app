// Discord Epoch: 1 January 2015 00:00:00 UTC
export const DISCORD_EPOCH = 1420070400000n;

export interface SnowflakeDecoded {
	timestamp: number;
	date: Date;
	workerId: number;
	processId: number;
	sequence: number;
}

export function encodeSnowflake(
	timestampMs: number,
	workerId: number,
	processId: number,
	sequence: number
): string {
	const ts = BigInt(timestampMs) - DISCORD_EPOCH;
	const wId = BigInt(workerId & 0x1f);
	const pId = BigInt(processId & 0x1f);
	const seq = BigInt(sequence & 0xfff);

	const snowflake = (ts << 22n) | (wId << 17n) | (pId << 12n) | seq;
	return snowflake.toString();
}

export function decodeSnowflake(id: string): SnowflakeDecoded {
	const snowflake = BigInt(id.trim());
	const timestamp = Number((snowflake >> 22n) + DISCORD_EPOCH);
	const workerId = Number((snowflake >> 17n) & 0x1fn);
	const processId = Number((snowflake >> 12n) & 0x1fn);
	const sequence = Number(snowflake & 0xfffn);

	return {
		timestamp,
		date: new Date(timestamp),
		workerId,
		processId,
		sequence
	};
}

export function generateSecureDigits(digits: number): string {
	let result = '';
	const buf = new Uint8Array(digits);
	crypto.getRandomValues(buf);

	for (let i = 0; i < digits; i++) {
		if (i === 0) {
			result += (1 + (buf[i] % 9)).toString();
		} else {
			result += (buf[i] % 10).toString();
		}
	}
	return result;
}
