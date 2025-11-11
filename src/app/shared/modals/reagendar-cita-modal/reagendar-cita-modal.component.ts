import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reagendar-cita-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reagendar-cita-modal.component.html',
  styleUrls: ['./reagendar-cita-modal.component.scss']
})
export class ReagendarCitaModalComponent {
  @Input() visible = false;
  @Input() fecha?: Date;
  @Input() hora?: string;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
