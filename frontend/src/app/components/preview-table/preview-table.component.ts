import { Component, Input, Output, EventEmitter, OnChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';

import { CsvData } from '../../models/csv.model';

@Component({
  selector: 'app-preview-table',
  imports: [CommonModule, FormsModule, TableModule, CheckboxModule],
  templateUrl: './preview-table.component.html',
  styleUrl: './preview-table.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PreviewTableComponent implements OnChanges {
  @Input() csvData!: CsvData;
  @Input() selectedColumns: string[] = [];
  @Input() selectedRowIndices: Set<number> = new Set();
  @Output() selectedColumnsChange = new EventEmitter<string[]>();
  @Output() selectedRowIndicesChange = new EventEmitter<Set<number>>();

  rows: Record<string, string>[] = [];

  ngOnChanges(): void {
    this.rows = this.csvData?.rows ?? [];
  }

  isColumnSelected(column: string): boolean {
    return this.selectedColumns.includes(column);
  }

  isRowSelected(index: number): boolean {
    return this.selectedRowIndices.has(index);
  }

  get allRowsSelected(): boolean {
    return this.rows.length > 0 && this.selectedRowIndices.size === this.rows.length;
  }

  toggleColumn(column: string): void {
    const updated = this.isColumnSelected(column)
      ? this.selectedColumns.filter(c => c !== column)
      : [...this.selectedColumns, column];
    this.selectedColumnsChange.emit(updated);
  }

  toggleRow(index: number): void {
    const updated = new Set(this.selectedRowIndices);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    this.selectedRowIndicesChange.emit(updated);
  }

  toggleAllRows(): void {
    if (this.allRowsSelected) {
      this.selectedRowIndicesChange.emit(new Set());
    } else {
      this.selectedRowIndicesChange.emit(new Set(this.rows.map((_, i) => i)));
    }
  }
}
