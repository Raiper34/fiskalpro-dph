import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';

import { CsvService } from '../../services/csv.service';
import { CsvData } from '../../models/csv.model';

@Component({
  selector: 'app-csv-loader',
  imports: [
    CommonModule,
    FileUploadModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    CardModule
  ],
  templateUrl: './csv-loader.component.html',
  styleUrl: './csv-loader.component.scss'
})
export class CsvLoaderComponent {
  @Output() fileLoaded = new EventEmitter<CsvData>();

  private csvService = inject(CsvService);

  isDragging = false;
  isLoading = false;
  errorMessage = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  async processFile(file: File): Promise<void> {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.errorMessage = 'Prosím vyberte súbor vo formáte CSV (.csv)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const data = await this.csvService.parseFile(file);
      this.fileLoaded.emit(data);
    } catch (e: unknown) {
      this.errorMessage = e instanceof Error ? e.message : 'Chyba pri načítaní súboru';
    } finally {
      this.isLoading = false;
    }
  }

  triggerFileInput(): void {
    document.getElementById('csv-file-input')?.click();
  }
}
