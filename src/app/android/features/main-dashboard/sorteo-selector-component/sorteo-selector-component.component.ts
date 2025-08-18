import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sorteo-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="cerrar()">
      <div class="modal-fullscreen" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="cerrar()">&times;</button>
        <h2 class="modal-title">Tus sorteos disponibles son:</h2>
        <div class="sorteo-list">
          <button
            class="sorteo-item"
            *ngFor="let sorteo of sorteos"
            (click)="select(sorteo.id)">
            {{ sorteo.nombre || 'Sorteo #' + sorteo.id }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-fullscreen {
      width: 75%;
      max-width: 480px;
      height: 70%;
      background: white;
      border-radius: 1.5rem;
      padding: 2rem 1.5rem;
      overflow-y: auto;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 0.8rem;
      right: 0.8rem;
      background: none;
      border: none;
      font-size: 1.8rem;
      font-weight: bold;
      color: #666;
      cursor: pointer;
    }

    .close-btn:hover {
      color: #000;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .sorteo-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sorteo-item {
      padding: 1rem;
      font-size: 1.1rem;
      background-color: #f3f4f6;
      border: none;
      border-radius: 1rem;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .sorteo-item:hover {
      background-color: #e5e7eb;
    }
  `]
})
export class SorteoSelectorComponent {
  @Input() sorteos: { id: number; nombre: string; [key: string]: any }[] = [];
  @Output() selected = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  select(id: number) {
    this.selected.emit(id);
  }

  cerrar() {
    this.closed.emit();
  }
}
