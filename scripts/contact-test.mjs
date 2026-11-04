import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../api/contact.js',import.meta.url),'utf8');
const {default:handler}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const base={method:'POST',headers:{origin:'https://seoah-production-partner.vercel.app','content-type':'application/json'},body:{name:'테스트',contact:'test@example.com',message:'테스트',situation:'기획부터 필요한 프로젝트',consent:'yes',website:'',requestId:'12345678-1234-1234-1234-123456789012'}};
async function run(req){const res={setHeader(){},status(n){this.code=n;return this},json(data){this.data=data;return this}};await handler(req,res);return res;}
delete process.env.CONTACT_ENABLED;
assert.equal((await run(base)).code,503);
process.env.CONTACT_ENABLED='true';process.env.CONTACT_SHARED_SECRET='test-not-a-secret';process.env.CONTACT_SCRIPT_URL='https://script.google.com/macros/s/test-deployment/exec';
assert.equal((await run({...base,headers:{...base.headers,origin:'https://other.example'}})).code,403);
assert.equal((await run({...base,body:{...base.body,consent:'no'}})).code,400);
assert.equal((await run({...base,body:{...base.body,contact:'bad'}})).code,400);
assert.equal((await run({...base,body:{...base.body,website:'bot'}})).code,400);
const saved=globalThis.fetch;
try{
let calls=0;
globalThis.fetch=async()=>{calls++;throw new Error('must not call provider');};
for(const message of ['', '   ', null, 123]) assert.equal((await run({...base,body:{...base.body,message}})).code,400);
assert.equal(calls,0);
globalThis.fetch=async()=>({ok:true,json:async()=>({ok:false,error:'rate_limited'})});
assert.equal((await run(base)).code,429);
globalThis.fetch=async()=>({ok:false,json:async()=>({})});assert.equal((await run(base)).code,502);
globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);assert.equal(url,process.env.CONTACT_SCRIPT_URL);assert.equal(body.contact,'test@example.com');assert.equal(body.secret,process.env.CONTACT_SHARED_SECRET);assert.equal(body.requestId,base.body.requestId);return{ok:true,json:async()=>({ok:true})}};
assert.equal((await run(base)).data.ok,true);
}finally{globalThis.fetch=saved}
console.log('PASS: disabled/origin/consent/contact/honeypot/provider failure/success/idempotency; mocked only, no email sent');
