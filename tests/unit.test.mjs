import test from 'node:test'
import assert from 'node:assert/strict'
import {hashPassword,verifyPassword,readJSON,equal} from '../worker/security.mjs'
test('salted password hashes verify without storing plaintext',async()=>{
  const password='A test-only passphrase 927!'
  const one=await hashPassword(password),two=await hashPassword(password)
  assert.notEqual(one,two);assert.equal(await verifyPassword(password,one),true)
  assert.equal(await verifyPassword('wrong password',one),false)
  await assert.rejects(()=>hashPassword('short'))
  assert.equal(equal('a','a'),true);assert.equal(equal('a','b'),false)
})
test('malformed JSON is a client error',async()=>{
  await assert.rejects(()=>readJSON(new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})),{status:400})
})
