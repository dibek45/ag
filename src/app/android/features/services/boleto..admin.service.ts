import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of, switchMap, throwError } from 'rxjs';
import { Boleto } from '../../../state/evento/evento.model';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {
  private apiUrl = 'https://api.sorteos.sa.dibeksolutions.com/boleto/';

  constructor(private http: HttpClient) {}
getBoletos(sorteoId: number): Observable<Boleto[]> {
  console.log(`⏳ Haciendo petición al API con sorteoId = ${sorteoId}...`);

  const request$ = this.http.get<Boleto[]>(`${this.apiUrl}${sorteoId}`);

  request$.subscribe({
    next: (boletos) => console.log('✅ Respuesta de API:', boletos),
    error: (err) => console.error('❌ Error al llamar API:', err)
  });

  return request$;
}


 private boletosSimulados: Boleto[] = [
   
    // Agrega más si quieres probar
  ];

  apartarBoleto(numero: string): Observable<any> {
    return of(true).pipe(
      delay(500), // Simula retardo de red
      switchMap(() => {
        const encontrado = this.boletosSimulados.find(b => b.numero === numero);
        if (!encontrado || encontrado.estado !== 'disponible') {
          return throwError(() => new Error('Ya ocupado'));
        }

        // Marca como ocupado
        encontrado.estado = 'ocupado';
        return of(true);
      })
    );
  }


  updateBoleto(boleto: Boleto): Observable<Boleto> {
  const url = `${this.apiUrl}${boleto.id}`;
  return this.http.patch<Boleto>(url, { estado: boleto.estado });
}

}
