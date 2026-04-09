import type {
  PeriodoFinanciero, PresupuestoAnual, AlertaFinanciera, DashboardFinancieroResultado,
} from '../types/fase3';

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function periodoVacio(mes: number, anio: number): PeriodoFinanciero {
  return {
    id: generarId(), mes, anio,
    ventas: 0, costoVentas: 0, gastosOperativos: 0,
    ebitda: 0, resultadoNeto: 0, caja: 0,
    deudaFinanciera: 0, cuentasCobrar: 0, cuentasPagar: 0,
    notasDirectorio: '',
  };
}

export function calcularDerivados(p: PeriodoFinanciero): PeriodoFinanciero {
  const margenBruto = p.ventas - p.costoVentas;
  const ebitda = margenBruto - p.gastosOperativos;
  return { ...p, ebitda };
}

export interface KPIs {
  margenBruto: number;
  margenEbitda: number;
  margenNeto: number;
  rotacionCobrar: number;
  rotacionPagar: number;
  endeudamiento: number;
}

export function calcularKPIs(p: PeriodoFinanciero): KPIs {
  const margenBruto = p.ventas > 0 ? Math.round((p.ventas - p.costoVentas) / p.ventas * 100) : 0;
  const margenEbitda = p.ventas > 0 ? Math.round(p.ebitda / p.ventas * 100) : 0;
  const margenNeto = p.ventas > 0 ? Math.round(p.resultadoNeto / p.ventas * 100) : 0;
  const rotacionCobrar = p.ventas > 0 ? Math.round(p.cuentasCobrar / (p.ventas / 30)) : 0;
  const rotacionPagar = p.costoVentas > 0 ? Math.round(p.cuentasPagar / (p.costoVentas / 30)) : 0;
  const endeudamiento = p.ventas > 0 ? Math.round(p.deudaFinanciera / p.ventas * 100) : 0;
  return { margenBruto, margenEbitda, margenNeto, rotacionCobrar, rotacionPagar, endeudamiento };
}

export function calcularVariacion(actual: number, anterior: number): { valor: number; positivo: boolean } {
  if (anterior === 0) return { valor: 0, positivo: true };
  const v = Math.round((actual - anterior) / Math.abs(anterior) * 100);
  return { valor: v, positivo: v >= 0 };
}

export function desvioVsPresupuesto(real: number, presupuesto: number): { valor: number; ok: boolean } {
  if (presupuesto === 0) return { valor: 0, ok: true };
  const v = Math.round((real - presupuesto) / Math.abs(presupuesto) * 100);
  return { valor: v, ok: v >= -10 };
}

export function generarAlertas(
  periodos: PeriodoFinanciero[],
  presupuesto: PresupuestoAnual | null,
): AlertaFinanciera[] {
  const alertas: AlertaFinanciera[] = [];
  if (periodos.length === 0) return alertas;

  const ultimo = periodos[periodos.length - 1];
  const anterior = periodos.length >= 2 ? periodos[periodos.length - 2] : null;
  const kpis = calcularKPIs(ultimo);

  if (ultimo.caja > 0 && ultimo.ventas > 0 && ultimo.caja < ultimo.ventas * 0.1) {
    alertas.push({
      id: generarId(), tipo: 'liquidez', severidad: 'critica', resuelta: false,
      fecha: new Date().toISOString().split('T')[0],
      titulo: 'Liquidez crítica',
      descripcion: `La caja representa menos del 10% de las ventas del período (${kpis.margenBruto}% margen bruto).`,
    });
  }

  if (ultimo.ebitda < 0) {
    alertas.push({
      id: generarId(), tipo: 'margen', severidad: 'critica', resuelta: false,
      fecha: new Date().toISOString().split('T')[0],
      titulo: 'EBITDA negativo',
      descripcion: 'El EBITDA del período es negativo. La empresa está consumiendo más de lo que genera operativamente.',
    });
  }

  if (anterior && anterior.ventas > 0) {
    const caida = Math.round((ultimo.ventas - anterior.ventas) / anterior.ventas * 100);
    if (caida < -15) {
      alertas.push({
        id: generarId(), tipo: 'desvio', severidad: 'advertencia', resuelta: false,
        fecha: new Date().toISOString().split('T')[0],
        titulo: `Caída de ventas ${Math.abs(caida)}% vs. mes anterior`,
        descripcion: `Las ventas cayeron de ${anterior.ventas.toLocaleString('es-AR')} a ${ultimo.ventas.toLocaleString('es-AR')}.`,
      });
    }
  }

  if (kpis.rotacionCobrar > 60) {
    alertas.push({
      id: generarId(), tipo: 'cobranza', severidad: 'advertencia', resuelta: false,
      fecha: new Date().toISOString().split('T')[0],
      titulo: `Cobranza extendida: ${kpis.rotacionCobrar} días promedio`,
      descripcion: 'Los clientes están tardando más de 60 días en pagar. Esto puede afectar la liquidez.',
    });
  }

  if (presupuesto && presupuesto.ventas > 0) {
    const ventasMensualesEsperadas = presupuesto.ventas / 12;
    const desvio = desvioVsPresupuesto(ultimo.ventas, ventasMensualesEsperadas);
    if (!desvio.ok) {
      alertas.push({
        id: generarId(), tipo: 'desvio', severidad: 'info', resuelta: false,
        fecha: new Date().toISOString().split('T')[0],
        titulo: `Ventas ${Math.abs(desvio.valor)}% por debajo del presupuesto mensual`,
        descripcion: `Presupuesto mensual estimado: ${Math.round(ventasMensualesEsperadas).toLocaleString('es-AR')}`,
      });
    }
  }

  return alertas;
}

