// Code delivery through Qura's existing accounts (server/SERVER_SPEC.md section 3). WhatsApp: the approved `otp`
// authentication template through Meta's Cloud API. SMS: AuthKey's OTP template, already registered on DLT. The requests
// match Qura's src/lib/whatsapp/metaCloud.js and src/lib/authkey.js; they are copied, not shared, so a change in Qura
// can't break Sakhi's login. The message carries only the code.

/* Why a send was refused, for the logs. Never the provider's raw text: Meta's "Malformed access token" error repeats the
   token, so every long key-like run is blanked out. */
export function refusal(status, data) {
  const err = (data && data.error) || {};
  const text = String((data && (err.message || data.message || data.Message)) || '').replace(/[A-Za-z0-9_-]{24,}/g, '[hidden]');
  const code = err.code ? ' #' + err.code + (err.error_subcode ? '/' + err.error_subcode : '') : '';
  return ('HTTP ' + status + code + (text ? ': ' + text : '')).slice(0, 160);
}

export function makeSender(env, fetchImpl = fetch) {
  async function post(url, headers, body, timeoutMs) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(body), signal: ctl.signal });
      let data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      if (!res.ok) throw new Error(refusal(res.status, data));
      return data;
    } finally {
      clearTimeout(timer);
    }
  }
  const national = (phone) => String(phone).replace(/^\+91/, '');
  return {
    async whatsapp(phone, code) {
      const phoneId = env.SAKHI_WA_PHONE_ID;
      const token = env.SAKHI_META_TOKEN;
      if (!phoneId || !token) throw new Error('WhatsApp is not configured');
      const version = env.SAKHI_META_GRAPH_VERSION || 'v21.0';
      /* Authentication templates carry the code twice: in the body and in the copy-code button (Meta rejects it otherwise, #131008). */
      await post('https://graph.facebook.com/' + version + '/' + phoneId + '/messages', { Authorization: 'Bearer ' + token }, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '91' + national(phone),
        type: 'template',
        template: {
          name: env.SAKHI_WA_TEMPLATE || 'otp',
          language: { code: env.SAKHI_WA_LANG || 'en' },
          components: [
            { type: 'body', parameters: [{ type: 'text', text: code }] },
            { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] }
          ]
        }
      }, 5000);
    },
    async sms(phone, code) {
      const key = env.SAKHI_AUTHKEY_KEY;
      const sid = env.SAKHI_AUTHKEY_OTP_SID;
      if (!key || !sid) throw new Error('SMS is not configured');
      await post('https://console.authkey.io/restapi/requestjson.php', { Authorization: 'Basic ' + key },
        { country_code: '91', mobile: national(phone), sid, otp: code }, 8000);
    }
  };
}
