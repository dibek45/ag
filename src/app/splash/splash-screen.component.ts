import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    const currentUrl = this.router.url;
    
    // ✅ Si no hay un número de sorteo en la URL (tipo /001), NO navegues
    const tieneSorteo = /^\/\d+/.test(currentUrl);

    setTimeout(() => {
      if (tieneSorteo) {
        this.router.navigateByUrl(currentUrl);
      }
    }, 1000);
  }
}

