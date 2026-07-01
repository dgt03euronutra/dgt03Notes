import { describe, expect, it, beforeEach } from 'vitest';
import { initAgenda } from './agenda';

describe('agenda virtual', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('guarda y recupera el texto escrito para un día', () => {
    const container = document.getElementById('app') as HTMLElement;

    initAgenda(container, { year: 2024, month: 0, storage: window.localStorage });

    const dayButton = container.querySelector('[data-date="2024-01-15"]') as HTMLButtonElement;
    expect(dayButton).toBeTruthy();

    dayButton.click();

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Reunión con cliente';
    textarea.dispatchEvent(new Event('input'));

    const saveButton = container.querySelector('[data-action="save"]') as HTMLButtonElement;
    saveButton.click();

    expect(window.localStorage.getItem('agenda-entries')).toContain('2024-01-15');
    expect(window.localStorage.getItem('agenda-entries')).toContain('Reunión con cliente');
    expect(container.textContent).toContain('Reunión con cliente');
    expect(container.querySelector('.agenda__feedback--success')).toBeTruthy();
  });
});
