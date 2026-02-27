import { describe, it, expect } from 'vitest';
import { FairnessEngine } from '$lib/utils/fairness';

describe('FairnessEngine Core Logic', () => {
	const engine = new FairnessEngine();

	it('should initialize with correct default properties', () => {
		expect(engine.rounds).toBe(7);
		expect(engine.seed).toBeNull();
	});

	it('should generate secure random integers correctly', () => {
		const value = engine.secureRandomInt(10);
		expect(value).toBeGreaterThanOrEqual(0);
		expect(value).toBeLessThan(10);
	});

	it('returns 0 if secureRandomInt is called with 0 or negative', () => {
		expect(engine.secureRandomInt(0)).toBe(0);
		expect(engine.secureRandomInt(-5)).toBe(0);
	});

	it('fisherYatesShuffle should return a shuffled array with the exact same items', () => {
		const input = ['A', 'B', 'C', 'D', 'E'];
		const shuffled = engine.fisherYatesShuffle(input);

		expect(shuffled.length).toBe(input.length);
		expect(shuffled).not.toBe(input); // Check immutable clone
		input.forEach((item) => {
			expect(shuffled.includes(item)).toBeTruthy();
		});
	});

	it('should generate a 64-character hex seed', () => {
		const seed = engine.generateSeed();
		expect(seed).toBeDefined();
		expect(seed).toHaveLength(64);
		expect(engine.seed).toBe(seed);
	});

	it('should properly calculate Chi-Square distributions for uniform group sizes', () => {
		const uniformGroups = [
			['A', 'B'],
			['C', 'D'],
			['E', 'F']
		];
		const stats = engine.chiSquareTest(uniformGroups);

		expect(stats.df).toBe(2);
		expect(stats.maxDiff).toBe(0);
		expect(stats.pass).toBe(true);
		expect(parseFloat(stats.chi)).toBe(0);
	});

	it('should calculate Chi-Square distribution maxDiff correctly', () => {
		const skewedGroups = [['A', 'B', 'X'], ['C', 'D'], ['E']];
		const stats = engine.chiSquareTest(skewedGroups);

		expect(stats.maxDiff).toBe(2); // 3 vs 1
		expect(stats.pass).toBe(true); // df=2, chi is low enough
	});

	it('should calculate Chi-square correctly and fail uniformly when extremely skewed', () => {
		const skewedGroups = [['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], ['K']];
		const stats = engine.chiSquareTest(skewedGroups);
		// e = 11/2 = 5.5
		// (10-5.5)^2/5.5 + (1-5.5)^2/5.5 = 20.25/5.5 + 20.25/5.5 ≈ 7.36
		// df = 1. c95 = 3.841.
		expect(stats.pass).toBe(false);
		expect(parseFloat(stats.chi)).toBeGreaterThan(3.841);
	});

	it('should use df * 2 fallback for df > 10 in chi-square test', () => {
		// Create 12 groups (df = 11)
		const groups = Array.from({ length: 12 }, (_, i) => [i.toString(), (i + 100).toString()]);
		const stats = engine.chiSquareTest(groups);
		expect(stats.df).toBe(11);
		expect(stats.pass).toBe(true); // Should fallback to c < df*2 (c < 22), chi is 0
	});

	it('should build a comprehensive log with leaders', () => {
		const log = engine.buildLog(
			['A', 'B', 'C', 'D', 'E'],
			['A'],
			[['A', 'B'], ['C', 'D'], ['E']],
			['G1', 'G2', 'G3'],
			'count=3'
		);

		expect(log).toBeInstanceOf(Array);
		expect(log.some((l) => l.l === 'LEADERS' && l.v === 'A')).toBeTruthy();
		expect(log.some((l) => l.l === '  Uniform' && l.v === 'PASS' && l.ok === true)).toBeTruthy();
		expect(
			log.some((l) => l.l === '  Leader spread' && l.v === 'Distributed' && l.ok === true)
		).toBeTruthy();
	});

	it('should build a comprehensive log without leaders and with a failed uniform state', () => {
		// Skewed to force t.pass = false
		const skewedGroups = [['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], ['K']];
		const log = engine.buildLog(
			['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
			[],
			skewedGroups,
			['G1', 'G2'],
			'count=2'
		);

		expect(log.some((l) => l.l === 'LEADERS' && l.v === 'None')).toBeTruthy();
		expect(
			log.some((l) => l.l === '  Leader spread' && l.v === 'N/A' && l.ok === true)
		).toBeTruthy();
		expect(log.some((l) => l.l === '  Uniform' && l.v === 'WARN' && l.ok === false)).toBeTruthy();
	});
});
