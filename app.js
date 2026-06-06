/**
 * Quran Player & Productivity PWA (قرآني)
 * Core Application Logic
 * Developer: محمد
 */

// --- Default Data: Reciters and Surahs ---
const DEFAULT_RECITERS = [
  {
    id: "alafasy",
    name: "مشاري العفاسي",
    folder: "مشاري العفاسي",
    baseUrl: "https://server8.mp3quran.net/afs/",
    avatar: "ع",
    subText: "عذب التلاوة ورائد الأناشيد"
  },
  {
    id: "sudais",
    name: "عبد الرحمن السديس",
    folder: "عبد الرحمن السديس",
    baseUrl: "https://server11.mp3quran.net/sds/",
    avatar: "س",
    subText: "إمام الحرم المكي الشريف"
  },
  {
    id: "yasser",
    name: "ياسر الدوسري",
    folder: "ياسر الدوسري",
    baseUrl: "https://server11.mp3quran.net/yasser/",
    avatar: "د",
    subText: "صوت قوي وتجويد رائع"
  },
  {
    id: "basit",
    name: "عبد الباسط عبد الصمد",
    folder: "عبد الباسط عبد الصمد",
    baseUrl: "https://server7.mp3quran.net/basit/",
    avatar: "ب",
    subText: "صاحب الحنجرة الذهبية والتلاوة المجودة"
  },
  {
    id: "husr",
    name: "محمود خليل الحصري",
    folder: "محمود خليل الحصري",
    baseUrl: "https://server13.mp3quran.net/husr/",
    avatar: "ح",
    subText: "المعلم الأول لترتيل وتجويد القرآن"
  },
  {
    id: "minsh",
    name: "محمد صديق المنشاوي",
    folder: "محمد صديق المنشاوي",
    baseUrl: "https://server10.mp3quran.net/minsh/",
    avatar: "م",
    subText: "صاحب الصوت الباكي الخاشع"
  },
  {
    id: "ahmad_talib",
    name: "أحمد بن طالب بن حميد",
    folder: "أحمد بن طالب بن حميد",
    baseUrl: "https://server16.mp3quran.net/a_binhameed/Rewayat-Hafs-A-n-Assem/",
    avatar: "ط",
    subText: "إمام المسجد النبوي الشريف"
  }
];

const SURAH_NAMES = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

const DEFAULT_SURAHS = SURAH_NAMES.map((name, index) => {
  const id = String(index + 1).padStart(3, '0');
  return {
    id: id,
    name: name,
    filename: `${id}.mp3`
  };
});

// --- App State ---
let reciters = [...DEFAULT_RECITERS];
let currentReciterIndex = 0;
let currentTrackIndex = 0;
let playbackSpeed = 1.0;
let isMuted = false;
let previousVolume = 0.8;
let currentAudioSourceMode = "local"; // local | cache | online

// Timer State
let timerInterval = null;
let timerTotalSeconds = 1500; // default 25 minutes
let timerSecondsRemaining = 1500;
let isTimerRunning = false;

// PWA Install Prompt
let deferredPrompt = null;

// --- DOM Elements ---
const DOM = {
  // Navigation / Status
  installBtn: document.getElementById("installBtn"),
  networkStatus: document.getElementById("networkStatus"),

  // Reciter List & Search
  recitersList: document.getElementById("recitersList"),
  sheikhSearch: document.getElementById("sheikhSearch"),

  // Player Panel
  playerSheikhAvatar: document.getElementById("playerSheikhAvatar"),
  playerSheikhName: document.getElementById("playerSheikhName"),
  playerTrackName: document.getElementById("playerTrackName"),
  sourceBadge: document.getElementById("sourceBadge"),
  mainAudio: document.getElementById("mainAudio"),
  spinningDisk: document.getElementById("spinningDisk"),
  waveVisualizer: document.getElementById("waveVisualizer"),
  tracksList: document.getElementById("tracksList"),

  // Player Controls
  currentTime: document.getElementById("currentTime"),
  durationTime: document.getElementById("durationTime"),
  progressSlider: document.getElementById("progressSlider"),
  loopBtn: document.getElementById("loopBtn"),
  prevBtn: document.getElementById("prevBtn"),
  playPauseBtn: document.getElementById("playPauseBtn"),
  nextBtn: document.getElementById("nextBtn"),
  speedBtn: document.getElementById("speedBtn"),
  muteBtn: document.getElementById("muteBtn"),
  volumeIcon: document.getElementById("volumeIcon"),
  volumeSlider: document.getElementById("volumeSlider"),

  // Todo Card
  todoFilterLabel: document.getElementById("todoFilterLabel"),
  todoForm: document.getElementById("todoForm"),
  todoInput: document.getElementById("todoInput"),
  todoList: document.getElementById("todoList"),
  todoCount: document.getElementById("todoCount"),
  clearCompletedTodos: document.getElementById("clearCompletedTodos"),

  // Timer Card
  timerDigits: document.getElementById("timerDigits"),
  timerProgress: document.getElementById("timerProgress"),
  startTimerBtn: document.getElementById("startTimerBtn"),
  pauseTimerBtn: document.getElementById("pauseTimerBtn"),
  resetTimerBtn: document.getElementById("resetTimerBtn"),
  customMinutes: document.getElementById("customMinutes"),
  applyCustomTime: document.getElementById("applyCustomTime"),
  timerPresets: document.querySelectorAll(".btn-preset")
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initPWA();
  loadRecitersFromStorage();
  renderReciters();
  selectReciter(0);
  initAudioEvents();
  initTodoEvents();
  initTimerEvents();
  checkNetworkStatus();
  initAdminEvents();
});

