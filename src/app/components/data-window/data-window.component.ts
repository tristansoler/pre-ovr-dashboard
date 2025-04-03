import { Component, Input, Output, EventEmitter, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../data-table/data-table.component';
import { TableState } from '../../services/data.service';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-data-window',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DragDropModule],
  templateUrl: './data-window.component.html',
  styleUrl: './data-window.component.scss'
})
export class DataWindowComponent implements OnInit {
  @Input() tableState!: TableState;
  @Output() close = new EventEmitter<string>();
  @Output() positionChange = new EventEmitter<{id: string, position: {x: number, y: number}}>(); 
  @Output() sizeChange = new EventEmitter<{id: string, size: {width: number, height: number}}>(); 
  @Output() bringToFront = new EventEmitter<string>();
  
  @ViewChild('resizeHandle') resizeHandleElement!: ElementRef;
  
  isResizing = false;
  resizeStartPos = { x: 0, y: 0 };
  resizeStartSize = { width: 0, height: 0 };
  
  ngOnInit(): void {
    // Initialize default values if not set
    if (this.tableState.x === undefined) this.tableState.x = 0;
    if (this.tableState.y === undefined) this.tableState.y = 0;
    if (this.tableState.width === undefined) this.tableState.width = 600;
    if (this.tableState.height === undefined) this.tableState.height = 400;
  }
  
  onDragEnded(event: CdkDragEnd): void {
    const position = event.source.getFreeDragPosition();
    
    // Update the tableState
    this.tableState.x = position.x;
    this.tableState.y = position.y;
    
    // Emit position change
    this.positionChange.emit({
      id: this.tableState.id,
      position: { x: position.x, y: position.y }
    });
  }
  
  onWindowClick(): void {
    this.bringToFront.emit(this.tableState.id);
  }
  
  onCloseClick(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(this.tableState.id);
  }
  
  // Custom resize implementation
  onResizeMousedown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isResizing = true;
    this.resizeStartPos = { x: event.clientX, y: event.clientY };
    this.resizeStartSize = { 
      width: this.tableState.width, 
      height: this.tableState.height 
    };
    
    // Add event listeners
    document.addEventListener('mousemove', this.onResizeMousemove);
    document.addEventListener('mouseup', this.onResizeMouseup);
    
    // Focus this window
    this.bringToFront.emit(this.tableState.id);
  }
  
  onResizeMousemove = (event: MouseEvent): void => {
    if (!this.isResizing) return;
    
    // Calculate new size
    const deltaX = event.clientX - this.resizeStartPos.x;
    const deltaY = event.clientY - this.resizeStartPos.y;
    
    const newWidth = Math.max(300, Math.min(1200, this.resizeStartSize.width + deltaX));
    const newHeight = Math.max(200, Math.min(800, this.resizeStartSize.height + deltaY));
    
    // Update tableState
    this.tableState.width = newWidth;
    this.tableState.height = newHeight;
    
    // Trigger change detection (needed in some cases)
    // We're modifying properties inside an event handler that Angular isn't aware of
    setTimeout(() => {}, 0);
  }
  
  onResizeMouseup = (event: MouseEvent): void => {
    this.isResizing = false;
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.onResizeMousemove);
    document.removeEventListener('mouseup', this.onResizeMouseup);
    
    // Emit size change
    this.sizeChange.emit({
      id: this.tableState.id,
      size: { 
        width: this.tableState.width, 
        height: this.tableState.height 
      }
    });
  }
}