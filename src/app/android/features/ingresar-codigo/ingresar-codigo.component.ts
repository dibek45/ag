import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BtnRegresarComponent } from '../../../shared/btn-regresar/btn-regresar.component';

@Component({
  selector: 'app-ingresar-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule,BtnRegresarComponent],
  templateUrl: './ingresar-codigo.component.html',
  styleUrls: ['./ingresar-codigo.component.scss']
})
export class IngresarCodigoComponent {
  codigo = '';

  constructor(private router: Router) {}

continuar() {
  if (!this.codigo.trim()) return;


  // Quitar los 2 primeros dígitos de la izquierda
  const sorteoId = this.codigo.substring(2);
  // Navegar con el nuevo ID
  this.router.navigate([`/${sorteoId}/agenda`], {
    queryParams: { 
      code: sorteoId, 
      estadoCuenta: 'premium'
    },
    state: { returnUrl: this.router.url }
  });
}



  regresar() {
    this.router.navigateByUrl('/'); 
  }
}
