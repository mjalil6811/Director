'use client';

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo5Resultado } from '../types';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#111',
  },
  coverPage: {
    fontFamily: 'Helvetica',
    padding: 60,
    color: '#111',
    justifyContent: 'center',
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  coverSubtitle: {
    fontSize: 14,
    marginBottom: 32,
    color: '#444',
  },
  coverCompany: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  coverFooter: {
    fontSize: 9,
    color: '#888',
    marginTop: 60,
  },
  coverLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#534AB7',
    marginBottom: 32,
    marginTop: 32,
    width: 60,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  moduleTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#534AB7',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 9,
    color: '#666',
    width: 120,
    flexShrink: 0,
  },
  value: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  badge: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    padding: '3 8',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dimLabel: {
    fontSize: 9,
    width: 80,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginHorizontal: 6,
  },
  barFill: {
    height: 6,
    backgroundColor: '#534AB7',
    borderRadius: 3,
  },
  dimPct: {
    fontSize: 8,
    color: '#666',
    width: 28,
    textAlign: 'right',
  },
  recItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  recBullet: {
    fontSize: 9,
    color: '#534AB7',
    marginRight: 4,
    marginTop: 1,
  },
  recText: {
    fontSize: 9,
    color: '#444',
    flex: 1,
    lineHeight: 1.5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  profileName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  profileUrgency: {
    fontSize: 9,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#999',
  },
  spacer: {
    marginBottom: 16,
  },
  small: {
    fontSize: 9,
    color: '#555',
    marginBottom: 4,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  conteoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  conteoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  conteoNum: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  conteoLabel: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
});

interface PDFReportData {
  empresa: string;
  m1: Modulo1Resultado | null;
  m2: Modulo2Resultado | null;
  m3: Modulo3Resultado | null;
  m4frecuencia: string | null;
  m5: Modulo5Resultado | null;
  fecha: string;
}

const PERFIL_LABELS: Record<string, string> = {
  estratega: "Estratega",
  financiero: "Financiero",
  familiar: "Familiar",
  sector: "Experto sectorial",
  legal: "Legal",
  rrhh: "RRHH",
  digital: "Digital",
  inversor: "Inversor",
  control: "Control",
  crisis: "Crisis",
};

function Footer({ pageNum }: { pageNum: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Directorio AR — Diagnóstico de Gobierno Corporativo</Text>
      <Text style={styles.footerText}>{pageNum}</Text>
    </View>
  );
}

