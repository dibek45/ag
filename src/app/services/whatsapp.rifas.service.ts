import { ApplicationRef, ComponentRef, Injectable, Injector, createComponent, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectBoletosSeleccionados } from '../state/boleto/boleto.selectors';
import { take } from 'rxjs/operators';
import { WhatsAppModalComponent } from './whatsapp-modal.component';
import * as BoletoActions from '../state/boleto/boleto.actions';
import { Boleto } from '../state/boleto/boleto.model';
import { BoletoSyncService } from '../sockets/boleto-sync.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppRIfasService {
  private store = inject(Store);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private  numeroWhatsApp = '0';
  private  cuentaSTP = '728969000032810021';
private syncService = inject(BoletoSyncService); // Añade esto arriba si no lo tienes

confirmarApartadoDeBoletos(boletos: Boleto[]): void {
  const modalRef = createComponent(WhatsAppModalComponent, {
    environmentInjector: this.appRef.injector,
  });

  modalRef.instance.confirmado.subscribe(({ nombre, telefono }) => {
    this.appRef.detachView(modalRef.hostView);
    modalRef.location.nativeElement.remove();

    if (!boletos.length) {
      alert('❌ No hay boletos seleccionados.');
      return;
    }

this.syncService.telefonoTemporalComprador = telefono; // 👈🔥 ¡Aquí se guarda tu número temporal!
this.apartarLoteDesdeFrontend(nombre, telefono, boletos);
  });

  modalRef.instance.cancelado.subscribe(() => {
    this.appRef.detachView(modalRef.hostView);
    modalRef.location.nativeElement.remove();
  });

  this.appRef.attachView(modalRef.hostView);
  document.body.appendChild(modalRef.location.nativeElement);
}



private apartarLoteDesdeFrontend(nombre: string, telefono: string, boletos: Boleto[]): void {
  if (!boletos.length) {
    alert('❌ No hay boletos para apartar.');
    return;
  }

  const sorteo = boletos[0]?.sorteo;
  if (!sorteo?.id) {
    console.error('❌ No se encontró el ID del sorteo.');
    return;
  }

  const numeroDueño = sorteo.numeroWhatsApp || '521XXXXXXXXXX';
  this.numeroWhatsApp = numeroDueño;

  const payload = {
    nombre,
    telefono,
    boletos: boletos.map(b => ({ id: Number(b.id) }))
  };

  fetch('https://api.sorteos.sa.dibeksolutions.com/boleto/apartar-lote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    .then(res => {
      console.log('✅ Apartado realizado:', res);

      // 🔹 Marcar como ocupados en local y store
      this.marcarComoOcupados(
        sorteo.id, // aquí ya es seguro porque validamos antes
        boletos.map(b => Number(b.id)),
        {
          id: Date.now(),
          nombre,
          telefono,
          email: '',
          createdAt: new Date().toISOString()
        }
      );

      // 📄 Crear lista de boletos para mensaje
      const lista = boletos
        .map(b => `• Número: ${String(b.numero).padStart(2, '0')}`)
        .join('\n');

      const precioUnitario = boletos[0]?.precio || sorteo.costoBoleto || 0;
      const total = precioUnitario * boletos.length;

      const mensaje = `
🎉 *${sorteo.nombre?.toUpperCase() || 'SORTEO'}* 🎉

👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}

🎟️ *Boletos apartados:*
${lista}

💰 *Total a pagar:* $${total} MXN  
(Cada boleto cuesta $${precioUnitario} MXN)

🏦 *Cuenta STP:* ${this.cuentaSTP}  
Banco: STP  
A nombre de: Sorteos SA

📅 *Fecha del sorteo:* ${sorteo.fecha || 'Pendiente'}

🎁 *BONO DE $1000 PESOS EXTRA:*  
¡Comparte esta rifa y si alguien compra gracias a ti, participas por un bono de $1000 pesos adicionales!

📸 Envía tu comprobante de pago por este medio para validar tu participación.

¡Gracias y mucha suerte! 🍀`;

      this.enviarMensaje(this.numeroWhatsApp, mensaje);

      // 🧹 Deseleccionar boletos
this.store.dispatch(BoletoActions.resetSeleccion({ sorteoId: sorteo.id }));
    })
    .catch(err => {
      console.error('❌ Error al apartar boletos:', err);
      alert('Error al apartar los boletos. Intenta de nuevo.');
    });
}




  abrirModalYEnviarUnBoleto(boleto: Boleto): Promise<Boleto | null> {
    return new Promise((resolve) => {
      const modalRef = createComponent(WhatsAppModalComponent, {
        environmentInjector: this.appRef.injector,
      });

      modalRef.instance.confirmado.subscribe(({ nombre, telefono }) => {
        this.appRef.detachView(modalRef.hostView);
        modalRef.location.nativeElement.remove();

        const boletoActualizado: Boleto = {
          ...boleto,
          estado: 'ocupado',
          comprador: {
            id: Date.now(),
            nombre,
            telefono,
            email: '',
            createdAt: new Date().toISOString(),
          },
        };

        resolve(boletoActualizado);
      });

      modalRef.instance.cancelado.subscribe(() => {
        this.appRef.detachView(modalRef.hostView);
        modalRef.location.nativeElement.remove();
        resolve(null);
      });

      this.appRef.attachView(modalRef.hostView);
      document.body.appendChild(modalRef.location.nativeElement);
    });
  }

  public apartarUnBoleto(nombre: string, telefono: string, boleto: Boleto): void {
    fetch('https://api.sorteos.sa.dibeksolutions.com/boleto/apartar-lote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        telefono,
        boletos: [{ id: Number(boleto.id) }],
      }),
    })
      .then(res => res.json())
      .then(res => {
        console.log('✅ Boleto apartado en backend:', res);
        this.enviarUnSoloBoleto(nombre, telefono, boleto);
      })
      .catch(err => {
        console.error('❌ Error al apartar el boleto:', err);
        alert('Error al apartar el boleto. Intenta de nuevo.');
      });
  }
