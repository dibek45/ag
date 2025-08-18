import { ApplicationRef, ComponentRef, Injectable, Injector, createComponent, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { selectBoletosSeleccionados, selectBoletosSeleccionadosPorSorteo } from '../../../state/boleto/boleto.selectors';
import { Boleto } from '../../../state/boleto/boleto.model';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private store = inject(Store);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private readonly numeroWhatsApp = '0';
  private readonly cuentaSTP = '728969000032810021';




MEJORES_FRASES_SUERTE: string[] = [
  "LA SUERTE ES LOCA... Y A CUALQUIERA LE TOCA 🍀",
  "TE DESEO MUCHA SUERTE 🍃",
  "QUE TENGAS LA MEJOR DE LAS SUERTES 🙌🏽",
  "GRACIAS POR PARTICIPAR, SUERTE 🌀",
  "¡MUCHA SUERTE DESDE YA! 💪",
  "TIENES NÚMEROS POTENTES, MUCHA SUERTE ⚡",
  "VAMOS CON TODA LA SUERTE 💯",
  "CONFÍO EN TU SUERTE HOY 🧠🍀",
  "TU NÚMERO PUEDE SORPRENDERTE, ¡MUCHA SUERTE!",
  "UN EMPUJÓN DE SUERTE PARA TI 🚀",
  "EL QUE NO ARRIESGA NO GANA 🎲",
  "🍀¡GRACIAS POR PARTICIPAR EN NUESTRO SORTEO!🍀\n\nFAVOR DE VERIFICAR TUS BOLETOS QUE ESTÉN EN VERDE EN EL BUSCADOR DE BOLETOS EN EL SIGUIENTE LINK:\n👇🏻👇🏻👇🏻\nhttps://sorteos.sa.dibeksolutions.com/44/boletos\n\n🥠¡TE DESEAMOS MUCHA SUERTE!🍀"
];

enviarMensajeDeConsulta(nombre: string, telefono: string, sorteoId: number): void {
  this.store
    .select<Boleto[]>(selectBoletosSeleccionadosPorSorteo(sorteoId)) // ✅ factory returns Boleto[]
    .pipe(take(1))
    .subscribe((boletos: Boleto[]) => {
      const fraseAleatoria =
        this.MEJORES_FRASES_SUERTE[
          Math.floor(Math.random() * this.MEJORES_FRASES_SUERTE.length)
        ];

      const pagados = boletos.filter((b) => b.estado === 'pagado');
      const ocupados = boletos.filter((b) => b.estado === 'ocupado');

      const numerosPagados = pagados.map((b) => b.numero).join(', ') || 'Ninguno';
      const numerosOcupados = ocupados.map((b) => b.numero).join(', ') || 'Ninguno';

      const mensaje = `
🍀 *¡Gracias por participar, ${nombre || 'amig@'}!* 🍀

Puedes consultar tus boletos en el siguiente enlace:
🔎 https://sorteos.sa.dibeksolutions.com/${sorteoId}/buscar-boleto

🎫 *Números pagados:* ${numerosPagados}
🟡 *Apartados (aún no pagados):* ${numerosOcupados}

${fraseAleatoria}
      `;

      this.enviarMensaje(telefono, mensaje);
    });
}





  private enviarMensaje(numero: string, mensaje: string) {
  const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

}
