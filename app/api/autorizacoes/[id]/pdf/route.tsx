import { NextResponse } from 'next/server';
import { pdf, Document, Page, Text, View, StyleSheet, Svg, Path, Circle, Rect, Line } from '@react-pdf/renderer';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUserFromRequest, getBeneficiarioByUserId, unauthorizedResponse } from '@/lib/autorizacoes';

const COLORS = {
  green: '#0b5d39',
  greenSoft: '#8bbd63',
  orange: '#f28c28',
  text: '#0d241a',
  muted: '#5f6d66',
  light: '#f3f7ef',
  border: '#dbe7d4',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
    fontSize: 12,
    color: COLORS.text,
    fontFamily: 'Helvetica',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  brandTextWrap: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: 1.4,
    color: COLORS.green,
    lineHeight: 1.05,
  },
  brandTitleAccent: {
    color: COLORS.orange,
  },
  brandSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 1.35,
    color: COLORS.text,
    letterSpacing: 0.7,
  },
  heroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderWidth: 6,
    borderColor: COLORS.green,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroLeft: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.orange,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: 900,
    color: COLORS.green,
    lineHeight: 1,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  heroRight: {
    width: 120,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    rowGap: 18,
  },
  infoCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#b7d19c',
    minHeight: 72,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    color: COLORS.greenSoft,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.text,
    lineHeight: 1.3,
  },
  legalBox: {
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: '#f4f7f0',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  legalText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.45,
    color: COLORS.text,
  },
  legalStrong: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 1.45,
    color: '#4a8f22',
    fontWeight: 800,
  },
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 14,
  },
  signatureBlock: {
    width: '56%',
    alignItems: 'center',
  },
  signatureScript: {
    fontSize: 26,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#9fb89a',
    marginBottom: 10,
  },
  signatureTitle: {
    fontSize: 15,
    color: COLORS.green,
    fontWeight: 700,
    marginBottom: 6,
  },
  signatureSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: COLORS.text,
    lineHeight: 1.4,
    letterSpacing: 0.4,
  },
  footerBar: {
    marginTop: 'auto',
    backgroundColor: COLORS.green,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 22,
  },
  footerAccent: {
    width: 300,
    height: 6,
    backgroundColor: COLORS.orange,
    borderRadius: 999,
    marginBottom: 14,
  },
  footerContacts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  footerContact: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
  },
  footerMission: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 1.4,
    textAlign: 'center',
  },
});

function formatDate(date: string | null) {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('pt-BR');
}

function BrandMark() {
  return (
    <Svg width="122" height="94" viewBox="0 0 122 94">
      <Path d="M18 71 C18 30, 36 12, 74 12 L94 12" stroke="#63a512" strokeWidth="16" fill="none" strokeLinecap="round" />
      <Path d="M92 12 L64 12 C46 12 34 22 34 37 C34 50 45 58 58 58 C70 58 82 61 82 73 C82 82 72 88 58 88 L26 88" stroke={COLORS.orange} strokeWidth="14" fill="none" strokeLinecap="round" />
      <Path d="M96 7 L96 23" stroke={COLORS.orange} strokeWidth="6" strokeLinecap="round" />
      <Path d="M88 15 L104 15" stroke={COLORS.orange} strokeWidth="6" strokeLinecap="round" />
      <Path d="M20 72 L20 34" stroke={COLORS.green} strokeWidth="12" strokeLinecap="round" />
    </Svg>
  );
}

