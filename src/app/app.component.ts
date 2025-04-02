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
  
  // Auto tiling functionality removed
  
  onCloseTable(id: string): void {
    this.dataService.removeTable(id);
  }
  
  // Pin toggling removed
  
  onPositionChange(event: {id: string, position: {x: number, y: number}}): void {
    // Use the position object correctly - make sure to handle x and y specifically
    this.dataService.updateTablePosition(event.id, {
      x: event.position.x,
      y: event.position.y
    });
  }
  
  onSizeChange(event: {id: string, size: {width: number, height: number}}): void {
    // Use the size object correctly - make sure to handle width and height specifically
    this.dataService.updateTableSize(event.id, {
      width: event.size.width,
      height: event.size.height
    });
  }
  
  onBringToFront(id: string): void {
    this.dataService.bringToFront(id);
  }
}
