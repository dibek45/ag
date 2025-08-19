export interface Disponibilidad {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface Admin {
  id: number;
  nombre: string;
  email: string;
  disponibilidades: Disponibilidad[];
}

export interface Cita {
  id: number;
  nombreCliente: string;
  telefonoCliente: string;
  fecha: string;
  hora: string;
  estado: string;
  eventoId: number;
}

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  duracion: number;
  citas: Cita[];
  admin: Admin;
}
