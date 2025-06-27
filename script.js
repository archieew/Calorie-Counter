const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const saveButton = document.getElementById('save');
const output = document.getElementById('output');
const summaryContent = document.getElementById('summary-content');
const statsGrid = document.getElementById('stats-grid');
const progressFill = document.getElementById('progress-fill');

let isError = false;
let entryCounter = 0;

const STORAGE_KEYS = {
  BUDGET: 'calorieCounter_budget',
  ENTRIES: 'calorieCounter_entries',
  LAST_SAVE: 'calorieCounter_lastSave'
};

document.addEventListener('DOMContentLoaded', () => {
  loadSavedData();
  updateLastSaveDisplay();
});

function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, '');
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? 'var(--warning-gradient)' : 'var(--success-gradient)'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: var(--shadow);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function addEntry() {
  const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
  const entryNumber = ++entryCounter;
  const entryId = `${entryDropdown.value}-${entryNumber}`;
  
  const HTMLString = `
    <div class="entry-item" data-entry-id="${entryId}">
      <button type="button" class="delete-btn" onclick="deleteEntry('${entryId}')" title="Delete entry">×</button>
      <label for="${entryId}-name">Food/Exercise Name</label>
      <input type="text" id="${entryId}-name" placeholder="e.g., Grilled Chicken Breast" />
      <label for="${entryId}-calories">Calories</label>
      <input type="number" min="0" id="${entryId}-calories" placeholder="250" />
      ${entryDropdown.value !== 'exercise' ? `
        <div class="macro-inputs">
          <div>
            <label for="${entryId}-protein">Protein (g)</label>
            <input type="number" min="0" step="0.1" id="${entryId}-protein" placeholder="25" />
          </div>
          <div>
            <label for="${entryId}-carbs">Carbs (g)</label>
            <input type="number" min="0" step="0.1" id="${entryId}-carbs" placeholder="30" />
          </div>
          <div>
            <label for="${entryId}-fat">Fat (g)</label>
            <input type="number" min="0" step="0.1" id="${entryId}-fat" placeholder="10" />
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);
  showNotification('Entry added successfully!');
}

function deleteEntry(entryId) {
  const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
  if (entryElement) {
    entryElement.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      entryElement.remove();
      showNotification('Entry deleted');
    }, 300);
  }
}

function saveData() {
  try {
    const budget = budgetNumberInput.value;
    const entries = getAllEntries();
    
    localStorage.setItem(STORAGE_KEYS.BUDGET, budget);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVE, new Date().toISOString());
    
    showNotification('Data saved successfully!', 'success');
    updateLastSaveDisplay();
  } catch (error) {
    showNotification('Failed to save data', 'error');
    console.error('Save error:', error);
  }
}

function loadSavedData() {
  try {
    const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
    const savedEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    
    if (savedBudget) {
      budgetNumberInput.value = savedBudget;
    }
    
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      restoreEntries(entries);
    }
  } catch (error) {
    showNotification('Failed to load saved data', 'error');
    console.error('Load error:', error);
  }
}

function getAllEntries() {
  const entries = [];
  const entryElements = document.querySelectorAll('.entry-item');
  
  entryElements.forEach(element => {
    const entryId = element.dataset.entryId;
    const [category, number] = entryId.split('-');
    
    const entry = {
      id: entryId,
      category: category,
      name: document.getElementById(`${entryId}-name`)?.value || '',
      calories: document.getElementById(`${entryId}-calories`)?.value || '0',
      protein: document.getElementById(`${entryId}-protein`)?.value || '0',
      carbs: document.getElementById(`${entryId}-carbs`)?.value || '0',
      fat: document.getElementById(`${entryId}-fat`)?.value || '0'
    };
    
    entries.push(entry);
  });
  
  return entries;
}

function restoreEntries(entries) {
  entries.forEach(entry => {
    entryDropdown.value = entry.category;
    
    const targetInputContainer = document.querySelector(`#${entry.category} .input-container`);
    const entryId = entry.id;
    
    const HTMLString = `
      <div class="entry-item" data-entry-id="${entryId}">
        <button type="button" class="delete-btn" onclick="deleteEntry('${entryId}')" title="Delete entry">×</button>
        <label for="${entryId}-name">Food/Exercise Name</label>
        <input type="text" id="${entryId}-name" placeholder="e.g., Grilled Chicken Breast" value="${entry.name}" />
        <label for="${entryId}-calories">Calories</label>
        <input type="number" min="0" id="${entryId}-calories" placeholder="250" value="${entry.calories}" />
        ${entry.category !== 'exercise' ? `
          <div class="macro-inputs">
            <div>
              <label for="${entryId}-protein">Protein (g)</label>
              <input type="number" min="0" step="0.1" id="${entryId}-protein" placeholder="25" value="${entry.protein}" />
            </div>
            <div>
              <label for="${entryId}-carbs">Carbs (g)</label>
              <input type="number" min="0" step="0.1" id="${entryId}-carbs" placeholder="30" value="${entry.carbs}" />
            </div>
            <div>
              <label for="${entryId}-fat">Fat (g)</label>
              <input type="number" min="0" step="0.1" id="${entryId}-fat" placeholder="10" value="${entry.fat}" />
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);
  });
  
  entryCounter = entries.length;
}

