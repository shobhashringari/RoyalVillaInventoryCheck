const activitiesPerPage = 2;
const ratings = ['Good', 'So/So', 'Bad'];
let currentPage = 0;
let currentPageSize = 2;
let nextActivityId = 0;

function getActivitiesPerPage(cards = [...document.querySelectorAll('.item-card')]) {
  if (window.innerWidth > 600 || cards.length === 0) {
    return 2;
  }

  const originalVisibility = cards.map((card) => card.hidden);
  const addButton = document.getElementById('add-activity');
  const sendButton = document.getElementById('send-whatsapp');
  const originalAddVisibility = addButton.hidden;
  const originalSendVisibility = sendButton.hidden;
  const containerTop = document.getElementById('form-container').getBoundingClientRect().top;

  cards.forEach((card) => {
    card.hidden = true;
  });
  addButton.hidden = false;
  sendButton.hidden = false;

  const cardHeights = cards.map((card) => {
    card.hidden = false;
    const description = card.querySelector('.activity-desc');
    resizeDescription(description);
    const style = window.getComputedStyle(card);
    const height = card.getBoundingClientRect().height
      + Number.parseFloat(style.marginBottom);
    card.hidden = true;
    return height;
  });

  const controls = [
    document.querySelector('.pagination'),
    addButton,
    sendButton,
  ];
  const controlsHeight = controls.reduce((total, element) => {
    const style = window.getComputedStyle(element);
    return total + element.getBoundingClientRect().height
      + Number.parseFloat(style.marginTop)
      + Number.parseFloat(style.marginBottom);
  }, 0);
  const availableHeight = window.innerHeight - containerTop - controlsHeight - 12;

  cards.forEach((card, index) => {
    card.hidden = originalVisibility[index];
  });
  addButton.hidden = originalAddVisibility;
  sendButton.hidden = originalSendVisibility;

  for (let pageSize = 3; pageSize >= 2; pageSize -= 1) {
    const everyPageFits = cardHeights.every((_, start) => {
      if (start % pageSize !== 0) {
        return true;
      }
      const pageHeight = cardHeights
        .slice(start, start + pageSize)
        .reduce((total, height) => total + height, 0);
      return pageHeight <= availableHeight;
    });
    if (everyPageFits) {
      return pageSize;
    }
  }

  return 2;
}

function resizeDescription(textarea) {
  textarea.style.height = 'auto';
  const styles = window.getComputedStyle(textarea);
  const borders = Number.parseFloat(styles.borderTopWidth)
    + Number.parseFloat(styles.borderBottomWidth);
  textarea.style.height = `${textarea.scrollHeight + borders}px`;
}

