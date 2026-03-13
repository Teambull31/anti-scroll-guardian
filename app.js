const feedContainer = document.getElementById('feed');
const overlay = document.getElementById('guardian-overlay');
const popup = document.getElementById('guardian-popup');
const btnContinue = document.getElementById('btn-continue');
const breathingCircle = document.getElementById('breathing-circle');
const breatheInstruction = document.getElementById('breathe-instruction');
const step1 = document.getElementById('guardian-step-1');
const step2 = document.getElementById('guardian-step-2');
const brainDumpInput = document.getElementById('brain-dump-input');
const guardianMsg = document.getElementById('guardian-msg');
const btnOpenJournal = document.getElementById('btn-open-journal');
const btnCloseJournal = document.getElementById('btn-close-journal');
const journalModal = document.getElementById('journal-modal');
const journalEntriesContainer = document.getElementById('journal-entries');

// Sleep Mode Elements
const sleepMode = document.getElementById('sleep-mode');
const starsContainer = document.getElementById('stars-container');
const btnExitSleep = document.getElementById('btn-exit-sleep');

// Tracking
let totalPixelsScrolled = 0;
let lastScrollY = window.scrollY;
let guardianActive = false;
let transeThreshold = 10;
let videoSwipedCount = 0;
let lastSwipeTime = Date.now();

// Générateur de contenu
let itemCount = 0;
const generateItems = (count = 5) => {
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.classList.add('feed-item');
        item.style.backgroundImage = `url('https://picsum.photos/400/800?random=${itemCount}')`;
        const content = document.createElement('div');
        content.classList.add('item-content');
        content.innerHTML = `<h3>Vidéo #${itemCount + 1}</h3><p>Scroll encore un peu...</p>`;
        item.appendChild(content);
        feedContainer.appendChild(item);
        itemCount++;
    }
};

// Intersection Observer pour la transe
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !guardianActive) {
            const now = Date.now();
            const timeDiff = now - lastSwipeTime;
            if (timeDiff < 2500 && timeDiff > 50) videoSwipedCount++;
            else if (timeDiff >= 2500) videoSwipedCount = Math.max(0, videoSwipedCount - 1);
            lastSwipeTime = now;
            if (videoSwipedCount >= transeThreshold) triggerGuardian();
            if (feedContainer.lastElementChild === entry.target) generateItems(3);
        }
    });
}, { threshold: 0.5 });

// Tracking de la distance réelle
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    totalPixelsScrolled += Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;
});

function triggerGuardian() {
    guardianActive = true;
    overlay.classList.remove('hidden');
    popup.classList.remove('hidden');
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    document.body.style.overflowY = 'hidden';

    // Calcul de la distance (environ 96 pixels par pouce, soit 2.54cm)
    const distanceMeters = (totalPixelsScrolled / 3780).toFixed(1);
    const floors = Math.round(distanceMeters / 3);
    
    const hour = new Date().getHours();
    let msg = `Tu as scrollé ${distanceMeters} mètres (l'équivalent de ${floors} étages !). `;
    
    if (hour >= 21 || hour <= 5) {
        guardianMsg.innerText = msg + "Ton cerveau s'épuise. On va t'aider à déconnecter.";
    } else {
        guardianMsg.innerText = msg + "C'est beaucoup pour une seule session. Respire un peu.";
    }

    startBreathingExercise();
}

function startBreathingExercise() {
    let timeLeft = 10;
    btnContinue.disabled = true;
    const interval = setInterval(() => {
        timeLeft--;
        btnContinue.innerText = `Respire... (${timeLeft}s)`;
        if (timeLeft <= 0) {
            clearInterval(interval);
            showBrainDump();
        }
    }, 1000);
}

function showBrainDump() {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    btnContinue.disabled = false;
    btnContinue.innerText = 'Sauvegarder et dormir ✨';
    btnContinue.onclick = () => {
        const text = brainDumpInput.value.trim();
        if (text) {
            const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
            entries.unshift({ date: new Date().toLocaleString('fr-FR'), text });
            localStorage.setItem('journal_entries', JSON.stringify(entries));
        }
        enterSleepMode();
    };
    brainDumpInput.focus();
}

function enterSleepMode() {
    popup.classList.add('hidden');
    overlay.classList.add('hidden');
    sleepMode.classList.remove('hidden');
    
    // Créer les étoiles
    starsContainer.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
        starsContainer.appendChild(star);
    }
}

btnExitSleep.onclick = () => {
    sleepMode.classList.add('hidden');
    document.body.style.overflowY = 'scroll';
    guardianActive = false;
    videoSwipedCount = 0;
    totalPixelsScrolled = 0;
};

// Journal
btnOpenJournal.onclick = () => {
    const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
    journalEntriesContainer.innerHTML = entries.length 
        ? entries.map(e => `<div class="journal-entry"><div class="entry-date">${e.date}</div><div class="entry-text">${e.text}</div></div>`).join('')
        : '<p>Aucune note encore...</p>';
    journalModal.classList.remove('hidden');
};

btnCloseJournal.onclick = () => journalModal.classList.add('hidden');

generateItems(10);
document.querySelectorAll('.feed-item').forEach(item => observer.observe(item));