function updateLastSaveDisplay() {
  const lastSave = localStorage.getItem(STORAGE_KEYS.LAST_SAVE);
  if (lastSave) {
    const date = new Date(lastSave);
    const timeAgo = getTimeAgo(date);
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function calculateCalories(e) {
  e.preventDefault();
  isError = false;

  const breakfastNumberInputs = document.querySelectorAll("#breakfast input[type='number']");
  const lunchNumberInputs = document.querySelectorAll("#lunch input[type='number']");
  const dinnerNumberInputs = document.querySelectorAll("#dinner input[type='number']");
  const snacksNumberInputs = document.querySelectorAll("#snacks input[type='number']");
  const exerciseNumberInputs = document.querySelectorAll("#exercise input[type='number']");

  const breakfastCalories = getCaloriesFromInputs(breakfastNumberInputs);
  const lunchCalories = getCaloriesFromInputs(lunchNumberInputs);
  const dinnerCalories = getCaloriesFromInputs(dinnerNumberInputs);
  const snacksCalories = getCaloriesFromInputs(snacksNumberInputs);
  const exerciseCalories = getCaloriesFromInputs(exerciseNumberInputs);
  const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

  if (isError) {
    return;
  }

  const consumedCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
  const remainingCalories = budgetCalories - consumedCalories + exerciseCalories;
  const surplusOrDeficit = remainingCalories < 0 ? 'Surplus' : 'Deficit';
  
  const macros = calculateMacros();
  
  const progressPercentage = Math.min((consumedCalories / budgetCalories) * 100, 100);
  progressFill.style.width = `${progressPercentage}%`;
  progressFill.className = `progress-fill ${remainingCalories < 0 ? 'surplus' : ''}`;
  
  summaryContent.innerHTML = `
    <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(remainingCalories)} Calorie ${surplusOrDeficit}</span>
  `;
  
  statsGrid.innerHTML = `
    <div class="stat-card">
      <h3>Budget</h3>
      <div class="value">${budgetCalories}</div>
    </div>
    <div class="stat-card">
      <h3>Consumed</h3>
      <div class="value">${consumedCalories}</div>
    </div>
    <div class="stat-card">
      <h3>Burned</h3>
      <div class="value">${exerciseCalories}</div>
    </div>
    <div class="stat-card">
      <h3>Protein</h3>
      <div class="value">${macros.protein}g</div>
    </div>
    <div class="stat-card">
      <h3>Carbs</h3>
      <div class="value">${macros.carbs}g</div>
    </div>
    <div class="stat-card">
      <h3>Fat</h3>
      <div class="value">${macros.fat}g</div>
    </div>
  `;

  output.classList.remove('hide');
  output.classList.add('show');
  
  saveData();
}

function calculateMacros() {
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  const foodEntries = document.querySelectorAll('.entry-item:not([data-entry-id*="exercise"])');
  
  foodEntries.forEach(entry => {
    const entryId = entry.dataset.entryId;
    totalProtein += Number(document.getElementById(`${entryId}-protein`)?.value || 0);
    totalCarbs += Number(document.getElementById(`${entryId}-carbs`)?.value || 0);
    totalFat += Number(document.getElementById(`${entryId}-fat`)?.value || 0);
  });
  
  return {
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
}

function getCaloriesFromInputs(list) {
  let calories = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      showNotification(`Invalid Input: ${invalidInputMatch[0]}`, 'error');
      isError = true;
      return null;
    }
    
    const numVal = Number(currVal);
    if (isNaN(numVal)) {
      showNotification('Please enter valid numbers only', 'error');
      isError = true;
      return null;
    }
    
    calories += numVal;
  }
  return calories;
}

function clearForm() {
  const inputContainers = Array.from(document.querySelectorAll('.input-container'));

  for (const container of inputContainers) {
    container.innerHTML = '';
  }

  budgetNumberInput.value = '';
  output.classList.remove('show');
  output.classList.add('hide');
  entryCounter = 0;
  
  showNotification('Form cleared');
}

addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener("click", clearForm);
saveButton.addEventListener("click", saveData);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case 's':
        e.preventDefault();
        saveData();
        break;
      case 'Enter':
        if (e.target.tagName === 'INPUT') {
          e.preventDefault();
          addEntry();
        }
        break;
    }
  }
});

const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);
