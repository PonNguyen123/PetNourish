// --- Sample food data ------------------------------------

const FOOD_DATABASE = [
  {
    id: 'dog1',
    name: 'Gentle Stomach Care',
    brand: 'PetNourish Lab',
    species: ['dog'],
    age: ['puppy', 'adult'],
    healthTags: ['sensitive'],
    priceLevel: 'mid',
    proteinLevel: 'high',
    highlights: 'High-quality single-source protein with added prebiotics for digestion.',
    ingredients: 'Fresh chicken, brown rice, pumpkin, chicory root, salmon oil, vitamins & minerals.',
    baseScore: 82,
    emoji: '🐶'
  },
  {
    id: 'dog2',
    name: 'Lean & Light Formula',
    brand: 'GreenTail',
    species: ['dog'],
    age: ['adult', 'senior'],
    healthTags: ['weight'],
    priceLevel: 'mid',
    proteinLevel: 'moderate',
    highlights: 'Balanced calories with L-carnitine to support healthy weight.',
    ingredients: 'Turkey meal, oat groats, peas, flaxseed, beet pulp, vitamins & minerals.',
    baseScore: 79,
    emoji: '🥗'
  },
  {
    id: 'dog3',
    name: 'Grain-Free Energy Mix',
    brand: 'WildTrail',
    species: ['dog'],
    age: ['puppy', 'adult'],
    healthTags: ['allergy'],
    priceLevel: 'premium',
    proteinLevel: 'very-high',
    highlights: 'Grain-free formula for active dogs and sensitive skin.',
    ingredients: 'Deboned salmon, lentils, chickpeas, sweet potato, coconut oil, vitamins.',
    baseScore: 88,
    emoji: '🏃‍♂️'
  },
  {
    id: 'cat1',
    name: 'Indoor Balance Blend',
    brand: 'WhiskerLife',
    species: ['cat'],
    age: ['adult'],
    healthTags: ['weight'],
    priceLevel: 'mid',
    proteinLevel: 'moderate',
    highlights: 'Designed for indoor cats with controlled calories and hairball support.',
    ingredients: 'Chicken meal, rice, barley, beet pulp, fish oil, vitamins & minerals.',
    baseScore: 80,
    emoji: '🐱'
  },
  {
    id: 'cat2',
    name: 'Sensitive Skin & Coat',
    brand: 'SilkyPaws',
    species: ['cat'],
    age: ['adult', 'senior'],
    healthTags: ['sensitive'],
    priceLevel: 'premium',
    proteinLevel: 'high',
    highlights: 'Rich in omega-3 & 6 for shiny coat and gentle digestion.',
    ingredients: 'Fresh salmon, potato, pea protein, sunflower oil, flaxseed, vitamins.',
    baseScore: 86,
    emoji: '✨'
  },
  {
    id: 'cat3',
    name: 'Kind Start Kitten Formula',
    brand: 'TinyTails',
    species: ['cat'],
    age: ['puppy'],
    healthTags: ['none'],
    priceLevel: 'value',
    proteinLevel: 'high',
    highlights: 'Supports healthy growth with DHA and carefully balanced minerals.',
    ingredients: 'Chicken meal, corn, rice, fish meal, chicken fat, vitamins & minerals.',
    baseScore: 78,
    emoji: '🍼'
  }
];

// --- State ------------------------------------------------

let currentPetProfile = null;
let currentFoodSelection = null;
let currentRecommendations = [];
let compareSelection = [];

// --- DOM references ---------------------------------------

const petForm = document.getElementById('pet-form');
const submitBtn = document.getElementById('submit-btn');
const resultsSubtitle = document.getElementById('results-subtitle');
const recommendationsList = document.getElementById('recommendations-list');
const petSummaryPill = document.getElementById('pet-summary-pill');
const petSummaryText = document.getElementById('pet-summary-text');

const detailsPlaceholder = document.getElementById('details-placeholder');
const detailsContent = document.getElementById('details-content');
const detailName = document.getElementById('detail-name');
const detailBrand = document.getElementById('detail-brand');
const detailScoreText = document.getElementById('detail-score-text');
const detailTags = document.getElementById('detail-tags');
const detailHighlights = document.getElementById('detail-highlights');
const detailIngredients = document.getElementById('detail-ingredients');
const insightsList = document.getElementById('insights-list');

