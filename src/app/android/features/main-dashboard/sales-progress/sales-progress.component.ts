import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sales-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-progress.component.html',
  styleUrl: './sales-progress.component.scss'
})
export class SalesProgressComponent {
  @Input() progress: number[] = []; // 👈 clave

}
