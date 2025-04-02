import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  
  filteredData: any[] = [];
  sortState: SortState = { column: null, direction: 'asc' };
  filterValues: Record<string, string> = {};
  
  ngOnInit(): void {
    console.log('DataTable ngOnInit - data:', this.data);
    console.log('DataTable ngOnInit - columns:', this.columns);
    this.applyFiltersAndSort();
  }
  
  ngOnChanges(): void {
    console.log('DataTable ngOnChanges - data:', this.data?.length);
    console.log('DataTable ngOnChanges - columns:', this.columns);
    this.applyFiltersAndSort();
  }
  
  sortColumn(column: string): void {
    if (this.sortState.column === column) {
      // Toggle direction if already sorting by this column
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and default to ascending
      this.sortState = { column, direction: 'asc' };
    }
    
    this.applyFiltersAndSort();
  }
  
  onFilterChange(): void {
    this.applyFiltersAndSort();
  }
  
  private applyFiltersAndSort(): void {
    if (!this.data) {
      this.filteredData = [];
      return;
    }
    
    // Apply filters
    let result = [...this.data];
    
    // Apply each column filter
    Object.keys(this.filterValues).forEach(column => {
      const filterValue = this.filterValues[column]?.toLowerCase();
      if (filterValue) {
        result = result.filter(row => {
          const value = row[column];
          let stringValue: string;
          
          // Convert various data types to string for filtering
          if (Array.isArray(value)) {
            stringValue = this.arrayToString(value).toLowerCase();
          } else if (typeof value === 'object' && value !== null) {
            stringValue = this.objectToString(value).toLowerCase();
          } else {
            stringValue = String(value || '').toLowerCase();
          }
          
          return stringValue.includes(filterValue);
        });
      }
    });
    
    // Apply sorting if a column is selected
    if (this.sortState.column) {
      result.sort((a, b) => {
        const aValue = a[this.sortState.column!];
        const bValue = b[this.sortState.column!];
        
        // Handle array values
        if (Array.isArray(aValue) && Array.isArray(bValue)) {
          const aStr = this.arrayToString(aValue);
          const bStr = this.arrayToString(bValue);
          return this.sortState.direction === 'asc'
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        }
        
        // Handle object values
        if (this.isObject(aValue) && this.isObject(bValue)) {
          const aStr = this.objectToString(aValue);
          const bStr = this.objectToString(bValue);
          return this.sortState.direction === 'asc'
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        }
        
        // Handle numeric values
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return this.sortState.direction === 'asc' 
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }
        
        // Handle string values and fallback for other types
        const aString = String(aValue || '').toLowerCase();
        const bString = String(bValue || '').toLowerCase();
        
        if (this.sortState.direction === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      });
    }
    
    this.filteredData = result;
  }
  
  getSortIndicator(column: string): string {
    if (this.sortState.column !== column) {
      return '';
    }
    return this.sortState.direction === 'asc' ? '▲' : '▼';
  }
  
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  
  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  
  arrayToString(arr: any[]): string {
    if (!arr) return '';
    return arr.join(', ');
  }
  
  objectToString(obj: any): string {
    if (!obj) return '';
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
}
