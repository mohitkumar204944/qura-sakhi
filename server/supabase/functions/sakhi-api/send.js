// Code delivery through Qura's existing accounts (server/SERVER_SPEC.md section 3). WhatsApp: the approved `otp`
// authentication template through Meta's Cloud API. SMS: AuthKey's OTP template, already registered on DLT. The requests
// match Qura's src/lib/whatsapp/metaCloud.js and src/lib/authkey.js; they are copied, not shared, so a change in Qura
// can't break Sakhi's login. The message carries only the code.

export function makeSender(env, fetchImpl = fetch) {
  async function post(url, headers, body, timeoutMs) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(body), signal: ctl.signal });
      let data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      if (!res.ok) throw new Error(String((data && ((data.error && data.error.message) || data.message || data.Message)) || 'HTTP ' + res.status).slice(0, 160));
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
