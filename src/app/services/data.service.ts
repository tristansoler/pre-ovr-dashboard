import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import * as Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

export interface TableInfo {
  id: string;
  name: string;
  filename: string;
}

export interface TablePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TableState extends TableInfo, TablePosition {
  pinned: boolean;
  active: boolean;
  data?: any[];
  columns?: string[];
  zIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private activeTablesSubject = new BehaviorSubject<TableState[]>([]);
  private highestZIndex = 1;

  // Table mapping between display names and filenames
  private tableMapping: TableInfo[] = [
    { id: uuidv4(), name: 'Clarity DataFeed Without OVR', filename: 'clarity_datafeed_without_ovr.csv' },
    { id: uuidv4(), name: 'SCS 002 EC', filename: 'scs_002_ec.csv' },
    { id: uuidv4(), name: 'SCS 001 SEC', filename: 'scs_001_sec.csv' },
    { id: uuidv4(), name: 'STR SFDR8 AEC', filename: 'str_sfdr8_aec.csv' },
    { id: uuidv4(), name: 'STR 006 SEC', filename: 'str_006_sec.csv' },
    { id: uuidv4(), name: 'STR 005 EC', filename: 'str_005_ec.csv' },
    { id: uuidv4(), name: 'STR 004 ASEC', filename: 'str_004_asec.csv' },
    { id: uuidv4(), name: 'STR 003B EC', filename: 'str_003b_ec.csv' },
    { id: uuidv4(), name: 'STR 003 EC', filename: 'str_003_ec.csv' },
    { id: uuidv4(), name: 'STR 002 EC', filename: 'str_002_ec.csv' },
    { id: uuidv4(), name: 'STR 001 S', filename: 'str_001_s.csv' },
    { id: uuidv4(), name: 'Out Issuer Clarity', filename: 'out_issuer_clarity.csv' },
    { id: uuidv4(), name: 'New Issuers Clarity', filename: 'new_issuers_clarity.csv' },
    { id: uuidv4(), name: 'INCL Benchmarks', filename: 'incl_benchmarks.csv' },
    { id: uuidv4(), name: 'INCL Carteras', filename: 'incl_carteras.csv' },
    { id: uuidv4(), name: 'Delta Clarity', filename: 'delta_clarity.csv' },
    { id: uuidv4(), name: 'Delta Benchmarks', filename: 'delta_benchmarks.csv' },
    { id: uuidv4(), name: 'Delta Carteras', filename: 'delta_carteras.csv' },
    { id: uuidv4(), name: 'Zombie Analysis', filename: 'zombie_analysis.csv' }
  ];

  constructor(private http: HttpClient) {}

  get availableTables(): TableInfo[] {
    return this.tableMapping;
  }

  get activeTables(): Observable<TableState[]> {
    return this.activeTablesSubject.asObservable();
  }

  private loadCSV(filename: string): Observable<any[]> {
    const url = `assets/input/${filename}`;
    return this.http.get(url, { responseType: 'text' })
      .pipe(
        map(csv => {
          const result = Papa.parse(csv, { header: true });
          return result.data;
        }),
        catchError(error => {
          console.error(`Error loading ${filename}:`, error);
          return of([]);
        })
      );
  }

  addTable(tableInfo: TableInfo): void {
    // Check if the table is already active
    const currentTables = this.activeTablesSubject.value;
    const existingTable = currentTables.find(t => t.id === tableInfo.id);
    
    if (existingTable) {
      this.bringToFront(existingTable.id);
      return;
    }

    // Position logic - stagger new tables
    const offset = currentTables.length * 20;
    const newZIndex = ++this.highestZIndex;
    
    // Create a new table state
    const newTable: TableState = {
      ...tableInfo,
      active: true,
      pinned: false,
      x: 100 + offset,
      y: 100 + offset,
      width: 600,
      height: 400,
      zIndex: newZIndex
    };

    // Load the data for this table
    this.loadCSV(tableInfo.filename).subscribe(data => {
      if (data && data.length > 0) {
        newTable.data = data;
        newTable.columns = Object.keys(data[0]);
        
        // Update the active tables list
        this.activeTablesSubject.next([...currentTables, newTable]);
      }
    });
  }

  removeTable(tableId: string): void {
    const currentTables = this.activeTablesSubject.value;
    const updatedTables = currentTables.filter(t => t.id !== tableId);
    this.activeTablesSubject.next(updatedTables);
  }

  updateTablePosition(tableId: string, position: Partial<TablePosition>): void {
    const currentTables = this.activeTablesSubject.value;
    const updatedTables = currentTables.map(table => {
      if (table.id === tableId) {
        return { ...table, ...position };
      }
      return table;
    });
    
    this.activeTablesSubject.next(updatedTables);
  }

  togglePinned(tableId: string): void {
    const currentTables = this.activeTablesSubject.value;
    const updatedTables = currentTables.map(table => {
      if (table.id === tableId) {
        return { ...table, pinned: !table.pinned };
      }
      return table;
    });
    
    this.activeTablesSubject.next(updatedTables);
  }

  bringToFront(tableId: string): void {
    const currentTables = this.activeTablesSubject.value;
    const newZIndex = ++this.highestZIndex;
    
    const updatedTables = currentTables.map(table => {
      if (table.id === tableId) {
        return { ...table, zIndex: newZIndex };
      }
      return table;
    });
    
    this.activeTablesSubject.next(updatedTables);
  }
}
