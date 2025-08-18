import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  constructor(private router: Router) {}

  entrarComoOrganizador() {
    this.router.navigate(['/login']);
  }

  entrarConCodigo() {
    this.router.navigate(['/ingresar-codigo']);
  }

 queEsPremium() {
  const modal = document.getElementById('premiumModal') as HTMLElement;
  modal.style.display = 'block';
}

cerrarModal() {
  const modal = document.getElementById('premiumModal') as HTMLElement;
  modal.style.display = 'none';
}

}
