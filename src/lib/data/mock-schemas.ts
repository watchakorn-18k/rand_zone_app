// Helper for random values
export function secureRandom(max: number): number {
	const buf = new Uint32Array(1);
	crypto.getRandomValues(buf);
	return buf[0] % max;
}

export function pick<T>(arr: T[]): T {
	return arr[secureRandom(arr.length)];
}

export function randomInt(min: number, max: number): number {
	return min + secureRandom(max - min + 1);
}

export function randomPrice(): number {
	return Math.round((randomInt(10, 99999) + Math.random()) * 100) / 100;
}

export function randomDate(yearStart = 2023, yearEnd = 2025): string {
	const y = randomInt(yearStart, yearEnd);
	const m = String(randomInt(1, 12)).padStart(2, '0');
	const d = String(randomInt(1, 28)).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

const CITIES = [
	'กรุงเทพ',
	'เชียงใหม่',
	'ขอนแก่น',
	'ภูเก็ต',
	'ชลบุรี',
	'นครราชสีมา',
	'สงขลา',
	'อุดรธานี',
	'เชียงราย',
	'พิษณุโลก'
];
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
	'ปิยะ',
	'รัตน์',
	'มานี',
	'ชาติ',
	'วัน',
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
	'มหาพรม',
	'Smith',
	'Johnson',
	'Williams',
	'Brown',
	'Jones',
	'Garcia',
	'Miller',
	'Davis',
	'Rodriguez',
	'Martinez'
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
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const DEPARTMENTS = [
	'Engineering',
	'Marketing',
	'Sales',
	'HR',
	'Finance',
	'Support',
	'Product',
	'Design'
];
const TITLES = [
	'Software Engineer',
	'Project Manager',
	'Designer',
	'Accountant',
	'Analyst',
	'Director',
	'Specialist'
];

export interface SchemaDefinition {
	key: string;
	label: string;
	icon: string;
	desc: string;
	generator: (id: number) => any;
}

export const MOCK_SCHEMAS: SchemaDefinition[] = [
	{
		key: 'users',
		label: 'Users',
		icon: 'ri-user-line',
		desc: 'ข้อมูลผู้ใช้ (ชื่อ, อีเมล, เมือง, โทรศัพท์)',
		generator: (id) => {
			const first = pick(FIRST_NAMES);
			return {
				id,
				first_name: first,
				last_name: pick(LAST_NAMES),
				email: `${first.toLowerCase()}${randomInt(1, 999)}@example.com`,
				age: randomInt(18, 65),
				city: pick(CITIES),
				phone: `0${randomInt(6, 9)}${randomInt(1000, 9999)}${randomInt(1000, 9999)}`,
				registered_at: randomDate(),
				is_active: secureRandom(100) > 20
			};
		}
	},
	{
		key: 'products',
		label: 'Products',
		icon: 'ri-shopping-bag-line',
		desc: 'ข้อมูลสินค้า (ชื่อ, หมวดหมู่, ราคา, สต็อก)',
		generator: (id) => ({
			id,
			name: `${pick(['Premium', 'Ultra', 'Smart', 'Pro', 'Mini'])} ${pick(['Headphones', 'Mouse', 'Keyboard', 'Monitor', 'Camera'])}`,
			category: pick(CATEGORIES),
			price: randomPrice(),
			stock: randomInt(0, 500),
			rating: Math.round((1 + Math.random() * 4) * 10) / 10,
			sku: `SKU-${randomInt(10000, 99999)}`,
			is_available: secureRandom(100) > 10
		})
	},
	{
		key: 'orders',
		label: 'Orders',
		icon: 'ri-file-list-3-line',
		desc: 'ข้อมูลออเดอร์ (เลขที่ออเดอร์, สถานะ, ยอดรวม)',
		generator: (id) => ({
			id,
			order_number: `ORD-${randomDate().replace(/-/g, '')}${randomInt(1000, 9999)}`,
			customer_id: randomInt(1, 200),
			total: randomPrice(),
			status: pick(STATUSES),
			ordered_at: randomDate(),
			shipping_address: `${randomInt(1, 999)} ${pick(CITIES)}`
		})
	},
	{
		key: 'posts',
		label: 'Posts',
		icon: 'ri-article-line',
		desc: 'บทความหรือโพสต์ (หัวข้อ, เนื้อหา, ผู้เขียน)',
		generator: (id) => ({
			id,
			title: pick([
				'How to learn Svelte',
				'Best CSS Practices',
				'JavaScript Tips',
				'Modern Web Design',
				'Future of AI'
			]),
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
			author_id: randomInt(1, 50),
			category: pick(CATEGORIES),
			views: randomInt(100, 10000),
			likes: randomInt(10, 500),
			published_at: randomDate(),
			is_draft: secureRandom(100) > 80
		})
	},
	{
		key: 'comments',
		label: 'Comments',
		icon: 'ri-chat-1-line',
		desc: 'ความคิดเห็น (เนื้อหา, ผู้ใช้, โพสต์ที่อ้างถึง)',
		generator: (id) => ({
			id,
			post_id: randomInt(1, 100),
			user_id: randomInt(1, 200),
			body: pick([
				'Great article!',
				'Thanks for sharing',
				'Very helpful',
				'I disagree with this',
				'Can you explain more?'
			]),
			created_at: randomDate(),
			is_approved: secureRandom(100) > 10
		})
	},
	{
		key: 'tasks',
		label: 'Tasks',
		icon: 'ri-checkbox-circle-line',
		desc: 'รายการสิ่งที่ต้องทำ (หัวข้อ, ความสำคัญ, สถานะ)',
		generator: (id) => ({
			id,
			title: pick([
				'Complete report',
				'Team meeting',
				'Pay bills',
				'Buy groceries',
				'Update website'
			]),
			priority: pick(['Low', 'Medium', 'High', 'Urgent']),
			status: pick(['todo', 'in_progress', 'completed', 'on_hold']),
			due_date: randomDate(2025, 2025),
			assigned_to: randomInt(1, 50)
		})
	},
	{
		key: 'invoices',
		label: 'Invoices',
		icon: 'ri-bill-line',
		desc: 'ใบแจ้งหนี้ (เลขที่ใบเสร็จ, ยอดเงิน, วันที่ครบกำหนด)',
		generator: (id) => ({
			id,
			invoice_number: `INV-${randomInt(10000, 99999)}`,
			customer_id: randomInt(1, 300),
			amount: randomPrice(),
			tax: 7.0,
			status: pick(['paid', 'unpaid', 'overdue', 'cancelled']),
			issued_at: randomDate(),
			due_at: randomDate(2025, 2025)
		})
	},
	{
		key: 'events',
		label: 'Events',
		icon: 'ri-calendar-event-line',
		desc: 'กิจกรรม/อีเวนต์ (ชื่อ, สถานที่, เวลา)',
		generator: (id) => ({
			id,
			name: pick([
				'Tech Conference',
				'Music Festival',
				'Art Exhibition',
				'Food Fair',
				'Startup Pitch'
			]),
			location: pick(CITIES),
			organizer: pick(['Company A', 'Foundation B', 'Individual C']),
			price: randomInt(0, 5000),
			capacity: randomInt(50, 1000),
			start_date: randomDate(2025, 2025)
		})
	},
	{
		key: 'employees',
		label: 'Employees',
		icon: 'ri-team-line',
		desc: 'ข้อมูลพนักงาน (ชื่อ, แผนก, เงินเดือน)',
		generator: (id) => ({
			id,
			employee_id: `EMP-${randomInt(1000, 9999)}`,
			first_name: pick(FIRST_NAMES),
			last_name: pick(LAST_NAMES),
			department: pick(DEPARTMENTS),
			job_title: pick(TITLES),
			salary: randomInt(15000, 150000),
			joined_at: randomDate(2020, 2024),
			status: pick(['active', 'on_leave', 'terminated'])
		})
	},
	{
		key: 'transactions',
		label: 'Transactions',
		icon: 'ri-exchange-funds-line',
		desc: 'รายการธุรกรรม (จำนวนเงิน, ประเภท, วันที่)',
		generator: (id) => ({
			id,
			transaction_id: `TXN-${randomInt(100000, 999999)}`,
			account_id: `ACC-${randomInt(1000, 9999)}`,
			amount: randomPrice(),
			type: pick(['deposit', 'withdrawal', 'transfer', 'payment']),
			method: pick(['PromptPay', 'Credit Card', 'Bank Transfer', 'Cash']),
			timestamp: `${randomDate()}T${randomInt(0, 23).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00`,
			status: pick(['success', 'pending', 'failed'])
		})
	},
	{
		key: 'vehicles',
		label: 'Vehicles',
		icon: 'ri-car-line',
		desc: 'ข้อมูลยานพาหนะ (ยี่ห้อ, รุ่น, ทะเบียน)',
		generator: (id) => ({
			id,
			brand: pick(['Toyota', 'Honda', 'Tesla', 'BMW', 'Mercedes', 'Ford']),
			model: pick(['Model S', 'Civic', 'Camry', 'X5', 'F-150', 'Mustang']),
			plate_number: `${pick(['กข', 'นธ', 'รย', 'ตค'])}-${randomInt(1000, 9999)}`,
			color: pick(['White', 'Black', 'Silver', 'Red', 'Blue']),
			year: randomInt(2015, 2025),
			vin: Math.random().toString(36).substring(2, 12).toUpperCase()
		})
	},
	{
		key: 'movies',
		label: 'Movies',
		icon: 'ri-movie-line',
		desc: 'ข้อมูลภาพยนตร์ (ชื่อเรื่อง, แนว, เรตติ้ง)',
		generator: (id) => ({
			id,
			title: pick([
				'Inception',
				'The Matrix',
				'The Godfather',
				'Interstellar',
				'Pulp Fiction',
				'Toy Story'
			]),
			genre: pick(['Sci-Fi', 'Action', 'Drama', 'Comedy', 'Thriller', 'Animation']),
			director: pick(['Christopher Nolan', 'Quentin Tarantino', 'Martin Scorsese', 'Greta Gerwig']),
			release_year: randomInt(1990, 2024),
			rating: Math.round((1 + Math.random() * 9) * 10) / 10,
			runtime_minutes: randomInt(80, 180)
		})
	},
	{
		key: 'weather',
		label: 'Weather',
		icon: 'ri-cloud-line',
		desc: 'ข้อมูลสภาพอากาศ (อุณหภูมิ, ความชื้น)',
		generator: (id) => ({
			id,
			city: pick(CITIES),
			temp_c: randomInt(15, 42),
			humidity: randomInt(30, 90),
			condition: pick(['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Windy']),
			wind_speed_kph: randomInt(0, 50),
			timestamp: `${randomDate()}T${randomInt(0, 23).toString().padStart(2, '0')}:00:00`
		})
	},
	{
		key: 'notifications',
		label: 'Notifications',
		icon: 'ri-notification-3-line',
		desc: 'การแจ้งเตือน (หัวข้อ, ข้อความ, สถานะการอ่าน)',
		generator: (id) => ({
			id,
			user_id: randomInt(1, 100),
			title: pick([
				'New Message',
				'Friend Request',
				'Payment Success',
				'System Update',
				'Special Offer'
			]),
			message: 'You have a new update regarding your account activities.',
			type: pick(['info', 'warning', 'error', 'success']),
			is_read: secureRandom(100) > 50,
			created_at: randomDate()
		})
	},
	{
		key: 'recipes',
		label: 'Recipes',
		icon: 'ri-restaurant-line',
		desc: 'เมนูอาหาร (ชื่อ, ส่วนผสม, เวลาทำ)',
		generator: (id) => ({
			id,
			name: pick(['Pad Thai', 'Green Curry', 'Mango Sticky Rice', 'Tom Yum Goong', 'Basil Pork']),
			difficulty: pick(['Easy', 'Medium', 'Hard']),
			prep_time_min: randomInt(10, 60),
			servings: randomInt(1, 6),
			calories: randomInt(200, 800),
			is_vegetarian: secureRandom(100) > 70
		})
	},
	{
		key: 'inventory',
		label: 'Inventory',
		icon: 'ri-archive-line',
		desc: 'คลังสินค้า (รหัสสินค้า, จำนวนคงเหลือ, สถานที่เก็บ)',
		generator: (id) => ({
			id,
			sku: `SKU-${randomInt(1000, 9999)}`,
			current_stock: randomInt(0, 1000),
			min_stock: randomInt(10, 50),
			warehouse_location: pick(['A-1', 'B-2', 'C-3', 'D-4']),
			last_restocked_at: randomDate()
		})
	},
	{
		key: 'courses',
		label: 'Courses',
		icon: 'ri-book-open-line',
		desc: 'คอร์สเรียน (ชื่อวิชา, ผู้สอน, ราคา)',
		generator: (id) => ({
			id,
			title: pick([
				'Introduction to Python',
				'Web Development 101',
				'Data Science Essentials',
				'UI/UX Principles'
			]),
			instructor: pick(FIRST_NAMES),
			price: randomInt(0, 20000),
			duration_weeks: randomInt(4, 16),
			enrolled_students: randomInt(0, 5000),
			rating: Math.round((3 + Math.random() * 2) * 10) / 10
		})
	},
	{
		key: 'tickets',
		label: 'Support Tickets',
		icon: 'ri-customer-service-2-line',
		desc: 'ตั๋วแจ้งปัญหา (รหัส, หัวข้อ, สถานะการแก้ไข)',
		generator: (id) => ({
			id,
			ticket_id: `TKT-${randomInt(1000, 9999)}`,
			subject: pick([
				'Password Reset',
				'Billing Issue',
				'Login Error',
				'Feature Request',
				'Bug Found'
			]),
			customer_name: pick(FIRST_NAMES),
			priority: pick(['Low', 'Medium', 'High', 'Urgent']),
			status: pick(['open', 'in_progress', 'resolved', 'closed']),
			created_at: randomDate()
		})
	},
	{
		key: 'assets',
		label: 'Assets/Files',
		icon: 'ri-file-line',
		desc: 'ข้อมูลไฟล์ (ชื่อไฟล์, ประเภท, ขนาด)',
		generator: (id) => ({
			id,
			filename: `${pick(['report', 'image', 'video', 'backup', 'document'])}-${randomInt(1, 100)}.${pick(['pdf', 'jpg', 'mp4', 'zip', 'docx'])}`,
			file_size_kb: randomInt(10, 100000),
			mime_type: pick(['application/pdf', 'image/jpeg', 'video/mp4', 'application/zip']),
			owner_id: randomInt(1, 100),
			uploaded_at: randomDate()
		})
	},
	{
		key: 'logs',
		label: 'System Logs',
		icon: 'ri-terminal-window-line',
		desc: 'บันทึกระบบ (ระดับความรุนแรง, ข้อความ, เวลา)',
		generator: (id) => ({
			id,
			level: pick(['INFO', 'DEBUG', 'WARNING', 'ERROR']),
			message: pick([
				'User logged in',
				'Database connection timeout',
				'Invalid API key',
				'Resource not found',
				'Service started'
			]),
			source: pick(['auth-service', 'api-gateway', 'db-instance-1', 'cache-node-A']),
			ip_address: `192.168.1.${randomInt(1, 254)}`,
			timestamp: `${new Date().toISOString()}`
		})
	},
	{
		key: 'customers',
		label: 'Customers',
		icon: 'ri-user-star-line',
		desc: 'ข้อมูลลูกค้า (ชื่อบริษัท, ผู้ติดต่อ, ระดับ)',
		generator: (id) => ({
			id,
			company: pick(['Acme Corp', 'Globex', 'Soylent Corp', 'Initech', 'Umbrella Corp']),
			contact_person: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
			email: `contact${id}@example.com`,
			tier: pick(['Gold', 'Silver', 'Bronze', 'Platinum']),
			country: pick(['Thailand', 'USA', 'Japan', 'Singapore']),
			total_spent: randomInt(1000, 1000000)
		})
	},
	{
		key: 'bank_accounts',
		label: 'Bank Accounts',
		icon: 'ri-bank-card-line',
		desc: 'ข้อมูลบัญชีธนาคาร (เลขบัญชี, ยอดเงิน, สาขา)',
		generator: (id) => ({
			id,
			account_number: `${randomInt(100, 999)}-${randomInt(0, 9)}-${randomInt(10000, 99999)}-${randomInt(0, 9)}`,
			bank_name: pick(['KBank', 'SCB', 'BBL', 'KTB', 'TTB']),
			balance: randomInt(100, 10000000),
			currency: 'THB',
			owner_name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
			type: pick(['Savings', 'Current', 'Fixed Deposit'])
		})
	},
	{
		key: 'subscriptions',
		label: 'Subscriptions',
		icon: 'ri-vip-diamond-line',
		desc: 'ข้อมูลการสมัครสมาชิก (แพลน, วันหมดอายุ, สถานะ)',
		generator: (id) => ({
			id,
			plan_name: pick(['Basic', 'Pro', 'Enterprise', 'Legacy']),
			billing_cycle: pick(['monthly', 'yearly']),
			status: pick(['active', 'expired', 'past_due', 'cancelled']),
			next_billing_date: randomDate(2025, 2026),
			auto_renew: secureRandom(100) > 30
		})
	},
	{
		key: 'students',
		label: 'Students',
		icon: 'ri-user-smile-line',
		desc: 'ข้อมูลนักเรียน (รหัส, เกรด, คณะ)',
		generator: (id) => ({
			id,
			student_id: `67${randomInt(100000, 999999)}`,
			name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
			faculty: pick(['Engineering', 'Medicine', 'Arts', 'Science', 'Business']),
			gpa: (2.0 + Math.random() * 2.0).toFixed(2),
			year: randomInt(1, 4),
			advisor: pick(FIRST_NAMES)
		})
	},
	{
		key: 'appointments',
		label: 'Appointments',
		icon: 'ri-hospital-line',
		desc: 'การนัดหมายแพทย์ (วันที่, คลินิก, อาการ)',
		generator: (id) => ({
			id,
			appointment_date: `${randomDate(2025, 2025)}T${randomInt(8, 16).toString().padStart(2, '0')}:00:00`,
			doctor_name: `Dr. ${pick(FIRST_NAMES)}`,
			patient_name: pick(FIRST_NAMES),
			department: pick(['General Care', 'Pediatrics', 'Dentistry', 'Cardiology', 'Dermatology']),
			status: pick(['scheduled', 'completed', 'cancelled', 'no_show']),
			room: randomInt(101, 510)
		})
	},
	{
		key: 'medicines',
		label: 'Medicines',
		icon: 'ri-capsule-line',
		desc: 'ข้อมูลยา (ชื่อยา, ประเภทยา, สรรพคุณ)',
		generator: (id) => ({
			id,
			name: pick(['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Loratadine', 'Omeprazole']),
			brand: pick(['Pfizer', 'GSK', 'Novartis', 'Sanofi']),
			form: pick(['Tablet', 'Capsule', 'Syrup', 'Injection']),
			expiry_date: randomDate(2026, 2028),
			price: randomInt(50, 2000),
			stock_quantity: randomInt(0, 5000)
		})
	},
	{
		key: 'projects',
		label: 'Projects',
		icon: 'ri-folders-line',
		desc: 'โครงการ (ชื่อโครงการ, งบประมาณ, เปอร์เซ็นต์เสร็จ)',
		generator: (id) => ({
			id,
			name: `Project ${pick(['Alpha', 'Beta', 'Gamma', 'Zeta', 'Phoenix'])}`,
			budget: randomInt(50000, 5000000),
			completion_pct: randomInt(0, 100),
			manager: pick(FIRST_NAMES),
			tech_stack: pick(['React/Node', 'Svelte/Go', 'Flutter/Firebase', 'Python/Django']),
			deadline: randomDate(2025, 2026)
		})
	},
	{
		key: 'repositories',
		label: 'Repositories',
		icon: 'ri-github-line',
		desc: 'คลังโค้ด (ชื่อ, ภาษาหลัก, สตาร์)',
		generator: (id) => ({
			id,
			name: `${pick(['awesome', 'fast', 'simple', 'ultra'])}-${pick(['api', 'ui', 'cli', 'lib', 'db'])}`,
			owner: pick(['user123', 'devTeam', 'corp-inc', 'open-source-lab']),
			language: pick(['TypeScript', 'Go', 'Rust', 'Python', 'C++', 'Swift']),
			stars: randomInt(0, 50000),
			forks: randomInt(0, 10000),
			is_private: secureRandom(100) > 90,
			last_commit: randomDate()
		})
	},
	{
		key: 'analytics',
		label: 'Analytics Hits',
		icon: 'ri-line-chart-line',
		desc: 'สถิติการเข้าชม (หน้าเว็บ, อุปกรณ์, ระยะเวลาเข้าชม)',
		generator: (id) => ({
			id,
			path: pick(['/', '/home', '/products', '/about', '/contact', '/blog/1']),
			browser: pick(['Chrome', 'Safari', 'Firefox', 'Edge']),
			device: pick(['Desktop', 'Mobile', 'Tablet']),
			country_code: pick(['TH', 'US', 'JP', 'UK', 'SG']),
			duration_seconds: randomInt(5, 600),
			is_new_user: secureRandom(100) > 70
		})
	},
	{
		key: 'ads',
		label: 'Ad Campaigns',
		icon: 'ri-advertisement-line',
		desc: 'แคมเปญโฆษณา (ชื่อ, งบ, ยอดคลิก)',
		generator: (id) => ({
			id,
			campaign_name: `${pick(['Summer', 'Winter', 'Flash', 'Holiday'])} Sale 2025`,
			platform: pick(['Facebook', 'Google', 'TikTok', 'Instagram']),
			budget: randomInt(1000, 50000),
			bid_strategy: pick(['CPC', 'CPM', 'CPA']),
			clicks: randomInt(0, 10000),
			impressions: randomInt(10000, 1000000),
			status: pick(['active', 'paused', 'ended'])
		})
	},
	{
		key: 'book_library',
		label: 'Books',
		icon: 'ri-book-line',
		desc: 'หนังสือ (ชื่อเรื่อง, ผู้แต่ง, ISBN)',
		generator: (id) => ({
			id,
			title: pick(['The Great Gatsby', '1984', 'To Kill a Mockingbird', 'The Hobbit']),
			author: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
			isbn: `${randomInt(100, 999)}-${randomInt(0, 9)}-${randomInt(10000, 99999)}`,
			pages: randomInt(150, 1000),
			publisher: pick(['Penguin', 'HarperCollins', 'Scholastic']),
			language: pick(['English', 'Thai', 'Japanese', 'French'])
		})
	},
	{
		key: 'flights',
		label: 'Flights',
		icon: 'ri-plane-line',
		desc: 'ข้อมูลเที่ยวบิน (รหัส, ต้นทาง, ปลายทาง)',
		generator: (id) => ({
			id,
			flight_number: `${pick(['TG', 'FD', 'PG', 'SL'])}${randomInt(100, 999)}`,
			origin: pick(['BKK', 'CNX', 'HKT', 'SIN', 'NRT', 'LHR']),
			destination: pick(['SYD', 'ICN', 'CDG', 'DXB', 'JFK']),
			departure_time: `${randomDate(2025, 2025)}T${randomInt(0, 23).toString().padStart(2, '0')}:00:00`,
			gate: `${pick(['A', 'B', 'C', 'D'])}${randomInt(1, 25)}`,
			airline: pick(['Thai Airways', 'AirAsia', 'Bangkok Airways', 'Emirates'])
		})
	},
	{
		key: 'hotels',
		label: 'Hotels',
		icon: 'ri-building-line',
		desc: 'โรงแรม (ชื่อ, ดาว, ราคาต่อคืน)',
		generator: (id) => ({
			id,
			name: `${pick(['Standard', 'Grand', 'Royal', 'Beach', 'Urban'])} ${pick(['Hotel', 'Resort', 'Suites', 'Inn'])}`,
			stars: randomInt(1, 5),
			price_per_night: randomInt(800, 15000),
			city: pick(CITIES),
			amenities: [pick(['Pool', 'Gym', 'Spa']), pick(['Wifi', 'Parking', 'Breakfast'])],
			check_in_time: '14:00',
			check_out_time: '12:00'
		})
	},
	{
		key: 'pets',
		label: 'Pets',
		icon: 'ri-guide-line',
		desc: 'ข้อมูลสัตว์เลี้ยง (ชื่อ, สายพันธุ์, อายุ)',
		generator: (id) => ({
			id,
			name: pick(['Buddy', 'Luna', 'Milo', 'Bella', 'Max', 'Charlie', 'Lucy']),
			species: pick(['Dog', 'Cat', 'Bird', 'Hamster', 'Rabbit']),
			breed: pick(['Golden Retriever', 'Siamese', 'Persian', 'Beagle', 'Bulldog']),
			age_years: randomInt(1, 15),
			owner_id: randomInt(1, 200),
			is_vaccinated: secureRandom(100) > 10
		})
	},
	{
		key: 'characters',
		label: 'Game Characters',
		icon: 'ri-sword-line',
		desc: 'ตัวละครเกม (ชื่อ, อาชีพ, เลเวล)',
		generator: (id) => ({
			id,
			name: pick(['ShadowWalker', 'FireMage', 'IronKnight', 'SwiftArcher', 'Healer99']),
			class: pick(['Warrior', 'Mage', 'Rogue', 'Paladin', 'Ranger']),
			level: randomInt(1, 100),
			server: pick(['Global-1', 'Asia-2', 'EU-West']),
			hp: randomInt(500, 10000),
			mp: randomInt(100, 5000),
			is_online: secureRandom(100) > 80
		})
	},
	{
		key: 'vouchers',
		label: 'Coupons/Vouchers',
		icon: 'ri-coupon-line',
		desc: 'รหัสส่วนลด (โค้ด, ส่วนลด, วันหมดอายุ)',
		generator: (id) => ({
			id,
			code: `${pick(['SALE', 'WELCOME', 'PROMO', 'SPECIAL'])}${randomInt(10, 99)}`,
			discount_pct: pick([5, 10, 15, 20, 50]),
			min_purchase: randomInt(0, 1000),
			expires_at: randomDate(2025, 2025),
			usage_limit: randomInt(10, 1000),
			times_used: randomInt(0, 10)
		})
	},
	{
		key: 'reviews',
		label: 'Reviews',
		icon: 'ri-star-half-line',
		desc: 'บทวิจารณ์ (เรตติ้ง, ตัวอย่างข้อความ, ผู้เขียน)',
		generator: (id) => ({
			id,
			target_id: randomInt(1, 50),
			target_type: pick(['product', 'hotel', 'movie', 'course']),
			rating: randomInt(1, 5),
			comment: pick(['Excellent', 'Pretty good', 'Average', 'Bad experience', 'Would recommend']),
			author: pick(FIRST_NAMES),
			is_verified_purchase: secureRandom(100) > 40
		})
	},
	{
		key: 'messages',
		label: 'Messages',
		icon: 'ri-message-3-line',
		desc: 'ข้อความแชท (ผู้ส่ง, ผู้รับ, เนื้อหา)',
		generator: (id) => ({
			id,
			from_id: randomInt(1, 100),
			to_id: randomInt(1, 100),
			text: pick(['Hello!', 'How are you?', 'Did you see this?', 'See you later!', 'OK.']),
			sent_at: `${randomDate()}T${randomInt(10, 22)}:00:00`,
			status: pick(['sent', 'delivered', 'read'])
		})
	},
	{
		key: 'bank_transactions',
		label: 'Bank Transactions',
		icon: 'ri-history-line',
		desc: 'ประวัติการทำธุรกรรม (เงินเข้า/ออก, รายละเอียด)',
		generator: (id) => ({
			id,
			ref_no: `REF${randomInt(100000, 999999)}`,
			description: pick([
				'Transfer',
				'Withdrawal ATM',
				'Purchase Starbucks',
				'Salary',
				'Netflix Bill'
			]),
			amount: (secureRandom(2) === 0 ? -1 : 1) * randomPrice(),
			channel: pick(['Mobile App', 'ATM', 'Counter', 'Web']),
			timestamp: `${randomDate()}T${randomInt(8, 20)}:30:00`
		})
	},
	{
		key: 'roles',
		label: 'User Roles',
		icon: 'ri-shield-user-line',
		desc: 'บทบาทและสิทธิ์ (ชื่อกลุ่ม, สิทธิ์การใช้งาน)',
		generator: (id) => ({
			id,
			role_name: pick(['Admin', 'Editor', 'Viewer', 'Moderator', 'Superuser']),
			permissions: [pick(['read', 'write']), pick(['delete', 'execute'])].slice(0, randomInt(1, 3)),
			user_count: randomInt(1, 1000),
			created_by: 'system'
		})
	},
	{
		key: 'social_profiles',
		label: 'Social Profiles',
		icon: 'ri-instagram-line',
		desc: 'โปรไฟล์โซเชียล (ชื่อผู้ใช้, ยอดฟอล, Bio)',
		generator: (id) => ({
			id,
			username: `${pick(FIRST_NAMES).toLowerCase()}_${randomInt(1, 99)}`,
			followers: randomInt(100, 1000000),
			following: randomInt(50, 5000),
			posts_count: randomInt(0, 500),
			bio: 'Lifestyle & Tech enthusiast 🚀',
			website: 'https://example.com'
		})
	},
	{
		key: 'cryptos',
		label: 'Crypto Wallet',
		icon: 'ri-bit-coin-line',
		desc: 'กระเป๋าคริปโต (ที่อยู่กระเป๋า, ยอดคงเหลือ)',
		generator: (id) => ({
			id,
			symbol: pick(['BTC', 'ETH', 'SOL', 'BNB', 'USDT']),
			balance: (Math.random() * 5).toFixed(4),
			wallet_address: `0x${Math.random().toString(16).substring(2, 42)}`,
			network: pick(['Ethereum', 'Bitcoin', 'Solana', 'BSC']),
			last_activity: randomDate()
		})
	},
	{
		key: 'it_tickets',
		label: 'IT Support Tickets',
		icon: 'ri-command-line',
		desc: 'เคสแจ้งซ่อม IT (อุปกรณ์ที่เสีย, สาขา, ผู้ดูแล)',
		generator: (id) => ({
			id,
			asset_tag: `IT-${randomInt(1000, 9999)}`,
			issue: pick(['Blue Screen', 'Wifi slow', 'Broken Keyboard', 'Printer jammed']),
			priority: pick(['P1', 'P2', 'P3', 'P4']),
			assigned_tech: pick(FIRST_NAMES),
			location: pick(CITIES),
			sla_hours: [4, 8, 24, 48][randomInt(0, 3)]
		})
	},
	{
		key: 'real_estate',
		label: 'Real Estate',
		icon: 'ri-home-heart-line',
		desc: 'อสังหาริมทรัพย์ (ประเภทบ้าน, ราคาขาย, พื้นที่)',
		generator: (id) => ({
			id,
			listing_name: `${pick(['Modern', 'Luxury', 'Classic', 'Cozy'])} ${pick(['Condo', 'House', 'Villa', 'Office'])}`,
			price: randomInt(1500000, 50000000),
			sqm: randomInt(30, 500),
			bedrooms: randomInt(1, 5),
			bathrooms: randomInt(1, 4),
			city: pick(CITIES),
			agent: pick(FIRST_NAMES)
		})
	},
	{
		key: 'restaurant_orders',
		label: 'Restaurant Orders',
		icon: 'ri-cup-line',
		desc: 'รายการสั่งอาหาร (โต๊ะ, เมนู, ราคารวม)',
		generator: (id) => ({
			id,
			table_no: randomInt(1, 30),
			items: [`${pick(['Coffee', 'Pasta', 'Steak'])}`, `${pick(['Water', 'Cake', 'Salad'])}`],
			total_price: randomInt(100, 2500),
			waiter: pick(FIRST_NAMES),
			is_takeaway: secureRandom(100) > 80,
			timestamp: `${new Date().toLocaleTimeString()}`
		})
	},
	{
		key: 'user_activity',
		label: 'User Activity',
		icon: 'ri-footprint-line',
		desc: 'กิจกรรมผู้ใช้ (หน้าเว็บที่เปิด, คลิก, scroll)',
		generator: (id) => ({
			id,
			user_id: randomInt(1, 500),
			action: pick(['page_view', 'button_click', 'form_submit', 'scroll_50']),
			target_element: pick(['home_hero', 'buy_now_btn', 'footer_link', 'login_form']),
			timestamp: new Date().toISOString()
		})
	},
	{
		key: 'pull_requests',
		label: 'Pull Requests',
		icon: 'ri-git-pull-request-line',
		desc: 'รายการรวมโค้ด (ชื่อ PR, สถานะการรีวิว)',
		generator: (id) => ({
			id,
			title: pick(['Fix login bug', 'Add new icon', 'Refactor styles', 'Update README']),
			branch: pick(['feature/auth', 'bugfix/nav', 'hotfix/api']),
			status: pick(['open', 'merged', 'closed', 'draft']),
			review_status: pick(['approved', 'changes_requested', 'pending']),
			author: pick(FIRST_NAMES)
		})
	},
	{
		key: 'server_stats',
		label: 'Server Status',
		icon: 'ri-cpu-line',
		desc: 'สถานะเซิร์ฟเวอร์ (CPU, RAM, Uptime)',
		generator: (id) => ({
			id,
			instance: `aws-ec2-${randomInt(1, 10)}`,
			cpu_usage: randomInt(10, 95),
			ram_usage: randomInt(20, 90),
			uptime_days: randomInt(1, 365),
			region: pick(['ap-southeast-1', 'us-east-1', 'eu-central-1']),
			status: pick(['healthy', 'warning', 'degraded'])
		})
	},
	{
		key: 'survey_results',
		label: 'Survey Results',
		icon: 'ri-questionnaire-line',
		desc: 'ผลสำรวจ (คะแนนความพึงพอใจ, ข้อเสนอแนะ)',
		generator: (id) => ({
			id,
			nps_score: randomInt(0, 10),
			satisfaction: pick(['Very Happy', 'Neutral', 'Disappointed']),
			feedback: 'The service was quite good and I would use it again.',
			would_recommend: secureRandom(100) > 40,
			submitted_at: randomDate()
		})
	},
	{
		key: 'news',
		label: 'News Articles',
		icon: 'ri-newspaper-line',
		desc: 'ข่าวสาร (หัวข้อข่าว, สำนักข่าว, เนื้อหา)',
		generator: (id) => ({
			id,
			headline: pick([
				'Breaking News: Market Hits High',
				'New Tech Innovations Revealed',
				'Weather Alert: Storm Approaching'
			]),
			publisher: pick(['BBC', 'CNN', 'Reuters', 'Thai Rath', 'The Standard']),
			author: pick(FIRST_NAMES),
			category: pick(['Business', 'Technology', 'Politics', 'Sports']),
			published_at: randomDate(),
			is_breaking: secureRandom(100) > 90
		})
	},
	{
		key: 'pc_components',
		label: 'PC Components',
		icon: 'ri-cpu-fill',
		desc: 'ชิ้นส่วนคอมพิวเตอร์ (CPU, GPU, RAM, ราคา)',
		generator: (id) => ({
			id,
			part_type: pick(['CPU', 'GPU', 'RAM', 'SSD', 'Motherboard']),
			brand: pick(['Intel', 'AMD', 'NVIDIA', 'Asus', 'Gigabyte', 'Kingston']),
			model: pick(['Core i9', 'Ryzen 9', 'RTX 4090', 'Vengeance LPX']),
			price: randomInt(2000, 60000),
			warranty_years: randomInt(1, 5),
			stock_status: pick(['In Stock', 'Out of Stock', 'Pre-order'])
		})
	},
	{
		key: 'instruments',
		label: 'Musical Instruments',
		icon: 'ri-music-2-line',
		desc: 'เครื่องดนตรี (ประเภท, ยี่ห้อ, ราคา)',
		generator: (id) => ({
			id,
			name: pick(['Electric Guitar', 'Acoustic Piano', 'Violin', 'Drum Set', 'Saxophone']),
			brand: pick(['Fender', 'Yamaha', 'Gibson', 'Steinway', 'Roland']),
			type: pick(['String', 'Keys', 'Percussion', 'Woodwind']),
			price: randomInt(5000, 200000),
			condition: pick(['New', 'Used', 'Vintage'])
		})
	},
	{
		key: 'artworks',
		label: 'Artworks',
		icon: 'ri-palette-line',
		desc: 'ผลงานศิลปะ (ชื่อภาพ, ศิลปิน, ปีที่สร้าง)',
		generator: (id) => ({
			id,
			title: pick(['Starlight Night', 'The Scream', 'Mona Lisa', 'The Thinker']),
			artist: pick(['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet']),
			medium: pick(['Oil on Canvas', 'Sculpture', 'Watercolor', 'Digital Art']),
			creation_year: randomInt(1500, 2024),
			estimated_value: randomInt(100000, 10000000)
		})
	},
	{
		key: 'workouts',
		label: 'Workouts',
		icon: 'ri-run-line',
		desc: 'รายการออกกำลังกาย (ท่าฝึก, เซต, แคลอรี่)',
		generator: (id) => ({
			id,
			exercise: pick(['Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'Shoulder Press']),
			muscle_group: pick(['Chest', 'Legs', 'Back', 'Shoulders', 'Arms']),
			sets: randomInt(3, 5),
			reps: randomInt(8, 15),
			calories_burned: randomInt(50, 200),
			duration_minutes: randomInt(10, 45)
		})
	},
	{
		key: 'diet_nutrition',
		label: 'Nutrition',
		icon: 'ri-apple-line',
		desc: 'ข้อมูลโภชนาการ (คาร์บ, โปรตีน, ไขมัน)',
		generator: (id) => ({
			id,
			food_item: pick(['Chicken Breast', 'Brown Rice', 'Avocado', 'Egg', 'Greek Yogurt']),
			calories: randomInt(50, 500),
			protein_g: randomInt(0, 40),
			carbs_g: randomInt(0, 40),
			fat_g: randomInt(0, 30),
			serving_size: '100g'
		})
	},
	{
		key: 'mobile_apps',
		label: 'Mobile Apps',
		icon: 'ri-smartphone-line',
		desc: 'แอปพลิเคชันมือถือ (ชื่อ, ผู้พัฒนา, ยอดดาวน์โหลด)',
		generator: (id) => ({
			id,
			app_name: pick(['QuickShare', 'SnapEdit', 'FitTracker', 'MindGuard', 'TaskMaster']),
			developer: pick(['AppZone', 'SoftCreative', 'DevStudio', 'GlobalConnect']),
			category: pick(['Social', 'Utility', 'Health', 'Games', 'Finance']),
			downloads: randomInt(1000, 100000000),
			rating: (2.0 + Math.random() * 3.0).toFixed(1),
			is_free: secureRandom(100) > 20
		})
	},
	{
		key: 'ai_models',
		label: 'AI Models',
		icon: 'ri-robot-2-line',
		desc: 'โมเดล AI (ชื่อโมเดล, พารามิเตอร์, ผู้สร้าง)',
		generator: (id) => ({
			id,
			model_name: pick(['GPT-4', 'Claude 3', 'Llama 2', 'PaLM 2', 'Mistral']),
			developer: pick(['OpenAI', 'Anthropic', 'Meta', 'Google']),
			parameters: `${randomInt(1, 1000)}B`,
			context_window: `${randomInt(4, 128)}k`,
			release_date: randomDate(),
			architecture: pick(['Transformer', 'MoE', 'Diffusion'])
		})
	},
	{
		key: 'cloud_services',
		label: 'Cloud Services',
		icon: 'ri-cloud-windy-line',
		desc: 'บริการคลาวด์ (ชื่อบริการ, ราคา, ภูมิภาค)',
		generator: (id) => ({
			id,
			service_name: pick(['EC2', 'S3', 'Lambda', 'RDS', 'CloudFront']),
			provider: pick(['AWS', 'Google Cloud', 'Azure', 'DigitalOcean']),
			monthly_cost: randomInt(5, 5000),
			region: pick(['us-east-1', 'ap-southeast-1', 'eu-west-1']),
			sla_uptime: '99.99%',
			status: pick(['Running', 'Stopped', 'Scaling'])
		})
	},
	{
		key: 'domains',
		label: 'Domain Names',
		icon: 'ri-global-line',
		desc: 'ชื่อโดเมน (URL, สถานะการจดทะเบียน)',
		generator: (id) => ({
			id,
			domain: `${pick(['awesome', 'tech', 'my', 'global'])}-${randomInt(100, 999)}.${pick(['com', 'io', 'net', 'org', 'th'])}`,
			registrant: pick(FIRST_NAMES),
			expires_at: randomDate(2025, 2030),
			status: pick(['Registered', 'Available', 'Premium', 'Expired']),
			auto_renew: secureRandom(100) > 50
		})
	},
	{
		key: 'ssh_keys',
		label: 'SSH Keys',
		icon: 'ri-key-2-line',
		desc: 'ข้อมูล SSH Key (ชื่อ, ลายนิ้วมือ, วันที่สร้าง)',
		generator: (id) => ({
			id,
			key_name: `${pick(['MacBook', 'WorkStation', 'Production', 'CI-CD'])}-Key`,
			fingerprint: `SHA256:${Math.random().toString(36).substring(2, 22)}`,
			type: pick(['ed25519', 'rsa-4096', 'ecdsa-sha2-nistp256']),
			created_at: randomDate(),
			last_used: randomDate()
		})
	},
	{
		key: 'docker',
		label: 'Docker Images',
		icon: 'ri-instance-line',
		desc: 'ด็อกเกอร์อิมเมจ (ชื่อ, แท็ก, ขนาดอิมเมจ)',
		generator: (id) => ({
			id,
			image_name: pick(['nginx', 'postgres', 'redis', 'node', 'alpine', 'python']),
			tag: pick(['latest', 'alpine', '14-slim', 'bullseye', 'v2.4.1']),
			size_mb: randomInt(5, 1200),
			pushed_at: randomDate(),
			maintainer: `${pick(FIRST_NAMES).toLowerCase()}-dev`,
			is_official: secureRandom(100) > 60
		})
	},
	{
		key: 'kubernetes',
		label: 'K8s Pods',
		icon: 'ri-stack-line',
		desc: 'เคเบอร์เนทีสพ็อด (ชื่อ, สถานะ, จำนวนรีสตาร์ท)',
		generator: (id) => ({
			id,
			pod_name: `${pick(['web', 'api', 'db', 'worker'])}-${randomInt(1000, 9999)}`,
			namespace: pick(['default', 'kube-system', 'production', 'staging']),
			status: pick(['Running', 'Pending', 'Error', 'CrashLoopBackOff']),
			restart_count: randomInt(0, 50),
			uptime_seconds: randomInt(3600, 864000),
			node: `node-0${randomInt(1, 4)}`
		})
	},
	{
		key: 'vulnerabilities',
		label: 'Security Vulnerabilities',
		icon: 'ri-bug-2-line',
		desc: 'ช่องโหว่ความมั่นคง (CVE, ระดับความรุนแรง)',
		generator: (id) => ({
			id,
			cve_id: `CVE-202${randomInt(0, 4)}-${randomInt(1000, 99999)}`,
			severity: pick(['Critical', 'High', 'Medium', 'Low']),
			cvss_score: (1.0 + Math.random() * 9.0).toFixed(1),
			package: pick(['openssl', 'bash', 'log4j', 'kubernetes', 'linux-kernel']),
			status: pick(['Fixed', 'Patched', 'Active', 'Under Investigation'])
		})
	},
	{
		key: 'changelog',
		label: 'Software Changelogs',
		icon: 'ri-history-line',
		desc: 'บันทึกการเปลี่ยนแปลง (เวอร์ชัน, รายการที่เพิ่ม/แก้ไข)',
		generator: (id) => ({
			id,
			version: `v${randomInt(1, 5)}.${randomInt(0, 9)}.${randomInt(0, 20)}`,
			type: pick(['Major', 'Minor', 'Patch', 'Hotfix']),
			changes: [
				pick(['Added dark mode', 'Improved performance', 'Fixed login bug', 'Updated dependencies'])
			],
			release_date: randomDate(),
			is_stable: secureRandom(100) > 20
		})
	},
	{
		key: 'travel_destinations',
		label: 'Travel Destinations',
		icon: 'ri-compass-3-line',
		desc: 'จุดหมายปลายทาง (เมือง, ประเทศ, ความนิยม)',
		generator: (id) => ({
			id,
			destination: pick([
				'Paris, France',
				'Kyoto, Japan',
				'Bangkok, Thailand',
				'Rome, Italy',
				'New York, USA'
			]),
			best_time_to_visit: pick(['Spring', 'Summer', 'Autumn', 'Winter']),
			popular_landmark: pick([
				'Eiffel Tower',
				'Fushimi Inari',
				'Wat Arun',
				'Colosseum',
				'Statue of Liberty'
			]),
			average_budget_per_day: randomInt(50, 500),
			rating: (4.0 + Math.random()).toFixed(1)
		})
	},
	{
		key: 'national_parks',
		label: 'National Parks',
		icon: 'ri-leaf-line',
		desc: 'อุทยานแห่งชาติ (ชื่อ, พื้นที่, สัตว์ป่า)',
		generator: (id) => ({
			id,
			park_name: pick(['Khao Yai', 'Inthanon', 'Yellowstone', 'Grand Canyon', 'Zion']),
			country: pick(['Thailand', 'USA', 'Japan', 'Canada']),
			acres: randomInt(50000, 2000000),
			fauna: [pick(['Tiger', 'Elephant', 'Grizzly', 'Eagle', 'Wolf'])],
			established_year: randomInt(1850, 2020)
		})
	},
	{
		key: 'city_stats',
		label: 'City Statistics',
		icon: 'ri-community-line',
		desc: 'สถิติเมือง (ประชากร, พื้นที่, รหัสไปรษณีย์)',
		generator: (id) => ({
			id,
			city: pick(CITIES),
			population: randomInt(100000, 10000000),
			timezone: 'GMT+7',
			zip_code: `${randomInt(10000, 99999)}`,
			is_capital: secureRandom(100) > 90,
			area_sqkm: randomInt(100, 2000)
		})
	},
	{
		key: 'economics',
		label: 'Economic Indicators',
		icon: 'ri-funds-line',
		desc: 'ตัวชี้วัดเศรษฐกิจ (GDP, เงินเฟ้อ, อัตราว่างงาน)',
		generator: (id) => ({
			id,
			country: pick(['Thailand', 'USA', 'Japan', 'Germany', 'China']),
			gdp_growth_pct: (Math.random() * 5).toFixed(1),
			inflation_pct: (Math.random() * 8).toFixed(1),
			unemployment_rate: (Math.random() * 10).toFixed(1),
			currency: pick(['THB', 'USD', 'JPY', 'EUR', 'CNY']),
			fiscal_year: 2024
		})
	},
	{
		key: 'stock_market',
		label: 'Stocks',
		icon: 'ri-stock-line',
		desc: 'ข้อมูลหุ้น (ชื่อหุ้น, ราคาล่าสุด, การเปลี่ยนแปลง)',
		generator: (id) => ({
			id,
			symbol: pick(['AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'NVDA', 'META']),
			company: pick(['Apple Inc.', 'Tesla Inc.', 'Microsoft', 'Amazon.com', 'Google']),
			price: (randomInt(10, 500) + Math.random()).toFixed(2),
			change_pct: (Math.random() * 10 - 5).toFixed(2),
			volume: randomInt(100000, 10000000),
			market_cap: `${randomInt(10, 3000)}B`
		})
	},
	{
		key: 'legal_docs',
		label: 'Legal Documents',
		icon: 'ri-file-shield-2-line',
		desc: 'เอกสารทางกฎหมาย (ประเภทสัญญา, วันที่รันอีเมล)',
		generator: (id) => ({
			id,
			doc_type: pick(['NDA', 'Employment Agreement', 'Lease Contract', 'Service Level Agreement']),
			status: pick(['Signed', 'Pending', 'Draft', 'Expired']),
			parties: [pick(['Corp A', 'Client B', 'Individual C', 'Entity D'])],
			effective_date: randomDate(),
			termination_date: randomDate(2025, 2030)
		})
	},
	{
		key: 'rentals',
		label: 'Rentals',
		icon: 'ri-key-line',
		desc: 'ข้อมูลเช่า (หอพัก/คอนโด, ราคาเช่า)',
		generator: (id) => ({
			id,
			property_type: pick(['Studio Condo', '1BR Apartment', 'Tounhouse', 'Commercial Space']),
			monthly_rent: randomInt(5000, 50000),
			deposit: randomInt(10000, 100000),
			is_furnished: secureRandom(100) > 40,
			utilities_included: secureRandom(100) > 80,
			available_from: randomDate()
		})
	},
	{
		key: 'insurance',
		label: 'Insurance',
		icon: 'ri-shield-check-line',
		desc: 'ข้อมูลประกัน (สุขภาพ, รถ, ชีวิต)',
		generator: (id) => ({
			id,
			policy_number: `POL-${randomInt(100000, 999999)}`,
			insurance_type: pick(['Health', 'Auto', 'Life', 'Travel', 'Property']),
			coverage_amount: randomInt(100000, 5000000),
			premium_monthly: randomInt(500, 5000),
			holder: pick(FIRST_NAMES),
			status: pick(['Active', 'Grace Period', 'Lapsed'])
		})
	},
	{
		key: 'mortgages',
		label: 'Mortgages',
		icon: 'ri-percent-line',
		desc: 'ข้อมูลสินเชื่อบ้าน (ยอดกู้, อัตราดอกเบี้ย)',
		generator: (id) => ({
			id,
			loan_amount: randomInt(1000000, 10000000),
			interest_rate: (2.5 + Math.random() * 5).toFixed(2),
			term_years: pick([15, 20, 25, 30]),
			bank: pick(['KBank', 'SCB', 'BBL', 'GH Bank']),
			monthly_payment: randomInt(5000, 50000),
			remaining_balance: randomInt(500000, 9000000)
		})
	},
	{
		key: 'credit_scores',
		label: 'Credit Scores',
		icon: 'ri-gauge-line',
		desc: 'คะแนนเครดิต (คะแนน, เกรด, ประวัติ)',
		generator: (id) => ({
			id,
			score: randomInt(300, 850),
			grade: pick(['Very Poor', 'Fair', 'Good', 'Very Good', 'Exceptional']),
			last_checked: randomDate(),
			on_track: secureRandom(100) > 20,
			debts_outstanding: randomInt(0, 500000)
		})
	},
	{
		key: 'uni_depts',
		label: 'University Depts',
		icon: 'ri-government-line',
		desc: 'คณะ/ภาควิชา (ชื่อคณะ, จำนวนบุคลากร)',
		generator: (id) => ({
			id,
			department: pick(['Faculty of Engineering', 'Faculty of Commerce', 'Faculty of Arts']),
			dean: pick(FIRST_NAMES),
			student_count: randomInt(500, 5000),
			faculty_count: randomInt(20, 200),
			research_budget: randomInt(100000, 5000000),
			location: `Building ${randomInt(1, 20)}`
		})
	},
	{
		key: 'research_papers',
		label: 'Research Papers',
		icon: 'ri-draft-line',
		desc: 'งานวิจัย (หัวข้อ, ผู้เขียน, จำนวนครั้งที่อ้างถึง)',
		generator: (id) => ({
			id,
			title: pick(['Advancements in ML', 'Impact of Social Media', 'Renewable Energy Efficiency']),
			authors: [`${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`],
			citations: randomInt(0, 5000),
			journal: pick(['Nature', 'Science', 'IEEE', 'The Lancet']),
			published_date: randomDate(),
			is_peer_reviewed: secureRandom(100) > 10
		})
	},
	{
		key: 'patents',
		label: 'Patents',
		icon: 'ri-medal-line',
		desc: 'สิทธิบัตร (ชื่อ, เจ้าของ, วันที่จด)',
		generator: (id) => ({
			id,
			patent_number: `US${randomInt(1000000, 9999999)}B2`,
			title: pick(['Folding Screen Device', 'Battery Management System', 'AI for Imaging']),
			assignee: pick(['Google', 'Samsung', 'IBM', 'Apple', 'Huawei']),
			filed_at: randomDate(2010, 2024),
			granted_at: randomDate(2020, 2024)
		})
	},
	{
		key: 'language_prof',
		label: 'Language Proficiency',
		icon: 'ri-chat-voice-line',
		desc: 'ระดับความสามารถทางภาษา (เลเวล, ใบรับรอง)',
		generator: (id) => ({
			id,
			language: pick(['English', 'Thai', 'Japanese', 'Chinese', 'French', 'German']),
			level: pick(['Beginner', 'Intermediate', 'Advanced', 'Native']),
			certification: pick(['TOEIC', 'TOEFL', 'IELTS', 'JLPT', 'HSK', 'DELF']),
			score: randomInt(10, 990),
			expired_at: randomDate(2025, 2028)
		})
	},
	{
		key: 'cultural_events',
		label: 'Cultural Events',
		icon: 'ri-empathy-line',
		desc: 'กิจกรรมทางวัฒนธรรม (งานวัด, เทศกาลดนตรี)',
		generator: (id) => ({
			id,
			event_name: pick(['Songkran Festival', 'Loy Krathong', 'Oktoberfest', 'Diwali', 'Hanami']),
			origin_country: pick(['Thailand', 'Germany', 'India', 'Japan', 'USA']),
			month: pick(['April', 'November', 'October', 'December']),
			type: pick(['Traditional', 'Modern', 'Religious', 'Music']),
			estimated_visitors: randomInt(10000, 1000000)
		})
	},
	{
		key: 'sports_matches',
		label: 'Sports Matches',
		icon: 'ri-ping-pong-line',
		desc: 'แมตชแข่งขันกีฬา (ทีม, ผลการแข่งขัน)',
		generator: (id) => ({
			id,
			sport: pick(['Football', 'Basketball', 'Tennis', 'Volleyball']),
			home_team: pick(['Team Red', 'Team Blue', 'Lions', 'Dragons']),
			away_team: pick(['Team White', 'Team Black', 'Eagles', 'Tigers']),
			final_score: `${randomInt(0, 5)}-${randomInt(0, 5)}`,
			status: pick(['Final', 'Live', 'Postponed']),
			stadium: `Central Arena ${randomInt(1, 4)}`
		})
	},
	{
		key: 'athlete_stats',
		label: 'Athlete Stats',
		icon: 'ri-user-follow-line',
		desc: 'สถิตินักกีฬา (ค่าพลัง, ความสูง น้ำหนัก)',
		generator: (id) => ({
			id,
			name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
			sport: pick(['Football', 'Basketball', 'Swimming']),
			performance_rating: (7.0 + Math.random() * 3.0).toFixed(1),
			height_cm: randomInt(160, 205),
			weight_kg: randomInt(50, 110),
			nationality: pick(['TH', 'USA', 'BR', 'ES', 'JP'])
		})
	},
	{
		key: 'olympic_medals',
		label: 'Olympic Medals',
		icon: 'ri-trophy-line',
		desc: 'เหรียญรางวัลโอลิมปิก (ประเทศ, เหรียญทอง/เงิน/ทองแดง)',
		generator: (id) => ({
			id,
			country: pick(['USA', 'China', 'Japan', 'Thailand', 'UK', 'Australia']),
			gold: randomInt(0, 40),
			silver: randomInt(0, 40),
			bronze: randomInt(0, 40),
			total: 0, // calculated later if needed
			year: 2024
		})
	},
	{
		key: 'space_missions',
		label: 'Space Missions',
		icon: 'ri-rocket-fill',
		desc: 'ภารกิจอวกาศ (ชื่อยาน, จุดหมาย, สถานะ)',
		generator: (id) => ({
			id,
			mission_name: pick(['Apollo 11', 'Artemis I', 'Mars Rover', 'Voyager 1', 'Juno']),
			target: pick(['Moon', 'Mars', 'Jupiter', 'Saturn', 'Outer Space']),
			agency: pick(['NASA', 'ESA', 'JAXA', 'SpaceX', 'ISRO']),
			launch_year: randomInt(1960, 2024),
			status: pick(['Successful', 'Active', 'Lost Contact', 'Decommissioned'])
		})
	},
	{
		key: 'celestial_bodies',
		label: 'Celestial Bodies',
		icon: 'ri-sun-line',
		desc: 'วัตถุในอวกาศ (ชื่อดาว, ประเภท, ระยะทาง)',
		generator: (id) => ({
			id,
			name: pick(['Mars', 'Venus', 'Andromeda Galaxy', 'Sirius', 'Alpha Centauri']),
			type: pick(['Planet', 'Galaxy', 'Star', 'Nebula', 'Black Hole']),
			distance_light_years: (Math.random() * 1000).toFixed(2),
			discovered_by: pick(['Newton', 'Galileo', 'Hubble', 'Kepler']),
			discovery_year: randomInt(1600, 2024)
		})
	},
	{
		key: 'telescope_obs',
		label: 'Telescope Obs',
		icon: 'ri-telescope-line',
		desc: 'บันทึกกล้องโทรทรรศน์ (วัตถุที่เจอ, ความสว่าง)',
		generator: (id) => ({
			id,
			observatory: pick(['Mauna Kea', 'Atacama', 'Palomar', 'JWST']),
			target_object: `Obj-${randomInt(100, 999)}`,
			magnitude: (Math.random() * 20).toFixed(1),
			exposure_seconds: randomInt(100, 3600),
			is_transient: secureRandom(100) > 80
		})
	},
	{
		key: 'environmental_data',
		label: 'Eco Data',
		icon: 'ri-temp-hot-line',
		desc: 'ข้อมูลสิ่งแวดล้อม (ระดับ CO2, มลพิษทางอากาศ)',
		generator: (id) => ({
			id,
			aqi_index: randomInt(10, 250),
			co2_ppm: randomInt(380, 450),
			pm2_5: randomInt(5, 150),
			measure_point: pick(CITIES),
			condition: pick(['Good', 'Moderate', 'Unhealthy', 'Hazardous']),
			last_reading: new Date().toISOString()
		})
	},
	{
		key: 'renewable_energy',
		label: 'Renewable Energy',
		icon: 'ri-lightbulb-flash-line',
		desc: 'พลังงานหมุนเวียน (โซลาร์, ลม, กำลังการผลิต)',
		generator: (id) => ({
			id,
			source: pick(['Solar', 'Wind', 'Hydro', 'Geothermal']),
			capacity_mw: randomInt(50, 2000),
			location: pick(['Bangkok', 'Chonburi', 'Phuket', 'Chiang Rai']),
			efficiency_pct: randomInt(15, 45),
			estimated_annual_output_gwh: randomInt(100, 5000),
			status: pick(['Online', 'Maintenance'])
		})
	},
	{
		key: 'farm_animals',
		label: 'Farm Animals',
		icon: 'ri-bear-smile-line',
		desc: 'สัตว์ฟาร์ม (สายพันธุ์, อายุ, สุขภาพ)',
		generator: (id) => ({
			id,
			animal_type: pick(['Cow', 'Pig', 'Chicken', 'Goat', 'Sheep']),
			breed: pick(['Holstein', 'Duroc', 'Rhode Island Red', 'Angora']),
			age_months: randomInt(1, 120),
			weight_kg: randomInt(1, 800),
			last_checkup: randomDate(),
			is_healthy: secureRandom(100) > 10
		})
	},
	{
		key: 'crops',
		label: 'Crop Production',
		icon: 'ri-plant-line',
		desc: 'ผลผลิตทางการเกษตร (ชนิดข้าว, ปริมาณ, ตลาด)',
		generator: (id) => ({
			id,
			crop_name: pick(['Rice', 'Wheat', 'Corn', 'Soybean', 'Sugarcane']),
			yield_tonnes: randomInt(100, 5000),
			area_hectares: randomInt(10, 500),
			market_price_per_ton: randomInt(8000, 25000),
			harvest_season: pick(['Rainy', 'Dry', 'Winter']),
			is_organic: secureRandom(100) > 70
		})
	},
	{
		key: 'fishing_areas',
		label: 'Fishing Areas',
		icon: 'ri-anchor-line',
		desc: 'แหล่งประมง (ทะเล, ชนิดปลาที่พบมาก)',
		generator: (id) => ({
			id,
			location_name: pick(['Gulf of Thailand', 'Andaman Sea', 'North Sea', 'Pacific Coast']),
			common_species: pick(['Mackerel', 'Tuna', 'Shrimp', 'Squid', 'Cod']),
			water_temp_c: randomInt(10, 32),
			legal_status: pick(['Open', 'Closed Season', 'Protected']),
			risk_level: pick(['Low', 'Moderate', 'Stormy'])
		})
	},
	{
		key: 'shipping_containers',
		label: 'Cloud Containers',
		icon: 'ri-truck-line',
		desc: 'ตู้คอนเทนเนอร์ (รหัสตู้, ท่าเรือต้นทาง)',
		generator: (id) => ({
			id,
			container_id: `CNTR-${randomInt(10000, 99999)}`,
			vessel_name: pick(['Evergreen', 'Maersk', 'MSC', 'COSCO']),
			origin_port: pick(['Laem Chabang', 'Singapore', 'Shanghai', 'Rotterdam']),
			destination_port: pick(['Los Angeles', 'Hamburg', 'Dubai', 'Sydney']),
			cargo_weight_tonnes: randomInt(5, 30),
			status: pick(['In Transit', 'Customs Clearance', 'Delivered'])
		})
	},
	{
		key: 'cargo_manifests',
		label: 'Cargo Manifests',
		icon: 'ri-clipboard-line',
		desc: 'รายการสินค้าในตู้ (รายการสินค้า, จำนวน)',
		generator: (id) => ({
			id,
			manifest_id: `MFS-${randomInt(1000, 9999)}`,
			items: [pick(['Furniture', 'Textiles', 'Electronics', 'Chemicals'])],
			quantity: randomInt(10, 5000),
			declared_value: randomInt(5000, 500000),
			sender: pick(['Global Trade Co.', 'Fast Logistics', 'Union Exp']),
			receiver: pick(['Retail Plus', 'Home Depot', 'Tech Mart'])
		})
	},
	{
		key: 'customs_dec',
		label: 'Customs Dec',
		icon: 'ri-government-fill',
		desc: 'ใบขนสินค้าขาเข้า (ภาษี, สถานะการตรวจสอบ)',
		generator: (id) => ({
			id,
			declaration_id: `DEC-${randomInt(100000, 999999)}`,
			import_duty_pct: pick([0, 5, 10, 20, 30]),
			vat_pct: 7,
			is_cleared: secureRandom(100) > 20,
			agent_name: pick(FIRST_NAMES),
			inspection_date: randomDate()
		})
	},
	{
		key: 'logistics_shipments',
		label: 'Shipments',
		icon: 'ri-ship-line',
		desc: 'การขนส่ง (บริษัทขนส่ง, สถานะพัสดุ)',
		generator: (id) => ({
			id,
			tracking_no: `TH${randomInt(100000000, 999999999)}`,
			carrier: pick(['Kerry', 'Flash', 'J&T', 'Thailand Post', 'DHL']),
			service_type: pick(['Standard', 'Express', 'Next Day']),
			current_location: pick(CITIES),
			est_delivery: randomDate(),
			last_update: 'Package departed sorting center'
		})
	},
	{
		key: 'retail_stores',
		label: 'Retail Stores',
		icon: 'ri-store-2-line',
		desc: 'ร้านค้าปลีก (ชื่อร้าน, พิกัด, ยอดขายเฉลี่ย)',
		generator: (id) => ({
			id,
			store_name: `${pick(['Mini', 'Quick', 'Mega', 'Best'])} Mart`,
			location: pick(CITIES),
			opening_hours: '08:00 - 22:00',
			manager: pick(FIRST_NAMES),
			monthly_revenue: randomInt(100000, 5000000),
			is_open: secureRandom(100) > 10
		})
	},
	{
		key: 'loyalty_points',
		label: 'Loyalty Points',
		icon: 'ri-hand-coin-line',
		desc: 'คะแนนสะสม (จำนวนคะแนน, วันหมดอายุ)',
		generator: (id) => ({
			id,
			customer_id: randomInt(1, 1000),
			points_balance: randomInt(0, 50000),
			membership_level: pick(['Silver', 'Gold', 'Platinum']),
			expires_at: randomDate(2025, 2026),
			last_transaction_points: randomInt(1, 500),
			is_redeemable: secureRandom(100) > 30
		})
	},
	{
		key: 'tech_stacks',
		label: 'Tech Stacks',
		icon: 'ri-tools-line',
		desc: 'Stack เทคโนโลยี (เครื่องมือที่ใช้พัฒนาซอฟต์แวร์)',
		generator: (id) => ({
			id,
			stack_name: pick(['Frontend', 'Backend', 'Fullstack', 'DevOps', 'Mobile']),
			languages: [pick(['TypeScript', 'Go', 'Python', 'Rust', 'Swift'])],
			frameworks: [pick(['React', 'SvelteKit', 'Next.js', 'Echo', 'Qwik'])],
			database: pick(['PostgreSQL', 'MongoDB', 'Redis', 'DynamoDB']),
			cloud: pick(['AWS', 'Vercel', 'Firebase'])
		})
	},
	{
		key: 'dev_profiles',
		label: 'Developer Profiles',
		icon: 'ri-user-settings-line',
		desc: 'โปรไฟล์นักพัฒนา (ทักษะ, ประสบการณ์)',
		generator: (id) => ({
			id,
			name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
			role: pick(['Senior Fullstack', 'Junior Web Dev', 'Cloud Architect', 'QA Engineer']),
			years_of_experience: randomInt(1, 15),
			preferred_editor: pick(['VS Code', 'Neovim', 'IntelliJ', 'WebStorm']),
			is_open_to_work: secureRandom(100) > 70
		})
	},
	{
		key: 'api_keys_mock',
		label: 'API Keys (Mock)',
		icon: 'ri-lock-password-line',
		desc: 'รหัส API (ตัวอย่างข้อมูลปกปิด, วันสร้าง)',
		generator: (id) => ({
			id,
			key_name: `Prod-API-Key-${randomInt(1, 50)}`,
			api_key: `sk_test_${Math.random().toString(36).substring(2, 22)}`,
			permissions: pick(['Full Access', 'Read-Only', 'Billing Only']),
			status: pick(['Active', 'Revoked', 'Expired']),
			created_at: randomDate()
		})
	}
];
