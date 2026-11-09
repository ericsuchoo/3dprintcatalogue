const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
async function load(path) {
 const js = ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
}
test('whitelist rejects arbitrary SQL table identifiers',async()=>{
 const {isEntity}=await load('src/lib/os/catalogue.ts');
 assert.equal(isEntity('productos'),true);
 assert.equal(isEntity('productos; DROP TABLE productos'),false);
 assert.equal(isEntity('__proto__'),false);
});
test('product listing retains authoritative id_personaje and bounded pagination',async()=>{
 const {listEntity}=await load('src/lib/os/catalogue.ts');
 let sql, args;
 const db={prepare(q){sql=q;return {bind(...a){args=a;return {async all(){return {results:[{id_producto:12,id_personaje:7}]}}}}}}};
 const result=await listEntity(db,'productos',2);
 assert.match(sql,/id_personaje/);
 assert.match(sql,/LIMIT \? OFFSET \?/);
 assert.deepEqual(args,[25,25]);
 assert.equal(result[0].id_personaje,7);
});
test('authentication fails closed without configured access, token or allowlist',async()=>{
 const {verifyAdmin,safePage}=await load('src/lib/os/auth.ts');
 assert.equal(await verifyAdmin(new Request('https://example.com/admin'),{}),null);
 assert.equal(await verifyAdmin(new Request('https://example.com/admin'),{CF_ACCESS_TEAM_DOMAIN:'https://a.cloudflareaccess.com',CF_ACCESS_AUD:'aud',ADMIN_EMAILS:'admin@example.com'}),null);
 assert.equal(safePage('-3'),1);assert.equal(safePage('2.5'),1);assert.equal(safePage('2'),2);
});
test('dashboard uses live aggregate queries without fabricated figures',async()=>{
 const {dashboard}=await load('src/lib/os/catalogue.ts');
 const db={prepare(sql){return {async all(){return {results:[{total:sql.includes('productos')?12:sql.includes('personajes')?5:3}]}}}}};
 assert.deepEqual(await dashboard(db),{productos:12,personajes:5,ediciones:3});
});
