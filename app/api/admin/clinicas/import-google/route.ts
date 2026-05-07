import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

interface GooglePlaceData {
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  website: string;
  google_maps_url: string;
  foto_url: string;
  horario: string;
  avaliacao: number;
  tipo: string;
}

/** Extrai place_id de diferentes formatos de URL do Google Maps */
function extractPlaceId(url: string): string | null {
  const patterns: RegExp[] = [
    /place_id:([^&]+)/,
    /data=.+!1s([^!]+)/,
    /maps[/]place[/][^/]+[/]([^/]+)/,
    /cid=([^&]+)/,
    /0x[^:]+:0x([^&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Faz scraping da página do Google Maps para extrair dados */
async function scrapeGoogleMaps(url: string): Promise<GooglePlaceData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });

    const html = await res.text();
    clearTimeout(timeout);

    const data: GooglePlaceData = {
      nome: '',
      telefone: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      website: '',
      google_maps_url: url,
      foto_url: '',
      horario: '',
      avaliacao: 0,
      tipo: '',
    };

    // Extrair nome do título da página ou og:title
    const titleMatch =
      html.match(/<title[^>]*>([^<]+)<[/]title>/i) ||
      html.match(/og:title["]+content["]+=["]+([^"]+)["]/i);
    if (titleMatch) {
      let title = titleMatch[1]
        .replace(/ - Google Maps$/i, '')
        .replace(/ – Google Maps$/i, '')
        .trim();
      data.nome = title;
    }

    // Extrair telefone
    const phonePatterns = [
      /(?:telefone|phone)["':]+["']?([^"'<]+)["']?/i,
      /(?:tel|phone)["':]+["']?((?:55)?(?:0)?(?:9)?(?:9)?[0-9]{2}[0-9]{4,5}[0-9]{4})/i,
      /[((]?(?:55)?(?:0)?[1-9]{2}[) )]?[0-9]{4,5}[- ]?[0-9]{4}/,
    ];
    for (const p of phonePatterns) {
      const m = html.match(p);
      if (m) {
        data.telefone = (m[1] || m[0]).trim();
        break;
      }
    }

    // Extrair endereço
    const addrPatterns = [
      /(?:endereco|address)["':]+["']?([^"'<]+)["']?/i,
      /"address":{"simple":"([^"]+)"/i,
      /data-address="([^"]+)"/i,
    ];
    for (const p of addrPatterns) {
      const m = html.match(p);
      if (m) {
        data.endereco = m[1].trim();
        break;
      }
    }

    // Extrair rating
    const ratingMatch = html.match(/"ratingValue"["':]+["']?([0-9.]+)["']?/i) ||
      html.match(/([0-9],[0-9])[^"]*avali/i) ||
      html.match(/"stars":([0-9.]+)/);
    if (ratingMatch) {
      data.avaliacao = parseFloat((ratingMatch[1] || ratingMatch[0]).replace(',', '.'));
    }

    // Extrair horário
    const hoursMatch = html.match(/(?:horario|hours)["':]+["']?([^"'<]+)["']?/i);
    if (hoursMatch) {
      data.horario = hoursMatch[1].trim();
    }

    // Extrair website
    const websiteMatch = html.match(/(?:website|site)["':]+["']?(https?:[^"'<]+)["']?/i);
    if (websiteMatch) {
      data.website = websiteMatch[1].trim();
    }

    // Extrair tipo/categoria
    const typeMatch = html.match(/"category"["':]+["']?([^"'<]+)["']?/i) ||
      html.match(/"business_type"["':]+["']?([^"'<]+)["']?/i);
    if (typeMatch) {
      data.tipo = typeMatch[1].trim();
    }

    // Extrair foto
    const fotoMatch = html.match(/"(https?:[^"]+ggpht[^"]+)"/i) ||
      html.match(/"(https?:[^"]+googleusercontent[^"]+)"/i) ||
      html.match(/og:image["]+content["]+=["]+([^"]+)["]/i);
    if (fotoMatch) {
      data.foto_url = fotoMatch[1].replace(/"/g, '').trim();
    }

    // Parsing de cidade/estado/bairro a partir do endereço
    if (data.endereco) {
      parseAddress(data);
    }

    // Se não achou nome, tentar extrair da URL
    if (!data.nome) {
      const urlNameMatch = url.match(/maps[/]place[/]([^/]+)/);
      if (urlNameMatch) {
        data.nome = decodeURIComponent(urlNameMatch[1].replace(/[+]/g, ' ').replace(/_/g, ' '));
      }
    }

    return data.nome ? data : null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/** Parse de endereço brasileiro para cidade, estado, bairro */
function parseAddress(data: GooglePlaceData): void {
  const addr = data.endereco;
  // Pattern: Rua X, 123 - Bairro, Cidade - UF, Brasil, CEP
  // ou: Rua X, Bairro, Cidade UF
  const fullMatch = addr.match(/(.*?),[^-]*-([^,]+),([^,]+)-([A-Z]{2})/i);
  if (fullMatch) {
    data.bairro = fullMatch[2].trim();
    data.cidade = fullMatch[3].trim();
    data.estado = fullMatch[4].trim();
    data.endereco = fullMatch[1].trim();
    return;
  }

  const simpleMatch = addr.match(/(.*?),([^,]+),([^,]+)[,-]?([A-Z]{2})/i);
  if (simpleMatch) {
    data.bairro = '';
    data.cidade = simpleMatch[3].trim();
    data.estado = simpleMatch[4]?.trim() || '';
    data.endereco = simpleMatch[1].trim();
    return;
  }

  // Fallback: última parte antes de - é cidade
  const parts = addr.split(' - ');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const cityState = lastPart.match(/([A-Za-zçéêà]+)[, -]*([A-Z]{2})/i);
    if (cityState) {
      data.cidade = cityState[1].trim();
      data.estado = cityState[2].trim();
    }
  }
}

/** Usa Google Places API para dados mais precisos (se place_id disponível) */
async function fetchViaPlaceId(placeId: string): Promise<GooglePlaceData | null> {
  // Constrói URL de redirect do Google Maps com place_id
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  return scrapeGoogleMaps(mapsUrl);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { url, especialidade_id } = body;

    if (!url || !url.includes('google')) {
      return NextResponse.json(
        { message: 'Envie um link válido do Google Maps ou Google Meu Negócio' },
        { status: 400 }
      );
    }

    if (!especialidade_id) {
      return NextResponse.json(
        { message: 'Selecione a especialidade' },
        { status: 400 }
      );
    }

    // Tenta via place_id primeiro (mais confiável), depois via scraping direto
    let data: GooglePlaceData | null = null;
    const placeId = extractPlaceId(url);

    if (placeId) {
      data = await fetchViaPlaceId(placeId);
    }

    if (!data) {
      data = await scrapeGoogleMaps(url);
    }

    if (!data || !data.nome) {
      return NextResponse.json(
        {
          message: 'Não foi possível extrair os dados deste link. Tente abrir o link no navegador, copiar a URL completa da barra de endereço e colar aqui.',
          partial: true,
          url,
        },
        { status: 422 }
      );
    }

    // Formata telefone para padrão brasileiro
    if (data.telefone) {
      const digits = data.telefone.replace(/[^0-9]/g, '');
      if (digits.length >= 10) {
        const ddd = digits.slice(-11, -9) || digits.slice(-10, -8);
        const rest = digits.slice(-9) || digits.slice(-8);
        data.telefone = `(${ddd}) ${rest.slice(0, rest.length === 9 ? 5 : 4)}-${rest.slice(-4)}`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        especialidade_id,
      },
    });
  } catch (error: any) {
    console.error('Erro importação Google:', error);
    return NextResponse.json(
      { message: 'Erro ao processar o link. Verifique se o link está correto.' },
      { status: 500 }
    );
  }
}
