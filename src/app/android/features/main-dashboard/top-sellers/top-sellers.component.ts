import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-top-sellers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-sellers.component.html',
  styleUrl: './top-sellers.component.scss'
})
export class TopSellersComponent {
noomplement() {
alert("Aun no disponible")}
  @Input() sellers: any[] = []; // 👈 Esto es lo que Angular necesita

}
