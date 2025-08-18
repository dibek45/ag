import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Boleto } from './boleto.model';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BoletoAdminService {
  private apiUrl = 'https://api.sorteos.sa.dibeksolutions.com/boleto/';

  constructor(private http: HttpClient) {}

  // -------------------------
  // PUBLIC
  // -------------------------

  getBoletos(sorteoId: number): Observable<Boleto[]> {
    const esPremium = this.isPremium();
    console.log(`⏳ getBoletos(${sorteoId}) [premium=${esPremium}]`);

    if (esPremium) {
      // 👑 PREMIUM → API
      return this.http.get<Boleto[]>(`${this.apiUrl}${sorteoId}`).pipe(
        tap(b => console.log('✅ API boletos:', b)),
        catchError(err => {
          console.error('❌ Error API getBoletos:', err);
          return throwError(() => err);
        })
      );
    }

    // 🟡 FREE/GUEST → LOCAL
    let boletos = this.loadLocalBoletos(sorteoId);

    if (!boletos || boletos.length === 0) {
      const sorteo = this.getLocalSorteo(sorteoId);
      if (!sorteo) {
        console.warn('⚠️ No encontré el sorteo en localStorage para generar boletos:', sorteoId);
        return of([]);
      }
      boletos = this.generateLocalBoletos(sorteoId, Number(sorteo.totalBoletos) || 0, Number(sorteo.costoBoleto) || 0, sorteo);
      this.saveLocalBoletos(sorteoId, boletos);
      console.log(`💾 Boletos locales generados: ${boletos.length}`);
    }

    return of(boletos);
  }

  /**
   * Aparta un boleto por número dentro de un sorteo.
   * PREMIUM → PATCH vía API / (si tienes endpoint de lote, úsalo).
   * FREE/GUEST → actualiza localStorage.
   */
  apartarBoleto(sorteoId: number, numero: string | number): Observable<Boleto> {
    const esPremium = this.isPremium();
    console.log(`⏳ apartarBoleto(sorteoId=${sorteoId}, numero=${numero}) [premium=${esPremium}]`);

    if (esPremium) {
      // Si tienes endpoint específico para apartar por numero+sorteo, úsalo.
      // Aquí hago una aproximación: primero obtengo el boleto por lista y luego PATCH.
      return this.http.get<Boleto[]>(`${this.apiUrl}${sorteoId}`).pipe(
        map(list => list.find(b => String(b.numero) === String(numero))),
        map(b => {
          if (!b) throw new Error('Boleto no encontrado en API');
          return b;
        }),
        switchMap(boleto =>
          this.http.patch<Boleto>(`${this.apiUrl}${boleto.id}`, { estado: 'ocupado' as const })
        ),
        tap(b => console.log('✅ API boleto apartado:', b))
      );
    }

    // 🟡 FREE/GUEST → LOCAL
    const boletos = this.loadLocalBoletos(sorteoId);
    const idx = boletos.findIndex(b => String(b.numero) === String(numero));
    if (idx === -1) return throwError(() => new Error('Boleto no encontrado (local)'));

    if (boletos[idx].estado !== 'disponible') {
      return throwError(() => new Error('Boleto no disponible (local)'));
    }

    boletos[idx] = { ...boletos[idx], estado: 'ocupado' as const };
    this.saveLocalBoletos(sorteoId, boletos);
    console.log('💾 Local boleto apartado:', boletos[idx]);

    return of(boletos[idx]);
  }

  /**
   * Actualiza estado de boleto.
   * PREMIUM → PATCH API
   * FREE/GUEST → actualiza localStorage
   */
  updateBoleto(boleto: Boleto): Observable<Boleto> {
    const esPremium = this.isPremium();
    console.log(`⏳ updateBoleto(id=${boleto.id}) [premium=${esPremium}] -> estado=${boleto.estado}`);

    if (esPremium) {
      const url = `${this.apiUrl}${boleto.id}`;
      return this.http.patch<Boleto>(url, { estado: boleto.estado }).pipe(
        tap(b => console.log('✅ API boleto actualizado:', b))
      );
    }

    // 🟡 FREE/GUEST
    const sorteoId = (boleto as any).sorteoId ?? boleto.sorteo?.id;
    if (!sorteoId) return throwError(() => new Error('Falta sorteoId para actualizar local'));

    const boletos = this.loadLocalBoletos(Number(sorteoId));
    const idx = boletos.findIndex(b => Number(b.id) === Number(boleto.id));
    if (idx === -1) return throwError(() => new Error('Boleto no encontrado (local)'));

    boletos[idx] = { ...boletos[idx], estado: boleto.estado };
    this.saveLocalBoletos(Number(sorteoId), boletos);
    console.log('💾 Local boleto actualizado:', boletos[idx]);

    return of(boletos[idx]);
  }

  // -------------------------
  // PRIVATE HELPERS (local)
  // -------------------------

  private isPremium(): boolean {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario?.plan === 'premium';
  }

  private localKey(sorteoId: number) {
    return `boletos-${sorteoId}`;
  }

  private loadLocalBoletos(sorteoId: number): Boleto[] {
    const raw = localStorage.getItem(this.localKey(sorteoId));
    return raw ? JSON.parse(raw) : [];
  }

  private saveLocalBoletos(sorteoId: number, boletos: Boleto[]) {
    localStorage.setItem(this.localKey(sorteoId), JSON.stringify(boletos));
  }

  private getLocalSorteo(sorteoId: number): any | null {
    const bases = [
      ...JSON.parse(localStorage.getItem('sorteos') || '[]'),
      ...JSON.parse(localStorage.getItem('sorteosLocales') || '[]')
    ];
    return bases.find((s: any) => Number(s.id) === Number(sorteoId)) || null;
  }

  private generateLocalBoletos(
    sorteoId: number,
    total: number,
    precio: number,
    sorteoObj?: any
  ): Boleto[] {
    const s = sorteoObj ?? this.getLocalSorteo(sorteoId);
    return Array.from({ length: total }, (_, i) => ({
      id: i + 1,
      numero: i + 1,
      estado: 'disponible',
      precio,
      // si tu modelo exige el objeto sorteo:
      sorteo: s,
      // si tu modelo solo usa sorteoId, puedes dejar también:
      // sorteoId
    } as unknown as Boleto));
  }
}
