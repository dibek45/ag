import { Evento } from '../evento/evento.model';



export interface EmpresaState {
  empresas: Empresa[];
  loading: boolean;
  error: any;
}

export interface Empresa {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  eventos: Evento[];
}
