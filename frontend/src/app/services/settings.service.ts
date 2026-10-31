import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppSettings, ColumnSettings } from '../models/csv.model';

declare const Neutralino: {
  storage: {
    setData(key: string, data: string): Promise<void>;
    getData(key: string): Promise<string>;
  };
  filesystem: {
    writeFile(path: string, data: string): Promise<void>;
    getPathsObject(): Promise<{ downloads: string }>;
  };
  app: {
    exit(): Promise<void>;
  };
};

const STORAGE_KEY = 'fiskalpro_dph_settings';

const DEFAULT_SETTINGS: AppSettings = {
  profiles: {},
  lastUsedProfile: ''
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _settings = new BehaviorSubject<AppSettings>(DEFAULT_SETTINGS);
  readonly settings$ = this._settings.asObservable();

  get settings(): AppSettings {
    return this._settings.value;
  }

  async loadSettings(): Promise<void> {
    try {
      if (typeof Neutralino !== 'undefined') {
        const raw = await Neutralino.storage.getData(STORAGE_KEY);
        const parsed: AppSettings = JSON.parse(raw);
        this._settings.next(parsed);
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this._settings.next(JSON.parse(raw));
        }
      }
    } catch {
      this._settings.next({ ...DEFAULT_SETTINGS });
    }
  }

  async saveSettings(): Promise<void> {
    const json = JSON.stringify(this._settings.value);
    try {
      if (typeof Neutralino !== 'undefined') {
        await Neutralino.storage.setData(STORAGE_KEY, json);
      } else {
        localStorage.setItem(STORAGE_KEY, json);
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  async saveProfile(profile: ColumnSettings): Promise<void> {
    const current = { ...this._settings.value };
    current.profiles[profile.profileName] = {
      ...profile,
      lastModified: new Date().toISOString()
    };
    current.lastUsedProfile = profile.profileName;
    this._settings.next(current);
    await this.saveSettings();
  }

  async deleteProfile(profileName: string): Promise<void> {
    const current = { ...this._settings.value };
    delete current.profiles[profileName];
    if (current.lastUsedProfile === profileName) {
      const keys = Object.keys(current.profiles);
      current.lastUsedProfile = keys.length > 0 ? keys[0] : '';
    }
    this._settings.next(current);
    await this.saveSettings();
  }

  getProfile(name: string): ColumnSettings | null {
    return this._settings.value.profiles[name] ?? null;
  }

  getLastUsedProfile(): ColumnSettings | null {
    const lastName = this._settings.value.lastUsedProfile;
    if (!lastName) return null;
    return this._settings.value.profiles[lastName] ?? null;
  }

  getProfileNames(): string[] {
    return Object.keys(this._settings.value.profiles);
  }

  async saveExportedFile(content: string, suggestedName: string): Promise<boolean> {
    try {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Failed to save file', e);
      return false;
    }
  }
}
