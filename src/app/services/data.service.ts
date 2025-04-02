import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
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
    { id: uuidv4(), name: 'Clarity DataFeed Without OVR', filename: 'clarity_datafeed_without_ovr.json' },
    { id: uuidv4(), name: 'SCS 002 EC', filename: 'scs_002_ec.json' },
    { id: uuidv4(), name: 'SCS 001 SEC', filename: 'scs_001_sec.json' },
    { id: uuidv4(), name: 'STR SFDR8 AEC', filename: 'str_sfdr8_aec.json' },
    { id: uuidv4(), name: 'STR 006 SEC', filename: 'str_006_sec.json' },
    { id: uuidv4(), name: 'STR 005 EC', filename: 'str_005_ec.json' },
    { id: uuidv4(), name: 'STR 004 ASEC', filename: 'str_004_asec.json' },
    { id: uuidv4(), name: 'STR 003B EC', filename: 'str_003b_ec.json' },
    { id: uuidv4(), name: 'STR 003 EC', filename: 'str_003_ec.json' },
    { id: uuidv4(), name: 'STR 002 EC', filename: 'str_002_ec.json' },
    { id: uuidv4(), name: 'STR 001 S', filename: 'str_001_s.json' },
    { id: uuidv4(), name: 'Out Issuer Clarity', filename: 'out_issuer_clarity.json' },
    { id: uuidv4(), name: 'New Issuers Clarity', filename: 'new_issuers_clarity.json' },
    { id: uuidv4(), name: 'INCL Benchmarks', filename: 'incl_benchmarks.json' },
    { id: uuidv4(), name: 'INCL Carteras', filename: 'incl_carteras.json' },
    { id: uuidv4(), name: 'Delta Clarity', filename: 'delta_clarity.json' },
    { id: uuidv4(), name: 'Delta Benchmarks', filename: 'delta_benchmarks.json' },
    { id: uuidv4(), name: 'Delta Carteras', filename: 'delta_carteras.json' },
    { id: uuidv4(), name: 'Zombie Analysis', filename: 'zombie_analysis.json' }
  ];

  constructor(private http: HttpClient) {}

  get availableTables(): TableInfo[] {
    return this.tableMapping;
  }

  get activeTables(): Observable<TableState[]> {
    return this.activeTablesSubject.asObservable();
  }

  private loadJSON(filename: string): Observable<any[]> {
    const url = `assets/input/${filename}`;
    console.log(`Attempting to load JSON from: ${url}`);
    return this.http.get<any[]>(url)
      .pipe(
        map(data => {
          console.log(`Data loaded from ${filename}:`, data.length > 0 ? data.slice(0, 1) : 'No data');
          
          // Process special string-represented arrays and objects
          return data.map(item => {
            const processedItem = { ...item };
            // Process each property
            Object.keys(processedItem).forEach(key => {
              // If the value starts with [ and ends with ], try to parse it as an array
              if (typeof processedItem[key] === 'string' && 
                  processedItem[key].startsWith('[') && 
                  processedItem[key].endsWith(']')) {
                try {
                  // Replace single quotes with double quotes for JSON parsing
                  const fixedStr = processedItem[key].replace(/'/g, '"');
                  processedItem[key] = JSON.parse(fixedStr);
                } catch (e) {
                  // In case of parse error, keep the original string
                  console.warn(`Failed to parse array string: ${processedItem[key]}`);
                }
              }
              
              // If the value starts with { and ends with }, try to parse it as an object
              if (typeof processedItem[key] === 'string' && 
                  processedItem[key].startsWith('{') && 
                  processedItem[key].endsWith('}')) {
                try {
                  // Replace single quotes with double quotes for JSON parsing
                  const fixedStr = processedItem[key].replace(/'/g, '"');
                  processedItem[key] = JSON.parse(fixedStr);
                } catch (e) {
                  // In case of parse error, keep the original string
                  console.warn(`Failed to parse object string: ${processedItem[key]}`);
                }
              }
            });
            
            return processedItem;
          });
        }),
        catchError(error => {
          console.error(`Error loading ${filename}:`, error);
          console.error(`Full error details:`, JSON.stringify(error));
          return of([]);
        })
      );
  }

  addTable(tableInfo: TableInfo): void {
    // Check if the table is already active
    const currentTables = this.activeTablesSubject.value;
    const existingTable = currentTables.find(t => t.id === tableInfo.id);
    
    if (existingTable) {
      // If already active, bring it to front but don't close
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
      x: 100 + offset,
      y: 100 + offset,
      width: 600,
      height: 400,
      zIndex: newZIndex,
      data: [], // Initialize with empty data
      columns: [] // Initialize with empty columns
    };
    
    // First add the table to show it immediately
    this.activeTablesSubject.next([...currentTables, newTable]);

    // Then load the data for this table
    this.loadJSON(tableInfo.filename).subscribe(data => {
      if (data && data.length > 0) {
        // Find the table in the current state and update it
        const updatedTables = this.activeTablesSubject.value.map(table => {
          if (table.id === newTable.id) {
            return {
              ...table,
              data: data,
              columns: Object.keys(data[0])
            };
          }
          return table;
        });
        
        // Update the active tables list
        this.activeTablesSubject.next(updatedTables);
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
    
    console.log('Updating position for table:', tableId, 'with new values:', position);
    
    const updatedTables = currentTables.map(table => {
      if (table.id === tableId) {
        // Create a proper merge of the existing table with the updated position values
        // This preserves other fields while updating only what was provided
        const updatedTable = { ...table, ...position };
        console.log('Updated table state:', updatedTable);
        return updatedTable;
      }
      return table;
    });
    
    this.activeTablesSubject.next(updatedTables);
  }

  // Pinning functionality removed

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
