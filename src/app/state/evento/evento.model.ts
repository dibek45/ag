export interface Disponibilidad {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface Admin {
  id: number;
  nombre: string;
    telefono?: string;                // 👈 nuevo campo

  email: string;
  disponibilidades: Disponibilidad[];
    servicios?: Servicio[]; // 👈 aquí agregas los servicios

}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number; // en minutos
}

export interface Cita {
  id: number;
  nombreCliente: string;
  clienteId:number
  telefonoCliente: string;
  fecha: string;
  hora: string;
  estado: string;
  eventoId: number;
  servicioId: number;   // FK
  servicio?: Servicio;  // relación opcional
}
export interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    duracion: number;
    citas: Cita[];
    admin: Admin;
    servicios: Servicio[]; // 🔹 un evento puede tener varios servicios
}
