// === SEKCJA 1: BAZA STARTOWA I STAN APLIKACJI ===
// === SEKCJA 1: BAZA STARTOWA I STAN APLIKACJI ===
const DEFAULT_EXERCISES = [
  { name: "Wyciskanie sztangi leżąc", part: "Klatka", primary: ["chest"], secondary: ["shoulders", "triceps"], tips: ["Ściągnij łopatki mocno w dół i do siebie (mostek w górę).", "Opuszczaj sztangę na dolną część klatki pod kątem ok. 45° w łokciach.", "Stopy wbite stabilnie w podłogę przez cały ruch."] },
  { name: "Wyciskanie hantli (skos)", part: "Klatka", primary: ["chest"], secondary: ["shoulders", "triceps"], tips: ["Ustaw ławkę na 30° (zbyt duży skos przejmuje przedni akton barków).", "Prowadź łokcie lekko do środka, nie rozchylaj ich na 90°.", "Pełne rozciągnięcie na dole bez odbijania."] },
  { name: "OHP (Barki)", part: "Barki", primary: ["shoulders"], secondary: ["triceps", "traps"], tips: ["Napnij mocno brzuch i pośladki – nie przeprostowuj lędźwi.", "Łokcie lekko przed sztangą w pozycji startowej.", "Wypchnij głowę lekko do przodu, gdy sztanga minie czoło."] },
  { name: "Wznosy bokiem", part: "Barki", primary: ["shoulders"], secondary: ["traps"], tips: ["Prowadź ruch łokciem, nie dłonią (mały palec lekko wyżej).", "Zatrzymaj ruch na wysokości barków, bez szarpania tułowiem.", "Kontroluj opuszczanie przez 2 sekundy."] },
  { name: "Triceps (wyciąg)", part: "Triceps", primary: ["triceps"], secondary: [], tips: ["Zablokuj łokcie przy tułowiu – nie ruszaj nimi przód-tył.", "Na dole mocno dopnij triceps i lekko rozchyl linkę na boki.", "Nie zaokrąglaj barków do przodu."] },
  { name: "Lat pulldown", part: "Plecy", primary: ["lats"], secondary: ["biceps", "traps"], tips: ["Zainicjuj ruch opuszczeniem barków w dół, potem ciągnij łokciami.", "Ściągaj drążek do obojczyków, lekko odchylając klatkę.", "Nie bujaj całym ciałem dla rozpędu."] },
  { name: "Cable rows", part: "Plecy", primary: ["lats", "traps"], secondary: ["biceps", "shoulders"], tips: ["Trzymaj proste plecy i wypchniętą klatkę piersiową.", "Ciągnij uchwyt w stronę pępka, spinając łopatki na końcu.", "Pozwól łopatkom się rozciągnąć w fazie powrotu."] },
  { name: "Dumbell rows", part: "Plecy", primary: ["lats", "traps"], secondary: ["biceps", "shoulders"], tips: ["Ciągnij hantel po łuku w stronę biodra, a nie pionowo do barku.", "Utrzymuj kręgosłup w neutralnej linii (nie skręcaj tułowia).", "Zatrzymaj na ułamek sekundy w górze."] },
  { name: "Bicep cable curl", part: "Biceps", primary: ["biceps"], secondary: ["forearms"], tips: ["Stałe napięcie z wyciągu – nie odkładaj ciężaru na dole.", "Łokcie nieruchomo przy żebrach.", "Powolna faza negatywna (opuszczanie)."] },
  { name: "Bicep pull-ups", part: "Biceps", primary: ["biceps", "lats"], secondary: ["traps", "forearms"], tips: ["Podchwyt na szerokość barków.", "Skup się na zginaniu w łokciu i przyciągnięciu mostka do drążka.", "Pełny wyprost rąk na dole bez puszczania napięcia łopatek."] },
  { name: "Przysiady ze sztangą", part: "Nogi", primary: ["quads", "glutes"], secondary: ["hamstrings", "lower_back", "abs"], tips: ["Nabierz powietrze do przepony (bracing) przed zejściem w dół.", "Prowadź kolana w linii palców stóp.", "Utrzymuj ciężar równo na całej stopie (trzy punkty podparcia)."] },
  { name: "Martwy ciąg", part: "Plecy / Nogi", primary: ["lower_back", "glutes", "hamstrings"], secondary: ["lats", "traps", "quads", "forearms"], tips: ["Sztanga blisko piszczeli przez cały czas trwania ruchu.", "Wypchnij biodra w tył, plecy sztywne jak deska.", "Wstając pchaj podłogę nogami, a na górze dopnij pośladki."] }
];

const WEEKDAY_SHORT = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
const WEEKDAY_FULL = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

let workouts = JSON.parse(localStorage.getItem('gym_workouts')) || {};
const storedExercises = JSON.parse(localStorage.getItem('gym_exercises'));
let exerciseDB = (Array.isArray(storedExercises) && storedExercises.length > 0)
  ? storedExercises
  : JSON.parse(JSON.stringify(DEFAULT_EXERCISES));
let schedules = JSON.parse(localStorage.getItem('gym_schedules')) || {};

let selectedDate = new Date();
let calendarViewDate = new Date();
let isConsistenceMode = false;

