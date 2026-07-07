// Nội dung màn ban đầu
const messages = [
	{ role: "bot", text: "Em à, anh có điều này muốn nói với em" },
	{ role: "bot", text: "Từ lâu anh đã muốn nói điều này..." },
	{ role: "user", text: "Điều gì vậy?" },
	{ role: "bot", text: "Anh muốn nói rằng anh thích em :3" },
	{ role: "user", text: "Hmmm" },
	{ role: "bot", text: "Hãy làm người yêu anh nhé" },
	{ role: "user", text: "Em đồng ý" },
	{ role: "bot", text: "Gọi video anh điều bất ngờ cho em..." }
];

// bên dưới là ảnh kèm nội dung ở phần sau khi ấn chấp nhận cuộc gọi, bạn có thể thay đổi ảnh và nội dung theo ý muốn
const SPEED = 32;
const DELAY = 900;
const GLITCH_DURATION = 0;
const TAP_EFFECT_DURATION = 1000;
const SLIDE_DELAY = 4200;
const AVATAR_SRC = 'image/anh.jpg';
const CALL_BG_IMAGE = 'image/anh11.jpg';
const SLIDE_IMAGES = [
	'image/anh2.jpg',
	'image/anh3.jpg',
	'image/anh4.jpg',
	'image/anh5.jpg',
	'image/anh6.jpg',
	'image/anh7.jpg',
	'image/anh8.jpg',
	'image/anh9.jpg',
	'image/anh10.jpg',
	'image/anh11.jpg'
];
const SLIDE_COPY = [
	'Anh thích em từ những điều rất nhỏ.',
	'Nụ cười của em làm anh rung động.',
	'Mỗi ngày trôi qua, anh lại nhớ em nhiều hơn.',
	'Anh chỉ muốn được ở cạnh em thật lâu.',
	'Nếu được chọn lại, anh vẫn sẽ chọn em.',
	'Em là lý do anh muốn cố gắng mỗi ngày.',
	'Trái tim anh từ lâu đã thuộc về em.',
	'Anh không giỏi nói lời hoa mỹ, nhưng anh thương em thật lòng.',
	'Điều anh mong nhất là được cùng em đi tiếp.',
	'Cho anh một cơ hội để yêu em nhé.',
	'Anh thích em, rất nhiều, và không hề đùa đâu'
];

const box = document.getElementById('msgs');
const heartsBg = document.getElementById('hearts-bg');
const phone = document.getElementById('phone');
const tapGate = document.getElementById('tap-gate');
const tapHeart = document.getElementById('tap-heart');
const tapLikeToggle = document.getElementById('tap-like-toggle');
const glitchLayer = document.getElementById('glitch-layer');
const callScreen = document.getElementById('call-screen');
const callActions = document.getElementById('call-actions');
const declineBtn = document.getElementById('decline-btn');
const acceptBtn = document.getElementById('accept-btn');
const declineHint = document.getElementById('decline-hint');
const revealScreen = document.getElementById('reveal-screen');
const revealImage = document.getElementById('reveal-image');
const revealLine = document.getElementById('reveal-line');
const romanceAudio = document.getElementById('romance-audio');

let declineTries = 0;
let slideIndex = 0;
let slideTimer = null;
let callStarted = false;
let tapGateTriggered = false;

// live clock
function updateClock() {
	const n = new Date();
	document.getElementById('sb-time').textContent =
		n.getHours().toString().padStart(2, '0') + ':' + n.getMinutes().toString().padStart(2, '0');
}
updateClock();
setInterval(updateClock, 30000);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function syncAppViewportHeight() {
	const vvHeight = window.visualViewport ? window.visualViewport.height : 0;
	const vh = Math.max(window.innerHeight, vvHeight);
	document.documentElement.style.setProperty('--app-height', `${Math.round(vh)}px`);
}

function enterMobileFullscreen() {
	const isMobile = window.matchMedia('(max-width: 899px)').matches;
	if (!isMobile) return;

	const doc = document;
	if (doc.fullscreenElement || doc.webkitFullscreenElement) return;

	const root = doc.documentElement;
	const request = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
	if (request) {
		request.call(root).catch(() => {});
	}
}

