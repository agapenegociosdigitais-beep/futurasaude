interface PlacesSearchResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    googleMapsUri?: string;
    location?: { latitude?: number; longitude?: number };
    primaryType?: string;
    rating?: number;
    userRatingCount?: number;
    businessStatus?: string;
  }>;
}

interface PlacesAddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface PlacesPhotoAttribution {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

interface PlacesPhoto {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: PlacesPhotoAttribution[];
}

interface PlaceDetailsResponse {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: PlacesAddressComponent[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  rating?: number;
  userRatingCount?: number;
  location?: { latitude?: number; longitude?: number };
  primaryType?: string;
  businessStatus?: string;
  photos?: PlacesPhoto[];
}

export interface GooglePlaceCandidate {
  place_id: string;
  nome: string;
  endereco_resumido: string;
  google_maps_url: string;
  avaliacao: number | null;
  total_avaliacoes: number | null;
  tipo_google: string | null;
  business_status: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface GooglePlacePreview {
  google_place_id: string;
  nome: string;
  telefone: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  website: string | null;
  google_maps_url: string;
  foto_url: string | null;
  google_photo_name: string | null;
  google_photo_author_name: string | null;
  google_photo_author_uri: string | null;
  horario: string | null;
  avaliacao: number | null;
  total_avaliacoes: number | null;
  latitude: number | null;
  longitude: number | null;
  tipo_google: string | null;
  business_status: string | null;
}

function getApiKey() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY não configurada');
  }
  return apiKey;
}

function buildTextQuery(params: {
  query: string;
  cidade?: string;
  bairro?: string;
  especialidadeNome?: string;
}) {
  return [params.query, params.bairro, params.cidade, params.especialidadeNome, 'Brasil']
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(', ');
}

function toMapsUrl(placeId?: string, googleMapsUri?: string) {
  if (googleMapsUri) return googleMapsUri;
  if (!placeId) return '';
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatPhone(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return phone.trim();
  const local = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return phone.trim();
}

function getComponent(components: PlacesAddressComponent[] | undefined, ...types: string[]) {
  if (!components?.length) return null;
  const found = components.find((component) =>
    types.some((type) => component.types?.includes(type))
  );
  return found?.longText?.trim() || found?.shortText?.trim() || null;
}

function buildStreetAddress(components?: PlacesAddressComponent[]) {
  const route = getComponent(components, 'route');
  const number = getComponent(components, 'street_number');
  const subpremise = getComponent(components, 'subpremise');
  const parts = [route, number, subpremise].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function formatOpeningHours(details: PlaceDetailsResponse) {
  const lines = details.regularOpeningHours?.weekdayDescriptions?.filter(Boolean);
  if (!lines?.length) return null;
  return lines.join(' | ');
}

function normalizeCandidate(place: NonNullable<PlacesSearchResponse['places']>[number]): GooglePlaceCandidate | null {
  if (!place.id || !place.displayName?.text) return null;
  return {
    place_id: place.id,
    nome: place.displayName.text.trim(),
    endereco_resumido: place.formattedAddress?.trim() || '',
    google_maps_url: toMapsUrl(place.id, place.googleMapsUri),
    avaliacao: toNumber(place.rating),
    total_avaliacoes:
      typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
    tipo_google: place.primaryType?.trim() || null,
    business_status: place.businessStatus?.trim() || null,
    latitude: toNumber(place.location?.latitude),
    longitude: toNumber(place.location?.longitude),
  };
}

function normalizeDetails(details: PlaceDetailsResponse): GooglePlacePreview {
  const bairro = getComponent(details.addressComponents, 'sublocality_level_1', 'sublocality', 'neighborhood');
  const cidade = getComponent(details.addressComponents, 'locality', 'administrative_area_level_2');
  const estado = getComponent(details.addressComponents, 'administrative_area_level_1');
  const endereco = buildStreetAddress(details.addressComponents) || details.formattedAddress?.trim() || null;
  const firstPhoto = details.photos?.find((photo) => photo.name?.trim());
  const firstAttribution = firstPhoto?.authorAttributions?.[0];
  const photoName = firstPhoto?.name?.trim() || null;

  return {
    google_place_id: details.id || '',
    nome: details.displayName?.text?.trim() || '',
    telefone: formatPhone(details.nationalPhoneNumber || details.internationalPhoneNumber || null),
    endereco,
    bairro,
    cidade,
    estado,
    website: details.websiteUri?.trim() || null,
    google_maps_url: toMapsUrl(details.id, details.googleMapsUri),
    foto_url: photoName
      ? `/api/admin/clinicas/google-photo?name=${encodeURIComponent(photoName)}`
      : null,
    google_photo_name: photoName,
    google_photo_author_name: firstAttribution?.displayName?.trim() || null,
    google_photo_author_uri: firstAttribution?.uri?.trim() || null,
    horario: formatOpeningHours(details),
    avaliacao: toNumber(details.rating),
    total_avaliacoes:
      typeof details.userRatingCount === 'number' ? details.userRatingCount : null,
    latitude: toNumber(details.location?.latitude),
    longitude: toNumber(details.location?.longitude),
    tipo_google: details.primaryType?.trim() || null,
    business_status: details.businessStatus?.trim() || null,
  };
}

export async function searchGooglePlaces(params: {
  query: string;
  cidade?: string;
  bairro?: string;
  especialidadeNome?: string;
  maxResultCount?: number;
}) {
  const apiKey = getApiKey();
  const textQuery = buildTextQuery(params);

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.googleMapsUri',
        'places.location',
        'places.primaryType',
        'places.rating',
        'places.userRatingCount',
        'places.businessStatus',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery,
      languageCode: 'pt-BR',
      regionCode: 'BR',
      maxResultCount: params.maxResultCount || 6,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro Google Places search: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as PlacesSearchResponse;
  return (json.places || []).map(normalizeCandidate).filter(Boolean) as GooglePlaceCandidate[];
}

export async function getGooglePlaceDetails(placeId: string) {
  const apiKey = getApiKey();
  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
  url.searchParams.set('languageCode', 'pt-BR');
  url.searchParams.set('regionCode', 'BR');

  const response = await fetch(url.toString(), {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'id',
        'displayName',
        'formattedAddress',
        'addressComponents',
        'nationalPhoneNumber',
        'internationalPhoneNumber',
        'websiteUri',
        'googleMapsUri',
        'regularOpeningHours',
        'rating',
        'userRatingCount',
        'location',
        'primaryType',
        'businessStatus',
        'photos',
      ].join(','),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro Google Places details: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as PlaceDetailsResponse;
  const normalized = normalizeDetails(json);
  if (!normalized.google_place_id || !normalized.nome) {
    throw new Error('Google Places retornou dados insuficientes');
  }
  return normalized;
}
