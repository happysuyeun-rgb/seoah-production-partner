const form = document.querySelector('#contact-form');
if (form) {
  const button = form.querySelector('button[type=submit]');
  const status = document.querySelector('#contact-status');
  let busy = false;
  let available = false;
  let requestId;
  const setStatus = text => { status.textContent = text; };
  function updateButton() {
    const contact = form.elements.contact.value.trim();
    const digits = contact.replace(/\D/g, '');
    const validContact = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) || (/^[+\d ()-]+$/.test(contact) && digits.length >= 9 && digits.length <= 15);
    button.disabled = busy || !available || !form.elements.name.value.trim() || !validContact || !form.elements.message.value.trim() || !form.querySelector('input[name="inquiry-situation"]:checked') || !form.elements.consent.checked || !Array.from(form.elements).every(el => !el.willValidate || el.validity.valid);
  }
  fetch('/api/contact', {cache:'no-store'}).then(r => r.ok ? r.json() : {}).then(data => {
    if (data.enabled) { available = true; updateButton(); setStatus('모든 항목을 작성하고 개인정보 수집·이용에 동의하면 보낼 수 있습니다.'); }
  }).catch(() => {});
  form.addEventListener('input', () => { requestId = undefined; form.elements.contact.setCustomValidity(''); updateButton(); });
  form.addEventListener('change', updateButton);
  form.addEventListener('reset', () => { setTimeout(updateButton, 0); });
  addEventListener('pageshow', updateButton);
  updateButton();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || button.disabled || !form.reportValidity()) return;
    const fields = new FormData(form);
    const contact = String(fields.get('contact') || '').trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const validPhone = /^[+\d ()-]+$/.test(contact) && contact.replace(/\D/g,'').length >= 9 && contact.replace(/\D/g,'').length <= 15;
    const input = form.elements.contact;
    input.setCustomValidity(validEmail || validPhone ? '' : '답변받을 이메일 또는 전화번호를 확인해 주세요.');
    if (!form.reportValidity()) { input.addEventListener('input', () => input.setCustomValidity(''), {once:true}); return; }
    requestId ||= crypto.randomUUID();
    const payload = {name:fields.get('name'), contact, message:fields.get('message'), situation:fields.get('inquiry-situation'), consent:fields.get('consent'), website:fields.get('website'), requestId};
    busy = true; button.disabled = true; form.setAttribute('aria-busy','true');
    setStatus('문의 내용을 전송하고 있습니다…');
    try {
      const response = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:AbortSignal.timeout(15000)});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error('delivery');
      form.reset(); requestId = undefined;
      setStatus('문의 메일 발송 요청이 접수되었습니다. 확인 후 연락드리겠습니다.');
    } catch { setStatus('접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하거나 아래 이메일·전화로 문의해 주세요.'); }
    finally { busy = false; updateButton(); form.removeAttribute('aria-busy'); }
  });
}
