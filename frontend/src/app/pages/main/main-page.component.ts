import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

import { CsvLoaderComponent } from '../../components/csv-loader/csv-loader.component';
import { PreviewTableComponent } from '../../components/preview-table/preview-table.component';

import { CsvService } from '../../services/csv.service';
import { SettingsService } from '../../services/settings.service';
import { CsvData } from '../../models/csv.model';

@Component({
  selector: 'app-main-page',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    DatePickerModule,
    CsvLoaderComponent,
    PreviewTableComponent
  ],
  providers: [MessageService],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
  private csvService = inject(CsvService);
  private settingsService = inject(SettingsService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  csvData: CsvData | null = null;
  selectedColumns: string[] = [];
  selectedRowIndices: Set<number> = new Set();
  filterDate: Date | null = null;

  async ngOnInit(): Promise<void> {
    await this.settingsService.loadSettings();
  }

  onFileLoaded(data: CsvData): void {
    this.csvData = data;
    this.filterDate = null;
    const lastProfile = this.settingsService.getLastUsedProfile();
    if (lastProfile) {
      const validColumns = lastProfile.selectedColumns.filter(c =>
        data.headers.includes(c)
      );
      this.selectedColumns = validColumns.length > 0 ? validColumns : [...data.headers];
    } else {
      this.selectedColumns = [...data.headers];
    }
    this.selectedRowIndices = new Set(data.rows.map((_, i) => i));
  }

  onSelectedColumnsChange(columns: string[]): void {
    this.selectedColumns = columns;
  }

  onSelectedRowsChange(indices: Set<number>): void {
    this.selectedRowIndices = indices;
  }

  onFilterDateChange(date: Date | null): void {
    this.filterDate = date;
    if (!this.csvData) return;

    if (!date) {
      this.selectedRowIndices = new Set(this.csvData.rows.map((_, i) => i));
      return;
    }

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateCol = this.csvData.headers[0];

    const newIndices = new Set<number>();
    this.csvData.rows.forEach((row, i) => {
      const parsed = this.parseRowDate(row[dateCol]);
      if (parsed !== null && parsed >= dateOnly) {
        newIndices.add(i);
      }
    });
    this.selectedRowIndices = newIndices;
  }

  private parseRowDate(raw: string): Date | null {
    if (!raw) return null;
    const match = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (!match) return null;
    const [, d, m, y] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  get selectedRowCount(): number {
    return this.selectedRowIndices.size;
  }

  async exportCsv(): Promise<void> {
    if (!this.csvData || this.selectedColumns.length === 0) return;

    await this.settingsService.saveProfile({
      profileName: '_auto',
      selectedColumns: this.selectedColumns,
      delimiter: ',',
      encoding: 'UTF-8',
      lastModified: new Date().toISOString()
    });

    const content = this.csvService.exportToCsv(
      this.csvData,
      this.selectedColumns,
      this.selectedRowIndices
    );
    const suggestedName = this.csvData.fileName.replace('.csv', '_export.csv');
    const saved = await this.settingsService.saveExportedFile(content, suggestedName);

    if (saved) {
      this.messageService.add({
        severity: 'success',
        summary: 'Hotovo',
        detail: 'CSV súbor bol úspešne uložený'
      });
    }
  }

  isPrinting = false;
  printRows: Record<string, string>[] = [];
  printColumns: string[] = [];

  printCsv(): void {
    if (!this.csvData || this.selectedColumns.length === 0) return;

    this.printRows = this.csvData.rows.filter((_, i) => this.selectedRowIndices.has(i));
    this.printColumns = this.selectedColumns;
    this.isPrinting = true;

    this.cdr.detectChanges();

    setTimeout(() => {
      window.print();
    }, 100);

    const afterPrint = (): void => {
      this.isPrinting = false;
      this.cdr.detectChanges();
      window.removeEventListener('afterprint', afterPrint);
    };
    window.addEventListener('afterprint', afterPrint);
  }

  loadNewFile(): void {
    this.csvData = null;
    this.selectedColumns = [];
    this.selectedRowIndices = new Set();
    this.filterDate = null;
    this.csvService.clear();
  }
}
