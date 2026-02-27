import { json } from '@sveltejs/kit';
export const prerender = true;

const CITIES = [
	'กรุงเทพ',
	'เชียงใหม่',
	'ขอนแก่น',
	'ภูเก็ต',
	'ชลบุรี',
	'นครราชสีมา',
	'สงขลา',
	'อุดรธานี'
];
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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
	const data = Array.from({ length: 500 }, (_, i) => {
		const date = `${rint(2023, 2025)}-${String(rint(1, 12)).padStart(2, '0')}-${String(rint(1, 28)).padStart(2, '0')}`;
		return {
			id: i + 1,
			order_number: `ORD-${date.replace(/-/g, '')}${rint(1000, 9999)}`,
			customer_id: rint(1, 200),
			product_id: rint(1, 200),
			quantity: rint(1, 10),
			total: Math.round((rint(10, 99999) + Math.random()) * 100) / 100,
			status: pick(STATUSES),
			ordered_at: date,
			shipping_address: `${rint(1, 999)} ${pick(CITIES)}`
		};
	});
	return json(data);
}