const feedWeightInput = document.getElementById('feed-weight');
const feedActivitySelect = document.getElementById('feed-activity');
const feedingOutput = document.getElementById('feeding-output');
const calculateBtn = document.getElementById('calculate-btn');

const themeToggle = document.getElementById('theme-toggle');
const savedPetsList = document.getElementById('saved-pets-list');
const sortBySelect = document.getElementById('sortBy');

const comparePanel = document.getElementById('compare-panel');
const compareGrid = document.getElementById('compare-grid');
const clearCompareBtn = document.getElementById('clear-compare');

const weightInput = document.getElementById('weight');
const weightError = document.getElementById('weight-error');
const toast = document.getElementById('toast');

// --- Helpers ----------------------------------------------

function collectPetProfile() {
  const petName = document.getElementById('petName').value.trim();
  const species = document.getElementById('species').value;
  const ageCategory = document.getElementById('ageCategory').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const activity = document.getElementById('activity').value;
  const health = document.getElementById('health').value;
  const budget = document.getElementById('budget').value;

  return { petName, species, ageCategory, weight, activity, health, budget };
}

function validatePetProfile(profile) {
  let valid = true;

  if (!profile.weight || profile.weight <= 0) {
    if (weightError) weightError.hidden = false;
    if (weightInput) weightInput.classList.add('has-error');
    valid = false;
  } else {
    if (weightError) weightError.hidden = true;
    if (weightInput) weightInput.classList.remove('has-error');
  }

  if (!valid) {
    showToast('Please fix the highlighted field.');
  }

  return valid;
}

function scoreFoodForPet(food, pet) {
  let score = food.baseScore;

  // Species match
  if (!food.species.includes(pet.species)) {
    score -= 20;
  }

  // Age
  if (food.age.includes(pet.ageCategory)) {
    score += 6;
  } else {
    score -= 8;
  }

  // Health focus
  if (pet.health !== 'none') {
    if (food.healthTags.includes(pet.health)) {
      score += 10;
    } else {
      score -= 6;
    }
  } else {
    score += 2;
  }

  // Budget
  if (pet.budget !== 'any') {
    if (pet.budget === food.priceLevel) {
      score += 6;
    } else if (pet.budget === 'value' && food.priceLevel === 'premium') {
      score -= 8;
    } else if (pet.budget === 'premium' && food.priceLevel === 'value') {
      score -= 4;
    }
  }

  // Activity vs protein level
  if (pet.activity === 'high' && (food.proteinLevel === 'high' || food.proteinLevel === 'very-high')) {
    score += 4;
  }
  if (pet.activity === 'low' && food.proteinLevel === 'very-high') {
    score -= 3;
  }

  return Math.max(40, Math.min(score, 99)); // clamp
}

function getRecommendationsForPet(pet) {
  const filtered = FOOD_DATABASE.filter(food => food.species.includes(pet.species));
  const scored = filtered.map(food => ({
    ...food,
    finalScore: scoreFoodForPet(food, pet)
  }));
  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored;
}

// --- Saved pets ------------------------------------------

