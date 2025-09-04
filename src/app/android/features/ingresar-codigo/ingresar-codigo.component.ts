import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BtnRegresarComponent } from '../../../shared/btn-regresar/btn-regresar.component';

type Category = { id: number; name: string; slug: string; icon: string };

@Component({
  selector: 'app-ingresar-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule, BtnRegresarComponent],
  templateUrl: './ingresar-codigo.component.html',
  styleUrls: ['./ingresar-codigo.component.scss'],
})
export class IngresarCodigoComponent {
  codigo = '';

  // ⚠️ cambia rutas de iconos según tu proyecto
 categories = [
  { id: 1, name: 'Uñas',     slug: 'unas',     icon: 'assets/icon/categorias/uas.svg' },
  { id: 2, name: 'Pestañas', slug: 'pestanas', icon: 'assets/icon/categorias/pestanas.svg' },
  { id: 3, name: 'Barbería', slug: 'barba',    icon: 'assets/icon/categorias/barba.svg' },
  { id: 4, name: 'Corte',    slug: 'tijeras',  icon: 'assets/icon/categorias/tijeras.svg' },
];


  constructor(private router: Router) {}

  continuar() {
    const trimmed = this.codigo.trim();
    if (!trimmed) return;

    // Quitar los 2 primeros dígitos de la izquierda
    const sorteoId = trimmed.substring(2);

    this.router.navigate([`/${sorteoId}/agenda`], {
      queryParams: { code: sorteoId, estadoCuenta: 'premium' },
      state: { returnUrl: this.router.url },
    });
  }

  selectCategory(cat: Category) {
    // Navega a listado de compañías por categoría (ajusta la ruta a tu app)
    this.router.navigate([`/categoria/${cat.slug}`], {
      queryParams: { from: 'landing-codigo' },
      state: { categoryId: cat.id, categoryName: cat.name },
    });
  }

  regresar() {
    this.router.navigateByUrl('/');
  }
}