// === SEKCJA 2: POMOCNICZE (DATY I ZAPIS) ===
function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}`;
}

function formatPolishDate(date) {
  const todayISO = toISODate(new Date());
  const targetISO = toISODate(date);
  if (todayISO === targetISO) return `Dzisiaj (${WEEKDAY_FULL[date.getDay()]})`;
  return WEEKDAY_FULL[date.getDay()];
}

function saveState() {
  localStorage.setItem('gym_workouts', JSON.stringify(workouts));
  localStorage.setItem('gym_exercises', JSON.stringify(exerciseDB));
  localStorage.setItem('gym_schedules', JSON.stringify(schedules));
  updateStats();
}

function updateStats() {
  const count = Object.keys(workouts).filter(d => workouts[d].exercises && workouts[d].exercises.length > 0).length;
  document.getElementById('header-stats').textContent = `Treningi: ${count}`;
}

// === SEKCJA 3: TRYB CONSISTENCE (HARMONOGRAM) ===
function toggleConsistenceMode() {
  isConsistenceMode = document.getElementById('consistence-toggle').checked;
  
  const statusTag = document.getElementById('mode-status-tag');
  const descText = document.getElementById('mode-desc-text');
  const singleControls = document.getElementById('single-day-controls');
  const consistenceControls = document.getElementById('consistence-controls');
  const singleNoteBox = document.getElementById('single-note-box');
  const addBtn = document.getElementById('add-ex-btn');

  if (isConsistenceMode) {
    statusTag.textContent = "(Aktywny)";
    statusTag.style.color = "#60a5fa";
    descText.textContent = "Tworzysz stały szablon (trafia do Tabeli i Kalendarza)";
    singleControls.style.display = 'none';
    consistenceControls.style.display = 'block';
    singleNoteBox.style.display = 'none';
    addBtn.classList.add('btn-blue');
    
    document.getElementById('consistence-weekday').value = String(selectedDate.getDay());
  } else {
    statusTag.textContent = "(Wyłączony)";
    statusTag.style.color = "var(--text-muted)";
    descText.textContent = "Edytujesz pojedynczy trening dla wybranej daty";
    singleControls.style.display = 'block';
    consistenceControls.style.display = 'none';
    singleNoteBox.style.display = 'block';
    addBtn.classList.remove('btn-blue');
  }

  renderWorkout();
}

function getActiveScheduleForDate(date) {
  const weekday = String(date.getDay());
  const sched = schedules[weekday];
  if (!sched || !sched.exercises || sched.exercises.length === 0) return null;

  const freq = parseInt(sched.freq || 1);
  if (freq === 1) return sched;

  const start = new Date(sched.startDate || toISODate(new Date()));
  start.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - start) / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks >= 0 && diffWeeks % freq === 0) {
    return sched;
  }
  return null;
}

function ensureScheduleExists(weekday) {
  if (!schedules[weekday]) {
    schedules[weekday] = {
      name: WEEKDAY_FULL[Number(weekday)],
      freq: "1",
      startDate: toISODate(new Date()),
      exercises: []
    };
  }
}

function updateScheduleFrequency() {
  const weekday = document.getElementById('consistence-weekday').value;
  ensureScheduleExists(weekday);
  schedules[weekday].freq = document.getElementById('consistence-freq').value;
  schedules[weekday].startDate = toISODate(new Date());
  saveState();
}

function updateScheduleName() {
  const weekday = document.getElementById('consistence-weekday').value;
  ensureScheduleExists(weekday);
  schedules[weekday].name = document.getElementById('consistence-plan-name').value;
  saveState();
}

// === SEKCJA 4: NOTES TRENINGOWY I PODPOWIEDZI ===
let stripStartDate = null;
let stripEndDate = null;
let stripInitialized = false;

function addDays(date, days) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function changeDay(offset) {
  selectedDate = addDays(selectedDate, offset);
  renderWorkout();
}

function goToToday() {
  selectedDate = new Date();
  stripStartDate = null;
  stripEndDate = null;
  renderWorkout();
}

function selectDateFromStrip(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  selectedDate = new Date(y, m - 1, d);
  renderWorkout();
}

function buildDayBlockHTML(dateObj, selectedISO, todayISO) {
  const iso = toISODate(dateObj);
  const wdShort = WEEKDAY_SHORT[dateObj.getDay()].toUpperCase();
  const dayNum = dateObj.getDate();

  const savedWorkout = workouts[iso];
  const hasSaved = savedWorkout && savedWorkout.exercises && savedWorkout.exercises.length > 0;
  const activeSched = getActiveScheduleForDate(dateObj);

  let planTitle = "Wolne";
  let planSub = "Odpoczynek";
  let hasPlan = false;

  if (hasSaved && savedWorkout.fromSchedule) {
    planTitle = savedWorkout.fromSchedule;
    planSub = "Plan";
    hasPlan = true;
  } else if (activeSched) {
    planTitle = activeSched.name || WEEKDAY_FULL[dateObj.getDay()];
    planSub = "Plan";
    hasPlan = true;
  } else if (hasSaved) {
    planTitle = "Trening";
    planSub = `${savedWorkout.exercises.length} ćw.`;
    hasPlan = true;
  }

  let classes = "day-block";
  if (iso === selectedISO) classes += " selected";
  if (iso === todayISO) classes += " is-today";
  if (hasSaved) classes += " has-done";

  return `
    <div class="${classes}" data-iso="${iso}" onclick="selectDateFromStrip('${iso}')">
      ${hasSaved ? '<span class="day-check-badge">&#10003;</span>' : ''}
      <span class="day-block-wd">${wdShort}</span>
      <span class="day-block-num">${dayNum}</span>
      <span class="day-block-plan ${hasPlan ? 'active-plan' : ''}">${planTitle}</span>
      <span class="day-block-sub">${planSub}</span>
    </div>
  `;
}

function renderDayStrip() {
  const stripEl = document.getElementById('day-strip-scroll');
  if (!stripEl) return;

  const selectedISO = toISODate(selectedDate);
  const todayISO = toISODate(new Date());

  // Licznik treningów w bieżącym miesiącu wybranej daty
  const monthPrefix = selectedISO.slice(0, 7);
  const monthCount = Object.keys(workouts).filter(
    d => d.startsWith(monthPrefix) && workouts[d].exercises && workouts[d].exercises.length > 0
  ).length;
  const streakEl = document.getElementById('month-streak-badge');
  if (streakEl) streakEl.innerHTML = `&#128293; ${monthCount}`;

  // Przycisk powrotu do Dzisiaj
  const jumpBtn = document.getElementById('btn-jump-today');
  if (jumpBtn) {
    jumpBtn.style.opacity = (selectedISO === todayISO) ? '0.45' : '1';
  }

  // Jeśli wybrana data jest poza aktualnym zakresem paska, wygeneruj okno +/- 18 dni
  if (!stripStartDate || !stripEndDate || selectedDate < addDays(stripStartDate, 3) || selectedDate > addDays(stripEndDate, -3)) {
    stripStartDate = addDays(selectedDate, -18);
    stripEndDate = addDays(selectedDate, 18);
  }

  let html = "";
  let cursor = new Date(stripStartDate);
  while (cursor <= stripEndDate) {
    html += buildDayBlockHTML(cursor, selectedISO, todayISO);
    cursor = addDays(cursor, 1);
  }
  stripEl.innerHTML = html;

  // Wyśrodkowanie wybranego kafelka
  const activeCard = stripEl.querySelector(`.day-block[data-iso="${selectedISO}"]`);
  if (activeCard) {
    const targetScroll = activeCard.offsetLeft - (stripEl.clientWidth / 2) + (activeCard.offsetWidth / 2);
    stripEl.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: stripInitialized ? 'smooth' : 'auto'
    });
  }

  if (!stripInitialized) {
    stripInitialized = true;
    setupDayStripInfiniteScroll(stripEl);
  }
}

function setupDayStripInfiniteScroll(stripEl) {
  let isExpanding = false;

  stripEl.addEventListener('scroll', () => {
    if (isExpanding) return;

    const selectedISO = toISODate(selectedDate);
    const todayISO = toISODate(new Date());

    // Doładowanie dni w prawo
    if (stripEl.scrollLeft + stripEl.clientWidth >= stripEl.scrollWidth - 120) {
      isExpanding = true;
      let extraHtml = "";
      for (let i = 1; i <= 14; i++) {
        stripEndDate = addDays(stripEndDate, 1);
        extraHtml += buildDayBlockHTML(stripEndDate, selectedISO, todayISO);
      }
      stripEl.insertAdjacentHTML('beforeend', extraHtml);
      isExpanding = false;
    }

    // Doładowanie dni w lewo bez przeskoku pozycji
    if (stripEl.scrollLeft <= 120) {
      isExpanding = true;
      const prevWidth = stripEl.scrollWidth;
      let extraHtml = "";
      const newDates = [];
      for (let i = 1; i <= 14; i++) {
        stripStartDate = addDays(stripStartDate, -1);
        newDates.unshift(new Date(stripStartDate));
      }
      newDates.forEach(d => {
        extraHtml += buildDayBlockHTML(d, selectedISO, todayISO);
      });
      stripEl.insertAdjacentHTML('afterbegin', extraHtml);
      stripEl.scrollLeft += (stripEl.scrollWidth - prevWidth);
      isExpanding = false;
    }
  }, { passive: true });
}

const exerciseInput = document.getElementById('exercise-input');
const suggestionsBox = document.getElementById('suggestions');

exerciseInput.addEventListener('input', showSuggestions);
exerciseInput.addEventListener('focus', showSuggestions);

document.addEventListener('click', (e) => {
  if (!e.target.closest('.add-exercise-box')) {
    suggestionsBox.style.display = 'none';
  }
});

function showSuggestions() {
  const query = exerciseInput.value.toLowerCase().trim();
  const filtered = exerciseDB.filter(ex => ex.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    suggestionsBox.style.display = 'none';
    return;
  }

  suggestionsBox.innerHTML = filtered.map(ex => `
    <div class="suggestion-item" onclick="selectExercise('${ex.name.replace(/'/g, "\\'")}')">
      <span>${ex.name}</span>
      <span class="suggestion-tag">${ex.part || 'Własne'}</span>
    </div>
  `).join('');
  suggestionsBox.style.display = 'block';
}

