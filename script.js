const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particlesArray;

// Resize canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update() {
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        this.x += this.directionX;
        this.y += this.directionY;

        // Twinkle effect
        if (Math.random() > 0.95) {
            this.opacity = Math.random() * 0.8 + 0.2;
        }

        this.draw();
    }
}

function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = Math.random() * 2.5; // Slightly larger for gold dust
        let x = Math.random() * (innerWidth - size * 2) + size * 2;
        let y = Math.random() * (innerHeight - size * 2) + size * 2;
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = '#d4af37'; // Gold

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
}

/* --- Audio Logic --- */
const countdownAudio = document.getElementById('countdown-audio');
const celebrationAudio = document.getElementById('celebration-audio');
const musicToggle = document.getElementById('music-toggle');

let isMusicPlaying = false;
let currentTrack = countdownAudio; // Default start track if time > 0

// Function to smooth fade out
function fadeOutAndStop(audioElement, duration = 2000) {
    const startVolume = audioElement.volume;
    const stepTime = 50; // ms
    const stepAmount = startVolume / (duration / stepTime);

    const fadeInterval = setInterval(() => {
        if (audioElement.volume > stepAmount) {
            audioElement.volume -= stepAmount;
        } else {
            audioElement.volume = 0;
            audioElement.pause();
            audioElement.currentTime = 0;
            clearInterval(fadeInterval);
            // Reset volume for next time if needed
            audioElement.volume = 1.0;
        }
    }, stepTime);
}

// Switch Music Function
function switchMusic() {
    if (currentTrack === celebrationAudio) return; // Already switched

    console.log("Switching to celebration music!");

    // Simple transition: Fade out countdown, start celebration
    if (isMusicPlaying) {
        fadeOutAndStop(countdownAudio);
        celebrationAudio.volume = 1.0;
        celebrationAudio.play().catch(e => console.log("Autoplay blocked:", e));
    } else {
        // If music wasn't playing, just swap the 'current' reference 
        // effectively 'arming' the celebration track for when user clicks toggle
    }

    currentTrack = celebrationAudio;
}

if (musicToggle) {
    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            currentTrack.pause();
            musicToggle.innerText = "🔇";
        } else {
            currentTrack.play().catch(e => console.log("Audio play failed:", e));
            musicToggle.innerText = "🎵";
        }
        isMusicPlaying = !isMusicPlaying;
    });
}

/* --- Countdown Logic --- */
function updateCountdown() {
    // !IMPORTANT: Change this date to test the transition!
    const targetDate = new Date("January 1, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");
    const countdownContainer = document.getElementById("countdown");
    const celebrationContainer = document.getElementById("celebration");

    // Check if countdown finished
    if (difference <= 0) {
        if (countdownContainer && !countdownContainer.classList.contains("hidden")) {
            countdownContainer.classList.add("hidden");
            celebrationContainer.classList.remove("hidden");

            // Trigger Music Switch
            switchMusic();
        }
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const format = (num) => num < 10 ? `0${num}` : num;

    if (daysElement) daysElement.innerText = format(days);
    if (hoursElement) hoursElement.innerText = format(hours);
    if (minutesElement) minutesElement.innerText = format(minutes);
    if (secondsElement) secondsElement.innerText = format(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* --- Chat Logic (Firebase) --- */
// Using Firebase Compat SDK (Global 'firebase' object)

// !!! TODO: REPLACE THIS WITH YOUR OWN FIREBASE CONFIG !!!
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

let db;
const chatStatus = document.getElementById('chat-status');

function updateChatStatus(isOnline) {
    if (chatStatus) {
        if (isOnline) {
            chatStatus.classList.remove('offline');
            chatStatus.classList.add('online');
            chatStatus.title = "Connected";
        } else {
            chatStatus.classList.remove('online');
            chatStatus.classList.add('offline');
            chatStatus.title = "Disconnected / Demo Mode";
        }
    }
}

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();

    // Check connection
    const connectedRef = db.ref(".info/connected");
    connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
            updateChatStatus(true);
        } else {
            updateChatStatus(false);
        }
    });

} catch (e) {
    console.warn("Firebase not configured or script failed loading. Chat will be in offline demo mode.");
    updateChatStatus(false);
}

const chatWidget = document.getElementById('chat-widget');
const openChatBtn = document.getElementById('open-chat-fab');
const closeChatBtn = document.getElementById('toggle-chat-btn');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('chat-messages');

// UI Toggles
// UI Toggles
if (openChatBtn) {
    openChatBtn.addEventListener('click', () => {
        chatWidget.classList.remove('closed');
        chatWidget.style.transform = 'scale(1)';
        chatWidget.style.opacity = '1';
        chatWidget.style.pointerEvents = 'auto'; // Ensure clickable
        openChatBtn.style.transform = 'scale(0)'; // Hide FAB
    });
}

if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
        chatWidget.classList.add('closed');
        chatWidget.style.transform = 'scale(0)';
        chatWidget.style.opacity = '0';
        chatWidget.style.pointerEvents = 'none';
        openChatBtn.style.transform = 'scale(1)'; // Show FAB
    });
}

// Messaging
function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        // Online Mode
        const messagesRef = db.ref('messages');
        messagesRef.push({
            text: text,
            timestamp: Date.now(),
            // Simple ID generation for demo purposes
            senderId: localStorage.getItem('chatUserId') || 'user_' + Math.floor(Math.random() * 1000)
        });
    } else {
        // Offline / Demo Mode
        addMessageToUI(text, 'sent');
        setTimeout(() => {
            addMessageToUI("This is a demo reply. Check the status dot!", 'received');
        }, 1000);
    }

    chatInput.value = '';
}

function addMessageToUI(text, type) {
    const div = document.createElement('div');
    div.classList.add('message', type);
    div.textContent = text;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Store a random ID for this session to distinguish "sent" vs "received"
if (!localStorage.getItem('chatUserId')) {
    localStorage.setItem('chatUserId', 'user_' + Math.floor(Math.random() * 100000));
}
const myId = localStorage.getItem('chatUserId');

// Listen for messages (Online Mode)
if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const messagesRef = db.ref('messages');
    messagesRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        const type = data.senderId === myId ? 'sent' : 'received';
        addMessageToUI(data.text, type);
    });
}
init();
animate();