function createActivityCard(description, editable = false) {
  const activityId = nextActivityId++;
  const card = document.createElement('div');
  card.className = 'item-card';

  const itemHeading = document.createElement('div');
  itemHeading.className = 'item-heading';

  const heading = document.createElement('label');
  const strong = document.createElement('strong');
  strong.textContent = 'Activity / Item Description:';
  heading.appendChild(strong);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'activity-delete';
  deleteButton.setAttribute(
    'aria-label',
    `Delete activity: ${description.trim() || 'untitled activity'}`,
  );
  deleteButton.title = 'Delete this activity';
  deleteButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" />
    </svg>
  `;
  deleteButton.addEventListener('click', () => {
    card.remove();
    showPage(currentPage);
  });
  itemHeading.append(heading, deleteButton);

  const descriptionInput = document.createElement('textarea');
  descriptionInput.rows = 2;
  descriptionInput.className = 'activity-desc';
  descriptionInput.value = description;
  descriptionInput.readOnly = !editable;
  descriptionInput.addEventListener('input', () => resizeDescription(descriptionInput));
  if (editable) {
    descriptionInput.placeholder = 'Enter activity or item description';
    descriptionInput.addEventListener('input', () => {
      deleteButton.setAttribute(
        'aria-label',
        `Delete activity: ${descriptionInput.value.trim() || 'untitled activity'}`,
      );
    });
  }

  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'rating-group';
  ratings.forEach((rating, ratingIndex) => {
    const ratingLabel = document.createElement('label');
    ratingLabel.className = 'rating-option';

    const ratingInput = document.createElement('input');
    ratingInput.type = 'checkbox';
    ratingInput.className = 'activity-rating';
    ratingInput.value = rating;
    ratingInput.id = `activity-${activityId}-rating-${ratingIndex}`;

    ratingLabel.htmlFor = ratingInput.id;
    ratingLabel.append(ratingInput, ` ${rating}`);
    ratingGroup.appendChild(ratingLabel);
  });

  const completedField = document.createElement('div');
  completedField.className = 'completed-field';
  const completeLabel = document.createElement('span');
  completeLabel.textContent = 'Complete';
  completedField.appendChild(completeLabel);

  const completedSelect = document.createElement('select');
  completedSelect.className = 'activity-complete';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '';
  placeholder.selected = true;
  placeholder.disabled = true;
  completedSelect.appendChild(placeholder);

  ['Yes', 'No'].forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    completedSelect.appendChild(option);
  });

  const completeControl = document.createElement('span');
  completeControl.className = 'complete-control';

  const completeTrigger = document.createElement('button');
  completeTrigger.type = 'button';
  completeTrigger.className = 'complete-trigger';
  completeTrigger.setAttribute('aria-label', 'Complete');
  completeTrigger.setAttribute('aria-haspopup', 'listbox');
  completeTrigger.setAttribute('aria-expanded', 'false');

  const completeMenu = document.createElement('div');
  completeMenu.className = 'complete-menu';
  completeMenu.setAttribute('role', 'listbox');
  completeMenu.setAttribute('aria-label', 'Complete');
  completeMenu.hidden = true;

  const closeCompleteMenu = () => {
    completeMenu.hidden = true;
    completeTrigger.setAttribute('aria-expanded', 'false');
  };

  ['Yes', 'No'].forEach((value) => {
    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'complete-option';
    optionButton.setAttribute('role', 'option');
    optionButton.setAttribute('aria-selected', 'false');
    optionButton.textContent = value;
    optionButton.addEventListener('click', (event) => {
      event.stopPropagation();
      completedSelect.value = value;
      completeTrigger.textContent = value;
      completeTrigger.setAttribute('aria-label', `Complete: ${value}`);
      completeMenu.querySelectorAll('.complete-option').forEach((option) => {
        option.setAttribute('aria-selected', String(option === optionButton));
      });
      closeCompleteMenu();
      completeTrigger.focus();
    });
    completeMenu.appendChild(optionButton);
  });

  completeTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const shouldOpen = completeMenu.hidden;
    document.querySelectorAll('.complete-menu:not([hidden])').forEach((menu) => {
      menu.hidden = true;
      menu.previousElementSibling.setAttribute('aria-expanded', 'false');
    });
    if (!shouldOpen) return;

    const triggerRect = completeTrigger.getBoundingClientRect();
    const menuHeight = completeMenu.querySelectorAll('.complete-option').length * 40 + 2;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const top = spaceBelow >= menuHeight || triggerRect.top < menuHeight
      ? triggerRect.bottom + 4
      : triggerRect.top - menuHeight - 4;
    const left = Math.min(
      triggerRect.left,
      window.innerWidth - Math.max(triggerRect.width, 80) - 8,
    );
    completeMenu.style.top = `${Math.max(8, top)}px`;
    completeMenu.style.left = `${Math.max(8, left)}px`;
    completeMenu.style.minWidth = `${Math.max(triggerRect.width, 80)}px`;
    completeMenu.hidden = false;
    completeTrigger.setAttribute('aria-expanded', 'true');
  });

  completeMenu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCompleteMenu();
      completeTrigger.focus();
    }
  });

  completeControl.append(completeTrigger, completeMenu, completedSelect);
  completedField.appendChild(completeControl);

  const assessmentRow = document.createElement('div');
  assessmentRow.className = 'assessment-row';
  assessmentRow.append(ratingGroup, completedField);

  const mediaLabel = document.createElement('label');
  mediaLabel.textContent = 'Proof:';

  const mediaInput = document.createElement('input');
  mediaInput.type = 'file';
  mediaInput.className = 'activity-media';
  mediaInput.accept = 'image/*,video/*';
  mediaInput.setAttribute('capture', 'environment');
  mediaInput.id = `activity-media-${activityId}`;
  mediaInput.hidden = true;

  const mediaButton = document.createElement('button');
  mediaButton.type = 'button';
  mediaButton.className = 'media-trigger';
  mediaButton.textContent = 'Take Picture/Video';
  mediaButton.addEventListener('click', () => mediaInput.click());

  const mediaField = document.createElement('div');
  mediaField.className = 'media-field';
  mediaField.append(mediaLabel, mediaButton, mediaInput);

  card.append(itemHeading, descriptionInput, assessmentRow, mediaField);
  return card;
}

function showPage(page, pageSize) {
  const cards = [...document.querySelectorAll('.item-card')];
  const activitiesPerPage = pageSize || getActivitiesPerPage(cards);
  currentPageSize = activitiesPerPage;
  const pageCount = Math.max(1, Math.ceil(cards.length / activitiesPerPage));
  currentPage = Math.min(Math.max(page, 0), pageCount - 1);

  cards.forEach((card, index) => {
    card.hidden = Math.floor(index / activitiesPerPage) !== currentPage;
  });
  resizeVisibleDescriptions(cards);

  document.getElementById('page-indicator').textContent =
    `Page ${currentPage + 1} of ${pageCount}`;
  document.getElementById('previous-page').disabled = currentPage === 0;
  document.getElementById('next-page').disabled = currentPage === pageCount - 1;
  document.getElementById('add-activity').hidden = currentPage !== pageCount - 1;
  document.getElementById('send-whatsapp').hidden = currentPage !== pageCount - 1;
}

function resizeVisibleDescriptions(cards = [...document.querySelectorAll('.item-card')]) {
  requestAnimationFrame(() => {
    cards
      .filter((card) => !card.hidden)
      .forEach((card) => resizeDescription(card.querySelector('.activity-desc')));
  });
}

function sendToWhatsApp() {
  const rows = [...document.querySelectorAll('.item-card')];
  const lines = rows.map((row, index) => {
    const description = row.querySelector('.activity-desc').value;
    const selectedRatings = [...row.querySelectorAll('.activity-rating:checked')]
      .map((input) => input.value);
    const ratingSummary = selectedRatings.length
      ? selectedRatings.join(', ')
      : 'No rating selected';
    const completed = row.querySelector('.activity-complete').value || 'Not selected';
    const media = row.querySelector('.activity-media').files.length ? 'Media attached' : 'No media';
    return `${index + 1}. ${description} (${ratingSummary}; Complete: ${completed}, ${media})`;
  });

  window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
}

document.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('resize', () => {
    const firstVisibleActivity = currentPage * currentPageSize;
    const newPageSize = getActivitiesPerPage();
    showPage(Math.floor(firstVisibleActivity / newPageSize), newPageSize);
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.complete-menu:not([hidden])').forEach((menu) => {
      menu.hidden = true;
      menu.previousElementSibling.setAttribute('aria-expanded', 'false');
    });
  });

  const timestampElement = document.getElementById('form-timestamp');
  const timestamp = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  timestampElement.textContent = `As on ${timestamp}`;

  const container = document.getElementById('form-container');
  try {
    const response = await fetch('./activities.json');
    if (!response.ok) {
      throw new Error(`Could not load activities.json (HTTP ${response.status})`);
    }

    const activities = await response.json();
    if (!Array.isArray(activities) || activities.some(
      (activity) => typeof activity !== 'string' || !activity.trim(),
    )) {
      throw new Error('activities.json must contain an array of non-empty description strings.');
    }

    activities.forEach((activity) => {
      container.appendChild(createActivityCard(activity.trim()));
    });
    container.querySelectorAll('.activity-desc').forEach(resizeDescription);

    document.getElementById('add-activity').addEventListener('click', () => {
      const cards = [...container.querySelectorAll('.item-card')];
      const newCard = createActivityCard('', true);
      container.appendChild(newCard);
      showPage(Math.ceil((cards.length + 1) / activitiesPerPage) - 1);
      newCard.querySelector('.activity-desc').focus();
    });

    document.getElementById('previous-page').addEventListener('click', () => {
      showPage(currentPage - 1);
    });
    document.getElementById('next-page').addEventListener('click', () => {
      showPage(currentPage + 1);
    });

    showPage(0);
  } catch (error) {
    const errorMessage = document.getElementById('load-error');
    errorMessage.textContent =
      `Unable to load the activity list. ${error.message} Run this page from a local web server.`;
    errorMessage.hidden = false;
  }
});
