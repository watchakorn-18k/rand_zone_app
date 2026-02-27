import { test, expect } from '@playwright/test';

test.describe('Rand Zone App E2E', () => {
	test.beforeEach(async ({ page }) => {
		// Assume app runs on localhost:5173 by default in SvelteKit
		await page.goto('/');
	});

	test('should have basic structural elements', async ({ page }) => {
		await expect(page).toHaveTitle(/Rand Zone/);
		await expect(page.locator('h1')).toContainText('ระบบสุ่มของ Rand Zone');
	});

	test('should allow entering names and calculating correct count', async ({ page }) => {
		const namesInput = page.locator('#namesInput');
		await namesInput.fill('John\nJane\nAlice\nBob');

		const countDisplay = page.locator('#nameCount');
		await expect(countDisplay).toHaveText('4 ชื่อ');
	});

	test('should be able to switch to Spin Wheel tab and spin', async ({ page }) => {
		const wheelTabBtn = page.getByTestId('mainTab2');
		await wheelTabBtn.click();

		const wheelInput = page.locator('#wheelInput');
		await expect(wheelInput).toBeVisible();
		await wheelInput.fill('Option A\nOption B\nOption C');

		const spinBtn = page.locator('#spinBtn');
		await spinBtn.click();

		// Ensure spin button gets disabled during animation
		await expect(spinBtn).toHaveClass(/pointer-events-none/);
	});

	test('should render leader selection UI correctly upon input', async ({ page }) => {
		// Tab Groups is default
		const namesInput = page.locator('#namesInput');
		await namesInput.fill('UserA\nUserB\nUserC\nUserD');

		const leaderArea = page.locator('#leaderArea');
		await expect(leaderArea).toContainText('คลิกเลือกหัวหน้ากลุ่ม:');

		const leaderGrid = page.locator('#leaderGrid > div');
		await expect(leaderGrid).toHaveCount(4);
	});

	test('should interact with Number Generator tab correctly', async ({ page }) => {
		const numberTabBtn = page.getByTestId('mainTab3');
		await numberTabBtn.click();

		const digitInput = page.locator('#digitInput');
		await expect(digitInput).toBeVisible();
		await expect(digitInput).toHaveValue('2');

		await digitInput.fill('5');

		const genBtn = page.locator('#genNumBtn');
		await genBtn.click();

		// Check animation state
		await expect(genBtn).toHaveClass(/pointer-events-none/);
	});

	test('should interact with UUID Generator tab correctly', async ({ page }) => {
		const uuidTabBtn = page.getByTestId('mainTab4');
		await uuidTabBtn.click();

		const uuidVersion = page.locator('#uuidVersion');
		await expect(uuidVersion).toBeVisible();
		await expect(uuidVersion).toHaveValue('4');

		const uuidCount = page.locator('#uuidCount');
		await expect(uuidCount).toHaveValue('1');

		await uuidCount.fill('5');
		await uuidVersion.selectOption('7');

		const genBtn = page.locator('#genUuidBtn');
		await genBtn.click();

		// Check animation state
		await expect(genBtn).toHaveClass(/pointer-events-none/);
	});
});