private enviarUnSoloBoleto(nombre: string, telefono: string, boleto: Boleto): void {
  const precio = boleto.precio || boleto.sorteo?.costoBoleto || 0;
  const total = precio;
  const numeroFormateado = String(boleto.numero).padStart(2, '0');
  const sorteo = boleto.sorteo;

  const mensaje = `
🎉 *${sorteo?.nombre?.toUpperCase() || 'SORTEO'}* 🎉

👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}

🎟️ *Boleto apartado:*
• Número: ${numeroFormateado}

💰 *Total a pagar:* $${total} MXN  
(Cada boleto cuesta $${precio} MXN)

🏦 *Cuenta STP:* ${this.cuentaSTP}  
Banco: STP  
A nombre de: Sorteos SA

📅 *Fecha del sorteo:* ${sorteo?.fecha || 'Pendiente'}

🎁 *BONO DE $1000 PESOS EXTRA:*  
¡Comparte esta rifa y si alguien compra gracias a ti, participas por un bono de $1000 pesos adicionales!

📸 Envía tu comprobante de pago por este medio para validar tu participación.

¡Gracias y mucha suerte! 🍀`;

  this.enviarMensaje(this.numeroWhatsApp, mensaje);
}


  private enviarMensaje(numero: string, mensaje: string) {
    const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }



  private actualizarBoletosLocalYStore(
  sorteoId: number,
  updater: (b: Boleto) => Boleto
): void {
  const baseKey = `boletos-${sorteoId}`;
  let boletosBase: Boleto[] = JSON.parse(localStorage.getItem(baseKey) || '[]');

  if (boletosBase.length === 0) {
    console.warn(`⚠ No había boletos en ${baseKey}, no se pudo actualizar en local.`);
    return;
  }

  const actualizados = boletosBase.map(updater);
  localStorage.setItem(baseKey, JSON.stringify(actualizados));

  console.log(`📝 Base de boletos actualizada (${baseKey}):`, actualizados);

  this.store.dispatch(BoletoActions.loadBoletosSuccess({ sorteoId, boletos: actualizados }));
}

private marcarComoOcupados(
  sorteoId: number,
  ids: number[],
  comprador: { id: number; nombre: string; telefono: string; email?: string; createdAt?: string }
): void {
  const setIds = new Set(ids.map(Number));

  this.actualizarBoletosLocalYStore(sorteoId, (b) =>
    setIds.has(Number(b.id))
      ? {
          ...b,
          estado: 'ocupado',
          comprador: {
            ...comprador,
            email: comprador.email ?? '',
            createdAt: comprador.createdAt ?? new Date().toISOString()
          }
        }
      : b
  );
}

}
