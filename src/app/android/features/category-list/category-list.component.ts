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
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent {
  codigo = '';

  // ⚠️ cambia rutas de iconos según tu proyecto
 categories = [
  { id: 1, name: 'Manicure',   slug: 'unas',       icon: 'assets/icon/categorias/Manicure.svg' },
  { id: 2, name: 'Lashes',     slug: 'pestanas',   icon: 'assets/icon/categorias/eyelashes.svg' },
  { id: 3, name: 'Barbería',   slug: 'barba',      icon: 'assets/icon/categorias/barberia.svg' },
  { id: 4, name: 'Estética',   slug: 'tijeras',    icon: 'assets/icon/categorias/estetica.svg' },
  { id: 5, name: 'Maquillaje', slug: 'maquillaje', icon: 'assets/icon/categorias/makeup.svg' },
  { id: 6, name: 'Masajes',    slug: 'masajes',    icon: 'assets/icon/categorias/massage.svg' }
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
