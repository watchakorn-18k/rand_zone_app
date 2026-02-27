import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showToast } from '$lib/utils/toast';

describe('ShowToast', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		document.body.innerHTML = ''; // Clean up before each test
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should create a toast element and append it to the body', () => {
		showToast('Test message');

		const toast = document.querySelector('.toast-el');
		expect(toast).not.toBeNull();
		expect(toast?.innerHTML).toContain('Test message');
		expect(toast?.innerHTML).toContain('ri-information-line');
		expect(toast?.classList.contains('fixed')).toBeTruthy();
	});

	it('should remove existing toasts when a new one is created', () => {
		showToast('Message 1');
		showToast('Message 2');

		const toasts = document.querySelectorAll('.toast-el');
		expect(toasts.length).toBe(1);
		expect(toasts[0].innerHTML).toContain('Message 2');
	});

	it('should gracefully handle if document is undefined (SSR)', () => {
		// Mock document as undefined
		const originalDocument = global.document;
		// @ts-ignore
		delete global.document;

		expect(() => showToast('SSR Context')).not.toThrow();

		// Restore
		global.document = originalDocument;
	});

	it('should fade out and remove the toast after timeout', () => {
		showToast('Timeout test');
		const toast = document.querySelector('.toast-el') as HTMLElement;

		expect(toast).toBeInTheDocument();

		// Advance time by 2500ms (opacity transition)
		vi.advanceTimersByTime(2500);
		expect(toast.style.opacity).toBe('0');

		// Advance another 300ms (removal)
		vi.advanceTimersByTime(300);
		expect(document.querySelector('.toast-el')).toBeNull();
	});
});
