import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-next-raffle',
  standalone: true,
  imports: [],
  templateUrl: './next-raffle.component.html',
  styleUrl: './next-raffle.component.scss'
})
export class NextRaffleComponent {
  @Input() deadline!: Date;

  timeLeft: string = '';

  ngOnInit() {
    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    const now = new Date().getTime();
    const countTo = new Date(this.deadline).getTime();
    const distance = countTo - now;

    if (distance < 0) {
      this.timeLeft = 'Sorteo finalizado';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}
