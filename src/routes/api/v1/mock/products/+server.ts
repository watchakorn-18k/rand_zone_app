import { json } from '@sveltejs/kit';
export const prerender = true;

const ADJ = [
	'Premium',
	'Ultra',
	'Smart',
	'Pro',
	'Mini',
	'Eco',
	'Super',
	'Classic',
	'Deluxe',
	'Elite'
];
const NOUN = [
	'Headphones',
	'Mouse',
	'Keyboard',
	'Monitor',
	'Camera',
	'Speaker',
	'Charger',
	'Cable',
	'Stand',
	'Light',
	'Hub',
	'Dock',
	'Case',
	'Pen',
	'Bag'
];
const CATEGORIES = [
	'Electronics',
	'Home',
	'Sports',
	'Fashion',
	'Books',
	'Toys',
	'Food',
	'Health',
	'Beauty',
	'Office'
];

function rng(max: number) {
	return Math.floor(Math.random() * max);
}
function pick<T>(a: T[]): T {
	return a[rng(a.length)];
}
function rint(min: number, max: number) {
	return min + rng(max - min + 1);
}

export async function GET() {
	const data = Array.from({ length: 50 }, (_, i) => ({
		id: i + 1,
		name: `${pick(ADJ)} ${pick(NOUN)}`,
		category: pick(CATEGORIES),
		price: Math.round((rint(10, 99999) + Math.random()) * 100) / 100,
		stock: rint(0, 500),
		rating: Math.round((1 + Math.random() * 4) * 10) / 10,
		sku: `SKU-${rint(10000, 99999)}`,
		created_at: `${rint(2023, 2025)}-${String(rint(1, 12)).padStart(2, '0')}-${String(rint(1, 28)).padStart(2, '0')}`,
		is_available: Math.random() > 0.1
	}));
	return json(data);
}
