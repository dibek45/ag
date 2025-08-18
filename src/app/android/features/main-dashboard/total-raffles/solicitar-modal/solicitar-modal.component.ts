import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sorteo } from '../../../../../state/sorteo/sorteo.model';
import { SorteoSyncService } from '../../../services/sorteo-sync.service';

@Component({
  selector: 'app-solicitar-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-modal.component.html',
  styleUrls: ['./solicitar-modal.component.scss']
})
export class SolicitarModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  step = 0;

  form: any = {};

  constructor(private sorteoSync: SorteoSyncService) {
    // Inicializamos con valores por defecto al cargar el componente
    this.setDefaultValues();
  }

  private formatFecha(valor: string) {
    if (!valor) return '';
    const fecha = new Date(valor);
    return isNaN(fecha.getTime()) ? valor : fecha.toISOString().slice(0, 16);
  }

  formSteps = [
    {
      label: '¿Cómo se llama el sorteo?',
      description: 'Dale un nombre llamativo a tu sorteo para que tus clientes lo identifiquen fácilmente.',
      type: 'text',
      placeholder: 'Ej: Sorteo de 5 mil pesos',
      key: 'nombreSorteo',
      image: 'https://cdn-icons-png.flaticon.com/512/1011/1011863.png'
    },
    {
      label: 'Agrega una descripción llamativa:',
      description: 'Explica en pocas palabras qué ofrece tu sorteo o cómo se puede ganar.',
      type: 'textarea',
      placeholder: 'Ej: ¡Participa por un bono extra si compartes!',
      key: 'descripcion',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    },
    {
      label: '¿Cuándo inicia el sorteo?',
      description: 'Selecciona la fecha en que se comenzará a participar en el sorteo.',
      type: 'date',
      key: 'fecha',
      image: 'https://cdn-icons-png.flaticon.com/512/747/747310.png'
    },
    {
      label: '¿Cuándo se cierra el sorteo?',
      description: 'Elige la fecha límite para que los usuarios puedan participar.',
      type: 'datetime-local',
      key: 'cierreVentas',
      image: 'https://cdn-icons-png.flaticon.com/512/747/747310.png'
    },
    {
      label: '¿Cuánto cuesta cada boleto?',
      description: 'Define el costo que los clientes deberán pagar por cada boleto.',
      type: 'number',
      key: 'costoBoleto',
      image: 'https://cdn-icons-png.flaticon.com/512/1170/1170576.png'
    },
    {
      label: '¿Número de boletos?',
      description: 'Especifica cuántos boletos se imprimirán para este sorteo.',
      type: 'number',
      key: 'totalBoletos',
      image: 'https://cdn-icons-png.flaticon.com/512/3828/3828845.png'
    },
    {
      label: 'Mensaje por WhatsApp al apartar un boleto',
      description: 'Este mensaje se enviará automáticamente cuando alguien aparte un boleto.',
      type: 'textarea',
      key: 'mensajeWhatsappApartado',
      placeholder: 'Ej: Te hemos apartado tus boletos. Confírmalos pronto.',
      image: 'https://cdn-icons-png.flaticon.com/512/5968/5968841.png'
    },
    {
      label: 'Mensaje por WhatsApp tras la compra',
      description: 'Este mensaje se enviará automáticamente cuando se confirme la compra.',
      type: 'textarea',
      key: 'mensajeWhatsappConfirmado',
      placeholder: 'Ej: ¡Gracias por participar!',
      image: 'https://cdn-icons-png.flaticon.com/512/2951/2951143.png'
    },
    {
      label: 'Mensaje si el cliente pide más información',
      description: 'Mensaje automatizado para responder consultas por WhatsApp.',
      type: 'textarea',
      key: 'mensajeWhatsappInfo',
      placeholder: 'Ej: Hola 👋 te paso la información completa del sorteo...',
      image: 'https://cdn-icons-png.flaticon.com/512/3524/3524659.png'
    }
  ];

  get totalSteps() {
    return this.formSteps.length;
  }

  cerrar() {
    this.closed.emit();
  }

  next() {
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prev() {
    if (this.step > 0) this.step--;
  }

  // ✅ Método para poner valores por defecto en el formulario
  setDefaultValues() {
    this.form = {
      nombreSorteo: 'Sorteo de prueba',
      descripcion: 'Este es un sorteo de ejemplo con datos de prueba.',
      fecha: this.formatFecha(new Date().toISOString()),
      cierreVentas: this.formatFecha(new Date(Date.now() + 86400000).toISOString()), // mañana
      costoBoleto: 50,
      totalBoletos: 100,
      mensajeWhatsappApartado: 'Tus boletos han sido apartados, confirma pronto.',
      mensajeWhatsappConfirmado: '¡Gracias por tu compra!',
      mensajeWhatsappInfo: 'Aquí tienes toda la info del sorteo...'
    };
  }

  // ✅ Método para limpiar el formulario
  clearForm() {
    this.form = {};
  }

  confirmar() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esPremium = usuario?.plan === 'premium';

    const nuevoSorteo: Sorteo = {
      id: Date.now(),
      adminId: usuario?.id || 0,
      nombre: this.form.nombreSorteo || '',
      descripcion: this.form.descripcion || '',
      fecha: this.formatFecha(this.form.fecha),
      cierreVentas: this.formatFecha(this.form.cierreVentas),
      costoBoleto: Number(this.form.costoBoleto) || 0,
      totalBoletos: Number(this.form.totalBoletos) || 0,
      mensajeWhatsappApartado: this.form.mensajeWhatsappApartado || '',
      mensajeWhatsappConfirmado: this.form.mensajeWhatsappConfirmado || '',
      mensajeWhatsappInfo: this.form.mensajeWhatsappInfo || '',
      numeroWhatsApp: '',
      nombreEmpresa: '',
    };

    if (esPremium) {
      const mensaje = encodeURIComponent(`📦 Nueva solicitud de sorteo:\n\n${JSON.stringify(nuevoSorteo, null, 2)}`);
      const numero = '4461796235';
      const link = `https://wa.me/52${numero}?text=${mensaje}`;
      window.open(link, '_blank');
    } else {
      const sorteos: Sorteo[] = JSON.parse(localStorage.getItem('sorteos') || '[]');
      sorteos.push(nuevoSorteo);
      localStorage.setItem('sorteos', JSON.stringify(sorteos));

      const total = Number(nuevoSorteo.totalBoletos) || 0;
      const boletos = Array.from({ length: total }, (_, i) => ({
        id: i + 1,
        numero: i + 1,
        estado: 'disponible',
        precio: nuevoSorteo.costoBoleto,
        sorteo: nuevoSorteo
      }));
      localStorage.setItem(`boletos-${nuevoSorteo.id}`, JSON.stringify(boletos));
    this.closed.emit();
        this.sorteoSync.notificarActualizacion();

      alert('✅ Sorteo y boletos guardados localmente');

    }

    // 🔍 Traemos lo que quedó en localStorage
    console.log('📂 Sorteos en localStorage:', JSON.parse(localStorage.getItem('sorteos') || '[]'));


  }
}