// --- PWA Installation & Network Handling ---
function initPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered successfully.', reg.scope))
        .catch(err => console.warn('Service Worker registration failed:', err));
    });
  }

  // Handle PWA Install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    DOM.installBtn.classList.remove('hidden');
  });

  DOM.installBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      deferredPrompt = null;
      DOM.installBtn.classList.add('hidden');
    });
  });

  window.addEventListener('appinstalled', () => {
    console.log('App was successfully installed!');
    DOM.installBtn.classList.add('hidden');
  });

  // Online/Offline status listeners
  window.addEventListener('online', checkNetworkStatus);
  window.addEventListener('offline', checkNetworkStatus);
}

function checkNetworkStatus() {
  if (navigator.onLine) {
    DOM.networkStatus.className = 'network-badge online';
    DOM.networkStatus.querySelector('.status-text').textContent = 'متصل بالإنترنت';
  } else {
    DOM.networkStatus.className = 'network-badge offline';
    DOM.networkStatus.querySelector('.status-text').textContent = 'أوفلاين (وضع عدم الاتصال)';
  }
}

// --- Cache & Offline Download Manager ---

// Helper to check reciter audio caching status
async function getReciterCacheStatus(reciter) {
  try {
    const cache = await caches.open("quran-audio-cache");
    let cachedCount = 0;
    for (const surah of DEFAULT_SURAHS) {
      const url = `${reciter.baseUrl}${surah.id}.mp3`;
      const match = await cache.match(url);
      if (match) {
        cachedCount++;
      }
    }
    if (cachedCount === DEFAULT_SURAHS.length) {
      return "downloaded";
    } else if (cachedCount > 0) {
      return "partial";
    } else {
      return "not_cached";
    }
  } catch (e) {
    return "not_cached";
  }
}

// Update Download Button UI icon and title
function updateDownloadBtnUI(btn, status, current = 0, total = 0) {
  btn.className = "download-reciter-btn";
  if (status === "downloaded") {
    btn.classList.add("downloaded");
    btn.title = "محمل بالكامل وجاهز للتشغيل أوفلاين (انقر للحذف)";
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (status === "partial") {
    btn.classList.add("partial");
    btn.title = "محمل جزئياً. انقر لتحميل الباقي.";
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.5-2-2.1-3.6-4.1-4.1-3.3-.8-6.1 1.2-6.1 4.3 0 .5-.1 1.1-.3 1.6M12 12v9m0 0l-3-3m3 3l3-3"/>
      </svg>
    `;
  } else if (status === "downloading") {
    btn.classList.add("downloading");
    btn.title = `جاري تحميل سور الشيخ... (${current}/${total})`;
    btn.innerHTML = `
      <div class="download-progress-spinner">
        <svg class="spinner" width="16" height="16" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80 200"></circle>
        </svg>
        <span class="progress-number">${current}</span>
      </div>
    `;
  } else {
    // not cached
    btn.title = "تحميل كل سور الشيخ للاستماع بدون إنترنت (أوفلاين)";
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
      </svg>
    `;
  }
}

// Download all default surahs for a given reciter index
async function downloadReciterAudio(reciterIdx, btn) {
  const reciter = reciters[reciterIdx];
  if (!navigator.onLine) {
    alert("لا يمكنك تحميل الملفات أثناء عدم الاتصال بالإنترنت.");
    return;
  }

  const total = DEFAULT_SURAHS.length;
  updateDownloadBtnUI(btn, "downloading", 0, total);

  try {
    const cache = await caches.open("quran-audio-cache");
    let successCount = 0;

    for (const surah of DEFAULT_SURAHS) {
      const url = `${reciter.baseUrl}${surah.id}.mp3`;

      // Check if already in cache
      const cached = await cache.match(url);
      if (cached) {
        successCount++;
        updateDownloadBtnUI(btn, "downloading", successCount, total);
        continue;
      }

      // Fetch and cache
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        successCount++;
        updateDownloadBtnUI(btn, "downloading", successCount, total);
      }
    }

    if (successCount === total) {
      updateDownloadBtnUI(btn, "downloaded");
      if (reciterIdx === currentReciterIndex) {
        updateAudioSourceBadge();
      }
    } else {
      updateDownloadBtnUI(btn, "partial");
      alert(`تم تحميل ${successCount} سور من أصل ${total} للشيخ ${reciter.name}.`);
    }
  } catch (err) {
    console.error("Failed to download reciter audio:", err);
    updateDownloadBtnUI(btn, "not_cached");
    alert("فشل التحميل. يرجى التحقق من اتصال الشبكة.");
  }
}

