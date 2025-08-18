import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-total-revenue',
  standalone:true,
  imports:[],
  templateUrl: './total-revenue.component.html',
  styleUrls: ['./total-revenue.component.scss']
})
export class TotalRevenueComponent {
  @Input() recaudado = 0;
  @Input() porRecaudar = 0;
}
