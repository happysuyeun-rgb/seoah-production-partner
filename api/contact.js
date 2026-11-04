const situations = ['기획부터 필요한 프로젝트', '준비된 자료가 있는 프로젝트', '지속적인 제작 파트너십'];
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function scriptUrl() {
  try {
    const url = new URL(process.env.CONTACT_SCRIPT_URL);
    return url.protocol === 'https:' && url.hostname === 'script.google.com' && /^\/macros\/s\/[\w-]+\/exec$/.test(url.pathname) && !url.search && !url.hash ? url.href : null;
  } catch { return null; }
}
const ready = () => process.env.CONTACT_ENABLED === 'true' && scriptUrl() && process.env.CONTACT_SHARED_SECRET;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({enabled: Boolean(ready())});
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({error:'method'}); }
  if (!ready()) return res.status(503).json({error:'unavailable'});
  const origin = process.env.CONTACT_SITE_ORIGIN || 'https://seoah-production-partner.vercel.app';
  if (req.headers.origin !== origin) return res.status(403).json({error:'origin'});
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({error:'type'});
  const b = req.body;
  if (!b || typeof b !== 'object' || Array.isArray(b)) return res.status(400).json({error:'invalid'});
  if (Buffer.byteLength(JSON.stringify(b)) > 16000) return res.status(413).json({error:'size'});
  if (typeof b.website !== 'string' || b.website) return res.status(400).json({error:'invalid'});
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const contact = typeof b.contact === 'string' ? b.contact.trim() : '';
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  if (!message) return res.status(400).json({error:'invalid'});
  const phone = /^[+\d ()-]+$/.test(contact) && contact.replace(/\D/g,'').length >= 9 && contact.replace(/\D/g,'').length <= 15;
  if (!name || name.length > 80 || /[\r\n\x00-\x1f]/.test(name) || contact.length > 160 || (!email.test(contact) && !phone) || /[\r\n]/.test(contact) || message.length > 3000 || b.consent !== 'yes' || !situations.includes(b.situation) || !/^[a-f0-9-]{36}$/.test(b.requestId || '')) return res.status(400).json({error:'invalid'});
  try {
    const result = await fetch(scriptUrl(), {
      method:'POST', signal:AbortSignal.timeout(10000),
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name,contact,message,situation:b.situation,consent:'yes',website:'',requestId:b.requestId,secret:process.env.CONTACT_SHARED_SECRET})
    });
    const data = await result.json();
    if (!result.ok || data.ok !== true) return res.status(data.error === 'rate_limited' ? 429 : 502).json({error:'delivery'});
    return res.status(200).json({ok:true});
  } catch { return res.status(502).json({error:'delivery'}); }
}