// Remove cached files for a reciter
async function removeReciterAudioFromCache(reciter) {
  try {
    const cache = await caches.open("quran-audio-cache");
    for (const surah of DEFAULT_SURAHS) {
      const url = `${reciter.baseUrl}${surah.id}.mp3`;
      await cache.delete(url);
    }
  } catch (e) {
    console.error("Failed to delete cached audio:", e);
  }
}

// Background auto-caching of played track
async function autoCacheTrack(reciter, surah) {
  if (!navigator.onLine) return; // only cache if online
  const onlineSrc = `${reciter.baseUrl}${surah.id}.mp3`;
  try {
    const cache = await caches.open("quran-audio-cache");
    const cachedResponse = await cache.match(onlineSrc);
    if (!cachedResponse) {
      console.log(`Auto-caching track in background: ${surah.name} by ${reciter.name}`);
      const response = await fetch(onlineSrc);
      if (response.ok) {
        await cache.put(onlineSrc, response);
        console.log(`Successfully cached track: ${surah.name}`);

        // Refresh the download icon status for this reciter
        const reciterIdx = reciters.findIndex(r => r.name === reciter.name);
        if (reciterIdx !== -1) {
          const status = await getReciterCacheStatus(reciter);
          const items = DOM.recitersList.querySelectorAll(".reciter-item");
          items.forEach(item => {
            if (parseInt(item.dataset.index) === reciterIdx) {
              const btn = item.querySelector(".download-reciter-btn");
              if (btn) updateDownloadBtnUI(btn, status);
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Failed to auto-cache track in background:", err);
  }
}

// Helper to dynamically update the active playing track source badge
async function updateAudioSourceBadge() {
  const reciter = reciters[currentReciterIndex];
  const surah = DEFAULT_SURAHS[currentTrackIndex];
  const onlineSrc = `${reciter.baseUrl}${surah.id}.mp3`;

  if (currentAudioSourceMode === "local") {
    DOM.sourceBadge.textContent = "محلي (مجلد)";
    DOM.sourceBadge.className = "source-badge local";
  } else if (currentAudioSourceMode === "cache") {
    DOM.sourceBadge.textContent = "محفوظ أوفلاين (كاش)";
    DOM.sourceBadge.className = "source-badge local";
  } else {
    DOM.sourceBadge.textContent = "إنترنت (بث مباشر)";
    DOM.sourceBadge.className = "source-badge";
  }
}

// --- Reciter Management ---
function renderReciters(filter = "") {
  DOM.recitersList.innerHTML = "";
  reciters.forEach(async (reciter, idx) => {
    if (filter && !reciter.name.includes(filter)) return;

    const item = document.createElement("div");
    item.className = `reciter-item ${idx === currentReciterIndex ? 'active' : ''}`;
    item.dataset.index = idx;

    item.innerHTML = `
      <div class="reciter-info">
        <div class="reciter-avatar">${reciter.avatar}</div>
        <div class="reciter-name-details">
          <span class="reciter-name">${reciter.name}</span>
          <span class="reciter-sub">${reciter.subText || ''}</span>
        </div>
      </div>
      <button class="download-reciter-btn" data-index="${idx}" title="تحميل التلاوات للاستماع أوفلاين">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
      </button>
    `;

    const dlBtn = item.querySelector(".download-reciter-btn");

    // Check caching status asynchronously
    const status = await getReciterCacheStatus(reciter);
    updateDownloadBtnUI(dlBtn, status);

    // Click on download button
    dlBtn.addEventListener("click", async (e) => {
      e.stopPropagation(); // prevent row click selection
      if (dlBtn.classList.contains("downloaded")) {
        if (confirm(`هل تريد حذف ملفات الكاش المحملة للشيخ ${reciter.name} لتوفير المساحة؟`)) {
          await removeReciterAudioFromCache(reciter);
          const newStatus = await getReciterCacheStatus(reciter);
          updateDownloadBtnUI(dlBtn, newStatus);
          if (idx === currentReciterIndex) {
            // Re-evaluate playing source
            loadTrack(currentTrackIndex, DOM.mainAudio.paused ? false : true);
          }
        }
        return;
      }

      if (dlBtn.classList.contains("downloading")) return;
      await downloadReciterAudio(idx, dlBtn);
    });

    // Click to select
    item.addEventListener("click", () => {
      selectReciter(idx);
    });

    DOM.recitersList.appendChild(item);
  });
}

function selectReciter(idx) {
  currentReciterIndex = idx;
  const activeItems = DOM.recitersList.querySelectorAll(".reciter-item");
  activeItems.forEach(el => el.classList.remove("active"));

  const selectedEl = DOM.recitersList.querySelector(`[data-index="${idx}"]`);
  if (selectedEl) selectedEl.classList.add("active");

  const reciter = reciters[idx];
  DOM.playerSheikhAvatar.textContent = reciter.avatar;
  DOM.playerSheikhName.textContent = reciter.name;
  DOM.todoFilterLabel.textContent = reciter.name;

  renderTracks();
  loadTodos(); // Load todos associated with this specific sheikh

  // Reset track selection to first Surah
  currentTrackIndex = 0;
  loadTrack(currentTrackIndex, false);
}

// --- Tracks / Surah System ---
function renderTracks() {
  DOM.tracksList.innerHTML = "";
  DEFAULT_SURAHS.forEach((surah, idx) => {
    const item = document.createElement("div");
    item.className = `track-item ${idx === currentTrackIndex ? 'active' : ''}`;
    item.dataset.index = idx;

    item.innerHTML = `
      <span class="track-num">${surah.id}</span>
      <span class="track-name">${surah.name}</span>
    `;

    item.addEventListener("click", () => {
      loadTrack(idx, true);
    });

    DOM.tracksList.appendChild(item);
  });
}

async function loadTrack(trackIdx, autoPlay = true) {
  currentTrackIndex = trackIdx;

  // Highlight track item
  const trackItems = DOM.tracksList.querySelectorAll(".track-item");
  trackItems.forEach(el => el.classList.remove("active"));
  const activeTrackEl = DOM.tracksList.querySelector(`[data-index="${trackIdx}"]`);
  if (activeTrackEl) activeTrackEl.classList.add("active");

  const reciter = reciters[currentReciterIndex];
  const surah = DEFAULT_SURAHS[trackIdx];
  DOM.playerTrackName.textContent = surah.name;

  // Construct paths
  const localSrc = `./audio/${reciter.folder}/${surah.filename}`;
  const onlineSrc = `${reciter.baseUrl}${surah.id}.mp3`;

  // First: Check if the online URL exists in browser's cache storage
  const cache = await caches.open("quran-audio-cache");
  const cachedResponse = await cache.match(onlineSrc);

  if (cachedResponse) {
    currentAudioSourceMode = "cache";
    DOM.mainAudio.src = onlineSrc; // Service Worker intercepts and plays it instantly offline
  } else {
    // If not in cache, fallback to local physical directory
    currentAudioSourceMode = "local";
    DOM.mainAudio.src = localSrc;
  }

  updateAudioSourceBadge();
  updateSingleTrackDownloadBtnUI();
  DOM.mainAudio.load();

  if (autoPlay) {
    playAudio();
  }
}

// --- Audio Player Logic ---
function initAudioEvents() {
  const audio = DOM.mainAudio;

  // Play/Pause button
  DOM.playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  });

  // Next / Prev buttons
  DOM.nextBtn.addEventListener("click", playNextTrack);
  DOM.prevBtn.addEventListener("click", playPrevTrack);

  // Loop Button
  DOM.loopBtn.addEventListener("click", () => {
    audio.loop = !audio.loop;
    DOM.loopBtn.classList.toggle("active", audio.loop);
  });

  // Speed control
  DOM.speedBtn.addEventListener("click", () => {
    const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
    let idx = speeds.indexOf(playbackSpeed);
    idx = (idx + 1) % speeds.length;
    playbackSpeed = speeds[idx];
    audio.playbackRate = playbackSpeed;
    DOM.speedBtn.textContent = `${playbackSpeed}x`;
  });

  // Volume controls
  DOM.volumeSlider.addEventListener("input", (e) => {
    const val = e.target.value / 100;
    audio.volume = val;
    previousVolume = val;
    isMuted = val === 0;
    updateVolumeIcon();
  });

  DOM.muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    if (isMuted) {
      audio.volume = 0;
      DOM.volumeSlider.value = 0;
    } else {
      audio.volume = previousVolume;
      DOM.volumeSlider.value = previousVolume * 100;
    }
    updateVolumeIcon();
  });

  // Timeline/Progress bar updates
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      DOM.progressSlider.value = percentage;
      DOM.currentTime.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    DOM.durationTime.textContent = formatTime(audio.duration);
    DOM.progressSlider.value = 0;
  });

  DOM.progressSlider.addEventListener("input", (e) => {
    if (audio.duration) {
      const seekTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    }
  });

  // Auto-play next track when ended
  audio.addEventListener("ended", () => {
    if (!audio.loop) {
      playNextTrack();
    }
  });

  // Hybrid Fallback: If local file errors (404), fall back to the online URL
  audio.addEventListener("error", (e) => {
    if (currentAudioSourceMode === "local") {
      const reciter = reciters[currentReciterIndex];
      const surah = DEFAULT_SURAHS[currentTrackIndex];
      const onlineSrc = `${reciter.baseUrl}${surah.id}.mp3`;

      console.log(`Local file failed/absent. Streaming online: ${onlineSrc}`);

      currentAudioSourceMode = "online";
      DOM.mainAudio.src = onlineSrc;
      DOM.mainAudio.load();
      playAudio();

      updateAudioSourceBadge();

      // Automatically download played track in the background for next time!
      autoCacheTrack(reciter, surah);
    } else {
      console.error("Audio error: Both local and online streams failed to load.");
      DOM.sourceBadge.textContent = "خطأ تشغيل";
      DOM.sourceBadge.className = "source-badge";
      pauseAudio();
    }
  });

  // Download single track button
  const downloadCurrentTrackBtn = document.getElementById("downloadCurrentTrackBtn");
  if (downloadCurrentTrackBtn) {
    downloadCurrentTrackBtn.addEventListener("click", () => {
      downloadCurrentTrack();
    });
  }

  // Search bar input
  DOM.sheikhSearch.addEventListener("input", (e) => {
    renderReciters(e.target.value.trim());
  });
}

