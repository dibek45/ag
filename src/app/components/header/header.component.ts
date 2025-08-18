import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() tipoMenu: number = 1;
  numeroSorteo: string | null = null;
  logoUrl: string='';

  constructor(private router: Router) {}

  ngOnInit(): void {  
  const match = this.router.url.match(/^\/(\d+)(\/|$)/);
this.numeroSorteo = match ? match[1] : null;
 if (this.numeroSorteo) {
this.logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/${this.numeroSorteo}.png`;
    }

    // debug opcional
    console.log('🎯 Numero de sorteo:'+this.numeroSorteo);
  }

  
  logoFallback() {
    console.warn('⚠️ Imagen de logo no encontrada, usando fallback');
    this.logoUrl = 'assets/default-logo.png';
  }
}
