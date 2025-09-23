import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Empresa } from './empresa.model';
import { Evento } from '../evento/evento.model';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  // 🔹 Empresas sin eventos de inicio
  private mockEmpresas: Empresa[] = [
    {
      id: 1,
      nombre: 'Nails Glam',
      direccion: 'Calle 123',
      telefono: '555-1234',
      eventos: []
    },
    {
      id: 2,
      nombre: 'Barbería Estilo',
      direccion: 'Av. Central',
      telefono: '555-9876',
      eventos: []
    }
  ];

  // 🔹 Eventos separados por empresa
  private mockEventos: Record<number, Evento[]> = {
    1: [
      {
        id: 101,
        titulo: 'Manicure básico',
        fecha: '2025-09-24',
        descripcion: 'Servicio de manicura básica',
        duracion: 60,
        citas: [],
        admin: {
          id: 1,
          nombre: 'Admin Nails',
          email: 'nails@glam.com',
          disponibilidades: []
        },
        servicios: [
          {
            id: 1,
            nombre: 'Manicure',
            descripcion: 'Básico',
            precio: 200,
            duracionMin: 60
          }
        ]
      },
      {
        id: 102,
        titulo: 'Pedicure deluxe',
        fecha: '2025-09-25',
        descripcion: 'Servicio de pedicura deluxe',
        duracion: 90,
        citas: [],
        admin: {
          id: 1,
          nombre: 'Admin Nails',
          email: 'nails@glam.com',
          disponibilidades: []
        },
        servicios: [
          {
            id: 2,
            nombre: 'Pedicure',
            descripcion: 'Deluxe',
            precio: 300,
            duracionMin: 90
          }
        ]
      }
    ],
    2: [
      {
        id: 201,
        titulo: 'Corte de cabello',
        fecha: '2025-09-26',
        descripcion: 'Corte con estilo clásico',
        duracion: 45,
        citas: [],
        admin: {
          id: 2,
          nombre: 'Admin Barber',
          email: 'barber@estilo.com',
          disponibilidades: []
        },
        servicios: [
          {
            id: 3,
            nombre: 'Corte',
            descripcion: 'Clásico',
            precio: 150,
            duracionMin: 45
          }
        ]
      }
    ]
  };

  // 🔹 Devuelve lista de empresas sin eventos
  getEmpresas() {
    return of(this.mockEmpresas).pipe(delay(500)); // simula API call
  }

  // 🔹 Devuelve eventos de la empresa según ID
  getEventosByEmpresa(empresaId: number) {
    return of(this.mockEventos[empresaId] ?? []).pipe(delay(500));
  }
}
