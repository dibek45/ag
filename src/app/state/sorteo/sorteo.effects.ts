import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { isPlatformBrowser } from '@angular/common';
import * as SorteoActions from './sorteo.actions';
import { mergeMap, map, catchError, of } from 'rxjs';
import { EMPTY } from 'rxjs';
import { SorteoService } from './sorteo.service';

@Injectable()
export class SorteoEffects {
  private platformId = inject(PLATFORM_ID);
  private actions$ = inject(Actions);

  constructor(private sorteoService: SorteoService) {}

  private isPremium(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
      return usuario?.plan === 'premium';
    } catch { return false; }
  }

  private loadFromLocal() {
    try {
      const ls = localStorage.getItem('sorteos');
      const sorteos = ls ? JSON.parse(ls) : [];
      return of(SorteoActions.loadSorteosSuccess({ sorteos }));
    } catch (e) {
      console.error('❌ Error parseando sorteos locales:', e);
      return of({ type: '[Sorteo Local] Empty/ParseError' });
    }
  }

  loadSorteos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SorteoActions.loadSorteos),
      mergeMap(() => {
        if (!isPlatformBrowser(this.platformId)) {
          console.log('🚫 SSR: efecto de sorteos cancelado');
          return EMPTY;
        }

        // 🔒 Filtro por plan
        if (!this.isPremium()) {
          console.warn('👤 No premium: usando solo localStorage para sorteos.');
          return this.loadFromLocal();
        }

        // ⭐ Premium: API con fallback a local
        return this.sorteoService.getSorteos().pipe(
          map(sorteos => SorteoActions.loadSorteosSuccess({ sorteos })),
          catchError(err => {
            console.error('[Sorteo API] Error:', err);
            return this.loadFromLocal();
          })
        );
      })
    )
  );
}
