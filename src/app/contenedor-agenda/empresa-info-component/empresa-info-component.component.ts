import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Empresa } from '../../state/empresa/empresa.model';

@Component({
  selector: 'app-empresa-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empresa-info-component.component.html',
  styleUrl: './empresa-info-component.component.scss'
})
export class EmpresaInfoComponent {
  @Input() empresa!: Partial<Empresa> & { logoUrl?: string; telefono?: string; email?: string };
}
