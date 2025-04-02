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
    this.applyFiltersAndSort();
  }
  
  ngOnChanges(): void {
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
          const cellValue = String(row[column] || '').toLowerCase();
          return cellValue.includes(filterValue);
        });
      }
    });
    
    // Apply sorting if a column is selected
    if (this.sortState.column) {
      result.sort((a, b) => {
        const aValue = a[this.sortState.column!];
        const bValue = b[this.sortState.column!];
        
        // Handle numeric values
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return this.sortState.direction === 'asc' 
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }
        
        // Handle string values
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
}
