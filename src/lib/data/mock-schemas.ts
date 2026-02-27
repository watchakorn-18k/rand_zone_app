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
	}
];