function setupFullscreenOnMobile() {
	const isMobile = window.matchMedia('(max-width: 899px)').matches;
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	if (!isMobile || !isTouchDevice) return;

	const removeTryListeners = () => {
		window.removeEventListener('touchstart', tryEnter);
	};

	const tryEnter = () => {
		enterMobileFullscreen();

		if (screen.orientation && screen.orientation.lock) {
			screen.orientation.lock('portrait').catch(() => {});
		}

		if (document.fullscreenElement || document.webkitFullscreenElement) {
			removeTryListeners();
		}
	};

	// Try immediately; some browsers allow this right after navigation.
	setTimeout(tryEnter, 120);

	// Fallback for browsers that require user gesture on touch devices.
	window.addEventListener('touchstart', tryEnter, { passive: true });
}

function startBackgroundMusic() {
	if (!romanceAudio) return;
	romanceAudio.volume = 0.8;

	const tryPlay = () => {
		romanceAudio.play().catch(() => {});
	};

	tryPlay();

	// Fallback for browsers that block autoplay until a user gesture.
	window.addEventListener('pointerdown', tryPlay, { once: true });
	window.addEventListener('keydown', tryPlay, { once: true });
	window.addEventListener('touchstart', tryPlay, { once: true });
}

async function runGlitchToCall() {
	if (callStarted) return;
	callStarted = true;
	phone.classList.add('cinematic');
	callScreen.classList.add('active');

	if (GLITCH_DURATION <= 0) {
		glitchLayer.classList.remove('active');
		return;
	}

	glitchLayer.classList.add('active');
	await sleep(GLITCH_DURATION);
	glitchLayer.classList.remove('active');
}

function startCallFromTap() {
	if (tapGateTriggered || callStarted) return;
	tapGateTriggered = true;

	if (tapLikeToggle) {
		tapLikeToggle.checked = true;
	}

	setTimeout(() => {
		if (tapGate) {
			tapGate.classList.remove('active');
		}
		runGlitchToCall();
	}, TAP_EFFECT_DURATION);
}

function onTapHeartChanged() {
	if (!tapLikeToggle || !tapLikeToggle.checked) return;
	if (tapGate) {
		startCallFromTap();
	}
}

function preloadSlides() {
	const callBg = new Image();
	callBg.src = CALL_BG_IMAGE;

	const avatar = new Image();
	avatar.src = AVATAR_SRC;

	SLIDE_IMAGES.forEach((src) => {
		const img = new Image();
		img.src = src;
	});
}

function evadeDecline() {
	declineTries += 1;
	const x = (Math.random() * 130) - 65;
	const y = (Math.random() * 54) - 27;
	declineBtn.style.transform = `translate(${x}px, ${y}px)`;

	if (declineTries === 1) {
		declineHint.textContent = 'Lỡ tay thôi đúng không? Bấm lại đi ❤️';
	} else {
		declineHint.textContent = 'Nó đang né em đó... hay bấm Chấp nhận nhé!';
	}

	if (navigator.vibrate) {
		navigator.vibrate([35, 25, 35]);
	}
}

function renderRevealCopy(index) {
	revealLine.textContent = SLIDE_COPY[index % SLIDE_COPY.length];
}

function showSlide(index) {
	revealImage.classList.remove('show');
	revealLine.classList.remove('show');
	revealImage.src = SLIDE_IMAGES[index % SLIDE_IMAGES.length];
	renderRevealCopy(index);
	requestAnimationFrame(() => {
		revealImage.classList.add('show');
		revealLine.classList.add('show');
	});
}

function startSlideAutoplay() {
	if (slideTimer) {
		clearInterval(slideTimer);
	}

	slideTimer = setInterval(() => {
		slideIndex += 1;
		showSlide(slideIndex);
	}, SLIDE_DELAY);
}

function advanceSlideManually() {
	if (!revealScreen.classList.contains('active')) return;

	slideIndex += 1;
	showSlide(slideIndex);
	startSlideAutoplay();
}

function startReveal() {
	callScreen.classList.remove('active');
	revealScreen.classList.add('active');

	slideIndex = 0;
	showSlide(slideIndex);
	startSlideAutoplay();
}

