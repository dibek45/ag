import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prize-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prize-info.component.html',
  styleUrl: './prize-info.component.scss',
})
export class PrizeInfoComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  logoUrl = ``;

  boletos: { cantidad: number; precio: number }[] = [];

  ngOnInit(): void {
    this.cargarDesdeStore();
  }

cargarDesdeStore() {
  const sorteoId = Number(this.route.parent?.snapshot.paramMap.get('numeroSorteo'));
  console.log('🧪 Param sorteoId recibido: ' + sorteoId);

  if (!sorteoId || isNaN(sorteoId)) {
    console.error('❌ sorteoId inválido en la URL:', sorteoId);
    return;
  }

  // ✅ Cargar sorteos si el array está vacío

}

 logoFallback() {

  }
}
