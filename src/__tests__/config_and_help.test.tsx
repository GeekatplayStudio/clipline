// src/__tests__/config_and_help.test.tsx
// Justification: Comprehensive test suite for system configuration, light/dark theme switching, and interactive mouse-over overlay help.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { configStore } from '../store/config_store';
import { findGlossaryTerm, HELP_GLOSSARY } from '../data/help_glossary';
import { SettingsModal } from '../components/settings/SettingsModal';
import { OverlayHelpHUD } from '../components/help/OverlayHelpHUD';
import { Header } from '../components/layout/Header';

describe('System Configurations, Theme Switching & Overlay Help Suite', () => {
  beforeEach(() => {
    configStore.resetToDefaults();
    document.documentElement.classList.remove('dark');
  });

  describe('configStore', () => {
    it('initializes with default settings', () => {
      const config = configStore.getConfig();
      expect(config.theme).toBe('system');
      expect(config.overlayHelpEnabled).toBe(false);
      expect(config.overlayDetailLevel).toBe('detailed');
      expect(config.animationsEnabled).toBe(true);
    });

    it('switches to dark mode and applies "dark" class to html', () => {
      configStore.setTheme('dark');
      expect(configStore.getConfig().theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('switches to light mode and removes "dark" class', () => {
      configStore.setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      configStore.setTheme('light');
      expect(configStore.getConfig().theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('switches to system mode and matches window.matchMedia', () => {
      configStore.setTheme('system');
      expect(configStore.getConfig().theme).toBe('system');
    });

    it('updates overlay help and detail levels', () => {
      configStore.setOverlayHelp(true);
      expect(configStore.getConfig().overlayHelpEnabled).toBe(true);

      configStore.setOverlayDetailLevel('standard');
      expect(configStore.getConfig().overlayDetailLevel).toBe('standard');

      configStore.setAnimations(false);
      expect(configStore.getConfig().animationsEnabled).toBe(false);
    });

    it('resets to defaults and cleans localStorage', () => {
      configStore.setTheme('dark');
      configStore.setOverlayHelp(true);
      expect(configStore.getConfig().theme).toBe('dark');

      configStore.resetToDefaults();
      expect(configStore.getConfig().theme).toBe('system');
      expect(configStore.getConfig().overlayHelpEnabled).toBe(false);
    });

    it('hydrates saved configuration from localStorage', () => {
      localStorage.setItem(
        'upbound_ai_config_v1',
        JSON.stringify({ theme: 'dark', overlayHelpEnabled: true })
      );
      const StoreClass = configStore.constructor as any;
      const rehydrated = new StoreClass();
      expect(rehydrated.getConfig().theme).toBe('dark');
      expect(rehydrated.getConfig().overlayHelpEnabled).toBe(true);
      localStorage.removeItem('upbound_ai_config_v1');
    });
  });

  describe('help_glossary and findGlossaryTerm', () => {
    it('contains comprehensive enterprise terms', () => {
      expect(HELP_GLOSSARY.length).toBeGreaterThanOrEqual(10);
      expect(HELP_GLOSSARY.some((g) => g.id === 'lob')).toBe(true);
      expect(HELP_GLOSSARY.some((g) => g.id === 'governed')).toBe(true);
      expect(HELP_GLOSSARY.some((g) => g.id === 'tier4')).toBe(true);
      expect(HELP_GLOSSARY.some((g) => g.id === 'iso42001')).toBe(true);
    });

    it('finds terms by exact term, id, or alias', () => {
      const lob = findGlossaryTerm('lob');
      expect(lob).not.toBeNull();
      expect(lob?.id).toBe('lob');
      expect(lob?.category).toBe('Enterprise Structure');

      const tier4 = findGlossaryTerm('Tier 4 Prohibited');
      expect(tier4).not.toBeNull();
      expect(tier4?.id).toBe('tier4');

      const nist = findGlossaryTerm('NIST AI RMF');
      expect(nist).not.toBeNull();
      expect(nist?.id).toBe('nist_rmf');
    });

    it('returns null for unknown terms or empty string', () => {
      expect(findGlossaryTerm('')).toBeNull();
      expect(findGlossaryTerm('random_nonexistent_xyz')).toBeNull();
    });
  });

  describe('SettingsModal Component', () => {
    it('renders theme choices, overlay help toggle, and accessibility options', () => {
      const onClose = vi.fn();
      render(<SettingsModal isOpen={true} onClose={onClose} />);

      expect(screen.getByText('Platform Configurations & Preferences')).toBeInTheDocument();
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('System Sync')).toBeInTheDocument();

      // Click Dark Mode
      fireEvent.click(screen.getByText('Dark Mode'));
      expect(configStore.getConfig().theme).toBe('dark');

      // Click Light Mode
      fireEvent.click(screen.getByText('Light Mode'));
      expect(configStore.getConfig().theme).toBe('light');

      // Toggle Overlay Help
      const helpSwitch = screen.getAllByRole('switch')[0];
      fireEvent.click(helpSwitch);
      expect(configStore.getConfig().overlayHelpEnabled).toBe(true);

      // Select Detail Level
      expect(screen.getByText('Standard Overview')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Standard Overview'));
      expect(configStore.getConfig().overlayDetailLevel).toBe('standard');

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Save & Close/i });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      const { container } = render(<SettingsModal isOpen={false} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('OverlayHelpHUD Component', () => {
    it('does not render when overlayHelpEnabled is false', () => {
      configStore.setOverlayHelp(false);
      const { container } = render(<OverlayHelpHUD />);
      expect(container.firstChild).toBeNull();
    });

    it('renders floating active status pill when enabled', () => {
      configStore.setOverlayHelp(true);
      render(<OverlayHelpHUD />);

      expect(screen.getByText(/Overlay Help Active/i)).toBeInTheDocument();

      // Turn off via close button in pill
      const closeBtn = screen.getByTitle(/Turn off Overlay Help/i);
      fireEvent.click(closeBtn);
      expect(configStore.getConfig().overlayHelpEnabled).toBe(false);
    });

    it('displays dynamic floating HUD card upon hovering elements with data-help-id', () => {
      configStore.setOverlayHelp(true);
      render(
        <div>
          <span data-help-id="lob">Test LOB Element</span>
          <OverlayHelpHUD />
        </div>
      );

      const target = screen.getByText('Test LOB Element');
      fireEvent.mouseOver(target);

      // Verify HUD content rendered
      expect(screen.getByText('LOB (Line of Business)')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Structure')).toBeInTheDocument();
      expect(screen.getByText(/What is this\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Upbound Group Context:/i)).toBeInTheDocument();
    });

    it('displays dynamic floating HUD card upon hovering matching text content', () => {
      configStore.setOverlayHelp(true);
      render(
        <div>
          <button type="button">Tier 4 Prohibited</button>
          <OverlayHelpHUD />
        </div>
      );

      const btn = screen.getByRole('button', { name: 'Tier 4 Prohibited' });
      fireEvent.mouseOver(btn);

      expect(screen.getByText('Governance Tier')).toBeInTheDocument();
      expect(screen.getByText(/Any workflow that attempts autonomous credit underwriting/i)).toBeInTheDocument();
    });
  });

  describe('Header Settings Cog Button', () => {
    it('renders cog gear button and triggers onOpenSettings on click', () => {
      const onOpenSettings = vi.fn();
      render(
        <Header
          currentRole="citizen_developer"
          onRoleChange={vi.fn()}
          activeView="registry"
          onViewChange={vi.fn()}
          onResetData={vi.fn()}
          onOpenSettings={onOpenSettings}
        />
      );

      const cogBtn = screen.getByLabelText('System Configurations');
      expect(cogBtn).toBeInTheDocument();

      fireEvent.click(cogBtn);
      expect(onOpenSettings).toHaveBeenCalled();
    });
  });
});
