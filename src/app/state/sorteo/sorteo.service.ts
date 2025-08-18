import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sorteo } from './sorteo.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SorteoService {
  private apiUrl = 'https://api.sorteos.sa.dibeksolutions.com/sorteo';

  constructor(private http: HttpClient) {}

  getSorteos(): Observable<Sorteo[]> {
        alert("entra api boletos")

    console.log('⏳ Cargando sorteos desde:', this.apiUrl);
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esPremium = usuario?.plan === 'premium';

    if (esPremium) {
      // 🚀 PREMIUM → Pedir a la API
      return this.http.get<Sorteo[]>(this.apiUrl);
    } else {
      // 💾 FREE/GUEST → Cargar desde LocalStorage
      const sorteosLocal = JSON.parse(localStorage.getItem('sorteos') || '[]');
      console.log('💾 Cargando sorteos desde localStorage', sorteosLocal);
      return of(sorteosLocal);
    }
  }

  guardarSorteosLocal(sorteos: Sorteo[]): void {
    localStorage.setItem('sorteos', JSON.stringify(sorteos));
    console.log('💾 Sorteos guardados en localStorage');
  }
}