function getSavedPets() {
  try {
    const raw = localStorage.getItem('pn-saved-pets');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePetProfile(profile) {
  const saved = getSavedPets();
  const id = Date.now().toString();
  const entry = {
    id,
    petName: profile.petName || 'Unnamed',
    species: profile.species,
    ageCategory: profile.ageCategory,
    weight: profile.weight,
    activity: profile.activity,
    health: profile.health,
    budget: profile.budget
  };
  saved.unshift(entry);
  const trimmed = saved.slice(0, 6); // keep last 6
  localStorage.setItem('pn-saved-pets', JSON.stringify(trimmed));
  renderSavedPets();
}

function deleteSavedPet(id) {
  const filtered = getSavedPets().filter(p => p.id !== id);
  localStorage.setItem('pn-saved-pets', JSON.stringify(filtered));
  renderSavedPets();
  showToast('Saved pet removed.');
}

function renderSavedPets() {
  const saved = getSavedPets();
  savedPetsList.innerHTML = '';
  if (!saved.length) return;

  saved.forEach(pet => {
    const chip = document.createElement('div');
    chip.className = 'saved-pet-chip';
    const speciesEmoji = pet.species === 'dog' ? '🐶' : '🐱';
    chip.dataset.id = pet.id;

    chip.innerHTML = `
      <span class="saved-pet-main">
        ${speciesEmoji} ${pet.petName}
      </span>
      <small>${pet.weight.toFixed(1)} kg • ${pet.ageCategory}</small>
      <button type="button" class="saved-pet-delete" aria-label="Delete saved pet">&times;</button>
    `;

    savedPetsList.appendChild(chip);
  });
}

// --- UI helpers ------------------------------------------

function renderPetSummary(pet) {
  const speciesLabel = pet.species === 'dog' ? 'Dog' : 'Cat';
  const namePart = pet.petName ? `${pet.petName} • ` : '';
  petSummaryText.textContent = `${namePart}${speciesLabel}, ${pet.ageCategory}, ${pet.weight.toFixed(1)} kg`;
  petSummaryPill.hidden = false;
}

function prettyHealth(tags) {
  if (!tags || !tags.length) return 'General nutrition';
  if (tags.includes('sensitive')) return 'Sensitive digestion / skin';
  if (tags.includes('weight')) return 'Weight management';
  if (tags.includes('allergy')) return 'Grain / allergy friendly';
  return 'General nutrition';
}

function prettyPrice(level) {
  if (level === 'value') return 'Value range';
  if (level === 'mid') return 'Mid-range';
  if (level === 'premium') return 'Premium';
  return 'Any budget';
}

function prettyProtein(level) {
  if (level === 'very-high') return 'Very high';
  if (level === 'high') return 'High';
  if (level === 'moderate') return 'Moderate';
  return 'Balanced';
}

// Sorting

function sortRecommendations(list) {
  const criterion = sortBySelect ? sortBySelect.value : 'match';

  if (criterion === 'match') {
    return list.sort((a, b) => b.finalScore - a.finalScore);
  }
  if (criterion === 'price') {
    const order = { value: 1, mid: 2, premium: 3 };
    return list.sort((a, b) => (order[a.priceLevel] || 99) - (order[b.priceLevel] || 99));
  }
  if (criterion === 'protein') {
    const order = { 'moderate': 1, 'high': 2, 'very-high': 3 };
    return list.sort((a, b) => (order[b.proteinLevel] || 0) - (order[a.proteinLevel] || 0));
  }

  return list;
}

// --- Recommendations rendering ---------------------------

function renderRecommendations(recList, pet) {
  recommendationsList.innerHTML = '';

  if (!recList.length) {
    recommendationsList.innerHTML = `
      <p style="font-size:13px; color:#777; margin:0;">
        No recommendations available for this combination yet in the demo dataset.
      </p>
    `;
    comparePanel.hidden = true;
    return;
  }

  recList.forEach(food => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.dataset.id = food.id;

    const checked = compareSelection.includes(food.id) ? 'checked' : '';

    card.innerHTML = `
      <div class="rec-avatar">${food.emoji || '🐾'}</div>
      <div class="rec-content">
        <p class="rec-title">${food.name}</p>
        <div class="rec-brand-line">
          <span class="rec-brand">${food.brand}</span>
          <span class="score-bubble">${food.finalScore}/100 match</span>
        </div>
        <div class="chip-row">
          <span class="chip chip-green">${prettyHealth(food.healthTags)}</span>
          <span class="chip">${prettyPrice(food.priceLevel)}</span>
          <span class="chip">Protein: ${prettyProtein(food.proteinLevel)}</span>
        </div>
        <div class="match-meter">
          <div class="match-meter-fill" style="width:${food.finalScore}%;"></div>
        </div>
      </div>
      <div class="rec-actions">
        <button class="btn btn-secondary view-detail-btn" data-id="${food.id}">
          View details
        </button>
        <div class="compare-control">
          <input type="checkbox" class="compare-checkbox" data-id="${food.id}" ${checked}>
          <span>Compare</span>
        </div>
      </div>
    `;

    recommendationsList.appendChild(card);
  });

  resultsSubtitle.textContent = `Top matches based on your pet’s profile. Tap a card to view details and feeding amount.`;
}

function highlightSelectedCard(foodId) {
  const cards = document.querySelectorAll('.rec-card');
  cards.forEach(card => {
    const match = card.dataset.id === foodId;
    card.classList.toggle('rec-card--active', match);
  });
}

function renderSkeletonRecommendations() {
  recommendationsList.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card';
    sk.innerHTML = `
      <div class="skeleton-avatar"></div>
      <div class="skeleton-content">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line long"></div>
      </div>
    `;
    recommendationsList.appendChild(sk);
  }
}

