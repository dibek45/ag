import { Sorteo } from "../sorteo/sorteo.model";

export interface Boleto {
  id: string;
  numero: string;
  precio: number;
  estado: 'disponible' | 'seleccionado' | 'ocupado' | 'pagado';
  metodoPago: string | null;
  fechaCompra: string | null;
  compradorId: number;
  vendedorId: number | null;
  comprador: Comprador;
  vendedor: Vendedor | null;
    sorteo?: Sorteo; // ✅ esto agrega compatibilidad con el HTML

}

export interface Comprador {
  id: number;
  nombre: string;
  email?: string;
  telefono: string;
  createdAt: string;
}



export interface Vendedor {
  id: number;
  nombre: string;
}
