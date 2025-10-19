import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.scss']
})
export class MenuSettingsComponent {

    @Output() cerrar = new EventEmitter<void>();


  agendaOpen = false;
finanzasOpen = false;

toggleAgenda() {
  this.agendaOpen = !this.agendaOpen;
}

toggleFinanzas() {
  this.finanzasOpen = !this.finanzasOpen;
}

goToSorteo() {
      this.router.navigate(['/home']);

}

  constructor(private router: Router){

  }

  onCerrar() {
    this.cerrar.emit();
  }

logout() {
  // 🧹 Borra toda la sesión guardada
  localStorage.removeItem('auth');
  localStorage.removeItem('token');
    this.cerrar.emit();

  // 🚪 Redirige al login
}

}
