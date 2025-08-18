import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BtnRegresarComponent } from '../../../shared/btn-regresar/btn-regresar.component';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Store } from '@ngrx/store';
import * as BoletoActions from '../../../state/boleto/boleto.actions'; // ajusta la ruta si difiere
import * as SorteoActions from '../../../state/sorteo/sorteo.actions'; // ajusta la ruta si difiere
import { ModalSimpleService } from './modal/modal-simple.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, BtnRegresarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login-component.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  modoRegistro = false; // false = Iniciar sesión, true = Registrarse

  constructor(private http: HttpClient, private router: Router,  private store: Store,
    private modalService: ModalSimpleService
  ) {}




usarSinRegistrarse() {
  const hayAvance = !!localStorage.getItem('sorteos');
  const esInvitado = localStorage.getItem('estadoCuenta') === 'invitado';

  if (hayAvance && esInvitado) {
    Swal.fire({
      title: 'Ya existe un avance',
      text: '¿Quieres continuar donde lo dejaste o empezar de nuevo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Nuevo'
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Continuar → no hacemos nada
        this.router.navigate(['/home']);
      } else {
        // ❌ Nuevo → limpiar todo
        this.resetInvitado();
      }
    });
  } else {
    // Si no hay avance o no es invitado, simplemente limpiar
    this.resetInvitado();
  }
}

private resetInvitado() {
  // 1️⃣ Limpiar todo el localStorage menos lo necesario
  localStorage.clear();
  localStorage.setItem('estadoCuenta', 'invitado');
  localStorage.setItem('nombreUsuario', 'Invitado');

  // 2️⃣ Limpiar el store de Redux
  this.store.dispatch(BoletoActions.clearBoletos());
  this.store.dispatch(SorteoActions.clearSorteos());

  // 3️⃣ Redirigir al home
  this.router.navigate(['/home']);
}

onSubmit(f: NgForm) {
  if (!f.valid) return;

  const esPremium = this.username.endsWith('@dibeksolutions.com');

  this.http.post<string>(
    'https://api.sorteos.sa.dibeksolutions.com/auth/login',
    { email: this.username, password: this.password },
    { responseType: 'text' as 'json' }
  ).subscribe({
    next: (token) => {
      localStorage.setItem('token', token);

      try {
        const decoded: any = jwtDecode(token);

        localStorage.setItem('nombreUsuario', decoded?.nombre || '');

        if (esPremium) {
          localStorage.setItem('estadoCuenta', 'premium'); // 👈 Premium
        } else {
          localStorage.setItem('estadoCuenta', 'conCuenta'); // 👈 Cuenta normal
        }

        if (decoded?.sorteos?.length) {
          const sorteosCompletos = decoded.sorteos.map((id: number) => ({
            id,
            nombre: `Sorteo ${id}`,
            boletos: [],
            recaudado: 0,
            porRecaudar: 0,
            progresoVentas: [],
            fechaSorteo: new Date(),
            topBuyers: [],
            topSellers: [],
          }));
          localStorage.setItem('sorteos', JSON.stringify(sorteosCompletos));
        }
      } catch (err) {
        console.error('❌ Error decodificando token', err);
      }

      this.router.navigate(['/home']);
    },
    error: (err) => {
      console.error('❌ Error al iniciar sesión:', err);
      alert('Error al iniciar sesión');
    }
  });
}

  toggleModo() {
    this.modoRegistro = !this.modoRegistro;
  }
}
