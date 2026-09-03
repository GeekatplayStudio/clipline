// src/store/config_store.ts
// Justification: Reactive state store for UI configuration, theme switching, and interactive overlay help.

import { AppConfig, ThemeMode, HelpDetailLevel } from '../types/config.js';

type ConfigListener = (config: AppConfig) => void;

const DEFAULT_CONFIG: AppConfig = {
  theme: 'system',
  overlayHelpEnabled: false,
  overlayDetailLevel: 'detailed',
  animationsEnabled: true,
};

class ConfigStore {
  private config: AppConfig = { ...DEFAULT_CONFIG };
  private listeners: Set<ConfigListener> = new Set();
  private readonly storageKey = 'upbound_ai_config_v1';
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    this.loadFromStorage();
    this.applyTheme(this.config.theme);
    this.setupSystemThemeListener();
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.config = { ...DEFAULT_CONFIG, ...parsed };
          return;
        } catch {
          // fallback
        }
      }
    }
    this.config = { ...DEFAULT_CONFIG };
  }

  private save(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((l) => l({ ...this.config }));
  }

  public subscribe(listener: ConfigListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.config });
    return () => this.listeners.delete(listener);
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public setTheme(theme: ThemeMode): void {
    this.config.theme = theme;
    this.applyTheme(theme);
    this.save();
  }

  public setOverlayHelp(enabled: boolean): void {
    this.config.overlayHelpEnabled = enabled;
    this.save();
  }

  public setOverlayDetailLevel(level: HelpDetailLevel): void {
    this.config.overlayDetailLevel = level;
    this.save();
  }

  public setAnimations(enabled: boolean): void {
    this.config.animationsEnabled = enabled;
    this.save();
  }

  public resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.applyTheme(this.config.theme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey);
    }
    this.save();
  }

  /**
   * Applies the 'dark' CSS class to <html> (document.documentElement)
   */
  public applyTheme(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    let isDark = false;

    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'light') {
      isDark = false;
    } else if (theme === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = () => {
        if (this.config.theme === 'system') {
          this.applyTheme('system');
        }
      };
      if (media.addEventListener) {
        media.addEventListener('change', this.mediaQueryListener);
      }
    } catch {
      // safe fallback
    }
  }
}

export const configStore = new ConfigStore();
