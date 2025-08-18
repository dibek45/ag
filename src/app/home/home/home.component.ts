import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PrizeInfoComponent } from '../../components/prize-info/prize-info.component';
import { DetallesRifaComponent } from '../../components/detalles-rifa/detalles-rifa.component';
import { WhatsappButtonComponent } from '../../components/wp/whatsapp-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PrizeInfoComponent, DetallesRifaComponent,WhatsappButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  numeroSorteo: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Obtén el número del sorteo desde la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      this.numeroSorteo = params.get('numeroSorteo');
    });
  }

  verBoletos() {
    if (this.numeroSorteo) {
      console.log('➡️ Navegar a boletos de sorteo', this.numeroSorteo);
      this.router.navigate([`/${this.numeroSorteo}/boletos`]);
    } else {
      console.warn('⚠️ No se encontró el número del sorteo');
    }
  }
}
