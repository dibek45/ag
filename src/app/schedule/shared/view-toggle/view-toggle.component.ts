import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router'; // 👈 IMPORTANTE

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [RouterModule], // 👈 aquí agregas RouterModule
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.scss'],
})
export class ViewToggleComponent {
  @Output() today = new EventEmitter<void>();

  activeView: 'month' | 'hoy' = 'month';

selectHoy() {
  this.activeView = 'hoy';
  this.goToToday(); // si ya tienes esta función
}

  goToToday() {
    this.today.emit();
  }
}
