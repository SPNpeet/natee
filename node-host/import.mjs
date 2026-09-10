import {DatabaseSync} from 'node:sqlite'
import {readFileSync,existsSync,mkdirSync,realpathSync} from 'node:fs'
import {resolve,sep,isAbsolute} from 'node:path'
import {createHash} from 'node:crypto'
import {FileKV,LocalD1} from './storage.mjs'
import {root} from './environment.mjs'
process.umask(0o077)
const source=realpathSync(process.argv[2]||'')
const data=process.env.DATA_DIR
if(!data||!isAbsolute(data))throw new Error('Set a private absolute DATA_DIR')
mkdirSync(data,{recursive:true,mode:0o700})
const target=realpathSync(data)
if(target===root||target.startsWith(root+sep)||target.includes(sep+'public_html'+sep)||target.endsWith(sep+'public_html'))throw new Error('Unsafe data directory')
if(existsSync(resolve(target,'natee.sqlite')))throw new Error('Refusing to overwrite an existing database')
const db=new DatabaseSync(resolve(target,'natee.sqlite'))
try{
  db.exec('PRAGMA foreign_keys=OFF;')
  db.exec(readFileSync(resolve(source,'database.sql'),'utf8'))
  db.exec('DELETE FROM sessions; DELETE FROM limits;')
  if(db.prepare('PRAGMA foreign_key_check').all().length)throw new Error('Imported database violates foreign keys')
  const kv=new FileKV(resolve(target,'media'))
  const manifest=JSON.parse(readFileSync(resolve(source,'media/manifest.json'),'utf8'))
  const mediaRoot=realpathSync(resolve(source,'media'))
  const imported=new Set()
  for(const row of manifest){
    const file=realpathSync(resolve(mediaRoot,row.file))
    if(!file.startsWith(mediaRoot+sep))throw new Error('Unsafe archive media path')
    const bytes=readFileSync(file)
    if(row.bytes!==bytes.length||row.sha256!==createHash('sha256').update(bytes).digest('hex'))throw new Error('Media checksum mismatch')
    await kv.put(row.name,bytes,{metadata:row.metadata});imported.add(row.name)
  }
  for(const row of db.prepare('SELECT path FROM media').all())if(!imported.has(row.path))throw new Error('Missing referenced media')
  db.exec('PRAGMA foreign_keys=ON;')
}finally{db.close()}
const checked=new LocalD1(resolve(target,'natee.sqlite'),resolve(root,'worker/migrations'))
checked.close()
console.log('Import complete; sessions cleared. Verify the site before cutover.')
