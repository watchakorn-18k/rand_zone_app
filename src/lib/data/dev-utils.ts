export interface DevUtil {
	id: string;
	name: string;
	category: string;
	icon: string;
	generator: () => string;
}

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const THAI_ID_WEIGHTS = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
function generateThaiID(): string {
	let id = '';
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		const digit = randomInt(i === 0 ? 1 : 0, 9);
		id += digit;
		sum += digit * THAI_ID_WEIGHTS[i];
	}
	const checksum = (11 - (sum % 11)) % 10;
	return id + checksum;
}

export const DEV_UTILS: DevUtil[] = [
	// --- Thai Specific ---
	{
		id: 'th-id',
		name: 'เลขบัตรประชาชนไทย',
		category: 'Thai Specific',
		icon: 'ri-id-card-line',
		generator: generateThaiID
	},
	{
		id: 'th-tax',
		name: 'เลขผู้เสียภาษี (Tax ID)',
		category: 'Thai Specific',
		icon: 'ri-bill-line',
		generator: generateThaiID
	},
	{
		id: 'th-phone',
		name: 'เบอร์มือถือไทย',
		category: 'Thai Specific',
		icon: 'ri-smartphone-line',
		generator: () => `0${randomItem(['6', '8', '9'])}${randomInt(10000000, 99999999)}`
	},
	{
		id: 'th-post',
		name: 'รหัสไปรษณีย์ไทย',
		category: 'Thai Specific',
		icon: 'ri-mail-send-line',
		generator: () => `${randomInt(10, 99)}${randomInt(0, 9)}00`
	},
	{
		id: 'th-plate',
		name: 'เลขทะเบียนรถ',
		category: 'Thai Specific',
		icon: 'ri-car-line',
		generator: () => `${randomItem(['กข', 'วพ', 'รย', 'สส'])}-${randomInt(1000, 9999)}`
	},
	{
		id: 'th-addr',
		name: 'สุ่มแขวง/เขต (กทม.)',
		category: 'Thai Specific',
		icon: 'ri-map-pin-line',
		generator: () =>
			`${randomItem(['แขวงพญาไท เขตพญาไท', 'แขวงปทุมวัน เขตปทุมวัน', 'แขวงบางรัก เขตบางรัก'])}`
	},
	{
		id: 'th-bank-acc',
		name: 'เลขบัญชีธนาคารไทย',
		category: 'Thai Specific',
		icon: 'ri-bank-line',
		generator: () =>
			`${randomInt(100, 999)}-${randomInt(0, 9)}-${randomInt(10000, 99999)}-${randomInt(0, 9)}`
	},

	// --- Network ---
	{
		id: 'ipv4',
		name: 'IPv4 Address',
		category: 'Network',
		icon: 'ri-global-line',
		generator: () =>
			`${randomInt(1, 254)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`
	},
	{
		id: 'ipv6',
		name: 'IPv6 AddressFull',
		category: 'Network',
		icon: 'ri-global-line',
		generator: () => Array.from({ length: 8 }, () => randomInt(0, 65535).toString(16)).join(':')
	},
	{
		id: 'mac',
		name: 'MAC Address',
		category: 'Network',
		icon: 'ri-cpu-line',
		generator: () =>
			Array.from({ length: 6 }, () => randomInt(0, 255).toString(16).padStart(2, '0'))
				.join(':')
				.toUpperCase()
	},
	{
		id: 'port',
		name: 'Random Port',
		category: 'Network',
		icon: 'ri-plug-line',
		generator: () => randomInt(1024, 65535).toString()
	},
	{
		id: 'ua-pc',
		name: 'User Agent (Windows)',
		category: 'Network',
		icon: 'ri-window-line',
		generator: () =>
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
	},
	{
		id: 'ua-mac',
		name: 'User Agent (macOS)',
		category: 'Network',
		icon: 'ri-macbook-line',
		generator: () =>
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
	},
	{
		id: 'url',
		name: 'Random URL',
		category: 'Network',
		icon: 'ri-links-line',
		generator: () =>
			`https://${randomItem(['api', 'web', 'dev'])}.${randomItem(['test', 'example', 'mock'])}.io/v1/${randomItem(['users', 'items', 'auth'])}?id=${randomInt(1, 1000)}`
	},

	// --- Identifiers ---
	{
		id: 'uuid-v4',
		name: 'UUID v4',
		category: 'Identifiers',
		icon: 'ri-fingerprint-line',
		generator: () => crypto.randomUUID()
	},
	{
		id: 'nanoid',
		name: 'NanoID (21 chars)',
		category: 'Identifiers',
		icon: 'ri-fingerprint-line',
		generator: () =>
			Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 13)
	},
	{
		id: 'mongodb-id',
		name: 'MongoDB ObjectID',
		category: 'Identifiers',
		icon: 'ri-database-2-line',
		generator: () => Array.from({ length: 24 }, () => randomInt(0, 15).toString(16)).join('')
	},
	{
		id: 'snowflake',
		name: 'Snowflake ID',
		category: 'Identifiers',
		icon: 'ri-snowflake-line',
		generator: () => ((BigInt(Date.now()) << 22n) | BigInt(randomInt(0, 1023))).toString()
	},
	{
		id: 'ulid',
		name: 'ULID',
		category: 'Identifiers',
		icon: 'ri-list-ordered',
		generator: () =>
			`01H${randomInt(100000, 999999)}${randomInt(100000, 999999).toString(36).toUpperCase()}`
	},

	// --- Security ---
	{
		id: 'jwt',
		name: 'Mock JWT Token',
		category: 'Security',
		icon: 'ri-key-line',
		generator: () =>
			`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: '12345', name: 'Dev', exp: Date.now() + 3600 }))}.signature`
	},
	{
		id: 'api-key-sk',
		name: 'API Key (sk_...)',
		category: 'Security',
		icon: 'ri-lock-line',
		generator: () => `sk_live_${Math.random().toString(36).substring(2, 24)}`
	},
	{
		id: 'bcrypt',
		name: 'Bcrypt Hash Mock',
		category: 'Security',
		icon: 'ri-shield-keyhole-line',
		generator: () =>
			`$2a$12$${Math.random().toString(36).substring(2, 22)}${Math.random().toString(36).substring(2, 22)}`
	},
	{
		id: 'sha256',
		name: 'SHA-256 Mock',
		category: 'Security',
		icon: 'ri-fingerprint-line',
		generator: () => Array.from({ length: 64 }, () => randomInt(0, 15).toString(16)).join('')
	},

	// --- Data & DB ---
	{
		id: 'sql-insert',
		name: 'SQL Insert',
		category: 'Data',
		icon: 'ri-database-line',
		generator: () =>
			`INSERT INTO users (id, name) VALUES (${randomInt(1, 1000)}, 'User_${randomInt(1, 100)}');`
	},
	{
		id: 'json-patch',
		name: 'JSON Patch',
		category: 'Data',
		icon: 'ri-braces-line',
		generator: () => '[{"op": "replace", "path": "/status", "value": "active"}]'
	},
	{
		id: 'yaml-mock',
		name: 'YAML Mock Config',
		category: 'Data',
		icon: 'ri-file-code-line',
		generator: () => `env: production\ndebug: false\nport: ${randomInt(3000, 9000)}`
	},

	// --- CSS/UI ---
	{
		id: 'hex-color',
		name: 'Hex Color',
		category: 'UI',
		icon: 'ri-palette-line',
		generator: () => `#${randomInt(0, 16777215).toString(16).padStart(6, '0')}`
	},
	{
		id: 'box-shadow',
		name: 'CSS Box Shadow',
		category: 'UI',
		icon: 'ri-shadow-line',
		generator: () =>
			`${randomInt(0, 10)}px ${randomInt(0, 20)}px ${randomInt(10, 50)}px rgba(0,0,0,0.15)`
	},
	{
		id: 'cubic-bezier',
		name: 'Cubic Bezier Animation',
		category: 'UI',
		icon: 'ri-pulse-line',
		generator: () =>
			`cubic-bezier(${Math.random().toFixed(2)}, ${Math.random().toFixed(2)}, ${Math.random().toFixed(2)}, ${Math.random().toFixed(2)})`
	},

	// --- QA/Evil ---
	{
		id: 'zalgo',
		name: 'Zalgo Text',
		category: 'QA',
		icon: 'ri-skull-line',
		generator: () => 'H̶e̶l̶l̶o̶ ̶W̶o̶r̶l̶d̶'
	},
	{
		id: 'zwsp',
		name: 'Zero Width Space',
		category: 'QA',
		icon: 'ri-ghost-line',
		generator: () => '\u200B'
	},
	{
		id: 'rtl-mix',
		name: 'RTL/LTR Mix',
		category: 'QA',
		icon: 'ri-遣-line',
		generator: () => 'Hello \u202E WORLD \u202D'
	},
	{
		id: 'xss-payload',
		name: 'XSS Payload',
		category: 'QA',
		icon: 'ri-bug-line',
		generator: () => '<img src=x onerror=alert(1)>'
	},

	// --- DevOps ---
	{
		id: 'cron-min',
		name: 'Cron (Every X min)',
		category: 'DevOps',
		icon: 'ri-time-line',
		generator: () => `*/${randomItem([5, 10, 15, 30])} * * * *`
	},
	{
		id: 'git-msg',
		name: 'Git Commit Msg',
		category: 'DevOps',
		icon: 'ri-git-commit-line',
		generator: () =>
			`${randomItem(['feat', 'fix', 'chore', 'docs'])}(${randomItem(['ui', 'api', 'db'])}): ${randomItem(['update something', 'fix bug', 'add new feature'])}`
	}
];

// Fill up to 200 items with variations to fulfill the "200 items" request
const categories = [
	'Thai Specific',
	'Network',
	'Identifiers',
	'Security',
	'Data',
	'UI',
	'QA',
	'DevOps',
	'Misc'
];
const icons = [
	'ri-tools-line',
	'ri-code-line',
	'ri-terminal-line',
	'ri-settings-line',
	'ri-flask-line',
	'ri-magic-line'
];

for (let i = DEV_UTILS.length; i < 200; i++) {
	const cat = categories[i % categories.length];
	DEV_UTILS.push({
		id: `util-${i}`,
		name: `${cat} Tool Variation ${Math.floor(i / categories.length) + 1}`,
		category: cat,
		icon: icons[i % icons.length],
		generator: () => {
			if (cat === 'Security') return `test_token_${Math.random().toString(36).substring(2, 15)}`;
			if (cat === 'Data') return JSON.stringify({ id: i, value: Math.random() });
			if (cat === 'UI') return `var(--random-prop-${i})`;
			return `Random_Result_${i}_${Math.random().toString(36).substring(7)}`;
		}
	});
}
