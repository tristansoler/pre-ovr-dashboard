import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { DataService, TableInfo } from '../../services/data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  availableTables: TableInfo[] = [];
  activeTables: TableInfo[] = [];

  constructor(private dataService: DataService) {
    this.availableTables = this.dataService.availableTables;
    
    // Subscribe to active tables changes
    this.dataService.activeTables.subscribe(tables => {
      this.activeTables = tables;
    });
  }

  private lastClickTime: number = 0;
  private lastClickedTableId: string | null = null;
  private clickThreshold: number = 300; // milliseconds
  
  toggleTable(table: TableInfo): void {
    const now = Date.now();
    
    if (this.lastClickedTableId === table.id && now - this.lastClickTime < this.clickThreshold) {
      // Double click - hide the table
      if (this.isTableActive(table.id)) {
        this.dataService.removeTable(table.id);
      }
    } else {
      // Single click - show the table
      if (!this.isTableActive(table.id)) {
        this.dataService.addTable(table);
      }
    }
    
    this.lastClickTime = now;
    this.lastClickedTableId = table.id;
  }
  
  isTableActive(tableId: string): boolean {
    return this.activeTables.some(table => table.id === tableId);
  }
}
