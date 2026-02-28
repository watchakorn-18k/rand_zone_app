import { json } from '@sveltejs/kit';
import { MOCK_SCHEMAS } from '$lib/data/mock-schemas';
import type { RequestEvent } from './$types';

export const prerender = true;

/**
 * บอก SvelteKit ว่าจะให้ prerender เป็นไฟล์ static ตรงไหนบ้าง (ทุก keys ใน MOCK_SCHEMAS)
 */
export function entries() {
	return MOCK_SCHEMAS.map((s) => ({ type: s.key }));
}

export async function GET({ params }: RequestEvent) {
	const { type } = params;
	const schema = MOCK_SCHEMAS.find((s) => s.key === type);

	if (!schema) {
		return json({ error: 'Schema not found' }, { status: 404 });
	}

	// สร้างข้อมูล 500 rows สำหรับฝึก pagination ตามที่ user ขอ
	const data = Array.from({ length: 500 }, (_, i) => {
		return schema.generator(i + 1);
	});

	return json(data);
}