function playAudio() {
  DOM.mainAudio.play().then(() => {
    DOM.playPauseBtn.querySelector(".play-icon").classList.add("hidden");
    DOM.playPauseBtn.querySelector(".pause-icon").classList.remove("hidden");
    DOM.spinningDisk.classList.add("playing");
    DOM.waveVisualizer.classList.add("playing");
  }).catch(err => {
    console.warn("Audio autoplay blocked or failed:", err);
  });
}

function pauseAudio() {
  DOM.mainAudio.pause();
  DOM.playPauseBtn.querySelector(".play-icon").classList.remove("hidden");
  DOM.playPauseBtn.querySelector(".pause-icon").classList.add("hidden");
  DOM.spinningDisk.classList.remove("playing");
  DOM.waveVisualizer.classList.remove("playing");
}

function playNextTrack() {
  let nextIdx = currentTrackIndex + 1;
  if (nextIdx >= DEFAULT_SURAHS.length) {
    nextIdx = 0; // wrap to first track
  }
  loadTrack(nextIdx, true);
}

function playPrevTrack() {
  let prevIdx = currentTrackIndex - 1;
  if (prevIdx < 0) {
    prevIdx = DEFAULT_SURAHS.length - 1; // wrap to last track
  }
  loadTrack(prevIdx, true);
}

