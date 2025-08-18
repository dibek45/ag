import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent {
  numeroSorteo: string = '001'; // valor por defecto

 constructor(private route: ActivatedRoute, private router: Router) {
  this.route.paramMap.subscribe(paramMap => {
    const param = paramMap.get('numeroSorteo') || this.route.parent?.snapshot.paramMap.get('numeroSorteo');
    this.numeroSorteo = param || '001';

   
  });
}
verificarPremium(ruta: string) {
      Swal.fire({
        icon: 'info',
        title: 'Función Premium',
        html: `
          <p>⚠️ Esta sección está disponible solo en la <b>versión de paga</b> de RIFAS Premium.</p>
          <p>Contáctanos por WhatsApp para más información.</p>
        `,
        confirmButtonText: 'Cerrar',
        showCancelButton: true,
        cancelButtonText: '📲 WhatsApp',
        reverseButtons: true
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          window.open(
            'https://wa.me/524461796235?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20la%20versi%C3%B3n%20de%20paga%20de%20RIFAS%20Premium',
            '_blank'
          );
        }
      });
   
    }
  
}