function selectExercise(name) {
  exerciseInput.value = '';
  suggestionsBox.style.display = 'none';
  handleAddExercise(name);
}

function addExerciseFromInput() {
  const name = exerciseInput.value.trim();
  if (!name) return;

  const exists = exerciseDB.some(ex => ex.name.toLowerCase() === name.toLowerCase());
  if (!exists) {
    exerciseDB.unshift({ name: name, part: "Własne" });
  }

  exerciseInput.value = '';
  suggestionsBox.style.display = 'none';
  handleAddExercise(name);
}

function handleAddExercise(name) {
  if (isConsistenceMode) {
    const weekday = document.getElementById('consistence-weekday').value;
    ensureScheduleExists(weekday);
    schedules[weekday].exercises.push({
      name: name,
      defaultSets: 3
    });
    saveState();
    renderWorkout();
  } else {
    const iso = toISODate(selectedDate);
    ensureDayMaterialized(iso);
    workouts[iso].exercises.push({
      name: name,
      sets: [{ weight: "", reps: "" }]
    });
    saveState();
    renderWorkout();
  }
}

function ensureDayMaterialized(iso) {
  if (!workouts[iso]) {
    const [y, m, d] = iso.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const activeSched = getActiveScheduleForDate(dateObj);

    if (activeSched) {
      workouts[iso] = {
        fromSchedule: activeSched.name || WEEKDAY_FULL[dateObj.getDay()],
        note: "",
        exercises: activeSched.exercises.map(ex => ({
          name: ex.name,
          sets: Array.from({ length: ex.defaultSets || 3 }, () => ({ weight: "", reps: "" }))
        }))
      };
    } else {
      workouts[iso] = { exercises: [], note: "" };
    }
  }
}

function removeExercise(exIndex) {
  if (isConsistenceMode) {
    const weekday = document.getElementById('consistence-weekday').value;
    schedules[weekday].exercises.splice(exIndex, 1);
    if (schedules[weekday].exercises.length === 0) {
      delete schedules[weekday];
    }
  } else {
    const iso = toISODate(selectedDate);
    ensureDayMaterialized(iso);
    workouts[iso].exercises.splice(exIndex, 1);
    cleanupEmptyDay(iso);
  }
  saveState();
  renderWorkout();
}

function changeTemplateSets(exIndex, delta) {
  const weekday = document.getElementById('consistence-weekday').value;
  const current = schedules[weekday].exercises[exIndex].defaultSets || 3;
  const next = Math.max(1, Math.min(10, current + delta));
  schedules[weekday].exercises[exIndex].defaultSets = next;
  saveState();
  renderWorkout();
}

function addSet(exIndex) {
  const iso = toISODate(selectedDate);
  ensureDayMaterialized(iso);
  const sets = workouts[iso].exercises[exIndex].sets;
  const lastSet = sets[sets.length - 1];
  sets.push({
    weight: lastSet ? lastSet.weight : "",
    reps: lastSet ? lastSet.reps : ""
  });
  saveState();
  renderWorkout();
}

function updateSet(exIndex, setIndex, field, value) {
  const iso = toISODate(selectedDate);
  ensureDayMaterialized(iso);
  workouts[iso].exercises[exIndex].sets[setIndex][field] = value;
  saveState();
}

function removeSet(exIndex, setIndex) {
  const iso = toISODate(selectedDate);
  ensureDayMaterialized(iso);
  workouts[iso].exercises[exIndex].sets.splice(setIndex, 1);
  if (workouts[iso].exercises[exIndex].sets.length === 0) {
    workouts[iso].exercises.splice(exIndex, 1);
  }
  cleanupEmptyDay(iso);
  saveState();
  renderWorkout();
}

function saveDayNote() {
  const iso = toISODate(selectedDate);
  const text = document.getElementById('day-note').value;
  ensureDayMaterialized(iso);
  workouts[iso].note = text;
  cleanupEmptyDay(iso);
  saveState();
}

function cleanupEmptyDay(iso) {
  if (workouts[iso] && workouts[iso].exercises.length === 0 && !workouts[iso].note.trim()) {
    delete workouts[iso];
  }
}

function renderWorkout() {
  const container = document.getElementById('workout-container');

  if (isConsistenceMode) {
    const weekday = document.getElementById('consistence-weekday').value;
    const sched = schedules[weekday] || { name: "", freq: "1", exercises: [] };

    document.getElementById('consistence-freq').value = sched.freq || "1";
    document.getElementById('consistence-plan-name').value = sched.name || "";

    if (!sched.exercises || sched.exercises.length === 0) {
      container.innerHTML = `<div class="empty-state">Brak stałego planu dla tego dnia tygodnia.<br>Dodaj ćwiczenia powyżej – pojawią się one automatycznie w Kalendarzu oraz jako kolumny w Tabeli.</div>`;
      return;
    }

    container.innerHTML = sched.exercises.map((ex, idx) => `
      <div class="exercise-card" style="border-color: rgba(59, 130, 246, 0.4);">
        <div class="exercise-header" style="margin-bottom: 6px; padding-bottom: 6px;">
          <div class="ex-title-group" onclick="openExerciseModal('${ex.name.replace(/'/g, "\\'")}')">
            <div class="muscle-avatar">${getMuscleSVG(ex.name, true)}</div>
            <div>
              <span class="exercise-title">${ex.name}</span>
              <span class="ex-info-hint">Kliknij, aby zobaczyć partię i tipy</span>
            </div>
          </div>
          <button class="btn-icon-danger" onclick="removeExercise(${idx})">&#10005;</button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted);">
          <span>Domyślna liczba serii: <strong style="color: var(--text-main);">${ex.defaultSets || 3}</strong></span>
          <div style="display: flex; gap: 6px;">
            <button onclick="changeTemplateSets(${idx}, -1)" style="background: var(--bg-input); border: none; color: white; width: 28px; height: 28px; border-radius: 6px; font-weight: bold;">-</button>
            <button onclick="changeTemplateSets(${idx}, 1)" style="background: var(--bg-input); border: none; color: white; width: 28px; height: 28px; border-radius: 6px; font-weight: bold;">+</button>
          </div>
        </div>
      </div>
    `).join('');
    return;
  }

  const iso = toISODate(selectedDate);
  document.getElementById('current-date-label').textContent = formatPolishDate(selectedDate);
  document.getElementById('current-date-iso').textContent = iso;
  renderDayStrip();

  const badgeContainer = document.getElementById('day-source-badge');
  let dayData = workouts[iso];
  let isFromPreviewSchedule = false;

  if (!dayData) {
    const activeSched = getActiveScheduleForDate(selectedDate);
    if (activeSched) {
      isFromPreviewSchedule = true;
      dayData = {
        fromSchedule: activeSched.name || WEEKDAY_FULL[selectedDate.getDay()],
        note: "",
        exercises: activeSched.exercises.map(ex => ({
          name: ex.name,
          sets: Array.from({ length: ex.defaultSets || 3 }, () => ({ weight: "", reps: "" }))
        }))
      };
    } else {
      dayData = { exercises: [], note: "" };
    }
  }

  if (dayData.fromSchedule || isFromPreviewSchedule) {
    const planTitle = dayData.fromSchedule || "Plan Consistence";
    badgeContainer.innerHTML = `<span class="badge-info badge-consistence">&#128260; Harmonogram: ${planTitle}</span>`;
  } else if (dayData.exercises.length > 0) {
    badgeContainer.innerHTML = `<span class="badge-info badge-single">&#128221; Trening pojedynczy</span>`;
  } else {
    badgeContainer.innerHTML = '';
  }

  const syncBar = document.getElementById('sync-weekday-bar');
  const syncLabel = document.getElementById('sync-weekday-label');
  if (dayData.exercises.length > 0) {
    const dayNameLower = WEEKDAY_FULL[selectedDate.getDay()].toLowerCase();
    syncLabel.textContent = `Ustaw na wszystkie: ${dayNameLower}`;
    syncBar.style.display = 'flex';
  } else {
    syncBar.style.display = 'none';
  }

  document.getElementById('day-note').value = dayData.note || "";

  if (dayData.exercises.length === 0) {
    container.innerHTML = `<div class="empty-state">Brak treningu w tym dniu.<br>Dodaj pojedyncze ćwiczenie powyżej lub włącz <strong>Tryb Consistence</strong>, aby ustawić stały plan.</div>`;
    return;
  }

  container.innerHTML = dayData.exercises.map((ex, exIdx) => `
    <div class="exercise-card">
      <div class="exercise-header">
        <div class="ex-title-group" onclick="openExerciseModal('${ex.name.replace(/'/g, "\\'")}')">
          <div class="muscle-avatar">${getMuscleSVG(ex.name, true)}</div>
          <div>
            <span class="exercise-title">${ex.name}</span>
            <span class="ex-info-hint">Partia i tipy &#9432;</span>
          </div>
        </div>
        <button class="btn-icon-danger" onclick="removeExercise(${exIdx})" title="Usuń ćwiczenie">&#10005;</button>
      </div>
      ${ex.sets.map((set, setIdx) => `
        <div class="set-row">
          <div class="set-num">#${setIdx + 1}</div>
          <div class="set-input-wrap">
            <input type="number" step="0.5" placeholder="0" value="${set.weight}" oninput="updateSet(${exIdx}, ${setIdx}, 'weight', this.value)">
            <span class="set-unit">kg</span>
          </div>
          <div class="set-input-wrap">
            <input type="number" placeholder="0" value="${set.reps}" oninput="updateSet(${exIdx}, ${setIdx}, 'reps', this.value)">
            <span class="set-unit">powt.</span>
          </div>
          <button class="btn-icon-danger" onclick="removeSet(${exIdx}, ${setIdx})">&#8722;</button>
        </div>
      `).join('')}
      <button class="btn-add-set" onclick="addSet(${exIdx})">+ Kolejna seria</button>
    </div>
  `).join('');
}

