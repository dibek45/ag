import { ApplicationRef, Injectable, Injector, createComponent, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Boleto } from '../state/boleto/boleto.model';
import { WhatsAppModalComponent } from './whatsapp-modal.component';
import * as BoletoActions from '../state/boleto/boleto.actions';
import { BoletoSyncService } from '../sockets/boleto-sync.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private store = inject(Store);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private numeroWhatsApp = '0';
  private cuentaSTP = '728969000032810021';
  private syncService = inject(BoletoSyncService);

  /**
   * Abrir modal para confirmar apartado de varios boletos
   */
 confirmarApartadoDeBoletos(boletos: Boleto[], sorteoId: number): void {
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

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esPremium = usuario?.plan === 'premium';
    this.syncService.telefonoTemporalComprador = telefono;

    if (esPremium) {
      // 🚀 PREMIUM → Guardar en API
      this.apartarLoteDesdeFrontend(nombre, telefono, boletos, sorteoId);
    } else {
      // 💾 FREE/GUEST → Guardar con información de sorteo
      const sorteo = boletos[0]?.sorteo;
      const key = `boletos-apartados-${sorteoId}`;
      const listaLocal = JSON.parse(localStorage.getItem(key) || '[]');

      listaLocal.push({
        sorteo: {
          id: sorteo?.id,
          nombre: sorteo?.nombre,
          descripcion: sorteo?.descripcion,
          fecha: sorteo?.fecha,
          cierreVentas: sorteo?.cierreVentas,
          costoBoleto: sorteo?.costoBoleto,
          totalBoletos: sorteo?.totalBoletos,
          numeroWhatsApp: sorteo?.numeroWhatsApp,
          nombreEmpresa: sorteo?.nombreEmpresa,
          mensajeWhatsappInfo: sorteo?.mensajeWhatsappInfo
        },
        usuario: { nombre, telefono },
        boletos: boletos.map(b => ({
          id: b.id,
          numero: b.numero,
          precio: b.precio,
          estado: b.estado
        })),
        fecha: new Date().toISOString()
      });

      localStorage.setItem(key, JSON.stringify(listaLocal));

      // 🔹 Actualizar en local y store para que aparezcan ocupados de inmediato
      this.marcarComoOcupados(
        sorteoId,
        boletos.map(b => Number(b.id)),
        {
          id: Date.now(),
          nombre,
          telefono,
          email: '',
          createdAt: new Date().toISOString()
        }
      );

      this.clearSeleccion(sorteoId);

      console.log(`💾 Guardado en localStorage con clave: ${key}`);
      const verificacion = JSON.parse(localStorage.getItem(key) || '[]');
      console.log(`📦 Verificación después de guardar (${key}):`, verificacion);
      alert('✅ Boletos guardados localmente con info de sorteo.');
    }
  });

  modalRef.instance.cancelado.subscribe(() => {
    this.appRef.detachView(modalRef.hostView);
    modalRef.location.nativeElement.remove();
  });

  this.appRef.attachView(modalRef.hostView);
  document.body.appendChild(modalRef.location.nativeElement);
}


  /**
   * Enviar apartado de varios boletos a backend y WhatsApp
   */
private apartarLoteDesdeFrontend(
  nombre: string,
  telefono: string,
  boletos: Boleto[],
  sorteoId: number
): void {
  const numeroDueño = boletos[0]?.sorteo?.numeroWhatsApp || '521XXXXXXXXXX';
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

      // Asegurar que boletos-${sorteoId} existe en localStorage
      const baseKey = `boletos-${sorteoId}`;
      let boletosBase: Boleto[] = JSON.parse(localStorage.getItem(baseKey) || '[]');
      if (boletosBase.length === 0) {
        boletosBase = boletos;
        localStorage.setItem(baseKey, JSON.stringify(boletosBase));
      }

      // 🔹 Actualizar en local y store
      this.marcarComoOcupados(
        sorteoId,
        boletos.map(b => Number(b.id)),
        {
          id: Date.now(),
          nombre,
          telefono,
          email: '',
          createdAt: new Date().toISOString()
        }
      );

      // Vaciar selección
      this.store.dispatch(BoletoActions.resetSeleccion({ sorteoId }));

      // Mensaje de WhatsApp
      const lista = boletos
        .map(b => `• Número: ${String(b.numero).padStart(2, '0')}`)
        .join('\n');

      const sorteo = boletos[0]?.sorteo;
      const precioUnitario = boletos[0]?.precio || sorteo?.costoBoleto || 0;
      const total = precioUnitario * boletos.length;

      const mensaje = `
🎉 *${sorteo?.nombre?.toUpperCase() || 'SORTEO'}* 🎉

👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}

🎟️ *Boletos apartados:*
${lista}

💰 *Total a pagar:* $${total} MXN  
(Cada boleto cuesta $${precioUnitario} MXN)

🏦 *Cuenta STP:* ${this.cuentaSTP}  
Banco: STP  
A nombre de: Sorteos SA

📅 *Fecha del sorteo:* ${sorteo?.fecha || 'Pendiente'}

🎁 *BONO DE $1000 PESOS EXTRA:*  
¡Comparte esta rifa y si alguien compra gracias a ti, participas por un bono de $1000 pesos adicionales!

📸 Envía tu comprobante de pago por este medio para validar tu participación.

¡Gracias y mucha suerte! 🍀`;

      this.enviarMensaje(this.numeroWhatsApp, mensaje);
    })
    .catch(err => {
      console.error('❌ Error al apartar boletos:', err);
      alert('Error al apartar los boletos. Intenta de nuevo.');
    });
}



  /**
   * Abrir modal para un solo boleto
   */
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

  /**
   * Apartar un solo boleto
   */