export function generarInformePreReunion(
  periodos: PeriodoFinanciero[],
  presupuesto: PresupuestoAnual | null,
  empresaNombre: string,
  numeroReunion: number,
): string {
  if (periodos.length === 0) return 'Sin datos financieros cargados.';

  const ultimo = periodos[periodos.length - 1];
  const anterior = periodos.length >= 2 ? periodos[periodos.length - 2] : null;
  const kpis = calcularKPIs(ultimo);
  const mesNombre = MESES[ultimo.mes - 1];
  const alertas = generarAlertas(periodos, presupuesto);
  const variVentas = anterior ? calcularVariacion(ultimo.ventas, anterior.ventas) : null;

  return `INFORME FINANCIERO PARA DIRECTORIO
${empresaNombre.toUpperCase()} — Reunión N° ${numeroReunion}
Período: ${mesNombre} ${ultimo.anio}

———————————————————————————————————
INDICADORES CLAVE
———————————————————————————————————
Ventas:          $${ultimo.ventas.toLocaleString('es-AR')}${variVentas ? ` (${variVentas.positivo ? '+' : ''}${variVentas.valor}% vs mes ant.)` : ''}
Costo de ventas: $${ultimo.costoVentas.toLocaleString('es-AR')}
Margen bruto:    ${kpis.margenBruto}%
Gastos operativos: $${ultimo.gastosOperativos.toLocaleString('es-AR')}
EBITDA:          $${ultimo.ebitda.toLocaleString('es-AR')} (${kpis.margenEbitda}%)
Resultado neto:  $${ultimo.resultadoNeto.toLocaleString('es-AR')}
Caja:            $${ultimo.caja.toLocaleString('es-AR')}
Deuda financiera: $${ultimo.deudaFinanciera.toLocaleString('es-AR')}
Días de cobranza: ${kpis.rotacionCobrar} días
Días de pago:    ${kpis.rotacionPagar} días
${presupuesto ? `
———————————————————————————————————
DESVÍO VS. PRESUPUESTO ${presupuesto.anio}
———————————————————————————————————
Ventas YTD vs. presupuesto: ${desvioVsPresupuesto(periodos.reduce((s, p) => s + p.ventas, 0), presupuesto.ventas).valor > 0 ? '+' : ''}${desvioVsPresupuesto(periodos.reduce((s, p) => s + p.ventas, 0), presupuesto.ventas).valor}%
EBITDA YTD vs. presupuesto: ${desvioVsPresupuesto(periodos.reduce((s, p) => s + p.ebitda, 0), presupuesto.ebitda).valor > 0 ? '+' : ''}${desvioVsPresupuesto(periodos.reduce((s, p) => s + p.ebitda, 0), presupuesto.ebitda).valor}%
` : ''}
${alertas.length > 0 ? `———————————————————————————————————
ALERTAS (${alertas.length})
———————————————————————————————————
${alertas.map(a => `⚠ ${a.titulo}\n  ${a.descripcion}`).join('\n')}
` : '———————————————————————————————————\nSin alertas críticas este período.\n'}
${ultimo.notasDirectorio ? `———————————————————————————————————\nNOTAS PARA EL DIRECTORIO\n———————————————————————————————————\n${ultimo.notasDirectorio}\n` : ''}
Informe generado por Directorio AR.
`;
}