// --- Details & Insights ----------------------------------

function renderFoodDetails(food, pet) {
  if (!food) return;

  currentFoodSelection = food;

  detailsPlaceholder.hidden = true;
  detailsContent.hidden = false;

  // restart details animation each time we change food
  detailsContent.classList.remove('details-animate');
  void detailsContent.offsetWidth; // force reflow
  detailsContent.classList.add('details-animate');

  detailName.textContent = food.name;
  detailBrand.textContent = `${food.brand} • ${prettyHealth(food.healthTags)}`;

  const recEntry = currentRecommendations.find(r => r.id === food.id);
  const matchScore = recEntry ? recEntry.finalScore : food.baseScore;
  detailScoreText.textContent = `${matchScore}/100 match`;

  // Tags
  detailTags.innerHTML = '';
  const tags = [
    prettyPrice(food.priceLevel),
    `Protein: ${prettyProtein(food.proteinLevel)}`
  ];
  food.healthTags.forEach(tag => {
    tags.push(prettyHealth([tag]));
  });

  const unique = [...new Set(tags)];
  unique.forEach(t => {
    const span = document.createElement('span');
    span.className = 'chip chip-green';
    span.textContent = t;
    detailTags.appendChild(span);
  });

  detailHighlights.textContent = food.highlights;
  detailIngredients.textContent = food.ingredients;

  // Insights
  renderInsights(food, pet, matchScore);

  // Initial feeding calculator values based on pet profile
  if (pet && pet.weight) {
    feedWeightInput.value = pet.weight.toFixed(1);
    feedActivitySelect.value = pet.activity || 'normal';
  }

  updateFeedingAmount();
}

function renderInsights(food, pet, score) {
  insightsList.innerHTML = '';
  if (!pet) return;

  const insights = [];

  if (pet.health !== 'none') {
    if (food.healthTags.includes(pet.health)) {
      if (pet.health === 'sensitive') {
        insights.push('Formulated for sensitive digestion and/or skin, matching your pet’s health focus.');
      } else if (pet.health === 'weight') {
        insights.push('Supports weight management, which aligns with your pet’s weight-control goal.');
      } else if (pet.health === 'allergy') {
        insights.push('Grain-free / allergy-friendly profile that reduces common triggers.');
      }
    } else {
      insights.push('This option is not specifically targeted at your health focus, but still offers balanced nutrition.');
    }
  } else {
    insights.push('Suitable for pets without special health requirements.');
  }

  if (pet.budget !== 'any') {
    if (pet.budget === food.priceLevel) {
      insights.push(`Matches your chosen budget level (${prettyPrice(pet.budget)}).`);
    } else {
      insights.push(`This food sits outside your preferred budget (${prettyPrice(food.priceLevel)} vs ${prettyPrice(pet.budget)}).`);
    }
  }

  if (pet.activity === 'high' && (food.proteinLevel === 'high' || food.proteinLevel === 'very-high')) {
    insights.push('Higher protein content supports your pet’s active lifestyle.');
  } else if (pet.activity === 'low' && food.proteinLevel === 'very-high') {
    insights.push('Very-high protein may be more than needed for low-activity pets; monitor weight over time.');
  } else {
    insights.push('Protein level is appropriate for your pet’s general activity level.');
  }

  insights.push(`Overall match score: ${score}/100 compared to other options for this profile.`);

  insights.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    insightsList.appendChild(li);
  });
}

// --- Feeding calculator -----------------------------------

function estimateDailyAmount(weightKg, activityLevel, species) {
  if (!weightKg || weightKg <= 0) return null;

  // Super simplified model just for demo
  let baseFactor;

  if (species === 'dog') {
    baseFactor = 30; // grams per kg
  } else {
    baseFactor = 25; // cats
  }

  let activityMultiplier = 1.0;
  if (activityLevel === 'low') activityMultiplier = 0.85;
  if (activityLevel === 'high') activityMultiplier = 1.15;

  const grams = weightKg * baseFactor * activityMultiplier;
  return Math.round(grams);
}

