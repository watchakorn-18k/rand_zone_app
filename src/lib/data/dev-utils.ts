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
const randomHex = (len: number) =>
	Array.from({ length: len }, () => randomInt(0, 15).toString(16)).join('');

// --- Safe environment polyfills/utils ---
const safeUUID = () => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

const safeBtoa = (str: string) => {
	try {
		return btoa(unescape(encodeURIComponent(str)));
	} catch (e) {
		return 'EncodingError';
	}
};

// --- Thai Specific Logic ---
const THAI_ID_WEIGHTS = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
function generateThaiID(): string {
	let id = '';
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		const d = randomInt(i === 0 ? 1 : 0, 9);
		id += d;
		sum += d * THAI_ID_WEIGHTS[i];
	}
	return id + ((11 - (sum % 11)) % 10);
}

// Reuseable Random Parts
const BRAN_NAMES = [
	'main',
	'master',
	'develop',
	'feature/login',
	'bugfix/header',
	'hotfix/api',
	'staging',
	'production'
];
const CONTAINERS = [
	'nginx',
	'redis',
	'postgres',
	'mongodb',
	'node',
	'alpine',
	'ubuntu',
	'mysql',
	'python',
	'go'
];
const FILE_NAMES = [
	'config',
	'index',
	'app',
	'server',
	'utils',
	'styles',
	'main',
	'test',
	'script'
];
const PROJECT_THEMES = ['Hyper', 'Turbo', 'Cyber', 'Delta', 'Quantum', 'Nexus', 'Prime', 'Zen'];

