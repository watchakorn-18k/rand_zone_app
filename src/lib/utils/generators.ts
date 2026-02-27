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

export interface PasswordOptions {
	length: number;
	useNumbers: boolean;
	useLowercase: boolean;
	useUppercase: boolean;
	useSpecial: boolean;
}

const CHAR_NUMBERS = '0123456789';
const CHAR_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const CHAR_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHAR_SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function buildCharset(opts: PasswordOptions): string {
	let charset = '';
	if (opts.useNumbers) charset += CHAR_NUMBERS;
	if (opts.useLowercase) charset += CHAR_LOWER;
	if (opts.useUppercase) charset += CHAR_UPPER;
	if (opts.useSpecial) charset += CHAR_SPECIAL;
	return charset;
}

export function generatePassword(opts: PasswordOptions): string {
	const charset = buildCharset(opts);
	if (charset.length === 0 || opts.length <= 0) return '';

	const buf = new Uint32Array(opts.length);
	crypto.getRandomValues(buf);

	let result = '';
	for (let i = 0; i < opts.length; i++) {
		result += charset[buf[i] % charset.length];
	}
	return result;
}

export function calcPasswordStrength(password: string): { score: number; label: string } {
	let score = 0;
	if (password.length >= 8) score += 1;
	if (password.length >= 12) score += 1;
	if (password.length >= 16) score += 1;
	if (/[a-z]/.test(password)) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^a-zA-Z0-9]/.test(password)) score += 1;

	if (score <= 2) return { score, label: 'อ่อน' };
	if (score <= 4) return { score, label: 'ปานกลาง' };
	if (score <= 5) return { score, label: 'แข็งแรง' };
	return { score, label: 'แข็งแกร่งมาก' };
}
