import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewToggleComponent } from './shared/view-toggle/view-toggle.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule, ViewToggleComponent],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  hideContent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/eventos')) {
      this.hideContent = true;
    }
  }

 
  goToToday() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  console.log('📅 Ir a hoy →', dateStr);

  this.router.navigate(['day', dateStr], { relativeTo: this.route }).then(
    (ok) => {
      console.log(ok ? '✅ Navegación completada (relativa).' : '❌ Falló la navegación.');
    },
    (err) => console.error('❌ Error navegando:', err)
  );
}



}
