// src/app/services/sorteo-sync.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SorteoSyncService {
  private sorteosActualizadosSource = new Subject<void>();
  sorteosActualizados$ = this.sorteosActualizadosSource.asObservable();

  /** Llamar cuando se guarden cambios en localStorage */
  notificarActualizacion() {
    this.sorteosActualizadosSource.next();
  }
}
