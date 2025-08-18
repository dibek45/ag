// navigation.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly KEY = 'previousUrl';
  private currentUrl = '/';

  constructor(private router: Router) {
    // Set inicial (por si recargas en /#/home)
    this.currentUrl = this.router.url || '/';

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        pairwise()
      )
      .subscribe(([prev, curr]) => {
        const prevUrl = prev.urlAfterRedirects || prev.url;
        const currUrl = curr.urlAfterRedirects || curr.url;

        // guarda la anterior, y actualiza la actual
        localStorage.setItem(this.KEY, prevUrl || '/');
        this.currentUrl = currUrl || '/';
        // console.log('prev:', prevUrl, 'curr:', currUrl);
      });

    // Si no hay previa aún, deja algo razonable
    if (!localStorage.getItem(this.KEY)) {
      localStorage.setItem(this.KEY, this.currentUrl);
    }
  }

  getPreviousUrl(): string {
    return localStorage.getItem(this.KEY) || '/';
  }

  setPreviousUrl(url: string) {
    localStorage.setItem(this.KEY, url || '/');
  }
}