// === SEKCJA 5: TABELA PROGRESU ===
function formatSetsCompact(sets) {
  if (!sets || sets.length === 0) return "";
  const valid = sets.filter(s => s.weight !== "" || s.reps !== "");
  if (valid.length === 0) return "";

  const groups = [];
  valid.forEach(s => {
    const w = s.weight ? `${s.weight}kg` : "";
    const r = s.reps ? `${s.reps}` : "?";
    const last = groups[groups.length - 1];
    if (last && last.reps === r && last.weight === w) {
      last.count += 1;
    } else {
      groups.push({ count: 1, reps: r, weight: w });
    }
  });

  const uniqueWeights = [...new Set(groups.map(g => g.weight).filter(Boolean))];
  if (uniqueWeights.length === 1) {
    const repPart = groups.map(g => `${g.count}/${g.reps}`).join(' ');
    return `${repPart} ${uniqueWeights[0]}`;
  }

  return groups.map(g => `${g.count}/${g.reps}${g.weight ? ' ' + g.weight : ''}`).join(' | ');
}

function buildTableSchema() {
  const orderedWeekdays = ["1", "2", "3", "4", "5", "6", "0"];
  const blocks = [];
  const allColumns = [];

  orderedWeekdays.forEach(wd => {
    const sched = schedules[wd];
    if (sched && sched.exercises && sched.exercises.length > 0) {
      const title = (sched.name && sched.name.trim()) ? sched.name.trim() : WEEKDAY_FULL[Number(wd)];
      const colorIdx = blocks.length % 4;
      const cols = sched.exercises.map(ex => ({
        name: ex.name,
        blockTitle: title,
        colorIdx: colorIdx,
        weekday: wd
      }));
      blocks.push({
        title: title,
        weekday: wd,
        colorIdx: colorIdx,
        exercises: cols
      });
      allColumns.push(...cols);
    }
  });

  const extraExercises = new Set();
  Object.entries(workouts).forEach(([iso, w]) => {
    if (w.exercises && w.exercises.length > 0) {
      w.exercises.forEach(ex => {
        const hasAnyFilledSet = ex.sets && ex.sets.some(s => s.weight !== "" || s.reps !== "");
        const alreadyInSchema = allColumns.some(c => c.name.toLowerCase() === ex.name.toLowerCase());
        if (hasAnyFilledSet && !alreadyInSchema) {
          extraExercises.add(ex.name);
        }
      });
    }
  });

  if (extraExercises.size > 0) {
    const colorIdx = blocks.length % 4;
    const cols = Array.from(extraExercises).map(name => ({
      name: name,
      blockTitle: "Pojedyncze",
      colorIdx: colorIdx,
      weekday: null
    }));
    blocks.push({
      title: "Pojedyncze",
      weekday: null,
      colorIdx: colorIdx,
      exercises: cols
    });
    allColumns.push(...cols);
  }

  return { blocks, allColumns };
}

