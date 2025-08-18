// modal-simple.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalSimpleService {
  confirmar(mensaje: string, opcion1: string, opcion2: string): Promise<'continuar' | 'nuevo'> {
    return new Promise(resolve => {
      const respuesta = window.confirm(`${mensaje}\n\nAceptar = ${opcion1}\nCancelar = ${opcion2}`);
      if (respuesta) {
        resolve('continuar');
      } else {
        resolve('nuevo');
      }
    });
  }
}