function updateFeedingAmount() {
  if (!currentPetProfile || !currentFoodSelection) return;

  const weight = parseFloat(feedWeightInput.value);
  const act = feedActivitySelect.value;

  const grams = estimateDailyAmount(weight, act, currentPetProfile.species);
  if (!grams) {
    feedingOutput.textContent = 'Daily amount: – g (please enter a valid weight)';
    return;
  }

  feedingOutput.textContent = `Daily amount: ~${grams} g (split into 2–3 meals)`;
}

// --- Compare panel ---------------------------------------

function updateCompareSelection(foodId, checked) {
  if (checked) {
    if (!compareSelection.includes(foodId)) {
      if (compareSelection.length >= 2) {
        showToast('You can compare up to 2 foods at a time.');
        // revert checkbox
        const checkbox = document.querySelector(`.compare-checkbox[data-id="${foodId}"]`);
        if (checkbox) checkbox.checked = false;
        return;
      }
      compareSelection.push(foodId);
    }
  } else {
    compareSelection = compareSelection.filter(id => id !== foodId);
  }
  renderComparePanel();
}

function renderComparePanel() {
  if (!compareSelection.length) {
    comparePanel.hidden = true;
    compareGrid.innerHTML = '';
    return;
  }

  const [idA, idB] = compareSelection;
  const foodA = currentRecommendations.find(f => f.id === idA);
  const foodB = currentRecommendations.find(f => f.id === idB);

  compareGrid.innerHTML = `
    <div class="compare-label">Metric</div>
    <div class="compare-label compare-cell-title">${foodA ? foodA.name : '–'}</div>
    <div class="compare-label compare-cell-title">${foodB ? foodB.name : '–'}</div>

    <div>Match score</div>
    <div>${foodA ? foodA.finalScore : '–'}</div>
    <div>${foodB ? foodB.finalScore : '–'}</div>

    <div>Price level</div>
    <div><span class="compare-pill">${foodA ? prettyPrice(foodA.priceLevel) : '–'}</span></div>
    <div><span class="compare-pill">${foodB ? prettyPrice(foodB.priceLevel) : '–'}</span></div>

    <div>Protein</div>
    <div>${foodA ? prettyProtein(foodA.proteinLevel) : '–'}</div>
    <div>${foodB ? prettyProtein(foodB.proteinLevel) : '–'}</div>

    <div>Health focus</div>
    <div>${foodA ? prettyHealth(foodA.healthTags) : '–'}</div>
    <div>${foodB ? prettyHealth(foodB.healthTags) : '–'}</div>
  `;

  comparePanel.hidden = false;
}

// --- Toast helper ----------------------------------------

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// --- THEME TOGGLE ----------------------------------------

function applyStoredThemePreference() {
  const stored = localStorage.getItem('pn-theme');
  if (stored === 'dark') {
    document.body.classList.add('theme-dark');
  } else if (stored === 'light') {
    document.body.classList.remove('theme-dark');
  } else {
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('theme-dark');
    }
  }
  updateThemeToggleVisual();
}

function updateThemeToggleVisual() {
  if (!themeToggle) return;
  const iconEl = themeToggle.querySelector('.theme-toggle__icon');
  const labelEl = themeToggle.querySelector('.theme-toggle__label');
  const isDark = document.body.classList.contains('theme-dark');

  if (iconEl) iconEl.textContent = isDark ? '🌙' : '☀️';
  if (labelEl) labelEl.textContent = isDark ? 'Dark' : 'Light';
}

// --- Init theme & saved pets -----------------------------

applyStoredThemePreference();
renderSavedPets();

// Theme toggle
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    const isDark = document.body.classList.contains('theme-dark');
    localStorage.setItem('pn-theme', isDark ? 'dark' : 'light');
    updateThemeToggleVisual();
  });
}

// Clear weight error on input
if (weightInput) {
  weightInput.addEventListener('input', () => {
    if (weightError) weightError.hidden = true;
    weightInput.classList.remove('has-error');
  });
}

// --- Event listeners --------------------------------------

