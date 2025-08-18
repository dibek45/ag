import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Boleto } from './boleto.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoletoService {
  private apiUrl = 'https://api.sorteos.sa.dibeksolutions.com/boleto';
  private cuentaSTP = '0';

  constructor(private http: HttpClient) {}

getBoletos(sorteoId: number): Observable<Boleto[]> {
  try {
    const estadoCuenta = localStorage.getItem('estadoCuenta');

    console.log("🔍 Valor de estadoCuenta:", estadoCuenta);

    const esPremium = estadoCuenta === 'premium';

    if (esPremium) {
      // ⭐ PREMIUM → desde API
      console.log(`⏳ [API] es premium se envia a apiCargando boletos de sorteo ${sorteoId}...`);
      const request$ = this.http.get<Boleto[]>(`${this.apiUrl}/${sorteoId}`);

      request$.subscribe({
        next: (boletos) => console.log('✅ Respuesta de API:', boletos),
        error: (err) => console.error('❌ Error al llamar API:', err)
      });

      return request$;
    } else {
      // 💾 NO PREMIUM → desde LocalStorage
      console.log(`💾 [Local] Cargando boletos de sorteo ${sorteoId}...`);
      const raw = localStorage.getItem(`boletos-${sorteoId}`);
      const boletos: Boleto[] = raw ? JSON.parse(raw) : [];

      console.log(`📦 Boletos cargados localmente: ${boletos.length}`, boletos);
      return of(boletos);
    }
  } catch (e) {
    console.error('❌ Error al obtener boletos:', e);
    return of([]);
  }
}


  apartarBoleto(boleto: Boleto, nombre: string, telefono: string): Observable<any> {
    const usuario = JSON.parse(localStorage.getItem('estadoCuenta') || '{}');
    const esPremium = usuario?.plan === 'premium';
alert(usuario)
    if (esPremium) {
      // 🚀 PREMIUM → Guardar en API
      return this.http.post(`${this.apiUrl}/apartar-lote`, {
        nombre,
        telefono,
        boletos: [{ id: Number(boleto.id) }]
      });
    } else {
      // 💾 FREE/GUEST → Guardar en LocalStorage
      const sorteoId = boleto.sorteo?.id;
      const key = `boletos-apartados-${sorteoId}`;
      const listaLocal = JSON.parse(localStorage.getItem(key) || '[]');

      listaLocal.push({
        nombre,
        telefono,
        boleto,
        fecha: new Date().toISOString()
      });

      localStorage.setItem(key, JSON.stringify(listaLocal));

      console.log(`💾 Boleto guardado localmente en clave: ${key}`);
      return of({ status: 'local', mensaje: 'Guardado en localStorage' });
    }
  }
}
