export interface Sorteo {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string | null;
  fecha: string;
  cierreVentas?: string;
  costoBoleto?: number;
  totalBoletos?: number;
  boletosVendidos?: number;
  estado?: 'activo' | 'cerrado' | 'finalizado';
  numeroWhatsApp?: string;
  nombreEmpresa?: string | null;
  linkfacebook?: string | null;
  numeroCuenta?: string | null;
  tipoBanco?: string | null;
  numeroDeSorteo?: string | null;
  mensajeWhatsappInfo?: string | null;
  mensajeWhatsappApartado?: string | null;
  mensajeWhatsappConfirmado?: string | null;
  mensajeWhatsappAnuncio?: string | null;

  // Relacional (opcional, solo si estás usando el objeto relacionado)
  cuentaBancariaId?: number | null;
  adminId: number;

  
}
