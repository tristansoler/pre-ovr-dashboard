import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { DataService, TableInfo } from '../../services/data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  availableTables: TableInfo[] = [];

  constructor(private dataService: DataService) {
    this.availableTables = this.dataService.availableTables;
  }

  addTable(table: TableInfo): void {
    this.dataService.addTable(table);
  }
}
