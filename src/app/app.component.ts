import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DataWindowComponent } from './components/data-window/data-window.component';
import { DataService, TableState } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, DataWindowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'pre-ovr-dashboard';
  activeTables: TableState[] = [];
  
  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    this.dataService.activeTables.subscribe(tables => {
      this.activeTables = tables;
    });
  }
  
  onCloseTable(id: string): void {
    this.dataService.removeTable(id);
  }
  
  onTogglePin(id: string): void {
    this.dataService.togglePinned(id);
  }
  
  onPositionChange(event: {id: string, position: {x: number, y: number}}): void {
    this.dataService.updateTablePosition(event.id, event.position);
  }
  
  onSizeChange(event: {id: string, size: {width: number, height: number}}): void {
    this.dataService.updateTablePosition(event.id, event.size);
  }
  
  onBringToFront(id: string): void {
    this.dataService.bringToFront(id);
  }
}
