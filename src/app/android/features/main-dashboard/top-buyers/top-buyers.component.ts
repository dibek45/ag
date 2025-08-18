import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-top-buyers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-buyers.component.html',
  styleUrl: './top-buyers.component.scss'
})
export class TopBuyersComponent {
  @Input() buyers: { nombre: string; totalBoletos: number; telefono?: string }[] = [];

  modalVisible = false;

  openModal() {
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  get top10() {
    return this.buyers.slice(0, 10);
  }

  whatsappLink(phone?: string): string {
    return phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : '#';
  }
}