public apartarUnBoleto(nombre: string, telefono: string, boleto: Boleto): void {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const esPremium = usuario?.plan === 'premium';
  this.numeroWhatsApp = boleto.sorteo?.numeroWhatsApp || '521XXXXXXXXXX';

  if (esPremium) {
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

        // 🔹 Actualizar local y store inmediatamente
        this.marcarComoOcupados(
          Number(boleto.sorteo?.id),
          [Number(boleto.id)],
          {
            id: Date.now(),
            nombre,
            telefono,
            email: '',
            createdAt: new Date().toISOString()
          }
        );

        this.enviarUnSoloBoleto(nombre, telefono, boleto);
      })
      .catch(err => {
        console.error('❌ Error al apartar el boleto:', err);
        alert('Error al apartar el boleto. Intenta de nuevo.');
      });
  } else {
    // 💾 FREE/GUEST → Guardar con información de sorteo
    const sorteo = boleto.sorteo;
    const key = `boletos-apartados-${sorteo?.id}`;
    const listaLocal = JSON.parse(localStorage.getItem(key) || '[]');

    listaLocal.push({
      sorteo: {
        id: sorteo?.id,
        nombre: sorteo?.nombre,
        descripcion: sorteo?.descripcion,
        fecha: sorteo?.fecha,
        cierreVentas: sorteo?.cierreVentas,
        costoBoleto: sorteo?.costoBoleto,
        totalBoletos: sorteo?.totalBoletos,
        numeroWhatsApp: sorteo?.numeroWhatsApp,
        nombreEmpresa: sorteo?.nombreEmpresa,
        mensajeWhatsappInfo: sorteo?.mensajeWhatsappInfo
      },
      usuario: { nombre, telefono },
      boleto: {
        id: boleto.id,
        numero: boleto.numero,
        precio: boleto.precio,
        estado: boleto.estado
      },
      fecha: new Date().toISOString()
    });

    localStorage.setItem(key, JSON.stringify(listaLocal));
    console.log(`💾 Boleto guardado localmente en clave: ${key}`);

    // 🔹 Actualizar en local y store para que aparezca ocupado inmediatamente
    if (sorteo?.id) {
      this.marcarComoOcupados(
        Number(sorteo.id),
        [Number(boleto.id)],
        {
          id: Date.now(),
          nombre,
          telefono,
          email: '',
          createdAt: new Date().toISOString()
        }
      );

      this.clearSeleccion(Number(sorteo.id));
    }

    alert('✅ Boleto guardado localmente con info de sorteo.');
  }
}

  /**
   * Enviar mensaje WhatsApp para un solo boleto
   */
  private enviarUnSoloBoleto(nombre: string, telefono: string, boleto: Boleto): void {
    const precio = boleto.precio || boleto.sorteo?.costoBoleto || 0;
    const numeroFormateado = String(boleto.numero).padStart(2, '0');
    const sorteo = boleto.sorteo;

    const mensaje = `
🎉 *${sorteo?.nombre?.toUpperCase() || 'SORTEO'}* 🎉

👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}

🎟️ *Boleto apartado:*
• Número: ${numeroFormateado}

💰 *Total a pagar:* $${precio} MXN  
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

  /**
   * Abrir enlace de WhatsApp
   */
  private enviarMensaje(numero: string, mensaje: string) {
    const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }


  private clearSeleccion(sorteoId: number) {
  this.store.dispatch(BoletoActions.resetSeleccion({ sorteoId }));
}













// 🧩 Actualiza la base local y el store usando un updater puro
private actualizarBoletosLocalYStore(
  sorteoId: number,
  updater: (b: Boleto) => Boleto
): void {
  const baseKey = `boletos-${sorteoId}`;
  const boletosBase: Boleto[] = JSON.parse(localStorage.getItem(baseKey) || '[]');

  const actualizados = boletosBase.map(updater);

  localStorage.setItem(baseKey, JSON.stringify(actualizados));
  console.log(`📝 Base de boletos actualizada (${baseKey}):`, actualizados);

  // Refresca el store para que el grid se actualice al instante
  this.store.dispatch(BoletoActions.loadBoletosSuccess({ sorteoId, boletos: actualizados }));
}

// 🧩 Marca como ocupados un conjunto de IDs con un comprador dado
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
            email: comprador.email ?? '', // ✅ string vacío si no viene
            createdAt: comprador.createdAt ?? new Date().toISOString() // ✅ fecha actual si no viene
          }
        }
      : b
  );
}


}