function bindCinematicEvents() {
	if (tapLikeToggle) {
		tapLikeToggle.addEventListener('change', onTapHeartChanged);
	} else if (tapHeart) {
		tapHeart.addEventListener('click', startCallFromTap);
	}

	declineBtn.addEventListener('click', evadeDecline);
	declineBtn.addEventListener('mouseenter', evadeDecline);
	declineBtn.addEventListener('touchstart', evadeDecline, { passive: true });
	acceptBtn.addEventListener('click', startReveal);

	// In reveal mode, user can tap anywhere to move to the next photo/caption.
	revealScreen.addEventListener('pointerup', advanceSlideManually);
}

function startPostChatFlow() {
	if (tapGate) {
		tapGateTriggered = false;
		if (tapLikeToggle) {
			tapLikeToggle.checked = false;
		}
		tapGate.classList.add('active');
	}
}

function createMsgAvatar() {
	const av = document.createElement('div');
	av.className = 'msg-av';

	const img = document.createElement('img');
	img.className = 'avatar-img';
	img.src = AVATAR_SRC;
	img.alt = 'Ảnh đại diện';

	av.appendChild(img);
	return av;
}

function spawnHeart() {
	if (!heartsBg) return;

	const heart = document.createElement('span');
	heart.className = 'heart';
	heart.textContent = '❤';

	const size = 10 + Math.random() * 18;
	const left = Math.random() * 100;
	const drift = -30 + Math.random() * 60;
	const duration = 7 + Math.random() * 6;
	const delay = Math.random() * .6;
	const opacity = .25 + Math.random() * .45;

	heart.style.left = left + '%';
	heart.style.fontSize = size + 'px';
	heart.style.opacity = opacity.toFixed(2);
	heart.style.setProperty('--drift', drift.toFixed(1) + 'px');
	heart.style.animationDuration = duration.toFixed(2) + 's';
	heart.style.animationDelay = delay.toFixed(2) + 's';

	heartsBg.appendChild(heart);
	setTimeout(() => {
		heart.remove();
	}, (duration + delay + .3) * 1000);
}

function runHearts() {
	// Seed some hearts so background does not start empty.
	for (let i = 0; i < 18; i++) {
		setTimeout(spawnHeart, i * 220);
	}

	setInterval(spawnHeart, 260);
}

async function typeText(el, text) {
	const cur = document.createElement('span');
	cur.className = 'cursor';
	el.appendChild(cur);
	for (let ch of text) {
		el.insertBefore(document.createTextNode(ch), cur);
		await sleep(SPEED);
	}
	el.removeChild(cur);
}

async function runChat() {
	box.innerHTML = '';
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i];
		await sleep(i === 0 ? 700 : 520);

		const wrap = document.createElement('div');
		wrap.className = 'msg-wrap ' + msg.role;

		if (msg.role === 'bot') {
			// left avatar + typing bubble
			const av = createMsgAvatar();

			const dw = document.createElement('div');
			dw.className = 'msg-wrap bot';
			const dav = createMsgAvatar();
			const db = document.createElement('div');
			db.className = 'bubble';
			db.innerHTML = '<div class="tdots"><span></span><span></span><span></span></div>';
			dw.appendChild(dav);
			dw.appendChild(db);
			box.appendChild(dw);
			box.scrollTop = box.scrollHeight;
			await sleep(DELAY);
			box.removeChild(dw);

			const bbl = document.createElement('div');
			bbl.className = 'bubble';
			wrap.appendChild(av.cloneNode(true));
			wrap.appendChild(bbl);
			box.appendChild(wrap);
			await sleep(20);
			wrap.classList.add('show');
			box.scrollTop = box.scrollHeight;
			await typeText(bbl, msg.text);

		} else {
			const bbl = document.createElement('div');
			bbl.className = 'bubble';
			wrap.appendChild(bbl);
			box.appendChild(wrap);
			await sleep(20);
			wrap.classList.add('show');
			box.scrollTop = box.scrollHeight;
			await typeText(bbl, msg.text);
		}
	}
	await sleep(120);
	startPostChatFlow();
}

bindCinematicEvents();
setupFullscreenOnMobile();
startBackgroundMusic();
preloadSlides();
if (window.matchMedia('(min-width: 900px)').matches) {
	runHearts();
}
runChat();
