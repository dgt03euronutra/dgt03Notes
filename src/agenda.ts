const STORAGE_KEY = 'agenda-entries';

interface AgendaEntry{
  text: string;
  color: string;
}
type AgendaEntries = Record<string, AgendaEntry>;

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

interface AgendaState {
  year: number;
  month: number;
  selectedDate: string | null;
  draft: string;
  entries: AgendaEntries;
  storage: Storage;
  feedback: FeedbackState;
  selectedColor: string;
}

interface AgendaOptions {
  year?: number;
  month?: number;
  storage?: Storage;
}

const NOTE_COLORS = {
  AZUL: '#3056d3', NARANJA: '#ea580c', VERDE: '#16a34a', NEGRO: '#111827', ROJO: '#ff0000'
} as const;

function createDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readEntries(storage: Storage): AgendaEntries {
  const raw = storage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    const migrated: AgendaEntries = {};
    for (const [date, value] of Object.entries(parsed)){
      if(typeof value == 'string'){
        migrated[date] = {text: value, color: '#3056d3'};
      } else if(value && typeof value == 'object' && 'text' in value){
        migrated[date] = value as AgendaEntry;}
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
}

function writeEntries(entries: AgendaEntries, storage: Storage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('es-ES', {
    month: 'long',
  });
}

function formatDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTodayLabel(): string {
  const today = new Date();
  const formatted = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}

function buildCalendarGrid(year: number, month: number): Array<Array<number | null>> {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = (firstDay.getDay() + 6) % 7;
  const cells: Array<Array<number | null>> = [];
  const totalCells = 42;
  const values: Array<number | null> = [];

  for (let index = 0; index < startingDay; index += 1) {
    values.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    values.push(day);
  }

  while (values.length < totalCells) {
    values.push(null);
  }

  for (let row = 0; row < totalCells / 7; row += 1) {
    cells.push(values.slice(row * 7, row * 7 + 7));
  }

  return cells;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function initAgenda(container: HTMLElement, options?: AgendaOptions): void {
  const storage = options?.storage ?? window.localStorage;
  const initialDate = new Date();
  const initialYear = options?.year ?? initialDate.getFullYear();
  const initialMonth = options?.month ?? initialDate.getMonth();

  const state: AgendaState = {
    year: initialYear,
    month: initialMonth,
    selectedDate: null,
    draft: '',
    entries: readEntries(storage),
    storage,
    feedback: null,
    selectedColor: '#3056d3'
  };

  let feedbackTimeout: number | null = null;

  const render = (): void => {
    const grid = buildCalendarGrid(state.year, state.month);
    const monthLabel = formatMonthLabel(state.year, state.month);
    const title = `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}`;
    const monthName = title.toUpperCase();

    container.innerHTML = `
      <section class="agenda">
        <header class="agenda__header">
          <div class="agenda__nav">
            <div class="agenda__nav-group">
              <button type="button" data-action="prev-month" class="agenda__nav-btn">←</button>
              <h1 class="agenda__nav-title">${title}</h1>
              <button type="button" data-action="next-month" class="agenda__nav-btn">→</button>
            </div>
            <button type="button" data-action="today" class="agenda__nav-today">Hoy: ${formatTodayLabel()}</button>
            <div class="agenda__nav-group">
              <button type="button" data-action="prev-year" class="agenda__nav-btn">←</button>
              <h1 class="agenda__nav-title">${state.year}</h1>
              <button type="button" data-action="next-year" class="agenda__nav-btn">→</button>
            </div>
          </div>
        </header>

        <div class="agenda__body">
          <div class="agenda__calendar-panel">
            <div class="agenda__grid" role="grid">
              ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => `<div class="agenda__weekday">${day}</div>`).join('')}
              ${grid
                .flat()
                .map((day) => {
                  if (day === null) {
                    return '<div class="agenda__cell agenda__cell--empty"></div>';
                  }

                  const dateKey = createDateKey(new Date(state.year, state.month, day));
                  const todayKey = createDateKey(new Date());
                  const isToday = dateKey === todayKey;
                  const isSelected = state.selectedDate === dateKey;
                  const note = state.entries[dateKey];
                  const hasNote = note?.text?.trim();
                  const classes = ['agenda__cell', 'agenda__day'];

                  if (isSelected) {classes.push('agenda__day--selected');}
                  if (isToday) {classes.push('agenda__day--today')};

                  return `
                    <button type="button" class="${classes.join(' ')}" data-date="${dateKey}">
                      <span class="agenda__day-number">${day}</span>
                      ${hasNote ? `<span class="agenda__note-indicator" style="background:${note.color}"></span>` : ''}
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>

          <section class="agenda__editor-panel"> ${state.selectedDate ? `
              <div class="agenda_editor-header">
                <h2>${formatDayLabel(state.selectedDate)}</h2>
                <div class="agenda-color-selector">
                  ${Object.entries(NOTE_COLORS).map(
                    ([name, value]) => `
                      <button type="button" class="agenda-color-option ${state.selectedColor === value ? 'agenda-color-option--selected' : ''}"
                        data-color="${value}" title="${name}" style="background:${value}"></button>`
                ).join('')}
                </div>
              </div>
              <textarea data-editor="true" rows="8">${escapeHtml(state.draft)}</textarea>
              <div class="agenda__actions">
                <button
                  type="button"
                  class="agenda__save-button${state.feedback?.type ? ` agenda__save-button--${state.feedback.type}` : ''}"
                  data-action="save"
                >
                  ${state.feedback?.type === 'success' ? 'Guardado' : state.feedback?.type === 'error' ? 'Reintentar' : 'Guardar'}
                </button>
              </div>
              ${state.feedback ? `<p class="agenda__feedback agenda__feedback--${state.feedback.type}">${state.feedback.message}</p>` : ''}
              <p class="agenda__hint">Se guarda solo en el almacenamiento local de este navegador.</p>
            ` : '<p class="agenda__hint">Selecciona un día para añadir o editar una nota.</p>'}
          </section>
        </div>
      </section>
    `;
  };

  container.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const actionButton = target.closest<HTMLButtonElement>('[data-action]');
    const colorButton = target.closest<HTMLButtonElement>('[data-color]');

    if (actionButton) {
      const action = actionButton.dataset.action;

      if (action === 'prev-month') {
        state.month -= 1;
        if (state.month < 0) {
          state.month = 11;
          state.year -= 1;
        }
        state.selectedDate = null;
        state.draft = '';
        state.feedback = null;
        render();
        return;
      }

      if (action === 'next-month') {
        state.month += 1;
        if (state.month > 11) {
          state.month = 0;
          state.year += 1;
        }
        state.selectedDate = null;
        state.draft = '';
        state.feedback = null;
        render();
        return;
      }

      if (action === 'prev-year') {
        state.year -= 1;
        state.selectedDate = null;
        state.draft = '';
        state.feedback = null;
        render();
        return;
      }

      if (action === 'next-year') {
        state.year += 1;
        state.selectedDate = null;
        state.draft = '';
        state.feedback = null;
        render();
        return;
      }

      if (action === 'today') {
        const today = new Date();
        state.year = today.getFullYear();
        state.month = today.getMonth();
        state.selectedDate = createDateKey(today);
        const entry = state.entries[state.selectedDate];
        state.draft = entry?.text ?? '';
        state.selectedColor = entry?.color ?? '#3056d3';
        state.feedback = null;
        render();
        return;
      }

      if (action === 'save') {
        if (!state.selectedDate) {
          state.feedback = { type: 'error', message: 'Selecciona un día antes de guardar.' };
          render();
          return;
        }

        try {
          const nextEntries = { ...state.entries};
          if(state.draft.trim()){
            nextEntries[state.selectedDate] = {text: state.draft, color: state.selectedColor};
          } else {delete nextEntries[state.selectedDate];}
          writeEntries(nextEntries, state.storage);
          state.entries = nextEntries;
          state.feedback = { type: 'success', message: 'Nota guardada correctamente.' };
          if(feedbackTimeout){clearTimeout(feedbackTimeout);}
          feedbackTimeout = window.setTimeout(() => {
            state.feedback = null;
            render();
          }, 3000);
        } catch {
          state.feedback = { type: 'error', message: 'No se pudo guardar la nota.' };
        }

        render();
        return;
      }
    }

    if(colorButton){
      state.selectedColor = colorButton.dataset.color ?? '#3056d3';
      render();
      return;
    }

    const dayButton = target.closest<HTMLButtonElement>('[data-date]');
    if (dayButton) {
      state.selectedDate = dayButton.dataset.date ?? null;
      if(state.selectedDate && state.entries[state.selectedDate]){
        state.draft = state.entries[state.selectedDate].text;
        state.selectedColor = state.entries[state.selectedDate].color;
      } else {
        state.draft = '';
        state.selectedColor = '#3056d3';
      }
      state.feedback = null;
      render();
    }
  });

  container.addEventListener(
    'input',
    (event) => {
      const target = event.target as HTMLTextAreaElement;
      if(target instanceof HTMLInputElement && target.dataset.colorSelector === 'true'){
        state.selectedColor = target.value;
        return;
      }
      if (target instanceof HTMLTextAreaElement && target.dataset.editor === 'true') {
        state.draft = target.value;
        if (state.feedback?.type) {
          state.feedback = null;
        }
      }
    },
    true,
  );

  render();
}