function HeartFamilyMark() {
  return (
    <Svg width="152" height="102" viewBox="0 0 152 102">
      <Path d="M28 28 C28 10, 44 2, 59 8 C68 12, 76 22, 76 22 C76 22, 84 12, 93 8 C108 2, 124 10, 124 28 C124 53, 101 69, 76 92 C51 69, 28 53, 28 28Z" stroke="#d7e6cc" strokeWidth="4" fill="none" />
      <Circle cx="66" cy="33" r="6" stroke="#d7e6cc" strokeWidth="2.4" fill="none" />
      <Circle cx="84" cy="30" r="5" stroke="#d7e6cc" strokeWidth="2.4" fill="none" />
      <Circle cx="75" cy="47" r="7" stroke="#d7e6cc" strokeWidth="2.4" fill="none" />
      <Path d="M22 63 L44 63 L50 58 L58 70 L66 63 L78 63 L88 57 L97 63 L122 63" stroke="#f5c2a1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function ShieldCheck({ size = 52, stroke = COLORS.green }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52">
      <Path d="M26 4 L42 10 L42 24 C42 35 34 43 26 48 C18 43 10 35 10 24 L10 10 Z" stroke={stroke} strokeWidth="2.5" fill="none" />
      <Path d="M18 27 L24 33 L34 20" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return <View style={styles.infoIconWrap}>{children}</View>;
}

function ProtocolIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Rect x="5" y="4" width="14" height="16" rx="2" stroke={COLORS.greenSoft} strokeWidth="1.8" fill="none" />
      <Line x1="8" y1="9" x2="16" y2="9" stroke={COLORS.greenSoft} strokeWidth="1.6" />
      <Line x1="8" y1="13" x2="16" y2="13" stroke={COLORS.greenSoft} strokeWidth="1.6" />
      <Line x1="8" y1="17" x2="13" y2="17" stroke={COLORS.greenSoft} strokeWidth="1.6" />
    </Svg>
  );
}

function StethoscopeIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path d="M8 4 V10 C8 13 10 15 12 15 C14 15 16 13 16 10 V4" stroke={COLORS.greenSoft} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Circle cx="18" cy="15" r="2.5" stroke={COLORS.greenSoft} strokeWidth="1.8" fill="none" />
      <Path d="M16 15 V17 C16 20 14 22 11 22 C8 22 6 20 6 17 V15" stroke={COLORS.greenSoft} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Path d="M9 4 V7" stroke={COLORS.greenSoft} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M15 4 V7" stroke={COLORS.greenSoft} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function UserIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="4" stroke={COLORS.greenSoft} strokeWidth="1.8" fill="none" />
      <Path d="M5 19 C6.5 15.5 9 14 12 14 C15 14 17.5 15.5 19 19" stroke={COLORS.greenSoft} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function ToothIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path d="M8 4 C5 4 4 6.5 4 9 C4 12 5.5 16 7.5 18.5 C8.4 19.6 9.2 19.4 9.8 18.1 L11.2 15 L12.8 15 L14.2 18.1 C14.8 19.4 15.6 19.6 16.5 18.5 C18.5 16 20 12 20 9 C20 6.5 19 4 16 4 C14.5 4 13.2 4.7 12 5.6 C10.8 4.7 9.5 4 8 4 Z" stroke={COLORS.greenSoft} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

function CpfIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Rect x="4" y="5" width="16" height="14" rx="2" stroke={COLORS.greenSoft} strokeWidth="1.6" fill="none" />
      <Circle cx="9" cy="11" r="2.2" stroke={COLORS.greenSoft} strokeWidth="1.4" fill="none" />
      <Path d="M6.5 16 C7.5 14.4 8.4 13.8 9.6 13.8 C10.8 13.8 11.8 14.4 12.6 16" stroke={COLORS.greenSoft} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Line x1="14" y1="10" x2="18" y2="10" stroke={COLORS.greenSoft} strokeWidth="1.4" />
      <Line x1="14" y1="14" x2="18" y2="14" stroke={COLORS.greenSoft} strokeWidth="1.4" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Rect x="4" y="6" width="16" height="14" rx="2" stroke={COLORS.greenSoft} strokeWidth="1.6" fill="none" />
      <Line x1="8" y1="4" x2="8" y2="8" stroke={COLORS.greenSoft} strokeWidth="1.6" />
      <Line x1="16" y1="4" x2="16" y2="8" stroke={COLORS.greenSoft} strokeWidth="1.6" />
      <Line x1="4" y1="10" x2="20" y2="10" stroke={COLORS.greenSoft} strokeWidth="1.6" />
      <Circle cx="9" cy="14" r="1.1" fill={COLORS.greenSoft} />
      <Circle cx="13" cy="14" r="1.1" fill={COLORS.greenSoft} />
      <Circle cx="17" cy="14" r="1.1" fill={COLORS.greenSoft} />
    </Svg>
  );
}

