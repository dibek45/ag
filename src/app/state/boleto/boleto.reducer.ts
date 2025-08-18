import { createReducer, on } from '@ngrx/store';
import * as BoletoActions from './boleto.actions';
import { Boleto } from './boleto.model';

export interface BoletoState {
  boletos: { [sorteoId: string]: Boleto[] };
  boletosSeleccionados: { [sorteoId: string]: Boleto[] };
}

export const initialState: BoletoState = {
  boletos: {},
  boletosSeleccionados: {},
};

export const boletoReducer = createReducer(
  initialState,

  // Cargar boletos por sorteo
  on(BoletoActions.loadBoletosSuccess, (state, { sorteoId, boletos }) => {
    const seleccionados = state.boletosSeleccionados[sorteoId] || [];

    const boletosActualizados = boletos.map(b => {
      const seleccionado = seleccionados.find(sel => sel.id === b.id);
      return seleccionado ? { ...b, estado: seleccionado.estado } : b;
    });

    // ✅ Ordenar siempre por número convertido a Number
    const ordenados = [...boletosActualizados].sort(
      (a, b) => Number(a.numero) - Number(b.numero)
    );

    return {
      ...state,
      boletos: {
        ...state.boletos,
        [sorteoId]: ordenados,
      },
    };
  }),

  // Agregar boleto
  on(BoletoActions.addBoleto, (state, { sorteoId, boleto }) => ({
    ...state,
    boletos: {
      ...state.boletos,
      [sorteoId]: [...(state.boletos[sorteoId] || []), boleto],
    },
  })),

  // Eliminar boleto
  on(BoletoActions.removeBoleto, (state, { sorteoId, boletoId }) => ({
    ...state,
    boletos: {
      ...state.boletos,
      [sorteoId]: (state.boletos[sorteoId] || []).filter(b =>Number(b.id) !== boletoId),
    },
    boletosSeleccionados: {
      ...state.boletosSeleccionados,
      [sorteoId]: (state.boletosSeleccionados[sorteoId] || []).filter(b =>Number(b.id)!== boletoId),
    },
  })),

  // Seleccionar boleto
  on(BoletoActions.addBoletoSeleccionado, (state, { sorteoId, boleto }) => {
    const seleccionados = state.boletosSeleccionados[sorteoId] || [];
    const yaExiste = seleccionados.some(b => b.id === boleto.id);

    return {
      ...state,
      boletos: {
        ...state.boletos,
        [sorteoId]: (state.boletos[sorteoId] || []).map(b =>
          b.id === boleto.id ? boleto : b
        ),
      },
      boletosSeleccionados: {
        ...state.boletosSeleccionados,
        [sorteoId]:
          boleto.estado === 'ocupado' || boleto.estado === 'seleccionado'
            ? yaExiste
              ? seleccionados
              : [...seleccionados, boleto]
            : seleccionados.filter(b => b.id !== boleto.id),
      },
    };
  }),

  // Deseleccionar y liberar
  on(BoletoActions.deseleccionarYLiberarBoleto, (state, { sorteoId, boletoId }) => {
    const boletosActualizados = (state.boletos[sorteoId] || []).map(b =>
      Number(b.id)=== boletoId ? { ...b, estado: 'disponible' as const } : b
    );

    const seleccionadosActualizados = (state.boletosSeleccionados[sorteoId] || []).filter(b => Number(b.id) !== boletoId);

    return {
      ...state,
      boletos: {
        ...state.boletos,
        [sorteoId]: boletosActualizados,
      },
      boletosSeleccionados: {
        ...state.boletosSeleccionados,
        [sorteoId]: seleccionadosActualizados,
      },
    };
  }),

  // Deseleccionar varios
  on(BoletoActions.deseleccionarBoletos, (state, { sorteoId, ids }) => ({
    ...state,
    boletosSeleccionados: {
      ...state.boletosSeleccionados,
      [sorteoId]: (state.boletosSeleccionados[sorteoId] || []).filter(b => !ids.includes(b.id)),
    },
  })),

  // Reset selección por sorteo
  on(BoletoActions.resetSeleccion, (state, { sorteoId }) => ({
    ...state,
    boletosSeleccionados: {
      ...state.boletosSeleccionados,
      [sorteoId]: [],
    },
  })),

  // Actualizar desde socket
  on(BoletoActions.updateBoletoEnStore, (state, { sorteoId, boleto }) => ({
    ...state,
    boletos: {
      ...state.boletos,
      [sorteoId]: (state.boletos[sorteoId] || []).map(b => b.id === boleto.id ? boleto : b),
    },
    boletosSeleccionados: {
      ...state.boletosSeleccionados,
      [sorteoId]: (state.boletosSeleccionados[sorteoId] || []).map(b => b.id === boleto.id ? boleto : b),
    },
  })),

  // src/app/state/boleto/boleto.reducer.ts (añade este handler)
on(BoletoActions.apartarLoteSuccess, (state, { sorteoId, boletos }) => {
  const base = state.boletos[sorteoId] || [];
  const porId = new Map(boletos.map(b => [String(b.id), b]));
  const fusionados = base.map(b => porId.get(String(b.id)) ?? b);

  return {
    ...state,
    boletos: {
      ...state.boletos,
      [sorteoId]: fusionados,
    },
    // si quieres mantener seleccionados o limpiarlos, tú decides:
    boletosSeleccionados: {
      ...state.boletosSeleccionados,
      [sorteoId]: boletos, // o [] si prefieres limpiar aquí
    },
  };
}),
  on(BoletoActions.clearBoletos, () => initialState)

);
