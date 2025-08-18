import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent {
  @Input() title: string = '';
  @Input() icon: string = 'help_outline';

  @Output() helpClicked = new EventEmitter<void>();
  @Input() backgroundColor?: string; // <-- Nuevo input opcional

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

  onHelpClick() {
    this.helpClicked.emit();
  }
}
