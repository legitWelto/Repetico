import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderSections } from '../src/js/ui/sections.js';

// Mock engine.js
vi.mock('../src/js/audio/engine.js', () => ({
  seek: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('sections.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="section-area">
        <div id="sections-container"></div>
      </div>
    `;
  });

  it('renders "No sections defined" when list is empty', () => {
    renderSections([], 'sections-container', vi.fn());
    const container = document.getElementById('sections-container');
    expect(container.innerHTML).toContain('No sections defined');
  });

  it('renders section buttons correctly', () => {
    const sections = [
      { name: 'Intro', start: 0 },
      { name: 'Verse', start: 30 }
    ];
    const onClick = vi.fn();
    renderSections(sections, 'sections-container', onClick);

    const container = document.getElementById('sections-container');
    expect(container.children).toHaveLength(2);
    expect(container.children[0].textContent).toContain('Intro');
    expect(container.children[1].textContent).toContain('Verse');
  });

  it('calls onClick when a section is clicked', () => {
    const sections = [
      { name: 'Intro', start: 0 }
    ];
    const onClick = vi.fn();
    renderSections(sections, 'sections-container', onClick);

    const btn = document.querySelector('.sec-btn');
    btn.click();

    expect(onClick).toHaveBeenCalledWith(sections[0]);
    expect(btn.classList.contains('active')).toBe(true);
  });
});
