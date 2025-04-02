import { Component, Input, Output, EventEmitter, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../data-table/data-table.component';
import { TableState } from '../../services/data.service';
import interact from 'interactjs';

@Component({
  selector: 'app-data-window',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './data-window.component.html',
  styleUrl: './data-window.component.scss'
})
export class DataWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tableState!: TableState;
  @Output() close = new EventEmitter<string>();
  @Output() positionChange = new EventEmitter<{id: string, position: {x: number, y: number}}>(); 
  @Output() sizeChange = new EventEmitter<{id: string, size: {width: number, height: number}}>(); 
  @Output() bringToFront = new EventEmitter<string>();
  
  @ViewChild('window') windowElement!: ElementRef;
  @ViewChild('windowHeader') headerElement!: ElementRef;
  @ViewChild('resizeHandle') resizeHandleElement!: ElementRef;
  
  private currentPosition = { x: 0, y: 0 };
  private interactable: any;
  private resizableElement: any;
  
  ngOnInit(): void {
    console.log('Window initialized:', this.tableState);
    
    // Ensure we have valid position values
    if (this.tableState.x === undefined) this.tableState.x = 0;
    if (this.tableState.y === undefined) this.tableState.y = 0;
    
    // Store current position
    this.currentPosition = { x: this.tableState.x, y: this.tableState.y };
  }
  
  ngAfterViewInit(): void {
    // Remove the setTimeout - it might be causing issues
    this.initDraggable();
    this.initResizable();
  }
  
  ngOnDestroy(): void {
    // Clean up interactjs instances
    if (this.interactable) {
      this.interactable.unset();
    }
    
    if (this.resizableElement) {
      this.resizableElement.unset();
    }
  }
  
  private initDraggable(): void {
    const element = this.windowElement.nativeElement;
    
    // Ensure current position is correct
    this.currentPosition = { 
      x: this.tableState.x || 0, 
      y: this.tableState.y || 0 
    };
    
    this.interactable = interact(element)
      .draggable({
        allowFrom: '.window-header',
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
            endOnly: true
          })
        ],
        inertia: true,
        listeners: {
          start: (event) => {
            console.log('Drag started', this.tableState.id, this.currentPosition);
            event.target.classList.add('dragging');
            this.bringToFront.emit(this.tableState.id);
          },
          move: (event) => {
            // Add debug log before move
            console.log('Before move:', 
              element.style.transform, 
              this.currentPosition.x, 
              this.currentPosition.y
            );
            
            // Update position in real-time
            this.currentPosition.x += event.dx;
            this.currentPosition.y += event.dy;
            
            // Apply new transform directly (WITHOUT using Angular binding)
            event.target.style.transform = 
              `translate(${this.currentPosition.x}px, ${this.currentPosition.y}px)`;
            
            // Add debug log after move
            console.log('After move:', 
              element.style.transform, 
              this.currentPosition.x, 
              this.currentPosition.y
            );
          },
          end: (event) => {
            console.log('Drag ended', this.currentPosition);
            event.target.classList.remove('dragging');
            
            // Update the tableState object
            this.tableState.x = this.currentPosition.x;
            this.tableState.y = this.currentPosition.y;
            
            // Emit position change event
            this.positionChange.emit({
              id: this.tableState.id,
              position: { 
                x: this.currentPosition.x,
                y: this.currentPosition.y
              }
            });
          }
        }
      });
  }
  
  private initResizable(): void {
    const element = this.windowElement.nativeElement;
    const resizeHandle = this.resizeHandleElement.nativeElement;
    
    this.resizableElement = interact(element)
      .resizable({
        // Enable resize from the resize handle element only
        edges: { right: true, bottom: true, left: false, top: false },
        
        // Set resize handle
        allowFrom: '.resize-handle',
        
        // Restrict resize to parent container 
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 300, height: 200 },
            max: { width: 1200, height: 800 }
          })
        ],
        
        inertia: true,
        
        listeners: {
          start: (event) => {
            console.log('Resize started');
            this.bringToFront.emit(this.tableState.id);
            element.classList.add('resizing');
          },
          move: (event) => {
            // Update element dimensions
            let width = this.tableState.width + event.deltaRect.width;
            let height = this.tableState.height + event.deltaRect.height;
            
            // Apply size constraints
            width = Math.max(300, Math.min(1200, width));
            height = Math.max(200, Math.min(800, height));
            
            // Update element style directly for smooth movement
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
            
            // Emit size change event to update parent state
            this.sizeChange.emit({
              id: this.tableState.id,
              size: { width, height }
            });
          },
          end: (event) => {
            console.log('Resize ended');
            element.classList.remove('resizing');
            
            // Final size update
            const finalWidth = element.offsetWidth;
            const finalHeight = element.offsetHeight;
            
            this.sizeChange.emit({
              id: this.tableState.id,
              size: { width: finalWidth, height: finalHeight }
            });
          }
        }
      });
  }
  
  onWindowClick(): void {
    this.bringToFront.emit(this.tableState.id);
  }
  
  onCloseClick(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(this.tableState.id);
  }
}
