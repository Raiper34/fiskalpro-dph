export interface CsvData {
  headers: string[];
  rows: Record<string, string>[];
  rawContent: string;
  fileName: string;
}

export interface ColumnSettings {
  profileName: string;
  selectedColumns: string[];
  delimiter: string;
  encoding: string;
  lastModified: string;
}

export interface AppSettings {
  profiles: Record<string, ColumnSettings>;
  lastUsedProfile: string;
}