function SealBadge() {
  return (
    <Svg width="104" height="104" viewBox="0 0 104 104">
      <Circle cx="52" cy="52" r="44" stroke={COLORS.green} strokeWidth="2" fill="none" />
      <Circle cx="52" cy="52" r="33" stroke={COLORS.greenSoft} strokeWidth="1.5" fill="none" />
      <Path d="M34 59 C34 44 42 34 56 34 C61 34 65 36 68 39" stroke={COLORS.orange} strokeWidth="8" fill="none" strokeLinecap="round" />
      <Path d="M43 63 L57 63 C65 63 70 58 70 50 C70 44 66 39 60 39" stroke={COLORS.green} strokeWidth="8" fill="none" strokeLinecap="round" />
      <Path d="M70 28 L70 40" stroke={COLORS.orange} strokeWidth="4" strokeLinecap="round" />
      <Path d="M64 34 L76 34" stroke={COLORS.orange} strokeWidth="4" strokeLinecap="round" />
      <Text style={{ fontSize: 7, fill: COLORS.green }}>COMPROMISSO COM A SAÚDE</Text>
    </Svg>
  );
}

function FooterBrandMark() {
  return (
    <Svg width="74" height="74" viewBox="0 0 74 74">
      <Path d="M60 10 Q46 10 40 16 Q34 22 34 33 Q34 44 44 49 Q54 54 54 63" stroke="#ffffff" strokeWidth="3" fill="none" opacity={0.22} />
      <Path d="M58 8 L66 8 M62 4 L62 12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity={0.22} />
    </Svg>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <IconCircle>{icon}</IconCircle>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
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

    const beneficiaryName = data.beneficiarios?.nome_completo || beneficiario.nome_completo;
    const beneficiaryCpf = data.beneficiarios?.cpf || beneficiario.cpf;
    const attendanceType = data.tipo === 'consulta' ? 'Consulta' : data.tipo === 'procedimento' ? 'Procedimento' : 'Exame';

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.topRow}>
            <View style={styles.brandWrap}>
              <BrandMark />
              <View style={styles.brandTextWrap}>
                <Text style={styles.brandTitle}>FUTURA</Text>
                <Text style={[styles.brandTitle, styles.brandTitleAccent]}>SAÚDE</Text>
                <Text style={styles.brandSubtitle}>EDUCAÇÃO E SAÚDE</Text>
                <Text style={styles.brandSubtitle}>PELO FUTURO DO SEU FILHO</Text>
              </View>
            </View>
            <HeartFamilyMark />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>AUTORIZAÇÃO</Text>
              <Text style={styles.heroSubtitle}>DE ATENDIMENTO</Text>
            </View>
            <View style={styles.heroRight}>
              <ShieldCheck size={62} stroke="#ffffff" />
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoRow icon={<ProtocolIcon />} label="PROTOCOLO" value={data.protocolo} />
            <InfoRow icon={<StethoscopeIcon />} label="TIPO DE ATENDIMENTO" value={attendanceType} />
            <InfoRow icon={<UserIcon />} label="BENEFICIÁRIO" value={beneficiaryName} />
            <InfoRow icon={<ToothIcon />} label="ESPECIALIDADE / EXAME" value={data.especialidade_ou_exame} />
            <InfoRow icon={<CpfIcon />} label="CPF" value={beneficiaryCpf} />
            <InfoRow icon={<CalendarIcon />} label="VALIDADE" value={formatDate(data.valida_ate)} />
          </View>

          <View style={styles.legalBox}>
            <ShieldCheck size={70} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legalText}>
                A Futura Saúde é uma rede de benefícios e não é operadora de plano de saúde regulamentada pela ANS.
              </Text>
              <Text style={styles.legalStrong}>
                Esta autorização é válida até a data indicada.
              </Text>
            </View>
          </View>

          <View style={styles.signatureArea}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureScript}>Futura Saúde</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureTitle}>FUTURA SAÚDE</Text>
              <Text style={styles.signatureSubtitle}>CUIDANDO DO PRESENTE,{"\n"}TRANSFORMANDO O FUTURO.</Text>
            </View>
            <SealBadge />
          </View>

          <View style={styles.footerBar}>
            <View style={styles.footerAccent} />
            <View style={styles.footerContacts}>
              <Text style={styles.footerContact}>(11) 99999-9999</Text>
              <Text style={styles.footerContact}>@futurasaudeoficial</Text>
              <Text style={styles.footerContact}>www.futurasaude.com</Text>
            </View>
            <Text style={styles.footerMission}>
              NOSSA MISSÃO É CUIDAR DA SAÚDE PARA TRANSFORMAR VIDAS E CONSTRUIR UM FUTURO MELHOR.
            </Text>
          </View>

          <View style={{ position: 'absolute', right: 24, bottom: 8 }}>
            <FooterBrandMark />
          </View>
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