function renderTable() {
  const container = document.getElementById('progress-table-container');
  const { blocks, allColumns } = buildTableSchema();

  if (allColumns.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        Tabela jest jeszcze pusta.<br><br>
        Włącz <strong>Tryb Consistence</strong> w Notesie i dodaj swoje stałe dni (np. Push, Pull, Legs), a kolumny i wiersze wygenerują się tu automatycznie!
      </div>
    `;
    return;
  }

  const topHeaderCells = blocks.map(b => `
    <th colspan="${b.exercises.length}" 
        class="group-header-${b.colorIdx}" 
        style="${b.weekday !== null ? 'cursor: pointer;' : ''}"
        ${b.weekday !== null ? `onclick="openConsistenceEditor('${b.weekday}')"` : ''}
        title="Kliknij, aby edytować ten plan Consistence">
      ${b.title} ${b.weekday !== null ? '&#9998;' : ''}
    </th>
  `).join('');

  const subHeaderCells = allColumns.map(col => `
    <th class="sub-header-${col.colorIdx}"
        style="${col.weekday !== null ? 'cursor: pointer;' : ''}"
        ${col.weekday !== null ? `onclick="openConsistenceEditor('${col.weekday}')"` : ''}>
      ${col.name}
    </th>
  `).join('');

  const savedDates = Object.keys(workouts)
    .filter(iso => workouts[iso].exercises && workouts[iso].exercises.length > 0)
    .sort();

  const plannedRows = [];
  const cursor = new Date();
  for (let i = 0; i < 21 && plannedRows.length < 9; i++) {
    const iso = toISODate(cursor);
    if (!workouts[iso]) {
      const sched = getActiveScheduleForDate(cursor);
      if (sched) {
        plannedRows.push({
          iso: iso,
          dateObj: new Date(cursor),
          sched: sched,
          isPlanned: true
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const allRows = [
    ...savedDates.map(iso => {
      const [y, m, d] = iso.split('-').map(Number);
      return { iso, dateObj: new Date(y, m - 1, d), data: workouts[iso], isPlanned: false };
    }),
    ...plannedRows
  ];

  const bodyRowsHtml = allRows.map(row => {
    const wd = String(row.dateObj.getDay());
    let planName = "";
    let matchingBlock = blocks.find(b => b.weekday === wd);

    if (row.isPlanned) {
      planName = row.sched.name || WEEKDAY_SHORT[row.dateObj.getDay()];
    } else {
      planName = row.data.fromSchedule || (matchingBlock ? matchingBlock.title : WEEKDAY_SHORT[row.dateObj.getDay()]);
    }

    const pillClass = matchingBlock ? `pill-${matchingBlock.colorIdx}` : 'pill-0';

    const dataCells = allColumns.map(col => {
      let cellText = "";
      if (!row.isPlanned && row.data.exercises) {
        const foundEx = row.data.exercises.find(e => e.name.toLowerCase() === col.name.toLowerCase());
        if (foundEx) {
          cellText = formatSetsCompact(foundEx.sets);
        }
      }

      const belongsToTodayBlock = (col.weekday === wd);
      let tdClass = "";
      if (cellText) tdClass = "cell-filled";
      else if (!belongsToTodayBlock && col.weekday !== null) tdClass = "cell-inactive";

      return `<td class="${tdClass}">${cellText}</td>`;
    }).join('');

    return `
      <tr class="${row.isPlanned ? 'row-planned' : ''}" onclick="openDateFromCalendar('${row.iso}')">
        <td class="sticky-col-1">${formatShortDate(row.iso)}</td>
        <td class="sticky-col-2"><span class="plan-pill ${pillClass}">${planName}</span></td>
        ${dataCells}
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="sheet-wrapper">
      <table class="gym-sheet">
        <thead>
          <tr>
            <th rowspan="2" class="sticky-col-1">Data</th>
            <th rowspan="2" class="sticky-col-2">Trening</th>
            ${topHeaderCells}
          </tr>
          <tr>
            ${subHeaderCells}
          </tr>
        </thead>
        <tbody>
          ${bodyRowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function exportCSV() {
  const { allColumns } = buildTableSchema();
  if (allColumns.length === 0) return;

  const headers = ["Data", "Trening", ...allColumns.map(c => `"${c.name}"`)];
  const savedDates = Object.keys(workouts)
    .filter(iso => workouts[iso].exercises && workouts[iso].exercises.length > 0)
    .sort();

  const lines = [headers.join(";")];
  savedDates.forEach(iso => {
    const [y, m, d] = iso.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const wd = String(dateObj.getDay());
    const sched = schedules[wd];
    const planName = workouts[iso].fromSchedule || (sched ? sched.name : WEEKDAY_FULL[dateObj.getDay()]);

    const rowVals = allColumns.map(col => {
      const found = workouts[iso].exercises.find(e => e.name.toLowerCase() === col.name.toLowerCase());
      return `"${found ? formatSetsCompact(found.sets) : ""}"`;
    });
    lines.push([iso, `"${planName}"`, ...rowVals].join(";"));
  });

  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gymnotes_tabela_${toISODate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// === SEKCJA 6: KALENDARZ ===
function changeMonth(offset) {
  calendarViewDate.setMonth(calendarViewDate.getMonth() + offset);
  renderCalendar();
}

function renderCalendar() {
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
  
  document.getElementById('calendar-month-title').textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayISO = toISODate(new Date());

  let html = '';
  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const currentIterDate = new Date(year, month, d);
    const iso = toISODate(currentIterDate);
    const hasSavedWorkout = workouts[iso] && workouts[iso].exercises && workouts[iso].exercises.length > 0;
    const hasPlannedWorkout = !hasSavedWorkout && getActiveScheduleForDate(currentIterDate) !== null;
    const isToday = iso === todayISO;

    let classes = 'cal-day';
    if (hasSavedWorkout) classes += ' has-workout';
    else if (hasPlannedWorkout) classes += ' planned-workout';
    if (isToday) classes += ' today';

    html += `
      <div class="${classes}" onclick="openDateFromCalendar('${iso}')">
        ${d}
      </div>
    `;
  }

  document.getElementById('calendar-days').innerHTML = html;
}

function openDateFromCalendar(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  selectedDate = new Date(y, m - 1, d);
  
  if (isConsistenceMode) {
    document.getElementById('consistence-toggle').checked = false;
    toggleConsistenceMode();
  }
  
  switchTab('notes', document.querySelector('.nav-btn'));
  renderWorkout();
}

function openConsistenceEditor(weekday) {
  switchTab('notes', document.querySelector('.nav-btn'));
  
  const toggle = document.getElementById('consistence-toggle');
  if (!toggle.checked) {
    toggle.checked = true;
    toggleConsistenceMode();
  }
  
  document.getElementById('consistence-weekday').value = String(weekday);
  renderWorkout();
}

// === SEKCJA 7: BAZA ĆWICZEŃ, KOPIA ZAPASOWA I NAWIGACJA ===
function renderExerciseDB() {
  const list = document.getElementById('exercise-db-list');
  list.innerHTML = exerciseDB.map((ex, idx) => `
    <div class="db-item">
      <span>${ex.name} <small style="color: var(--text-muted);">(${ex.part})</small></span>
      <button class="btn-icon-danger" onclick="deleteExerciseFromDB(${idx})">&#10005;</button>
    </div>
  `).join('');
}

function deleteExerciseFromDB(idx) {
  exerciseDB.splice(idx, 1);
  saveState();
  renderExerciseDB();
}

function restoreDefaultExercises() {
  DEFAULT_EXERCISES.forEach(defEx => {
    const exists = exerciseDB.some(ex => ex.name.toLowerCase() === defEx.name.toLowerCase());
    if (!exists) {
      exerciseDB.push(JSON.parse(JSON.stringify(defEx)));
    }
  });
  saveState();
  renderExerciseDB();
}

function exportData() {
  const data = { workouts, exerciseDB, schedules };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gymnotes_kopia_${toISODate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.workouts) workouts = parsed.workouts;
      if (parsed.exerciseDB) exerciseDB = parsed.exerciseDB;
      if (parsed.schedules) schedules = parsed.schedules;
      saveState();
      renderWorkout();
      renderCalendar();
      renderTable();
      renderExerciseDB();
      alert("Dane zostały pomyślnie wczytane!");
    } catch (err) {
      alert("Błąd odczytu pliku kopii zapasowej.");
    }
  };
  reader.readAsText(file);
}

function switchTab(tabName, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`tab-${tabName}`).classList.add('active');
  if (btnElement) btnElement.classList.add('active');

  if (tabName === 'calendar') renderCalendar();
  if (tabName === 'table') renderTable();
  if (tabName === 'settings') renderExerciseDB();
}

// === SEKCJA 8: SYLWETKA MIĘŚNIOWA (SVG) I MODAL TIPÓW ===
let activeModalExerciseName = "";
let svgUidCounter = 0;

function resolveExerciseMuscles(exName) {
  const found = exerciseDB.find(e => e.name.toLowerCase() === exName.toLowerCase());
  if (found && Array.isArray(found.primary) && found.primary.length > 0) {
    return {
      primary: found.primary,
      secondary: found.secondary || []
    };
  }

  const text = ((found ? found.part : "") + " " + exName).toLowerCase();

  if (text.includes("martw") || text.includes("deadlift") || text.includes("rdl")) {
    return { primary: ["lower_back", "glutes", "hamstrings"], secondary: ["lats", "traps", "forearms"] };
  }
  if (text.includes("przysiad") || text.includes("squat") || text.includes("suwnic") || text.includes("wykrok") || text.includes("lunge")) {
    return { primary: ["quads", "glutes"], secondary: ["hamstrings", "calves"] };
  }
  if (text.includes("dwugłow") || text.includes("uginanie nóg") || text.includes("leg curl")) {
    return { primary: ["hamstrings"], secondary: ["glutes", "calves"] };
  }
  if (text.includes("wyprost") && text.includes("nóg") || text.includes("leg ext")) {
    return { primary: ["quads"], secondary: [] };
  }
  if (text.includes("hip thrust") || text.includes("poślad")) {
    return { primary: ["glutes"], secondary: ["hamstrings"] };
  }
  if (text.includes("łydk") || text.includes("calf") || text.includes("wspięcia")) {
    return { primary: ["calves"], secondary: [] };
  }
  if (text.includes("klatk") || text.includes("bench") || text.includes("chest") || text.includes("rozpięt") || text.includes("pompk")) {
    return { primary: ["chest"], secondary: ["shoulders", "triceps"] };
  }
  if (text.includes("ohp") || text.includes("żołniersk") || (text.includes("wycisk") && text.includes("bark"))) {
    return { primary: ["shoulders"], secondary: ["triceps", "traps"] };
  }
  if (text.includes("face pull") || text.includes("tył bark")) {
    return { primary: ["shoulders", "traps"], secondary: [] };
  }
  if (text.includes("bark") || text.includes("wznos") || text.includes("shoulder") || text.includes("lateral")) {
    return { primary: ["shoulders"], secondary: ["traps"] };
  }
  if (text.includes("kaptur") || text.includes("szrugs") || text.includes("shrug")) {
    return { primary: ["traps"], secondary: ["forearms"] };
  }
  if (text.includes("podciąg") || text.includes("pull-up") || text.includes("chin-up") || text.includes("pulldown") || text.includes("ściąganie")) {
    return { primary: ["lats"], secondary: ["biceps", "traps"] };
  }
  if (text.includes("plec") || text.includes("row") || text.includes("wiosł") || text.includes("back")) {
    return { primary: ["lats", "traps"], secondary: ["biceps", "shoulders"] };
  }
  if (text.includes("bicep") || text.includes("uginan") || text.includes("curl")) {
    return { primary: ["biceps"], secondary: ["forearms"] };
  }
  if (text.includes("tricep") || text.includes("francusk") || text.includes("dips") || text.includes("poręcz")) {
    return { primary: ["triceps"], secondary: ["shoulders"] };
  }
  if (text.includes("brzuch") || text.includes("plank") || text.includes("abs") || text.includes("crunch")) {
    return { primary: ["abs"], secondary: [] };
  }
  if (text.includes("nog") || text.includes("leg")) {
    return { primary: ["quads", "hamstrings", "glutes"], secondary: ["calves"] };
  }

  return { primary: ["chest", "lats", "quads"], secondary: ["shoulders", "abs"] };
}

function renderAnatomicalFigure(side, muscleMap, uid, viewBox = "6 4 88 186") {
  const mColor = (key) => {
    if (muscleMap.primary.includes(key)) return `url(#m-pri-${uid})`;
    if (muscleMap.secondary.includes(key)) return `url(#m-sec-${uid})`;
    return "#232934";
  };
  const mFilter = (key) => muscleMap.primary.includes(key) ? `filter="url(#m-glow-${uid})"` : "";
  const isActive = (key) => muscleMap.primary.includes(key) || muscleMap.secondary.includes(key);

  const skin = "#1A1F28";
  const outline = "#12161D";
  const strokeLine = "#2C3442";

  if (side === "front") {
    return `
      <svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="m-pri-${uid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FF7E7E"/>
            <stop offset="100%" stop-color="#E11D48"/>
          </linearGradient>
          <linearGradient id="m-sec-${uid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FDBA74" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#EA580C" stop-opacity="0.8"/>
          </linearGradient>
          <filter id="m-glow-${uid}" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="1.6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Zarys sylwetki -->
        <path d="M43 13 C43 7.5 57 7.5 57 13 C57 17.5 55.5 21 53.5 23 L55.5 26.5 L68 31.2 C74.5 32.5 77.5 38 76.5 45 L77.5 62 L81.8 85 L82.8 94.5 L78.2 96 L76.5 85.5 L70.2 64.5 L65.8 50.5 L63.5 77.5 L66 92 L67.8 113 L64.5 132 L66 154 L63 175 L66.2 185 L56.5 184.5 L56.8 174.5 L54.2 136 L52.5 92 L47.5 92 L45.8 136 L43.2 174.5 L43.5 184.5 L33.8 185 L37 175 L34 154 L35.5 132 L32.2 113 L34 92 L36.5 77.5 L34.2 50.5 L29.8 64.5 L23.5 85.5 L21.8 96 L17.2 94.5 L18.2 85 L22.5 62 L23.5 45 C22.5 38 25.5 32.5 32 31.2 L44.5 26.5 L46.5 23 C44.5 21 43 17.5 43 13 Z"
              fill="${outline}" stroke="${strokeLine}" stroke-width="0.9"/>

        <!-- Głowa i szyja -->
        <path d="M44 13.2 C44 8.5 56 8.5 56 13.2 C56 17.2 54.5 20.8 52.5 22.4 C50.8 23.6 49.2 23.6 47.5 22.4 C45.5 20.8 44 17.2 44 13.2 Z" fill="${skin}"/>
        <path d="M46 22.8 L44.5 29.5 L55.5 29.5 L54 22.8 Z" fill="${skin}"/>

        <!-- Kaptury (przód) -->
        <g fill="${mColor('traps')}" ${mFilter('traps')}>
          <path d="M44.5 26.5 Q38.5 28.5 33 31.3 L37 33.4 L44.8 30 Z"/>
          <path d="M55.5 26.5 Q61.5 28.5 67 31.3 L63 33.4 L55.2 30 Z"/>
        </g>

        <!-- Barki (przedni / boczny akton) -->
        <g fill="${mColor('shoulders')}" ${mFilter('shoulders')}>
          <path d="M32.5 31.5 C26.8 32.6 24 37.5 24.8 44.2 C26.2 47 29.5 47 31.4 43.8 C32.8 40 34.4 35.5 36.4 33.5 Z"/>
          <path d="M67.5 31.5 C73.2 32.6 76 37.5 75.2 44.2 C73.8 47 70.5 47 68.6 43.8 C67.2 40 65.6 35.5 63.6 33.5 Z"/>
        </g>

        <!-- Klatka piersiowa -->
        <g fill="${mColor('chest')}" ${mFilter('chest')}>
          <path d="M49.2 33.4 L37 33.7 C34.5 37.5 33.6 43.5 35.6 48.2 C38.6 51.2 45.6 51.2 49.2 48.2 Z"/>
          <path d="M50.8 33.4 L63 33.7 C65.5 37.5 66.4 43.5 64.4 48.2 C61.4 51.2 54.4 51.2 50.8 48.2 Z"/>
        </g>
        ${isActive('chest') ? `
          <path d="M48.2 37.5 Q41.5 39.2 36.2 43.2 M48.2 42.5 Q42.2 44.2 36.8 46.5 M51.8 37.5 Q58.5 39.2 63.8 43.2 M51.8 42.5 Q57.8 44.2 63.2 46.5"
                stroke="#0B0D0F" stroke-width="0.75" stroke-linecap="round" fill="none" opacity="0.35"/>
        ` : ''}

        <!-- Biceps -->
        <g fill="${mColor('biceps')}" ${mFilter('biceps')}>
          <path d="M25.5 45.8 C23.6 50.8 23.2 57.8 24.6 63.2 C26.5 64.6 29.4 63.6 30.6 59.8 C31.6 54.8 31.3 48.8 30.3 45.4 Z"/>
          <path d="M74.5 45.8 C76.4 50.8 76.8 57.8 75.4 63.2 C73.5 64.6 70.6 63.6 69.4 59.8 C68.4 54.8 68.7 48.8 69.7 45.4 Z"/>
        </g>

        <!-- Przedramiona -->
        <g fill="${mColor('forearms')}" ${mFilter('forearms')}>
          <path d="M24 64.5 C21.6 70 19.6 78 19.2 84.5 L22.5 85.4 C24.8 79.4 27.4 71.4 28.8 64.5 Z"/>
          <path d="M76 64.5 C78.4 70 80.4 78 80.8 84.5 L77.5 85.4 C75.2 79.4 72.6 71.4 71.2 64.5 Z"/>
        </g>

        <!-- Brzuch (6-pack + mięśnie skośne) -->
        <g fill="${mColor('abs')}" ${mFilter('abs')}>
          <path d="M35.6 50.5 C34.6 58 35.4 68 37.6 76.8 L41.4 78.6 L41.4 52 Z" opacity="0.82"/>
          <path d="M64.4 50.5 C65.4 58 64.6 68 62.4 76.8 L58.6 78.6 L58.6 52 Z" opacity="0.82"/>
          <rect x="42.5" y="51.4" width="6.7" height="6.4" rx="1.6"/>
          <rect x="50.8" y="51.4" width="6.7" height="6.4" rx="1.6"/>
          <rect x="42.5" y="59.1" width="6.7" height="6.5" rx="1.6"/>
          <rect x="50.8" y="59.1" width="6.7" height="6.5" rx="1.6"/>
          <path d="M42.5 67 L49.2 67 L49.2 79.2 L44.4 76.4 Z"/>
          <path d="M50.8 67 L57.5 67 L57.5 79.2 L55.6 76.4 Z"/>
        </g>

        <!-- Pas biodrowy -->
        <path d="M37.5 77.6 L44.5 80.4 L50 82.8 L55.5 80.4 L62.5 77.6 L64.2 86.8 L51.4 90.8 L48.6 90.8 L35.8 86.8 Z" fill="${skin}"/>

        <!-- Czworogłowe uda (Quads) -->
        <g fill="${mColor('quads')}" ${mFilter('quads')}>
          <path d="M35.6 87.6 C32.6 98 32.6 113 35.6 126.8 L39.5 125.8 C38.5 112 38.5 99 40 89.2 Z"/>
          <path d="M40.6 89.6 L48.2 91.8 C48.8 105 47.8 119 45.5 127.8 L40.2 126.8 C39.2 114 39.5 101 40.6 89.6 Z"/>
          <path d="M64.4 87.6 C67.4 98 67.4 113 64.4 126.8 L60.5 125.8 C61.5 112 61.5 99 60 89.2 Z"/>
          <path d="M59.4 89.6 L51.8 91.8 C51.2 105 52.2 119 54.5 127.8 L59.8 126.8 C60.8 114 60.5 101 59.4 89.6 Z"/>
        </g>

        <!-- Kolana -->
        <path d="M36.4 128.6 L45 129.6 L44.5 136.4 L37 136.4 Z" fill="${skin}"/>
        <path d="M63.6 128.6 L55 129.6 L55.5 136.4 L63 136.4 Z" fill="${skin}"/>

        <!-- Łydki / Podudzia -->
        <g fill="${mColor('calves')}" ${mFilter('calves')}>
          <path d="M36.6 138 C34.4 147 34.6 158 37.6 173.8 L42.6 173.8 C44.6 159 45.4 147 44.4 138 Z"/>
          <path d="M63.4 138 C65.6 147 65.4 158 62.4 173.8 L57.4 173.8 C55.4 159 54.6 147 55.6 138 Z"/>
        </g>
      </svg>
    `;
  }

  return `
    <svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="m-pri-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF7E7E"/>
          <stop offset="100%" stop-color="#E11D48"/>
        </linearGradient>
        <linearGradient id="m-sec-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FDBA74" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#EA580C" stop-opacity="0.8"/>
        </linearGradient>
        <filter id="m-glow-${uid}" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Zarys sylwetki (Tył) -->
      <path d="M43 13 C43 7.5 57 7.5 57 13 C57 17.5 55.5 21 53.5 23 L55.5 26.5 L68 31.2 C74.5 32.5 77.5 38 76.5 45 L77.5 62 L81.8 85 L82.8 94.5 L78.2 96 L76.5 85.5 L70.2 64.5 L66.5 51 L63.2 75 L66.2 91 L67.5 113 L64.2 132 L66 154 L63 175 L64 185 L56.8 185 L57 174.5 L54.2 136 L52 94 L48 94 L45.8 136 L43 174.5 L43.2 185 L36 185 L37 175 L34 154 L35.8 132 L32.5 113 L33.8 91 L36.8 75 L33.5 51 L29.8 64.5 L23.5 85.5 L21.8 96 L17.2 94.5 L18.2 85 L22.5 62 L23.5 45 C22.5 38 25.5 32.5 32 31.2 L44.5 26.5 L46.5 23 C44.5 21 43 17.5 43 13 Z"
            fill="${outline}" stroke="${strokeLine}" stroke-width="0.9"/>

      <!-- Tył głowy i kark -->
      <path d="M44 13.2 C44 8.5 56 8.5 56 13.2 C56 17.5 54.4 21 52.5 22.5 L47.5 22.5 C45.6 21 44 17.5 44 13.2 Z" fill="${skin}"/>
      <path d="M46 22.4 L44.8 27.5 L55.2 27.5 L54 22.4 Z" fill="${skin}"/>

      <!-- Czworoboczny / Kaptury / Równoległoboczne -->
      <g fill="${mColor('traps')}" ${mFilter('traps')}>
        <path d="M49.4 24.4 L44.6 26.8 L33.6 31.4 L41.4 41.5 L49.4 51.8 Z"/>
        <path d="M50.6 24.4 L55.4 26.8 L66.4 31.4 L58.6 41.5 L50.6 51.8 Z"/>
      </g>

      <!-- Tylny akton barków -->
      <g fill="${mColor('shoulders')}" ${mFilter('shoulders')}>
        <path d="M32.5 31.5 C26.8 32.6 24 37.5 24.8 44.2 C26.6 46.8 30 45.8 32.4 42.4 C34.4 39 35.4 35 33.5 31.5 Z"/>
        <path d="M67.5 31.5 C73.2 32.6 76 37.5 75.2 44.2 C73.4 46.8 70 45.8 67.6 42.4 C65.6 39 64.6 35 66.5 31.5 Z"/>
      </g>

      <!-- Najszerszy grzbietu (Lats) -->
      <g fill="${mColor('lats')}" ${mFilter('lats')}>
        <path d="M33.2 43.4 C31.6 51 33.6 61 38.6 72.4 L44.4 74.2 L45.4 53 L40.8 42.4 Z"/>
        <path d="M66.8 43.4 C68.4 51 66.4 61 61.4 72.4 L55.6 74.2 L54.6 53 L59.2 42.4 Z"/>
      </g>
      ${isActive('lats') ? `
        <path d="M35.5 49 Q40 53 44.5 58 M36.8 56 Q40.5 60 44.2 64.5 M64.5 49 Q60 53 55.5 58 M63.2 56 Q59.5 60 55.8 64.5"
              stroke="#0B0D0F" stroke-width="0.75" stroke-linecap="round" fill="none" opacity="0.35"/>
      ` : ''}

      <!-- Prostowniki grzbietu (Lower Back) -->
      <g fill="${mColor('lower_back')}" ${mFilter('lower_back')}>
        <path d="M46.2 53.4 L49.3 53.4 L49.3 76.2 L44.8 75.2 Z"/>
        <path d="M53.8 53.4 L50.7 53.4 L50.7 76.2 L55.2 75.2 Z"/>
      </g>

      <!-- Triceps -->
      <g fill="${mColor('triceps')}" ${mFilter('triceps')}>
        <path d="M25.2 45.8 C23.2 51.4 23.2 58.4 25 63.8 C27 64.8 29.8 63.4 31 59.4 C32 54.4 31.5 48.5 30.2 45.4 Z"/>
        <path d="M74.8 45.8 C76.8 51.4 76.8 58.4 75 63.8 C73 64.8 70.2 63.4 69 59.4 C68 54.4 68.5 48.5 69.8 45.4 Z"/>
      </g>

      <!-- Przedramiona (tył) -->
      <g fill="${mColor('forearms')}" ${mFilter('forearms')}>
        <path d="M24 64.5 C21.6 70 19.6 78 19.2 84.5 L22.5 85.4 C24.8 79.4 27.4 71.4 28.8 64.5 Z"/>
        <path d="M76 64.5 C78.4 70 80.4 78 80.8 84.5 L77.5 85.4 C75.2 79.4 72.6 71.4 71.2 64.5 Z"/>
      </g>

      <!-- Pośladki (Glutes) -->
      <g fill="${mColor('glutes')}" ${mFilter('glutes')}>
        <path d="M38.4 74.5 C35.2 79 35 87.5 37.6 92.4 C41.6 94.4 47.4 93.8 49.3 90.4 L49.3 77.8 Z"/>
        <path d="M61.6 74.5 C64.8 79 65 87.5 62.4 92.4 C58.4 94.4 52.6 93.8 50.7 90.4 L50.7 77.8 Z"/>
      </g>

      <!-- Dwugłowe uda (Hamstrings) -->
      <g fill="${mColor('hamstrings')}" ${mFilter('hamstrings')}>
        <path d="M37 93.5 C34.6 104 35 117 37.2 127.8 L45.8 127.8 C47.8 117 48.4 104 48.2 93 C44 95 39.6 94.8 37 93.5 Z"/>
        <path d="M63 93.5 C65.4 104 65 117 62.8 127.8 L54.2 127.8 C52.2 117 51.6 104 51.8 93 C56 95 60.4 94.8 63 93.5 Z"/>
      </g>

      <!-- Zgięcie kolan -->
      <path d="M37.4 129.4 L45.5 129.4 L45 136.4 L37.6 136.4 Z" fill="${skin}"/>
      <path d="M62.6 129.4 L54.5 129.4 L55 136.4 L62.4 136.4 Z" fill="${skin}"/>

      <!-- Łydki (Gastrocnemius) -->
      <g fill="${mColor('calves')}" ${mFilter('calves')}>
        <path d="M37.2 138 C34.2 146 34.4 156 37.8 173.8 L42.4 173.8 C45.6 156 46 146 44.6 138 Z"/>
        <path d="M62.8 138 C65.8 146 65.6 156 62.2 173.8 L57.6 173.8 C54.4 156 54 146 55.4 138 Z"/>
      </g>
    </svg>
  `;
}

function getMuscleSVG(exName, isAvatar = false) {
  const muscleMap = resolveExerciseMuscles(exName);
  const backMuscles = ["lats", "traps", "lower_back", "triceps", "glutes", "hamstrings", "calves"];
  const lowerMuscles = ["quads", "hamstrings", "glutes", "calves"];

  if (isAvatar) {
    const primary = muscleMap.primary;
    const isBackPrimary = primary.some(m => backMuscles.includes(m));
    const isLowerPrimary = primary.every(m => lowerMuscles.includes(m));
    const isUpperPrimary = primary.every(m => !lowerMuscles.includes(m));

    let viewBox = "8 6 84 182";
    if (isUpperPrimary) viewBox = "15 20 70 68";
    else if (isLowerPrimary) viewBox = "22 72 56 88";

    const uid = ++svgUidCounter;
    return renderAnatomicalFigure(isBackPrimary ? "back" : "front", muscleMap, uid, viewBox);
  }

  const uidFront = ++svgUidCounter;
  const uidBack = ++svgUidCounter;

  return `
    <div class="anatomy-dual-wrap">
      <div class="anatomy-dual-figures">
        <div class="anatomy-col">
          ${renderAnatomicalFigure("front", muscleMap, uidFront, "12 5 76 184")}
          <span>Przód</span>
        </div>
        <div class="anatomy-col">
          ${renderAnatomicalFigure("back", muscleMap, uidBack, "12 5 76 184")}
          <span>Tył</span>
        </div>
      </div>
      <div class="anatomy-legend">
        <span><i class="dot-pri"></i>Główna</span>
        <span><i class="dot-sec"></i>Pomocnicza</span>
      </div>
    </div>
  `;
}

function openExerciseModal(exName) {
  activeModalExerciseName = exName;
  let exObj = exerciseDB.find(e => e.name.toLowerCase() === exName.toLowerCase());
  if (!exObj) {
    exObj = { name: exName, part: "Własne", tips: [], userTip: "" };
  }

  document.getElementById('modal-ex-title').textContent = exObj.name;
  document.getElementById('modal-ex-part').textContent = exObj.part || "Ogólne";
  document.getElementById('modal-muscle-svg').innerHTML = getMuscleSVG(exObj.name, false);

  const tipsList = document.getElementById('modal-ex-tips');
  const tips = (exObj.tips && exObj.tips.length > 0)
    ? exObj.tips
    : ["Utrzymuj pełną kontrolę nad ciężarem w obu fazach ruchu.", "Zadbaj o stabilną pozycję i pełny zakres ruchu."];

  tipsList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
  document.getElementById('modal-user-tip').value = exObj.userTip || "";

  document.getElementById('exercise-modal').classList.add('open');
}

function closeExerciseModal(event) {
  if (!event || event.target.id === 'exercise-modal') {
    document.getElementById('exercise-modal').classList.remove('open');
  }
}

function saveExerciseUserTip() {
  if (!activeModalExerciseName) return;
  const val = document.getElementById('modal-user-tip').value;
  let exObj = exerciseDB.find(e => e.name.toLowerCase() === activeModalExerciseName.toLowerCase());
  if (!exObj) {
    exObj = { name: activeModalExerciseName, part: "Własne", tips: [], userTip: val };
    exerciseDB.unshift(exObj);
  } else {
    exObj.userTip = val;
  }
  saveState();
}

// === SEKCJA 9: NADPISYWANIE BIEŻĄCEGO TRENINGU NA DZIEŃ TYGODNIA ===
function applyCurrentWorkoutToWeekday() {
  const iso = toISODate(selectedDate);
  const weekday = String(selectedDate.getDay());
  const dayName = WEEKDAY_FULL[selectedDate.getDay()];

  let currentExercises = [];
  if (workouts[iso] && workouts[iso].exercises.length > 0) {
    currentExercises = workouts[iso].exercises;
  } else {
    const activeSched = getActiveScheduleForDate(selectedDate);
    if (activeSched) currentExercises = activeSched.exercises;
  }

  if (currentExercises.length === 0) return;

  const existingName = (schedules[weekday] && schedules[weekday].name) ? schedules[weekday].name : dayName;
  const planName = prompt(`Podaj nazwę dla tego stałego planu (np. PUSH, PULL, LEGS):`, existingName);
  if (planName === null) return;

  const finalName = planName.trim() || dayName;

  schedules[weekday] = {
    name: finalName,
    freq: (schedules[weekday] && schedules[weekday].freq) ? schedules[weekday].freq : "1",
    startDate: iso,
    exercises: currentExercises.map(ex => ({
      name: ex.name,
      defaultSets: ex.sets ? ex.sets.length : (ex.defaultSets || 3)
    }))
  };

  if (workouts[iso]) {
    workouts[iso].fromSchedule = finalName;
  }

  saveState();
  renderWorkout();
  alert(`Gotowe! Ten zestaw ćwiczeń będzie teraz pojawiać się w każdy: ${dayName.toLowerCase()} (w Kalendarzu i Tabeli).`);
}

// === START APLIKACJI ===
updateStats();
renderWorkout();
