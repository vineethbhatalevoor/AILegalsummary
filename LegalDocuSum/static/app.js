const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const summarizeBtn = document.getElementById('summarizeBtn');
const listenBtn = document.getElementById('listenBtn');
const resultSection = document.getElementById('resultSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const summaryContent = document.getElementById('summaryContent');
const errorMessage = document.getElementById('errorMessage');
const fileInfo = document.getElementById('fileInfo');
const themeToggle = document.getElementById('themeToggle');

let currentSummary = '';
let speechSynthesis = window.speechSynthesis;
let utterance = null;
let availableVoices = [];

// Load voices properly
function loadVoices() {
    availableVoices = speechSynthesis.getVoices();
    if (availableVoices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            availableVoices = speechSynthesis.getVoices();
        };
    }
}
loadVoices();

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    fileName.textContent = file ? file.name : 'No file chosen';
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const language = document.getElementById('language').value;

    if (!file) {
        showError('Please select a file to upload');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    showLoading();

    try {
        const response = await fetch('/summarize', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.summary) {
            currentSummary = data.summary;
            showResult(data.summary, file.name);
        } else {
            showError(data.error || 'An error occurred while processing your document');
        }
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
    }
});

listenBtn.addEventListener('click', () => {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        listenBtn.innerHTML = '<span class="btn-icon">🔊</span> Listen';
    } else {
        const language = document.getElementById('language').value;
        const langMap = {
            'English': 'en-IN',
            'Hindi': 'hi-IN',
            'Kannada': 'kn-IN'
        };
        const speechLang = langMap[language] || 'en-IN';

        utterance = new SpeechSynthesisUtterance(currentSummary);
        utterance.lang = speechLang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        const matchedVoice = availableVoices.find(v => v.lang === speechLang);
        utterance.voice = matchedVoice || availableVoices[0];

        if (!matchedVoice) {
            console.warn(`No voice found for ${speechLang}. Using default voice.`);
        }

        utterance.onstart = () => {
            listenBtn.innerHTML = '<span class="btn-icon">⏸️</span> Stop';
        };

        utterance.onend = () => {
            listenBtn.innerHTML = '<span class="btn-icon">🔊</span> Listen';
        };

        speechSynthesis.speak(utterance);
    }
});

function showLoading() {
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
    loadingSection.style.display = 'block';
    summarizeBtn.disabled = true;
}
function showResult(summary, filename) {
    loadingSection.style.display = 'none';
    errorSection.style.display = 'none';
    resultSection.style.display = 'block';

    summaryContent.innerHTML = summary;  

    fileInfo.innerHTML = `<strong>📎 File:</strong> ${filename}`;
    summarizeBtn.disabled = false;

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
    loadingSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
    summarizeBtn.disabled = false;

    errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const themeIcon = themeToggle.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}