function PDFDocument({ data }: { data: PDFReportData }) {
  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>Directorio AR</Text>
        <Text style={styles.coverSubtitle}>Diagnóstico de Gobierno Corporativo</Text>
        <View style={styles.coverLine} />
        {data.empresa && (
          <>
            <Text style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>Empresa</Text>
            <Text style={styles.coverCompany}>{data.empresa}</Text>
          </>
        )}
        <Text style={styles.coverDate}>Fecha de generación: {data.fecha}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.coverFooter}>Desarrollado para el contexto empresarial argentino</Text>
      </Page>

      {/* Module 1 */}
      {data.m1 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionHeader}>Módulo 1 — ¿Necesitás un directorio?</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Puntuación:</Text>
              <Text style={styles.value}>{data.m1.porcentaje}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nivel:</Text>
              <Text style={styles.value}>{data.m1.nivel}</Text>
            </View>
          </View>

          <Text style={styles.moduleTitle}>Puntuación por dimensión</Text>
          <View style={styles.card}>
            {data.m1.scoresPorDimension.map(dim => (
              <View key={dim.nombre} style={styles.dimRow}>
                <Text style={styles.dimLabel}>{dim.nombre}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.round((dim.score / dim.max) * 100)}%` }]} />
                </View>
                <Text style={styles.dimPct}>{Math.round((dim.score / dim.max) * 100)}%</Text>
              </View>
            ))}
          </View>

          {data.m1.recomendaciones.length > 0 && (
            <>
              <Text style={styles.moduleTitle}>Recomendaciones</Text>
              <View style={styles.card}>
                {data.m1.recomendaciones.map((rec, i) => (
                  <View key={i} style={styles.recItem}>
                    <Text style={styles.recBullet}>→</Text>
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          <Footer pageNum={2} />
        </Page>
      )}

      {/* Module 2 */}
      {data.m2 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionHeader}>Módulo 2 — Clasificador de roles</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Perfil predominante:</Text>
              <Text style={styles.value}>{data.m2.perfil}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Respuestas correctas:</Text>
              <Text style={styles.value}>{data.m2.porcentaje}%</Text>
            </View>
          </View>

          <Text style={styles.moduleTitle}>Distribución de respuestas</Text>
          <View style={styles.conteoGrid}>
            {(['A', 'D', 'G', 'M'] as const).map(key => (
              <View key={key} style={styles.conteoBox}>
                <Text style={styles.conteoNum}>{data.m2!.conteos[key]}</Text>
                <Text style={styles.conteoLabel}>{key === 'A' ? 'Accionista' : key === 'D' ? 'Director' : key === 'G' ? 'Gerente' : 'Mezclado'}</Text>
              </View>
            ))}
          </View>

          {data.m2.tensiones.length > 0 && (
            <>
              <View style={styles.spacer} />
              <Text style={styles.moduleTitle}>Tensiones identificadas</Text>
              <View style={styles.card}>
                {data.m2.tensiones.map((t, i) => (
                  <Text key={i} style={styles.small}>
                    Pregunta {t.pregunta}: elegiste {t.elegido === 'A' ? 'Accionista' : t.elegido === 'D' ? 'Director' : 'Gerente'}, correcto era {t.correcto === 'A' ? 'Accionista' : t.correcto === 'D' ? 'Director' : 'Gerente'}
                  </Text>
                ))}
              </View>
            </>
          )}
          <Footer pageNum={3} />
        </Page>
      )}

      {/* Module 3 */}
      {data.m3 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionHeader}>Módulo 3 — Perfiles del directorio</Text>
          <Text style={[styles.small, { marginBottom: 12 }]}>Top 4 perfiles recomendados para tu directorio, ordenados por prioridad.</Text>
          {data.m3.topPerfiles.map((p, i) => (
            <View key={p.perfil} style={styles.card}>
              <View style={styles.profileRow}>
                <Text style={[styles.profileName, { marginRight: 8 }]}>
                  {i + 1}. {PERFIL_LABELS[p.perfil] ?? p.perfil}
                </Text>
                <Text style={styles.profileUrgency}>{p.urgencia} (score: {p.score})</Text>
              </View>
              <Text style={styles.small}>{p.descripcion}</Text>
            </View>
          ))}
          <Footer pageNum={4} />
        </Page>
      )}

      {/* Module 4 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionHeader}>Módulo 4 — Dinámica de reuniones</Text>
        <View style={styles.card}>
          <Text style={styles.moduleTitle}>Frecuencia recomendada</Text>
          <Text style={styles.value}>{data.m4frecuencia ?? 'No calculada'}</Text>
        </View>
        <Text style={styles.small}>
          La frecuencia se determina según el nivel de necesidad de gobierno corporativo identificado en el Módulo 1.
          A mayor complejidad, mayor es la frecuencia recomendada.
        </Text>
        <Footer pageNum={5} />
      </Page>

      {/* Module 5 */}
      {data.m5 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionHeader}>Módulo 5 — Relación directorio y gerencia</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={styles.value}>{data.m5.nivel}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Puntuación:</Text>
              <Text style={styles.value}>{data.m5.porcentaje}%</Text>
            </View>
          </View>
          <Text style={[styles.small, { marginTop: 8 }]}>
            Basado en 10 afirmaciones sobre la dinámica entre el directorio y la gerencia,
            valoradas como Sí (1), Parcial (0.5) y No (0).
          </Text>
          <Footer pageNum={6} />
        </Page>
      )}
    </Document>
  );
}

export async function generatePDF(data: PDFReportData): Promise<Blob> {
  const blob = await pdf(<PDFDocument data={data} />).toBlob();
  return blob;
}

export default PDFDocument;
