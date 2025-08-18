import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-bottom',
  standalone: true,
  imports: [],
  templateUrl: './menu-bottom.component.html',
  styleUrl: './menu-bottom.component.scss'
})
export class MenuBottomComponent {
@Output() abrirModalSorteos = new EventEmitter<void>();
  @Output() abrirMenuConfig = new EventEmitter<void>();

    constructor(private router: Router) {}

  irAHome() {
        this.abrirModalSorteos.emit(); 
}

   emitirAbrirMenu() {
    this.abrirMenuConfig.emit();
  }

  inicio(){
      this.router.navigate(['/home']);
  }

    mostrarAlertaPremium() {
    Swal.fire({
      icon: 'info',
      title: 'Función Premium',
      html: `
        <p>⚠️ Esta función está disponible solo en la <b>versión de paga</b> de RIFAS Premium.</p>
        <p>Contáctanos por WhatsApp para más información.</p>
      `,
      confirmButtonText: 'Cerrar',
      showCancelButton: true,
      cancelButtonText: '📲 WhatsApp',
      reverseButtons: true
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        window.open(
          'https://wa.me/524461796235?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20versi%C3%B3n%20de%20paga%20de%20RIFAS%20Premium',
          '_blank'
        );
      }
    });
  }


}
