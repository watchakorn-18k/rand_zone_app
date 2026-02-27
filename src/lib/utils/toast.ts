export function showToast(msg: string) {
	if (typeof document === 'undefined') return;
	document.querySelectorAll('.toast-el').forEach((t) => t.remove());
	const t = document.createElement('div');
	t.className =
		'toast-el fixed bottom-6 right-6 bg-base-800 border border-base-700 rounded-xl px-5 py-3 text-[13px] text-base-200 z-[200] flex items-center gap-2 shadow-xl';
	t.style.animation = 'resultIn 0.3s ease';
	t.innerHTML = `<i class="ri-information-line text-pri-400"></i><span>${msg}</span>`;
	document.body.appendChild(t);
	setTimeout(() => {
		t.style.opacity = '0';
		t.style.transition = 'opacity 0.3s';
	}, 2500);
	setTimeout(() => t.remove(), 2800);
}