// Submit with fake "AI" loading state
petForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const profile = collectPetProfile();
  if (!validatePetProfile(profile)) return;

  // Loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    submitBtn.textContent = 'Analyzing...';
  }
  resultsSubtitle.textContent = 'Analyzing your pet’s profile and matching foods...';
  recommendationsList.innerHTML = '';
  renderSkeletonRecommendations();

  setTimeout(() => {
    currentPetProfile = profile;
    renderPetSummary(profile);
    savePetProfile(profile);

    const recs = getRecommendationsForPet(profile);
    currentRecommendations = recs;

    compareSelection = []; // reset compare when new profile
    renderComparePanel();

    const sorted = sortRecommendations([...recs]);
    renderRecommendations(sorted, profile);

    if (sorted.length > 0) {
      highlightSelectedCard(sorted[0].id);
      renderFoodDetails(sorted[0], profile);
    } else {
      detailsPlaceholder.hidden = false;
      detailsContent.hidden = true;
    }

    // reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.textContent = 'Get recommendations';
    }

    if (currentPetProfile) {
      const name = currentPetProfile.petName || (currentPetProfile.species === 'dog' ? 'your dog' : 'your cat');
      showToast(`Updated recommendations for ${name}.`);
    }
  }, 600);
});

// Delegate click for "View details" buttons and compare checkboxes
recommendationsList.addEventListener('click', function (e) {
  const btn = e.target.closest('.view-detail-btn');
  if (btn) {
    const id = btn.dataset.id;
    const food = currentRecommendations.find(f => f.id === id) ||
                 FOOD_DATABASE.find(f => f.id === id);
    if (food) {
      renderFoodDetails(food, currentPetProfile);
      highlightSelectedCard(id);
    }
    return;
  }

  const checkbox = e.target.closest('.compare-checkbox');
  if (checkbox) {
    const id = checkbox.dataset.id;
    updateCompareSelection(id, checkbox.checked);
  }
});

// Sort dropdown
if (sortBySelect) {
  sortBySelect.addEventListener('change', () => {
    if (!currentPetProfile || !currentRecommendations.length) return;
    const sorted = sortRecommendations([...currentRecommendations]);
    renderRecommendations(sorted, currentPetProfile);
    if (sorted.length) {
      highlightSelectedCard(sorted[0].id);
      renderFoodDetails(sorted[0], currentPetProfile);
    }
  });
}

// Saved pet chips click (load or delete)
savedPetsList.addEventListener('click', e => {
  // Delete clicked
  const deleteBtn = e.target.closest('.saved-pet-delete');
  if (deleteBtn) {
    const chip = deleteBtn.closest('.saved-pet-chip');
    if (!chip) return;
    const id = chip.dataset.id;
    deleteSavedPet(id);
    return;
  }

  // Load pet profile
  const chip = e.target.closest('.saved-pet-chip');
  if (!chip) return;
  const id = chip.dataset.id;
  const saved = getSavedPets();
  const pet = saved.find(p => p.id === id);
  if (!pet) return;

  document.getElementById('petName').value = pet.petName;
  document.getElementById('species').value = pet.species;
  document.getElementById('ageCategory').value = pet.ageCategory;
  document.getElementById('weight').value = pet.weight;
  document.getElementById('activity').value = pet.activity;
  document.getElementById('health').value = pet.health;
  document.getElementById('budget').value = pet.budget;

  currentPetProfile = pet;
  renderPetSummary(pet);

  const recs = getRecommendationsForPet(pet);
  currentRecommendations = recs;
  compareSelection = [];
  renderComparePanel();

  const sorted = sortRecommendations([...recs]);
  renderRecommendations(sorted, pet);
  if (sorted.length > 0) {
    highlightSelectedCard(sorted[0].id);
    renderFoodDetails(sorted[0], pet);
  } else {
    detailsPlaceholder.hidden = false;
    detailsContent.hidden = true;
  }
});

// Feeding calculator events
calculateBtn.addEventListener('click', updateFeedingAmount);
feedWeightInput.addEventListener('change', updateFeedingAmount);
feedActivitySelect.addEventListener('change', updateFeedingAmount);

// Clear compare button
clearCompareBtn.addEventListener('click', () => {
  compareSelection = [];
  renderComparePanel();
  // uncheck all checkboxes
  document.querySelectorAll('.compare-checkbox').forEach(cb => {
    cb.checked = false;
  });
});
