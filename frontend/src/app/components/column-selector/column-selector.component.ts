import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';

import { SettingsService } from '../../services/settings.service';
import { ColumnSettings } from '../../models/csv.model';

@Component({
  selector: 'app-column-selector',
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DialogModule,
    SelectButtonModule,
    BadgeModule,
    TooltipModule,
    SelectModule,
    DividerModule
  ],
  templateUrl: './column-selector.component.html',
  styleUrl: './column-selector.component.scss'
})
export class ColumnSelectorComponent implements OnInit {
  @Input() headers: string[] = [];
  @Input() selectedColumns: string[] = [];
  @Output() columnsChanged = new EventEmitter<string[]>();
  @Output() profileSaved = new EventEmitter<string>();

  private settingsService = inject(SettingsService);

  localSelected: string[] = [];
  showSaveDialog = false;
  showLoadDialog = false;
  newProfileName = '';
  profileNames: string[] = [];
  selectedProfileToLoad = '';

  ngOnInit(): void {
    this.localSelected = [...this.selectedColumns];
    this.profileNames = this.settingsService.getProfileNames();
  }

  toggleAll(): void {
    if (this.localSelected.length === this.headers.length) {
      this.localSelected = [];
    } else {
      this.localSelected = [...this.headers];
    }
    this.columnsChanged.emit(this.localSelected);
  }

  onColumnToggle(column: string): void {
    const idx = this.localSelected.indexOf(column);
    if (idx >= 0) {
      this.localSelected = this.localSelected.filter(c => c !== column);
    } else {
      this.localSelected = [...this.localSelected, column];
    }
    this.columnsChanged.emit(this.localSelected);
  }

  isSelected(column: string): boolean {
    return this.localSelected.includes(column);
  }

  get allSelected(): boolean {
    return this.localSelected.length === this.headers.length;
  }

  get noneSelected(): boolean {
    return this.localSelected.length === 0;
  }

  openSaveDialog(): void {
    this.newProfileName = '';
    this.showSaveDialog = true;
  }

  confirmSave(): void {
    if (!this.newProfileName.trim()) return;
    this.profileSaved.emit(this.newProfileName.trim());
    this.profileNames = this.settingsService.getProfileNames();
    this.showSaveDialog = false;
  }

  openLoadDialog(): void {
    this.profileNames = this.settingsService.getProfileNames();
    this.selectedProfileToLoad = '';
    this.showLoadDialog = true;
  }

  confirmLoad(): void {
    if (!this.selectedProfileToLoad) return;
    const profile = this.settingsService.getProfile(this.selectedProfileToLoad);
    if (profile) {
      const validCols = profile.selectedColumns.filter(c => this.headers.includes(c));
      this.localSelected = validCols;
      this.columnsChanged.emit(this.localSelected);
    }
    this.showLoadDialog = false;
  }

  async deleteProfile(name: string): Promise<void> {
    await this.settingsService.deleteProfile(name);
    this.profileNames = this.settingsService.getProfileNames();
    if (this.selectedProfileToLoad === name) {
      this.selectedProfileToLoad = '';
    }
  }

  getProfileInfo(name: string): ColumnSettings | null {
    return this.settingsService.getProfile(name);
  }
}
