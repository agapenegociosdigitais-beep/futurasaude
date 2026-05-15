import { NextResponse } from 'next/server';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUserFromRequest, getBeneficiarioByUserId, unauthorizedResponse } from '@/lib/autorizacoes';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12, color: '#0a2a5e' },
  header: { marginBottom: 24 },
  logo: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  title: { fontSize: 18, marginBottom: 4 },
  section: { marginBottom: 12 },
  label: { fontSize: 10, color: '#666', marginBottom: 2 },
  value: { fontSize: 13, marginBottom: 8 },
  footer: { marginTop: 28, fontSize: 10, color: '#444' },
});

function formatDate(date: string | null) {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('pt-BR');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const beneficiario = await getBeneficiarioByUserId(user.id);
    if (!beneficiario) {
      return NextResponse.json({ message: 'Beneficiário não encontrado' }, { status: 404 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('autorizacoes')
      .select('*, beneficiarios(nome_completo, cpf)')
      .eq('id', id)
      .eq('beneficiario_id', beneficiario.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar autorização' }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ message: 'Autorização não encontrada' }, { status: 404 });
    }

    if (data.status !== 'aprovada') {
      return NextResponse.json({ message: 'PDF disponível apenas para autorizações aprovadas' }, { status: 400 });
    }

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>FUTURA SAÚDE</Text>
            <Text style={styles.title}>Autorização de Atendimento</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Protocolo</Text>
            <Text style={styles.value}>{data.protocolo}</Text>

            <Text style={styles.label}>Beneficiário</Text>
            <Text style={styles.value}>{data.beneficiarios?.nome_completo || beneficiario.nome_completo}</Text>

            <Text style={styles.label}>CPF</Text>
            <Text style={styles.value}>{data.beneficiarios?.cpf || beneficiario.cpf}</Text>

            <Text style={styles.label}>Tipo de atendimento</Text>
            <Text style={styles.value}>{data.tipo}</Text>

            <Text style={styles.label}>Especialidade / exame</Text>
            <Text style={styles.value}>{data.especialidade_ou_exame}</Text>

            <Text style={styles.label}>Validade</Text>
            <Text style={styles.value}>{formatDate(data.valida_ate)}</Text>
          </View>

          <Text style={styles.footer}>
            A Futura Saúde é uma rede de benefícios e não é operadora de plano de saúde regulamentada pela ANS. Esta autorização é válida até a data indicada.
          </Text>
        </Page>
      </Document>
    );

    const pdfBuffer = await pdf(doc).toBuffer();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="autorizacao-${data.protocolo}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Erro ao gerar PDF' }, { status: 500 });
  }
}