function updateVolumeIcon() {
  const vol = DOM.mainAudio.volume;
  if (vol === 0 || isMuted) {
    DOM.volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;
  } else if (vol < 0.5) {
    DOM.volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;
  } else {
    DOM.volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- Todo List (Reciter-Specific) ---
let currentTodos = [];

function initTodoEvents() {
  DOM.todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = DOM.todoInput.value.trim();
    if (!text) return;

    addTodo(text);
    DOM.todoInput.value = "";
  });

  DOM.clearCompletedTodos.addEventListener("click", clearCompletedTodos);
}

function getTodoStorageKey() {
  const reciter = reciters[currentReciterIndex];
  return `todos_${reciter ? reciter.name : 'general'}`;
}

function loadTodos() {
  const key = getTodoStorageKey();
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      currentTodos = JSON.parse(saved);
    } catch (e) {
      currentTodos = [];
    }
  } else {
    // Pre-populate some tasks for each sheikh
    currentTodos = [

    ];
    saveTodos();
  }
  renderTodos();
}

function saveTodos() {
  const key = getTodoStorageKey();
  localStorage.setItem(key, JSON.stringify(currentTodos));
}

function renderTodos() {
  DOM.todoList.innerHTML = "";

  if (currentTodos.length === 0) {
    DOM.todoList.innerHTML = `<p class="timer-helper-text" style="padding: 20px 0;">لا توجد مهام حالياً للشيخ. أضف مهمة جديدة في الأعلى.</p>`;
    DOM.todoCount.textContent = "لا توجد مهام معلقة";
    return;
  }

  let incompleteCount = 0;

  currentTodos.forEach((todo) => {
    if (!todo.completed) incompleteCount++;

    const item = document.createElement("div");
    item.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    item.innerHTML = `
      <div class="todo-checkbox-wrapper">
        <div class="todo-checkbox">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="todo-text">${escapeHTML(todo.text)}</span>
      </div>
      <button class="btn-todo-delete" title="حذف المهمة">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    // Toggle completed state
    item.querySelector(".todo-checkbox-wrapper").addEventListener("click", () => {
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    });

    // Delete action
    item.querySelector(".btn-todo-delete").addEventListener("click", () => {
      deleteTodo(todo.id);
    });

    DOM.todoList.appendChild(item);
  });

  DOM.todoCount.textContent = `يوجد ${incompleteCount} مهام متبقية`;
}

function addTodo(text) {
  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false
  };
  currentTodos.push(newTodo);
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  currentTodos = currentTodos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompletedTodos() {
  const activeCount = currentTodos.filter(t => !t.completed).length;
  if (currentTodos.length - activeCount === 0) return; // nothing to clear

  if (confirm("هل تريد مسح جميع المهام المنجزة؟")) {
    currentTodos = currentTodos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --- Productivity Pomodoro Timer ---
function initTimerEvents() {
  // Start button
  DOM.startTimerBtn.addEventListener("click", () => {
    startTimer();
  });

  // Pause button
  DOM.pauseTimerBtn.addEventListener("click", () => {
    pauseTimer();
  });

  // Reset button
  DOM.resetTimerBtn.addEventListener("click", () => {
    resetTimer();
  });

  // Presets (25m / 45m)
  DOM.timerPresets.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Toggle active classes
      DOM.timerPresets.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const seconds = parseInt(btn.dataset.time);
      setTimerDuration(seconds);
    });
  });

  // Apply Custom Minutes
  DOM.applyCustomTime.addEventListener("click", () => {
    const minVal = parseInt(DOM.customMinutes.value);
    if (isNaN(minVal) || minVal < 1 || minVal > 180) {
      alert("الرجاء إدخال رقم صحيح بين 1 و 180 دقيقة.");
      return;
    }
    // Remove active state on presets
    DOM.timerPresets.forEach(b => b.classList.remove("active"));

    setTimerDuration(minVal * 60);
    DOM.customMinutes.value = "";
  });

  // Set initial circular ring
  updateTimerUI();
}

function setTimerDuration(seconds) {
  pauseTimer();
  timerTotalSeconds = seconds;
  timerSecondsRemaining = seconds;
  updateTimerUI();
}

function startTimer() {
  if (isTimerRunning) return;

  isTimerRunning = true;
  DOM.startTimerBtn.classList.add("hidden");
  DOM.pauseTimerBtn.classList.remove("hidden");
  DOM.resetTimerBtn.classList.remove("hidden");

  timerInterval = setInterval(() => {
    timerSecondsRemaining--;
    updateTimerUI();

    if (timerSecondsRemaining <= 0) {
      clearInterval(timerInterval);
      timerFinished();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isTimerRunning) return;
  isTimerRunning = false;
  clearInterval(timerInterval);

  DOM.startTimerBtn.classList.remove("hidden");
  DOM.pauseTimerBtn.classList.add("hidden");
}

function resetTimer() {
  pauseTimer();
  timerSecondsRemaining = timerTotalSeconds;
  updateTimerUI();

  DOM.resetTimerBtn.classList.add("hidden");
}

function updateTimerUI() {
  // Update numbers
  DOM.timerDigits.textContent = formatTime(timerSecondsRemaining);

  // Update progress circle ring
  // Circumference = 2 * PI * r = 2 * 3.14159 * 80 = 502.65
  const circumference = 502.65;
  const progressRatio = timerSecondsRemaining / timerTotalSeconds;
  const offset = circumference * (1 - progressRatio);

  DOM.timerProgress.style.strokeDashoffset = offset;
}

function timerFinished() {
  isTimerRunning = false;
  DOM.startTimerBtn.classList.remove("hidden");
  DOM.pauseTimerBtn.classList.add("hidden");

  playAlertSound();

  // Custom spiritual alert notification
  alert("ما شاء الله! انتهت فترة التركيز بنجاح. خذ قسطاً من الراحة.");
}

/**
 * Play a synthesized chime alert sound utilizing the Web Audio API
 * This ensures the app is 100% self-contained and works fully offline.
 */
function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create oscillator (bell tone sound)
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Elegant bell frequency (a mix of high and pleasant resonance)
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.2); // slide down to A4

    // Decay sweep for volume
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.1); // attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5); // decay/release

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 1.6);
  } catch (err) {
    console.error("Web Audio API not supported or blocked:", err);
  }
}

// --- Reciter LocalStorage Persistance ---
function loadRecitersFromStorage() {
  const saved = localStorage.getItem("reciters_list");
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      // Merge: keep all loaded items, but also add any DEFAULT_RECITERS that are not in loaded (matched by id)
      const merged = [...loaded];
      DEFAULT_RECITERS.forEach(def => {
        if (!merged.some(item => item.id === def.id)) {
          merged.push(def);
        }
      });
      reciters = merged;
      saveRecitersToStorage();
    } catch (e) {
      reciters = [...DEFAULT_RECITERS];
      saveRecitersToStorage();
    }
  } else {
    reciters = [...DEFAULT_RECITERS];
    saveRecitersToStorage();
  }
}

function saveRecitersToStorage() {
  localStorage.setItem("reciters_list", JSON.stringify(reciters));
}

// --- Single Track Download Manager ---
async function downloadCurrentTrack() {
  const reciter = reciters[currentReciterIndex];
  const surah = DEFAULT_SURAHS[currentTrackIndex];
  const url = `${reciter.baseUrl}${surah.id}.mp3`;

  if (!navigator.onLine) {
    alert("لا يمكنك تحميل الملفات أثناء عدم الاتصال بالإنترنت.");
    return;
  }

  const btn = document.getElementById("downloadCurrentTrackBtn");
  btn.classList.add("downloading");
  btn.disabled = true;
  btn.innerHTML = `
    <svg class="spinner" width="16" height="16" viewBox="0 0 50 50" style="animation: spin 1.2s linear infinite;">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80 200"></circle>
    </svg>
  `;

  try {
    const cache = await caches.open("quran-audio-cache");
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response);
      btn.className = "btn-single-download downloaded";
      btn.title = "محملة وجاهزة للتشغيل أوفلاين";
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      // Update badge
      loadTrack(currentTrackIndex, false);

      // Update sidebar download icon
      const status = await getReciterCacheStatus(reciter);
      const items = DOM.recitersList.querySelectorAll(".reciter-item");
      items.forEach(item => {
        if (parseInt(item.dataset.index) === currentReciterIndex) {
          const sidebarDlBtn = item.querySelector(".download-reciter-btn");
          if (sidebarDlBtn) updateDownloadBtnUI(sidebarDlBtn, status);
        }
      });
    } else {
      throw new Error("Response not OK");
    }
  } catch (err) {
    console.error("Failed to download track:", err);
    btn.className = "btn-single-download";
    btn.title = "تحميل هذه السورة للتشغيل أوفلاين";
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
      </svg>
    `;
    alert("فشل تحميل السورة. يرجى التحقق من اتصال الشبكة.");
  } finally {
    btn.disabled = false;
  }
}

async function updateSingleTrackDownloadBtnUI() {
  const reciter = reciters[currentReciterIndex];
  const surah = DEFAULT_SURAHS[currentTrackIndex];
  const url = `${reciter.baseUrl}${surah.id}.mp3`;
  const btn = document.getElementById("downloadCurrentTrackBtn");

  if (!btn) return;

  try {
    const cache = await caches.open("quran-audio-cache");
    const match = await cache.match(url);
    if (match) {
      btn.className = "btn-single-download downloaded";
      btn.title = "محملة وجاهزة للتشغيل أوفلاين";
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      btn.className = "btn-single-download";
      btn.title = "تحميل هذه السورة للتشغيل أوفلاين";
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
      `;
    }
  } catch (e) {
    btn.className = "btn-single-download";
  }
}

// --- Admin Panel Events & Management ---
function initAdminEvents() {
  const adminBtn = document.getElementById("adminBtn");
  const adminModal = document.getElementById("adminModal");
  const closeAdminModal = document.getElementById("closeAdminModal");
  const addReciterForm = document.getElementById("addReciterForm");

  if (!adminBtn || !adminModal) return;

  adminBtn.addEventListener("click", () => {
    adminModal.classList.remove("hidden");
    renderAdminRecitersList();
  });

  closeAdminModal.addEventListener("click", () => {
    adminModal.classList.add("hidden");
  });

  adminModal.addEventListener("click", (e) => {
    if (e.target === adminModal) {
      adminModal.classList.add("hidden");
    }
  });

  const tabs = adminModal.querySelectorAll(".modal-tabs .tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const tabTarget = tab.dataset.tab;
      adminModal.querySelectorAll(".tab-content").forEach(content => {
        if (content.id === tabTarget) {
          content.classList.remove("hidden");
        } else {
          content.classList.add("hidden");
        }
      });

      if (tabTarget === "manage-reciters-tab") {
        renderAdminRecitersList();
      }
    });
  });

  addReciterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("reciterName").value.trim();
    const subText = document.getElementById("reciterSub").value.trim();
    let baseUrl = document.getElementById("reciterUrl").value.trim();
    const avatarInput = document.getElementById("reciterAvatar").value.trim();

    if (!name || !baseUrl) return;

    if (!baseUrl.endsWith("/")) {
      baseUrl += "/";
    }

    const avatar = avatarInput || name.charAt(0);

    const newReciter = {
      id: "reciter_" + Date.now(),
      name: name,
      folder: name,
      baseUrl: baseUrl,
      avatar: avatar,
      subText: subText || "قارئ مضاف حديثاً"
    };

    reciters.push(newReciter);
    saveRecitersToStorage();

    renderReciters();
    selectReciter(reciters.length - 1);

    addReciterForm.reset();

    alert(`تم إضافة القارئ "${name}" بنجاح!`);

    const manageTabBtn = adminModal.querySelector('[data-tab="manage-reciters-tab"]');
    if (manageTabBtn) {
      manageTabBtn.click();
    }
  });
}

function renderAdminRecitersList() {
  const container = document.getElementById("adminRecitersList");
  if (!container) return;

  container.innerHTML = "";

  if (reciters.length === 0) {
    container.innerHTML = `<p class="timer-helper-text" style="padding: 20px 0;">لا يوجد قراء حالياً. قم بإضافة قارئ جديد.</p>`;
    return;
  }

  reciters.forEach((reciter, idx) => {
    const item = document.createElement("div");
    item.className = "admin-reciter-item";

    item.innerHTML = `
      <div class="reciter-info">
        <div class="reciter-avatar">${reciter.avatar}</div>
        <div class="reciter-name-details">
          <span class="reciter-name">${reciter.name}</span>
          <span class="reciter-sub">${reciter.subText || ''}</span>
        </div>
      </div>
      <button class="btn-delete-reciter" data-index="${idx}" title="حذف القارئ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    item.querySelector(".btn-delete-reciter").addEventListener("click", () => {
      deleteReciter(idx);
    });

    container.appendChild(item);
  });
}

function deleteReciter(idx) {
  const reciterToDelete = reciters[idx];
  if (confirm(`هل أنت متأكد من حذف القارئ "${reciterToDelete.name}"؟`)) {
    removeReciterAudioFromCache(reciterToDelete);

    reciters.splice(idx, 1);
    saveRecitersToStorage();

    if (currentReciterIndex === idx) {
      currentReciterIndex = 0;
    } else if (currentReciterIndex > idx) {
      currentReciterIndex--;
    }

    renderReciters();
    if (reciters.length > 0) {
      selectReciter(currentReciterIndex);
    } else {
      DOM.playerSheikhName.textContent = "لا يوجد قراء";
      DOM.tracksList.innerHTML = "";
    }

    renderAdminRecitersList();
  }
}
