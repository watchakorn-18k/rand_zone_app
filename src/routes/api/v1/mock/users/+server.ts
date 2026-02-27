import { json } from '@sveltejs/kit';
export const prerender = true;

const FIRST_NAMES = [
	'สมชาย',
	'สมหญิง',
	'ธนา',
	'พิม',
	'กิตติ',
	'อรุณ',
	'จันทร์',
	'วิชัย',
	'นภา',
	'ศิริ',
	'James',
	'Emma',
	'Liam',
	'Olivia',
	'Noah',
	'Ava',
	'Sophia',
	'Lucas',
	'Mia',
	'Ethan'
];
const LAST_NAMES = [
	'จันทร์เพ็ญ',
	'ศรีสุข',
	'วงษ์สวัสดิ์',
	'พลอยงาม',
	'Smith',
	'Johnson',
	'Williams',
	'Brown',
	'Jones',
	'Garcia'
];
const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'company.co.th'];
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
		const first = pick(FIRST_NAMES);
		const last = pick(LAST_NAMES);
		return {
			id: i + 1,
			first_name: first,
			last_name: last,
			email: `user${rint(1, 9999)}@${pick(DOMAINS)}`,
			age: rint(18, 65),
			city: pick(CITIES),
			phone: `0${rint(6, 9)}${rint(1000, 9999)}${rint(1000, 9999)}`,
			registered_at: `${rint(2023, 2025)}-${String(rint(1, 12)).padStart(2, '0')}-${String(rint(1, 28)).padStart(2, '0')}`,
			is_active: Math.random() > 0.2
		};
	});
	return json(data);
}
