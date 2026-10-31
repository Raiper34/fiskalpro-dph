import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Papa from 'papaparse';
import { CsvData } from '../models/csv.model';

@Injectable({ providedIn: 'root' })
export class CsvService {
  private _csvData = new BehaviorSubject<CsvData | null>(null);
  readonly csvData$ = this._csvData.asObservable();

  get csvData(): CsvData | null {
    return this._csvData.value;
  }

  parseFile(file: File): Promise<CsvData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false
        });

        if (result.errors.length > 0 && result.data.length === 0) {
          reject(new Error(result.errors[0].message));
          return;
        }

        const csvData: CsvData = {
          headers: result.meta.fields ?? [],
          rows: result.data as Record<string, string>[],
          rawContent: content,
          fileName: file.name
        };

        this._csvData.next(csvData);
        resolve(csvData);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  exportToCsv(data: CsvData, selectedColumns: string[], selectedRowIndices: Set<number>, delimiter: string = ','): string {
    const filteredRows = data.rows
      .filter((_, i) => selectedRowIndices.has(i))
      .map(row => {
        const filtered: Record<string, string> = {};
        for (const col of selectedColumns) {
          filtered[col] = row[col] ?? '';
        }
        return filtered;
      });

    return Papa.unparse(filteredRows, {
      columns: selectedColumns,
      delimiter
    });
  }

  clear(): void {
    this._csvData.next(null);
  }
}
