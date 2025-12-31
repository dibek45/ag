import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppState } from '../../../state/app.state';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../state/auth/auth.actions';

@Component({
  selector: 'app-menu-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.scss']
})
export class MenuSettingsComponent {

    @Output() cerrar = new EventEmitter<void>();
    agendaOpen = false;
    finanzasOpen = false;


  constructor(private router: Router,      private store: Store<AppState>,
  ){

  }

toggleAgenda() {
  this.agendaOpen = !this.agendaOpen;
}

toggleFinanzas() {
  this.finanzasOpen = !this.finanzasOpen;
}

goToSorteo() {
      this.router.navigate(['/home']);

}



  onCerrar() {
    this.cerrar.emit();
  }

logout() {
  this.store.dispatch(AuthActions.logout());

  this.cerrar.emit();
}


}
