import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-btn-regresar',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './btn-regresar.component.html',
  styleUrls: ['./btn-regresar.component.scss']
})
export class BtnRegresarComponent {
  @Input() url: string = '/';

  constructor(private router: Router) {}

  regresar() {
    if (this.url) {
      this.router.navigateByUrl(this.url);
    } else {
      history.back();
    }
  }
}
