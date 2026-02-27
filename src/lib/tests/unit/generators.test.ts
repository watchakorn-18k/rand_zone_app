import { describe, it, expect } from 'vitest';
import {
	DISCORD_EPOCH,
	encodeSnowflake,
	decodeSnowflake,
	generateSecureDigits
} from '$lib/utils/generators';

describe('Snowflake Encode/Decode', () => {
	it('should encode a snowflake with known values and decode back correctly', () => {
		const timestampMs = 1700000000000; // a fixed known timestamp
		const workerId = 5;
		const processId = 10;
		const sequence = 42;

		const encoded = encodeSnowflake(timestampMs, workerId, processId, sequence);
		expect(typeof encoded).toBe('string');
		expect(encoded.length).toBeGreaterThan(0);

		const decoded = decodeSnowflake(encoded);
		expect(decoded.timestamp).toBe(timestampMs);
		expect(decoded.workerId).toBe(workerId);
		expect(decoded.processId).toBe(processId);
		expect(decoded.sequence).toBe(sequence);
	});

	it('should correctly use Discord Epoch (1 Jan 2015)', () => {
		expect(DISCORD_EPOCH).toBe(1420070400000n);
	});

	it('should encode and decode worker/process ID edge values (0 and 31)', () => {
		const ts = 1700000000000;

		// Min values
		const minEncoded = encodeSnowflake(ts, 0, 0, 0);
		const minDecoded = decodeSnowflake(minEncoded);
		expect(minDecoded.workerId).toBe(0);
		expect(minDecoded.processId).toBe(0);
		expect(minDecoded.sequence).toBe(0);

		// Max values (5 bits = 31, 12 bits = 4095)
		const maxEncoded = encodeSnowflake(ts, 31, 31, 4095);
		const maxDecoded = decodeSnowflake(maxEncoded);
		expect(maxDecoded.workerId).toBe(31);
		expect(maxDecoded.processId).toBe(31);
		expect(maxDecoded.sequence).toBe(4095);
	});

	it('should mask worker/process IDs to 5 bits (values > 31 get truncated)', () => {
		const ts = 1700000000000;
		// workerId=32 should be masked to 0 (32 & 0x1F = 0)
		const encoded = encodeSnowflake(ts, 32, 33, 0);
		const decoded = decodeSnowflake(encoded);
		expect(decoded.workerId).toBe(0); // 32 & 31 = 0
		expect(decoded.processId).toBe(1); // 33 & 31 = 1
	});

	it('should mask sequence to 12 bits (values > 4095 get truncated)', () => {
		const ts = 1700000000000;
		// sequence=4096 should be masked to 0
		const encoded = encodeSnowflake(ts, 1, 1, 4096);
		const decoded = decodeSnowflake(encoded);
		expect(decoded.sequence).toBe(0); // 4096 & 0xFFF = 0
	});

	it('should produce time-sortable IDs (later timestamp = higher ID)', () => {
		const earlier = encodeSnowflake(1700000000000, 1, 1, 0);
		const later = encodeSnowflake(1700000001000, 1, 1, 0);
		expect(BigInt(later)).toBeGreaterThan(BigInt(earlier));
	});

	it('should produce unique IDs with different sequences', () => {
		const ts = 1700000000000;
		const id1 = encodeSnowflake(ts, 1, 1, 0);
		const id2 = encodeSnowflake(ts, 1, 1, 1);
		const id3 = encodeSnowflake(ts, 1, 1, 2);

		expect(id1).not.toBe(id2);
		expect(id2).not.toBe(id3);
	});

	it('should decode a known Discord Snowflake ID correctly', () => {
		// Discord Bot Application ID example: 175928847299117063
		const decoded = decodeSnowflake('175928847299117063');
		// This ID was created sometime in 2016
		expect(decoded.timestamp).toBeGreaterThan(1420070400000); // After Discord Epoch
		expect(decoded.timestamp).toBeLessThan(1600000000000); // Before 2020
		expect(decoded.workerId).toBeGreaterThanOrEqual(0);
		expect(decoded.workerId).toBeLessThanOrEqual(31);
		expect(decoded.processId).toBeGreaterThanOrEqual(0);
		expect(decoded.processId).toBeLessThanOrEqual(31);
		expect(decoded.sequence).toBeGreaterThanOrEqual(0);
	});

	it('should return a valid Date object from decoded snowflake', () => {
		const ts = 1700000000000;
		const encoded = encodeSnowflake(ts, 1, 1, 0);
		const decoded = decodeSnowflake(encoded);
		expect(decoded.date).toBeInstanceOf(Date);
		expect(decoded.date.getTime()).toBe(ts);
	});

	it('should throw on invalid input to decodeSnowflake', () => {
		expect(() => decodeSnowflake('not_a_number')).toThrow();
		expect(() => decodeSnowflake('abc123xyz')).toThrow();
	});

	it('should handle whitespace in input to decodeSnowflake', () => {
		const ts = 1700000000000;
		const encoded = encodeSnowflake(ts, 1, 1, 0);
		const decoded = decodeSnowflake(`  ${encoded}  `);
		expect(decoded.timestamp).toBe(ts);
	});
});

describe('generateSecureDigits', () => {
	it('should generate a string of the requested length', () => {
		for (let len = 2; len <= 10; len++) {
			const result = generateSecureDigits(len);
			expect(result).toHaveLength(len);
		}
	});

	it('should not start with 0 (first digit is 1-9)', () => {
		// Run multiple times to increase confidence
		for (let i = 0; i < 50; i++) {
			const result = generateSecureDigits(5);
			expect(result[0]).not.toBe('0');
			expect(parseInt(result[0])).toBeGreaterThanOrEqual(1);
			expect(parseInt(result[0])).toBeLessThanOrEqual(9);
		}
	});

	it('should only contain numeric characters', () => {
		for (let i = 0; i < 20; i++) {
			const result = generateSecureDigits(10);
			expect(result).toMatch(/^\d+$/);
		}
	});

	it('should generate different values across calls (not deterministic)', () => {
		const results = new Set<string>();
		for (let i = 0; i < 30; i++) {
			results.add(generateSecureDigits(6));
		}
		// With 6 digits and 30 calls, should have at least 5 unique values
		expect(results.size).toBeGreaterThanOrEqual(5);
	});

	it('should handle minimum digit count of 1', () => {
		const result = generateSecureDigits(1);
		expect(result).toHaveLength(1);
		expect(parseInt(result)).toBeGreaterThanOrEqual(1);
		expect(parseInt(result)).toBeLessThanOrEqual(9);
	});
});
