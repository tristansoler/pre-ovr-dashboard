import { Component, Input, Output, EventEmitter, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { DataTableComponent } from '../data-table/data-table.component';
import { TableState } from '../../services/data.service';

@Component({
  selector: 'app-data-window',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDragHandle, DragDropModule, DataTableComponent],
  templateUrl: './data-window.component.html',
  styleUrl: './data-window.component.scss'
})
export class DataWindowComponent implements OnInit, AfterViewInit {
  @Input() tableState!: TableState;
  @Output() close = new EventEmitter<string>();
  // Pin toggle removed
  @Output() positionChange = new EventEmitter<{id: string, position: {x: number, y: number}}>(); 
  @Output() sizeChange = new EventEmitter<{id: string, size: {width: number, height: number}}>(); 
  @Output() bringToFront = new EventEmitter<string>();
  
  @ViewChild('window') windowElement!: ElementRef;
  @ViewChild('resizeHandle') resizeHandleElement!: ElementRef;
  
  resizing = false;
  resizeStartX = 0;
  resizeStartY = 0;
  initialWidth = 0;
  initialHeight = 0;
  
  ngOnInit(): void {
    // Initial position and size are set via CSS using the tableState inputs
    console.log('Window initialized:', this.tableState);
    
    // Ensure we have valid position values
    if (this.tableState.x === undefined) this.tableState.x = 0;
    if (this.tableState.y === undefined) this.tableState.y = 0;
  }
  
  ngAfterViewInit(): void {
    // Ensure window is properly positioned and sized after view is initialized
    setTimeout(() => {
      if (this.windowElement) {
        console.log('Window element rendered:', this.windowElement.nativeElement);
      }
    }, 0);
  }
  
  onDragStarted(): void {
    this.bringToFront.emit(this.tableState.id);
  }
  
  onDragEnded(event: CdkDragEnd): void {
    // Get the final drag position directly from the CDK event
    const position = event.source.getFreeDragPosition();
    
    // Making sure position is properly captured and emitted
    console.log('Drag ended, new position:', position);
    console.log('Window element:', this.windowElement?.nativeElement.getBoundingClientRect());
    console.log('Previous position state:', {x: this.tableState.x, y: this.tableState.y});
    
    // Emit the position change event with the updated coordinates
    this.positionChange.emit({
      id: this.tableState.id, 
      position: {x: position.x, y: position.y}
    });
  }
  
  onWindowClick(): void {
    this.bringToFront.emit(this.tableState.id);
  }
  
  onCloseClick(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(this.tableState.id);
  }
  
  // Pin click handler removed
  
  startResize(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.resizing = true;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.initialWidth = this.tableState.width;
    this.initialHeight = this.tableState.height;
    
    // Add event listeners to track mouse move and up
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
    
    this.bringToFront.emit(this.tableState.id);
  }
  
  onResizeMove = (event: MouseEvent): void => {
    if (!this.resizing) return;
    
    const dx = event.clientX - this.resizeStartX;
    const dy = event.clientY - this.resizeStartY;
    
    const newWidth = Math.max(300, this.initialWidth + dx);
    const newHeight = Math.max(200, this.initialHeight + dy);
    
    this.sizeChange.emit({
      id: this.tableState.id, 
      size: {width: newWidth, height: newHeight}
    });
  }
  
  onResizeEnd = (): void => {
    this.resizing = false;
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }
}
