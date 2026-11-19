const UUID = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;

export class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function readSessionHeaders(request) {
  const authorization = request.headers.get('authorization');
  if (!/^Bearer [^\s,]+$/i.test(authorization ?? '')) throw new RequestError(401, 'Meld je aan als beheerder.');
  const session = request.headers.get('x-khutbah-session');
  if (!UUID.test(session ?? '')) throw new RequestError(400, 'De uitzendsessie is ongeldig.');
  return { authorization, session };
}

export function serverConfig() {
  const { OPENAI_API_KEY: apiKey, VITE_SUPABASE_URL: supabaseUrl, VITE_SUPABASE_ANON_KEY: publicKey } = process.env;
  if (!apiKey || !supabaseUrl || !publicKey) throw new RequestError(503, 'De API-sleutels voor Live khutbah zijn nog niet ingesteld op de server.');
  return { apiKey, supabaseUrl, publicKey };
}

export async function control(action, options, caption) {
  const { supabaseUrl, publicKey, authorization, session, sequence, signal } = options;
  const response = await fetch(new URL('/rest/v1/rpc/khutbah_control', supabaseUrl), {
    method: 'POST',
    headers: { apikey: publicKey, Authorization: authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_action: action, p_session: session, p_seq: sequence, p_caption: caption }),
    signal,
  });
  if (response.status === 401) throw new RequestError(401, 'Je aanmelding is verlopen. Meld je opnieuw aan.');
  if (response.status === 403) throw new RequestError(403, 'Je account heeft geen toegang tot deze uitzending.');
  if (response.status === 409) throw new RequestError(409, 'De uitzendsessie is verlopen of gewijzigd.');
  if (!response.ok) throw new RequestError(503, 'De uitzending is niet bereikbaar. Controleer de Supabase-inrichting.');
  const accepted = await response.json();
  if (accepted === false) throw new RequestError(409, 'De sessie of het audiofragment is niet meer actueel.');
  if (accepted !== true) throw new RequestError(502, 'Onverwacht antwoord van de uitzending.');
}