// --- List of REAL High-Quality Unique Tools (No generic variants) ---
export const DEV_UTILS: DevUtil[] = [
	// --- Thai Identity (🇹🇭 อัตลักษณ์ไทย) ---
	{
		id: 'th-id',
		name: 'เลขบัตรประชาชน',
		category: 'Thai Identity',
		icon: 'ri-id-card-line',
		generator: generateThaiID
	},
	{
		id: 'th-mobile',
		name: 'เบอร์มือถือไทย',
		category: 'Thai Identity',
		icon: 'ri-smartphone-line',
		generator: () => `0${randomItem(['6', '8', '9'])}${randomInt(10000000, 99999999)}`
	},
	{
		id: 'th-fullname-m',
		name: 'ชื่อ-นามสกุล (ชาย)',
		category: 'Thai Identity',
		icon: 'ri-user-line',
		generator: () =>
			randomItem([
				'อธิราช',
				'ปองพล',
				'กิตติศักดิ์',
				'ธนเดช',
				'วรวุฒิ',
				'อัครพล',
				'ภาณุพันธุ์',
				'พงศธร',
				'ธีรพงศ์',
				'นิธิคุณ'
			]) +
			' ' +
			randomItem([
				'มั่นคง',
				'เจริญลาภ',
				'รุ่งโรจน์',
				'รักษ์ชาติ',
				'โชคดี',
				'กิตติพงศ์',
				'เกียรติวงศ์',
				'เดโช'
			])
	},
	{
		id: 'th-fullname-f',
		name: 'ชื่อ-นามสกุล (หญิง)',
		category: 'Thai Identity',
		icon: 'ri-user-heart-line',
		generator: () =>
			randomItem([
				'พัชราภา',
				'กนกวรรณ',
				'สิริพร',
				'ชลธิชา',
				'นงลักษณ์',
				'พิชชาญา',
				'รชยา',
				'อลิสา',
				'นาลันทา',
				'แพรไหม'
			]) +
			' ' +
			randomItem([
				'ปรีชา',
				'มีสุข',
				'งามเหลือ',
				'เพริศพริ้ว',
				'รุ่งเรือง',
				'งามตา',
				'สิริเนตร',
				'เพ็ญพักตร์'
			])
	},
	{
		id: 'th-bank-acc',
		name: 'เลขบัญชีธนาคารสุ่ม',
		category: 'Thai Identity',
		icon: 'ri-bank-line',
		generator: () =>
			`${randomInt(100, 999)}-${randomInt(0, 9)}-${randomInt(10000, 99999)}-${randomInt(0, 9)}`
	},
	{
		id: 'th-company',
		name: 'ชื่อบริษัท (บจก.)',
		category: 'Thai Identity',
		icon: 'ri-building-line',
		generator: () => {
			if (Math.random() < 0.2) return 'บริษัท ฝากด้วย โลจิสติกส์ แอนด์ ดิจิทัล แพลตฟอร์ม จำกัด';
			return `บริษัท ${randomItem(PROJECT_THEMES)} ${randomItem(['คอร์ปอเรชั่น', 'อินเตอร์เนชั่นแนล', 'โปรดักชั่น', 'เทคโนโลยี', 'ไทย', 'เซอร์วิส', 'โซลูชั่น'])} จำกัด`;
		}
	},
	{
		id: 'th-prov',
		name: 'สุ่มจังหวัดในไทย',
		category: 'Thai Identity',
		icon: 'ri-map-pin-line',
		generator: () =>
			randomItem([
				'กรุงเทพฯ',
				'เชียงใหม่',
				'ขอนแก่น',
				'ภูเก็ต',
				'ชลบุรี',
				'นครราชสีมา',
				'นนทบุรี',
				'สมุทรปราการ',
				'อุบลราชธานี',
				'สงขลา',
				'นครปฐม',
				'ปทุมธานี'
			])
	},
	{
		id: 'th-plate',
		name: 'เลขทะเบียนรถ (กทม.)',
		category: 'Thai Identity',
		icon: 'ri-car-line',
		generator: () =>
			`${randomInt(1, 9)}${randomItem(['กข', 'สส', 'รย', 'วพ', 'ฮฮ', 'ชช', 'นข', 'มข'])}-${randomInt(100, 9999)}`
	},
	{
		id: 'th-address-bkk',
		name: 'ที่อยู่สุ่ม (กทม.)',
		category: 'Thai Identity',
		icon: 'ri-map-2-line',
		generator: () =>
			`${randomInt(1, 500)}/${randomInt(1, 100)} ถ.${randomItem(['สุขุมวิท', 'พหลโยธิน', 'รัชดาภิเษก', 'วิภาวดีรังสิต', 'พระราม 4'])} เขต${randomItem(['พญาไท', 'จตุจักร', 'บางรัก', 'ปทุมวัน', 'ราชเทวี', 'ห้วยขวาง'])}`
	},
	{
		id: 'th-passport',
		name: 'เลขพาสปอร์ตไทย',
		category: 'Thai Identity',
		icon: 'ri-passport-line',
		generator: () => `AA${randomInt(1000000, 9999999)}`
	},
	{
		id: 'th-isbn',
		name: 'ISBN-13 (Prefix ไทย)',
		category: 'Thai Identity',
		icon: 'ri-book-line',
		generator: () => `978-616-${randomInt(1000, 9999)}-${randomInt(0, 9)}`
	},
	{
		id: 'th-ean-13',
		name: 'Barcode EAN-13 (ไทย)',
		category: 'Thai Identity',
		icon: 'ri-barcode-line',
		generator: () => `885${randomInt(1000000000, 9999999999)}`
	},
	{
		id: 'th-stock-symbol',
		name: 'สุ่มชื่อหุ้น (SET/MAI)',
		category: 'Thai Identity',
		icon: 'ri-funds-line',
		generator: () =>
			randomItem([
				'PTT',
				'CPALL',
				'ADVANC',
				'AOT',
				'KBANK',
				'SCB',
				'SCC',
				'BDMS',
				'BBL',
				'GULF',
				'OR',
				'DELTA'
			]) + (randomInt(0, 1) ? '-R' : '')
	},
	{
		id: 'th-university',
		name: 'สุ่มชื่อมหาวิทยาลัย',
		category: 'Thai Identity',
		icon: 'ri-graduation-cap-line',
		generator: () =>
			randomItem([
				'จุฬาลงกรณ์',
				'ธรรมศาสตร์',
				'เกษตรศาสตร์',
				'มหิดล',
				'ศิลปากร',
				'ขอนแก่น',
				'เชียงใหม่',
				'สงขลานครินทร์',
				'พระจอมเกล้าฯ ลาดกระบัง',
				'มศว'
			]) + 'มหาวิทยาลัย'
	},
	{
		id: 'th-gov-id',
		name: 'รหัส อปท. (ราชการ)',
		category: 'Thai Identity',
		icon: 'ri-government-line',
		generator: () => `DLA-${randomInt(1000, 9999)}-${randomInt(10, 99)}`
	},
	{
		id: 'th-bank-scb',
		name: 'เลขบัญชี SCB Mock',
		category: 'Thai Identity',
		icon: 'ri-bank-line',
		generator: () => `0${randomInt(10, 99)}-2-${randomInt(10000, 99999)}-${randomInt(0, 9)}`
	},
	{
		id: 'th-bank-kbot',
		name: 'เลขบัญชี KBank Mock',
		category: 'Thai Identity',
		icon: 'ri-bank-line',
		generator: () => `0${randomInt(10, 99)}-8-${randomInt(10000, 99999)}-${randomInt(0, 9)}`
	},
	{
		id: 'th-postcode',
		name: 'รหัสไปรษณีย์ไทย',
		category: 'Thai Identity',
		icon: 'ri-mail-line',
		generator: () => `${randomInt(10, 99)}${randomInt(0, 9)}00`
	},
	{
		id: 'th-tel',
		name: 'เบอร์บ้าน (02/03/05/07)',
		category: 'Thai Identity',
		icon: 'ri-phone-line',
		generator: () => `0${randomItem(['2', '3', '5', '7'])}${randomInt(1000000, 9999999)}`
	},
	{
		id: 'th-promptpay-id',
		name: 'PromptPay (เลขบัตร)',
		category: 'Thai Identity',
		icon: 'ri-qr-code-line',
		generator: generateThaiID
	},

	// --- Networking (🌐 ระบบเครือข่าย) ---
	{
		id: 'net-ipv4',
		name: 'IPv4 Address (Public)',
		category: 'Networking',
		icon: 'ri-global-line',
		generator: () =>
			`${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`
	},
	{
		id: 'net-ipv4-local',
		name: 'IPv4 Address (Local)',
		category: 'Networking',
		icon: 'ri-home-wifi-line',
		generator: () => `192.168.${randomInt(0, 255)}.${randomInt(1, 254)}`
	},
	{
		id: 'net-ipv6',
		name: 'IPv6 Address Full',
		category: 'Networking',
		icon: 'ri-global-line',
		generator: () => Array.from({ length: 8 }, () => randomHex(4)).join(':')
	},
	{
		id: 'net-mac',
		name: 'MAC Addressสุ่ม',
		category: 'Networking',
		icon: 'ri-cpu-line',
		generator: () => Array.from({ length: 6 }, () => randomHex(2).toUpperCase()).join(':')
	},
	{
		id: 'net-port',
		name: 'Random Port (Range)',
		category: 'Networking',
		icon: 'ri-plug-line',
		generator: () => randomInt(1024, 65535).toString()
	},
	{
		id: 'net-ua-pc',
		name: 'User Agent (PC)',
		category: 'Networking',
		icon: 'ri-computer-line',
		generator: () =>
			`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomInt(110, 122)}.0.0.0 Safari/537.36`
	},
	{
		id: 'net-ua-mobile',
		name: 'User Agent (Mobile)',
		category: 'Networking',
		icon: 'ri-smartphone-line',
		generator: () =>
			`Mozilla/5.0 (iPhone; CPU iPhone OS ${randomInt(15, 17)}_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${randomInt(15, 17)}.0 Mobile/15E148 Safari/604.1`
	},
	{
		id: 'net-url',
		name: 'Random API Endpoint',
		category: 'Networking',
		icon: 'ri-links-line',
		generator: () =>
			`https://${randomItem(['api', 'v1', 'web', 'dev'])}.${randomItem(['example', 'mock', 'test'])}.io/v2/${randomItem(['users', 'orders', 'products', 'auth'])}/${randomHex(8)}`
	},
	{
		id: 'net-subdomain',
		name: 'สุ่ม Subdomain ชื่อเท่ๆ',
		category: 'Networking',
		icon: 'ri-links-line',
		generator: () =>
			`${randomItem(['stg', 'beta', 'dev', 'portal', 'admin', 'docs', 'v2', 'alpha'])}.myapp.com`
	},
	{
		id: 'net-proxy',
		name: 'สุ่ม Proxy Config',
		category: 'Networking',
		icon: 'ri-server-line',
		generator: () =>
			`http://${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}:${randomInt(3128, 8080)}`
	},
	{
		id: 'net-header-agent',
		name: 'Header: User-Agentสุ่ม',
		category: 'Networking',
		icon: 'ri-article-line',
		generator: () =>
			`User-Agent: ExplorerBot/${randomInt(1, 5)}.${randomInt(0, 9)} (${randomItem(['Linux', 'Darwin', 'Win32'])})`
	},
	{
		id: 'net-header-cors',
		name: 'Header: CORS Originสุ่ม',
		category: 'Networking',
		icon: 'ri-shield-user-line',
		generator: () =>
			`Access-Control-Allow-Origin: ${randomItem(['*', 'https://app.io', 'https://api.myapp.com'])}`
	},
	{
		id: 'net-ws-url',
		name: 'WebSocket Serverสุ่ม',
		category: 'Networking',
		icon: 'ri-bubble-chart-line',
		generator: () =>
			`wss://${randomItem(['ws', 'stream', 'realtime'])}.${randomItem(PROJECT_THEMES).toLowerCase()}.io/v${randomInt(1, 3)}/connect`
	},
	{
		id: 'net-api-res',
		name: 'Mock API Responseสุ่ม',
		category: 'Networking',
		icon: 'ri-braces-line',
		generator: () =>
			JSON.stringify({
				code: randomItem([200, 201, 400, 404, 500]),
				status: randomItem(['ok', 'error', 'loading']),
				payload: { ref: randomHex(6) }
			})
	},
	{
		id: 'net-dns-a',
		name: 'DNS A Recordสุ่ม',
		category: 'Networking',
		icon: 'ri-earth-line',
		generator: () =>
			`${randomItem(['ns1', 'ns2', 'web', 'api'])}.example.com. IN A ${randomInt(1, 223)}.${randomInt(0, 255)}.0.1`
	},
	{
		id: 'net-mimetype',
		name: 'MimeType แบบไม่ซ้ำ',
		category: 'Networking',
		icon: 'ri-file-line',
		generator: () =>
			randomItem([
				'application/pdf',
				'image/webp',
				'video/mp4',
				'application/zip',
				'audio/mpeg',
				'text/markdown'
			])
	},
	{
		id: 'net-ssh-port',
		name: 'SSH Login Commandสุ่ม',
		category: 'Networking',
		icon: 'ri-terminal-window-line',
		generator: () =>
			`ssh -i ~/.ssh/id_rsa_${randomItem(['key', 'prod'])} root@${randomInt(10, 223)}.0.1 -p ${randomInt(22, 2222)}`
	},
	{
		id: 'net-cidr',
		name: 'CIDR Blockสุ่ม',
		category: 'Networking',
		icon: 'ri-radar-line',
		generator: () => `10.${randomInt(0, 255)}.0.0/${randomItem(['16', '24', '28'])}`
	},
	{
		id: 'net-cookie',
		name: 'Set-Cookie Headerสุ่ม',
		category: 'Networking',
		icon: 'ri-cookie-line',
		generator: () => `_sess=${randomHex(32)}; Domain=myapp.com; Path=/; Secure; HttpOnly`
	},
	{
		id: 'net-grpc',
		name: 'gRPC Service Nameสุ่ม',
		category: 'Networking',
		icon: 'ri-node-tree',
		generator: () =>
			`pb.${randomItem(PROJECT_THEMES).toLowerCase()}.v1.DataService/${randomItem(['Query', 'Push', 'Verify'])}`
	},

	// --- Security & Identifiers (🔒 ความปลอดภัย) ---
	{
		id: 'sec-uuid-v4',
		name: 'UUID v4 (Random)',
		category: 'Security & Identifiers',
		icon: 'ri-fingerprint-line',
		generator: () => safeUUID()
	},
	{
		id: 'sec-uuid-v7',
		name: 'UUID v7 (Sortable)',
		category: 'Security & Identifiers',
		icon: 'ri-time-line',
		generator: () => '018f9a2e-5264-7bc1-' + randomHex(4) + '-' + randomHex(12)
	},
	{
		id: 'sec-nanoid',
		name: 'NanoIDสุ่ม (21ตัว)',
		category: 'Security & Identifiers',
		icon: 'ri-key-line',
		generator: () =>
			Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 13)
	},
	{
		id: 'sec-mongo-id',
		name: 'MongoDB ObjectIDสุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-database-2-line',
		generator: () => randomHex(24)
	},
	{
		id: 'sec-sha256',
		name: 'SHA-256 Mockสุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-fingerprint-line',
		generator: () => randomHex(64)
	},
	{
		id: 'sec-jwt',
		name: 'JWT Mock (Header.Pay.Sig)',
		category: 'Security & Identifiers',
		icon: 'ri-key-line',
		generator: () =>
			`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${safeBtoa(JSON.stringify({ uid: randomHex(8), exp: Date.now() + 3600 }))}.${randomHex(32)}`
	},
	{
		id: 'sec-api-sk',
		name: 'API Key (sk_...)สุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-lock-line',
		generator: () => `sk_${randomItem(['live', 'test'])}_${randomHex(32)}`
	},
	{
		id: 'sec-pass',
		name: 'รหัสผ่านแกร่ง (16ตัว)',
		category: 'Security & Identifiers',
		icon: 'ri-lock-password-line',
		generator: () =>
			`${randomHex(4).toUpperCase()}!${randomHex(4)}$${randomInt(10, 99)}${randomItem(['@', '#', '*'])}`
	},
	{
		id: 'sec-otp',
		name: 'OTPสุ่ม (6 หลัก)',
		category: 'Security & Identifiers',
		icon: 'ri-lock-line',
		generator: () => randomInt(111111, 999999).toString()
	},
	{
		id: 'sec-bcrypt',
		name: 'Bcrypt Hash Formatสุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-shield-keyhole-line',
		generator: () => `$2a$12$${randomHex(22)}${randomHex(31)}`
	},
	{
		id: 'sec-ulid',
		name: 'ULID (Time Filterable)',
		category: 'Security & Identifiers',
		icon: 'ri-sort-asc',
		generator: () => `01H${randomInt(100, 999)}${randomHex(8).toUpperCase()}`
	},
	{
		id: 'sec-snowflake',
		name: 'Snowflake ID (64bit)',
		category: 'Security & Identifiers',
		icon: 'ri-snowflake-line',
		generator: () => ((BigInt(Date.now()) << 22n) | BigInt(randomInt(0, 1023))).toString()
	},
	{
		id: 'sec-recovery',
		name: 'Recovery Codeสุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-shield-user-line',
		generator: () => `${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}`.toUpperCase()
	},
	{
		id: 'sec-state',
		name: 'OAuth2 State Stringสุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-exchange-line',
		generator: () => randomHex(16)
	},
	{
		id: 'sec-iv',
		name: 'Encryption IV (16B)',
		category: 'Security & Identifiers',
		icon: 'ri-shield-flash-line',
		generator: () => randomHex(32)
	},
	{
		id: 'sec-argon2',
		name: 'Argon2 ID Hash Mock',
		category: 'Security & Identifiers',
		icon: 'ri-shield-line',
		generator: () => `$argon2id$v=19$m=4096,t=3,p=1$${randomHex(16)}$${randomHex(32)}`
	},
	{
		id: 'sec-paseto',
		name: 'Paseto Token V4สุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-key-2-line',
		generator: () => `v4.local.${randomHex(48)}`
	},
	{
		id: 'sec-md5',
		name: 'MD5 Mock Hashสุ่ม',
		category: 'Security & Identifiers',
		icon: 'ri-fingerprint-line',
		generator: () => randomHex(32)
	},
	{
		id: 'sec-nonce',
		name: 'Safe Nonce (12B)',
		category: 'Security & Identifiers',
		icon: 'ri-magic-line',
		generator: () => randomHex(24)
	},
	{
		id: 'sec-stripe',
		name: 'Stripe Mock Token',
		category: 'Security & Identifiers',
		icon: 'ri-bank-card-line',
		generator: () => `tok_${randomItem(['visa', 'mastercard'])}_${randomHex(24)}`
	},

	// --- UI & Styling (🎨 งานดีไซน์) ---
	{
		id: 'ui-hex',
		name: 'สี Hex (Modern)',
		category: 'UI & Styling',
		icon: 'ri-palette-line',
		generator: () => `#${randomInt(0, 16777215).toString(16).padStart(6, '0')}`
	},
	{
		id: 'ui-shadow',
		name: 'เงานุ่มๆ Soft Shadowสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-shadow-line',
		generator: () =>
			`0 ${randomInt(4, 12)}px ${randomInt(20, 50)}px -${randomInt(5, 10)}px rgba(0,0,0,0.15)`
	},
	{
		id: 'ui-glass',
		name: 'Glassmorphism Styleสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-blur-off-line',
		generator: () =>
			`background: rgba(255, 255, 255, 0.${randomInt(1, 2)}); backdrop-filter: blur(${randomInt(5, 15)}px); border: 1px solid rgba(255, 255, 255, 0.1);`
	},
	{
		id: 'ui-grad',
		name: 'Gradient (Deg)สุ่ม',
		category: 'UI & Styling',
		icon: 'ri-rainbow-line',
		generator: () => `linear-gradient(${randomInt(0, 360)}deg, #${randomHex(6)}, #${randomHex(6)})`
	},
	{
		id: 'ui-radius',
		name: 'Fancy Border Radiusสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-shape-line',
		generator: () =>
			`${randomInt(20, 80)}% ${randomInt(20, 80)}% ${randomInt(20, 80)}% ${randomInt(20, 80)}% / ${randomInt(20, 80)}% ${randomInt(20, 80)}% ${randomInt(20, 80)}% ${randomInt(20, 80)}%`
	},
	{
		id: 'ui-bezier',
		name: 'Bezier Curveสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-pulse-line',
		generator: () =>
			`cubic-bezier(${Math.random().toFixed(2)}, ${Math.random().toFixed(2)}, ${Math.random().toFixed(2)}, ${Math.random().toFixed(2)})`
	},
	{
		id: 'ui-tw-color',
		name: 'Tailwind Color Utilityสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-palette-line',
		generator: () =>
			`${randomItem(['blue', 'emerald', 'amber', 'rose', 'cyan', 'violet'])}-${randomItem(['400', '500', '600', '700'])}`
	},
	{
		id: 'ui-gap',
		name: 'Tailwind Gapสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-layout-right-line',
		generator: () => `gap-${randomItem(['1', '2', '4', '6', '8', '12', '16', '20'])}`
	},
	{
		id: 'ui-grid',
		name: 'Grid Template Colsสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-grid-line',
		generator: () =>
			`grid-template-columns: repeat(${randomInt(2, 5)}, 1fr); gap: ${randomInt(4, 24)}px;`
	},
	{
		id: 'ui-clamp',
		name: 'CSS Clamp Textสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-text-spacing',
		generator: () => `font-size: clamp(1rem, ${randomInt(2, 5)}vw, 3.5rem);`
	},
	{
		id: 'ui-shadow-layered',
		name: 'Layered Shadowสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-shadow-line',
		generator: () => {
			const op = () => (Math.random() * 0.15 + 0.05).toFixed(2);
			return `0 1px 1px rgba(0,0,0,${op()}), 0 2px 2px rgba(0,0,0,${op()}), 0 4px 4px rgba(0,0,0,${op()}), 0 8px 8px rgba(0,0,0,${op()}), 0 16px 16px rgba(0,0,0,${op()})`;
		}
	},
	{
		id: 'ui-neon',
		name: 'Neon Glow Textสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-flashlight-line',
		generator: () => `text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #${randomHex(6)};`
	},
	{
		id: 'ui-aspect',
		name: 'Aspect Ratioสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-aspect-ratio-line',
		generator: () => `aspect-ratio: ${randomItem(['1/1', '4/3', '16/9', '9/16', '21/9'])}`
	},
	{
		id: 'ui-backdrop',
		name: 'Backdrop Filterสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-magic-line',
		generator: () =>
			`backdrop-filter: blur(${randomInt(4, 12)}px) saturate(${randomInt(100, 180)}%);`
	},
	{
		id: 'ui-zindex',
		name: 'Z-Index Tierสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-layers-line',
		generator: () => `z-index: ${randomItem(['10', '50', '100', '999', '9999'])};`
	},
	{
		id: 'ui-blend',
		name: 'Mix Blend Modeสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-scissors-2-line',
		generator: () =>
			`mix-blend-mode: ${randomItem(['multiply', 'overlay', 'screen', 'color-dodge', 'difference'])}`
	},
	{
		id: 'ui-font',
		name: 'Font Stackสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-font-family',
		generator: () =>
			randomItem([
				'"Inter", sans-serif',
				'ui-monospace, monospace',
				'"Montserrat", sans-serif',
				'"Roboto", sans-serif'
			])
	},
	{
		id: 'ui-border',
		name: 'Fancy Dashed Borderสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-border-bottom-line',
		generator: () =>
			`border: ${randomInt(2, 5)}px dashed #${randomHex(6)}; border-radius: ${randomInt(8, 20)}px;`
	},
	{
		id: 'ui-animate',
		name: 'Anim Delayสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-time-line',
		generator: () => `animation-delay: ${randomInt(100, 2000)}ms;`
	},
	{
		id: 'ui-padding',
		name: 'CSS Paddingสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-terminal-line',
		generator: () => `padding: ${randomInt(0, 40)}px ${randomInt(0, 40)}px;`
	},
	{
		id: 'ui-flex-dir',
		name: 'Flex Directionสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-layout-masonry-line',
		generator: () =>
			`flex-direction: ${randomItem(['row', 'column', 'row-reverse', 'column-reverse'])};`
	},
	{
		id: 'ui-flex-wrap',
		name: 'Flex Wrapสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-command-line',
		generator: () => `flex-wrap: ${randomItem(['wrap', 'nowrap', 'wrap-reverse'])};`
	},
	{
		id: 'ui-justify',
		name: 'Justify Contentสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-align-center',
		generator: () =>
			`justify-content: ${randomItem(['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'])};`
	},
	{
		id: 'ui-align',
		name: 'Align Itemsสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-align-vertically',
		generator: () =>
			`align-items: ${randomItem(['flex-start', 'flex-end', 'center', 'baseline', 'stretch'])};`
	},
	{
		id: 'ui-align-self',
		name: 'Align Self (Individual)สุ่ม',
		category: 'UI & Styling',
		icon: 'ri-align-bottom',
		generator: () =>
			`align-self: ${randomItem(['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'])};`
	},
	{
		id: 'ui-flex-grow',
		name: 'Flex Growสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-expand-left-right-line',
		generator: () => `flex-grow: ${randomItem(['0', '1', '2', '3'])};`
	},
	{
		id: 'ui-order',
		name: 'Flex/Grid Orderสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-sort-desc',
		generator: () => `order: ${randomInt(-1, 5)};`
	},
	{
		id: 'ui-skeleton',
		name: 'Skeleton Loader Configสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-loader-line',
		generator: () => {
			const modes = ['card', 'list', 'profile'];
			const mode = randomItem(modes);
			const radius = randomInt(0, 1) ? `${randomInt(4, 16)}px` : '9999px';
			const speed = (randomInt(12, 25) / 10).toFixed(1);
			const color = randomItem(['#f1f5f9', '#e2e8f0', '#cbd5e1', '#e5e7eb']);
			return `/* Mode: ${mode} */\n.skeleton-item {\n  background: ${color};\n  border-radius: ${radius};\n  animation: shimmer ${speed}s infinite ease-in-out alternate;\n}`;
		}
	},
	{
		id: 'ui-badge',
		name: 'Modern Badge Styleสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-notification-3-line',
		generator: () =>
			`display: inline-flex; items-center; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #${randomHex(6)}20; color: #${randomHex(6)}; border: 1px solid currentColor;`
	},
	{
		id: 'ui-input',
		name: 'Modern Input Styleสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-input-cursor-move',
		generator: () =>
			`background: transparent; border: ${randomInt(1, 2)}px solid #${randomHex(6)}; border-radius: ${randomInt(8, 16)}px; padding: 10px 15px; outline: none; transition: border-color 0.2s;`
	},
	{
		id: 'ui-text-grad',
		name: 'Text Gradient Effectสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-text-color',
		generator: () =>
			`background: linear-gradient(${randomInt(0, 360)}deg, #${randomHex(6)}, #${randomHex(6)}); -webkit-background-clip: text; color: transparent;`
	},
	{
		id: 'ui-bg-pattern',
		name: 'Background Patternสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-layout-grid-line',
		generator: () =>
			`background-image: radial-gradient(#${randomHex(6)} 0.5px, transparent 0.5px); background-size: ${randomInt(10, 30)}px ${randomInt(10, 30)}px;`
	},
	{
		id: 'ui-filter',
		name: 'Modern Image Filterสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-image-edit-line',
		generator: () =>
			`filter: blur(${randomInt(0, 5)}px) saturate(${randomInt(50, 200)}%) contrast(${randomInt(80, 120)}%) grayscale(${randomInt(0, 100)}%);`
	},
	{
		id: 'ui-letter-spacing',
		name: 'Letter Spacingสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-text-spacing',
		generator: () =>
			`letter-spacing: ${randomItem(['-0.05em', '-0.02em', '0', '0.05em', '0.1em', '0.25em'])};`
	},
	{
		id: 'ui-line-height',
		name: 'Line Heightสุ่ม',
		category: 'UI & Styling',
		icon: 'ri-menu-5-line',
		generator: () => `line-height: ${randomItem(['1', '1.25', '1.5', '1.625', '2'])};`
	},

	// --- QA & Testing (🧪 เคสประหลาด) ---
	{
		id: 'qa-zalgo',
		name: 'Zalgo Text (หลอน)สุ่ม',
		category: 'QA & Testing',
		icon: 'ri-skull-line',
		generator: () =>
			'H̸̞͘e̸͓̾e̸͓̾ḽ̵̈́o̸̲͒' +
			randomHex(2)
				.split('')
				.map((c) => c + '\u030D')
				.join('')
	},
	{
		id: 'qa-xss',
		name: 'XSS Injectionสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-bug-line',
		generator: () =>
			randomItem([
				'<img src=x onerror=alert(1)>',
				'<svg onload=alert(1)>',
				'"><script>alert(1)</script>'
			])
	},
	{
		id: 'qa-sql',
		name: 'SQL Injectionสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-database-2-line',
		generator: () => randomItem(["' OR '1'='1", "'; DROP TABLE users; --", "' UNION SELECT NULL--"])
	},
	{
		id: 'qa-emoji',
		name: 'Emoji Spamสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-emotion-line',
		generator: () => randomItem(['🚀', '🔥', '💎', '✨', '🌈']).repeat(randomInt(30, 100))
	},
	{
		id: 'qa-long',
		name: 'ข้อความยาวมากสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-text-spacing',
		generator: () => 'A'.repeat(randomInt(5000, 15000))
	},
	{
		id: 'qa-zwsp',
		name: 'Zero Width Spaceสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-ghost-line',
		generator: () => '\u200B'.repeat(randomInt(1, 8))
	},
	{
		id: 'qa-rtl',
		name: 'RTL/LTR Mixedสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-遣-line',
		generator: () => 'Hi ' + '\u202E' + 'Invis' + '\u202D' + ' End'
	},
	{
		id: 'qa-path',
		name: 'Path Traversalสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-folder-reduce-line',
		generator: () => '../'.repeat(randomInt(3, 8)) + 'etc/passwd'
	},
	{
		id: 'qa-json',
		name: 'Deep Nested JSONสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-braces-line',
		generator: () => '{"a":'.repeat(25) + '1' + '}'.repeat(25)
	},
	{
		id: 'qa-max',
		name: 'Max Safe Integerสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-numbers-line',
		generator: () => Number.MAX_SAFE_INTEGER.toString()
	},
	{
		id: 'qa-bom',
		name: 'BOM Characterสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-file-search-line',
		generator: () => '\uFEFF' + 'Data'
	},
	{
		id: 'qa-null',
		name: 'Null Byte (\0)สุ่ม',
		category: 'QA & Testing',
		icon: 'ri-forbid-line',
		generator: () => 'admin\0secret'
	},
	{
		id: 'qa-unicode',
		name: 'Fullwidth Unicodeสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-font-family',
		generator: () => 'Ｈｅｌｌｏ'
	},
	{
		id: 'qa-csv',
		name: 'CSV Injectionสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-file-excel-line',
		generator: () => "=cmd|' /C calc'!A0"
	},
	{
		id: 'qa-redo',
		name: 'ReDoS Regex Bombสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-fire-line',
		generator: () => '(a+)+$'
	},
	{
		id: 'qa-broken',
		name: 'Broken UTF-8สุ่ม',
		category: 'QA & Testing',
		icon: 'ri-error-warning-line',
		generator: () => '\xc3\x28'
	},
	{
		id: 'qa-nan',
		name: 'NaN / Inf / Nullสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-question-mark',
		generator: () => randomItem(['NaN', 'Infinity', 'null', 'undefined'])
	},
	{
		id: 'qa-tag',
		name: 'Unclosed HTMLสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-code-line',
		generator: () => '<div><p><span>Hello'
	},
	{
		id: 'qa-space',
		name: 'Whitespace Mixedสุ่ม',
		category: 'QA & Testing',
		icon: 'ri-space',
		generator: () => 'L' + '\u00A0\u1680\u2000' + 'R'
	},
	{
		id: 'qa-huge64',
		name: 'Huge Base64สุ่ม',
		category: 'QA & Testing',
		icon: 'ri-file-code-line',
		generator: () => safeBtoa(randomHex(800))
	},

	// --- DevOps & CLI (🛠️ สายลุย) ---
	{
		id: 'dev-docker',
		name: 'Docker Run Commandสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-docker-line',
		generator: () =>
			`docker run -d -p ${randomInt(8000, 9000)}:80 --name ${randomItem(PROJECT_THEMES).toLowerCase()}_${randomHex(4)} ${randomItem(CONTAINERS)}:latest`
	},
	{
		id: 'dev-git',
		name: 'Git Commit Msgสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-git-commit-line',
		generator: () =>
			`${randomItem(['feat', 'fix', 'chore'])}(${randomItem(['ui', 'api'])}): update ${randomItem(['config', 'logic'])}#${randomInt(100, 999)}`
	},
	{
		id: 'dev-npm',
		name: 'NPM Installสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-npmjs-line',
		generator: () =>
			`npm install ${randomItem(['zod', 'axios', 'lodash', 'vitest', 'svelte'])}@latest`
	},
	{
		id: 'dev-k8s',
		name: 'Kubectl Getสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-terminal-line',
		generator: () =>
			`kubectl get ${randomItem(['pods', 'svc', 'deploy'])} -n ${randomItem(['default', 'prod', 'stg'])}`
	},
	{
		id: 'dev-ssh',
		name: 'SSH Login Mockสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-key-line',
		generator: () => `ssh root@${randomInt(10, 223)}.0.1 -p ${randomInt(22, 2222)}`
	},
	{
		id: 'dev-tar',
		name: 'Tar gz Commandสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-file-zip-line',
		generator: () => `tar -czvf backup_${randomHex(4)}.tar.gz ./src`
	},
	{
		id: 'dev-grep',
		name: 'Fine & Grepสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-search-eye-line',
		generator: () => `find . -type f -name "*.ts" | xargs grep "${randomItem(['TODO', 'FIXME'])}"`
	},
	{
		id: 'dev-chmod',
		name: 'Chmodสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-lock-unlock-line',
		generator: () => `chmod ${randomItem(['755', '644', '777'])} script.sh`
	},
	{
		id: 'dev-aws',
		name: 'S3 Syncสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-cloud-line',
		generator: () => `aws s3 sync ./dist s3://${randomItem(PROJECT_THEMES).toLowerCase()}-bucket`
	},
	{
		id: 'dev-curl',
		name: 'cURL Requestสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-terminal-box-line',
		generator: () => `curl -X POST https://api.io/v1/data -H "Auth: Bearer ${randomHex(16)}"`
	},
	{
		id: 'dev-prune',
		name: 'Docker Pruneสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-delete-bin-3-line',
		generator: () => `docker ${randomItem(['system', 'container', 'image'])} prune -f`
	},
	{
		id: 'dev-gh',
		name: 'GH Cloneสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-github-line',
		generator: () =>
			`gh repo clone ${randomItem(['vercel', 'google', 'facebook'])}/app-${randomHex(4)}`
	},
	{
		id: 'dev-pnpm',
		name: 'PNPM Runสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-nodejs-line',
		generator: () => `pnpm ${randomItem(['dev', 'build', 'test', 'lint', 'format'])}`
	},
	{
		id: 'dev-rsync',
		name: 'Rsync Syncสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-save-line',
		generator: () => `rsync -avz ./src/ user@server:/app/`
	},
	{
		id: 'dev-tf',
		name: 'Terraform Workflowสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-cloud-fill',
		generator: () => `terraform ${randomItem(['plan', 'apply', 'init', 'destroy'])}`
	},
	{
		id: 'dev-brew',
		name: 'Brew Commandsสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-cup-line',
		generator: () => `brew ${randomItem(['doctor', 'cleanup', 'update', 'upgrade', 'outdated'])}`
	},
	{
		id: 'dev-lsof',
		name: 'Find Process Portสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-list-check',
		generator: () => `lsof -i :${randomItem(['3000', '5000', '8080'])}`
	},
	{
		id: 'dev-cron',
		name: 'Cron Expสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-time-line',
		generator: () => `*/${randomInt(5, 30)} * * * *`
	},
	{
		id: 'dev-env',
		name: 'Env Exportสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-terminal-line',
		generator: () => `export APP_ID=${randomHex(8)}`
	},
	{
		id: 'dev-alias',
		name: 'Aliasสุ่ม',
		category: 'DevOps & CLI',
		icon: 'ri-command-line',
		generator: () => `alias g='git commit -m "${randomHex(4)}"'`
	},

	// --- Data & Database (🏗️ ระบบฐานข้อมูล) ---
	{
		id: 'db-sql',
		name: 'SQL Insertสุ่ม',
		category: 'Data & Database',
		icon: 'ri-database-line',
		generator: () =>
			`INSERT INTO users (id, name) VALUES (${randomInt(1, 999)}, 'User_${randomHex(4)}');`
	},
	{
		id: 'db-json',
		name: 'JSON Mock Itemสุ่ม',
		category: 'Data & Database',
		icon: 'ri-braces-line',
		generator: () => JSON.stringify({ id: safeUUID(), title: randomItem(PROJECT_THEMES) })
	},
	{
		id: 'db-mongo',
		name: 'Mongo Filterสุ่ม',
		category: 'Data & Database',
		icon: 'ri-database-2-line',
		generator: () =>
			`db.col.find({ status: "${randomItem(['active', 'pending'])}", age: { $gt: ${randomInt(18, 50)} } })`
	},
	{
		id: 'db-prisma',
		name: 'Prisma Modelสุ่ม',
		category: 'Data & Database',
		icon: 'ri-folders-line',
		generator: () => `model ${randomItem(PROJECT_THEMES)} {\n  id Int @id\n  name String\n}`
	},
	{
		id: 'db-redis',
		name: 'Redis Commandสุ่ม',
		category: 'Data & Database',
		icon: 'ri-flashlight-line',
		generator: () => `SET cache:${randomHex(4)} "${randomHex(16)}" EX 3600`
	},
	{
		id: 'db-graphql',
		name: 'GraphQL Queryสุ่ม',
		category: 'Data & Database',
		icon: 'ri-bubble-chart-line',
		generator: () => `query { user(id: ${randomInt(1, 100)}) { id name email } }`
	},
	{
		id: 'db-csv',
		name: 'CSV Rowสุ่ม',
		category: 'Data & Database',
		icon: 'ri-file-text-line',
		generator: () => `id,name,role\n${randomInt(1, 99)},User_${randomHex(4)},admin`
	},
	{
		id: 'db-sqlite',
		name: 'SQLite Createสุ่ม',
		category: 'Data & Database',
		icon: 'ri-file-list-3-line',
		generator: () => `CREATE TABLE tbl_${randomHex(2)} (id INTEGER, val TEXT);`
	},
	{
		id: 'db-pg',
		name: 'Postgres Linkสุ่ม',
		category: 'Data & Database',
		icon: 'ri-links-line',
		generator: () => `postgresql://usr:${randomHex(8)}@localhost:5432/db`
	},
	{
		id: 'db-fire',
		name: 'Firebase Pathสุ่ม',
		category: 'Data & Database',
		icon: 'ri-fire-line',
		generator: () => `/users/${randomHex(16)}/data`
	},
	{
		id: 'db-knex',
		name: 'Knex Migrationสุ่ม',
		category: 'Data & Database',
		icon: 'ri-hammer-line',
		generator: () => `table.string('${randomItem(['key', 'val', 'hash'])}');`
	},
	{
		id: 'db-influx',
		name: 'InfluxDB Lineสุ่ม',
		category: 'Data & Database',
		icon: 'ri-line-chart-line',
		generator: () => `usage,host=srv val=${Math.random().toFixed(2)}`
	},
	{
		id: 'db-elastic',
		name: 'Elastic Indexสุ่ม',
		category: 'Data & Database',
		icon: 'ri-search-2-line',
		generator: () => `PUT /logs/_doc/${randomHex(4)} { "ts": "${new Date().toISOString()}" }`
	},
	{
		id: 'db-cass',
		name: 'Cassandra CQLสุ่ม',
		category: 'Data & Database',
		icon: 'ri-database-line',
		generator: () => `INSERT INTO users (id) VALUES (${safeUUID()});`
	},
	{
		id: 'db-neo',
		name: 'Neo4j Cypherสุ่ม',
		category: 'Data & Database',
		icon: 'ri-node-tree',
		generator: () => `CREATE (n:P {name: '${randomHex(4)}'})`
	},
	{
		id: 'db-dyna',
		name: 'DynamoDB Itemสุ่ม',
		category: 'Data & Database',
		icon: 'ri-cloud-line',
		generator: () => `{"id": {"S": "${randomHex(8)}"}, "v": {"N": "${randomInt(1, 99)}"}}`
	},
	{
		id: 'db-update',
		name: 'SQL Updateสุ่ม',
		category: 'Data & Database',
		icon: 'ri-edit-line',
		generator: () => `UPDATE users SET status = 'active' WHERE id = ${randomInt(1, 999)};`
	},
	{
		id: 'db-go',
		name: 'Go SQL Tagสุ่ม',
		category: 'Data & Database',
		icon: 'ri-code-line',
		generator: () =>
			`\`db:"${randomItem(['id', 'name', 'key'])}" json:"${randomItem(['id', 'name', 'key'])}"\``
	},
	{
		id: 'db-diesel',
		name: 'Diesel Schemaสุ่ม',
		category: 'Data & Database',
		icon: 'ri-file-settings-line',
		generator: () => `table! { users (id) { id -> Int4 } }`
	},
	{
		id: 'db-slow',
		name: 'Slow Log Mockสุ่ม',
		category: 'Data & Database',
		icon: 'ri-timer-flash-line',
		generator: () => `# Query_time: ${randomInt(1, 5)}.01`
	},

	// --- Miscellaneous (🕶️ อื่นๆ) ---
	{
		id: 'misc-project',
		name: 'สุ่มชื่อโปรเจกต์เท่ๆ',
		category: 'Miscellaneous',
		icon: 'ri-flashlight-line',
		generator: () =>
			`${randomItem(PROJECT_THEMES)}${randomItem(['Labs', 'System', 'Core', 'Nexus', 'Flow'])}`
	},
	{
		id: 'misc-theme',
		name: 'สุ่มธีม VSCode แนะนำ',
		category: 'Miscellaneous',
		icon: 'ri-palette-line',
		generator: () =>
			randomItem(['One Dark Pro', 'Catppuccin', 'Dracula', 'GitHub Dark', 'Tokyo Night'])
	},
	{
		id: 'misc-coffee',
		name: 'สุ่มเมนูกาแฟหาไอเดีย',
		category: 'Miscellaneous',
		icon: 'ri-cup-line',
		generator: () => randomItem(['Americano', 'Latte', 'Piccolo', 'Dirty', 'Flat White', 'Es-Yen'])
	},
	{
		id: 'misc-font',
		name: 'สุ่ม Font เขียนโค้ด',
		category: 'Miscellaneous',
		icon: 'ri-font-family',
		generator: () =>
			randomItem(['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Hack', 'Input Mono'])
	},
	{
		id: 'misc-naming',
		name: 'สุ่ม Naming Style',
		category: 'Miscellaneous',
		icon: 'ri-text-wrap',
		generator: () => `${randomItem(['is_active', 'isActive', 'IsActive', 'IS_ACTIVE'])}`
	},
	{
		id: 'misc-joke',
		name: 'สุ่มมุก Dev ฝรั่ง (Mock)',
		category: 'Miscellaneous',
		icon: 'ri-emotion-happy-line',
		generator: () =>
			randomItem([
				'10 kinds of people...',
				'A SQL query walks into a bar...',
				'Why arrays start at 0?'
			])
	}
];
