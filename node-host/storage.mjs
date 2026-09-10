import {DatabaseSync} from 'node:sqlite'
import {mkdirSync,readFileSync,readdirSync,existsSync,writeFileSync,renameSync,unlinkSync,realpathSync} from 'node:fs'
import {resolve,join,sep} from 'node:path'
import {randomUUID} from 'node:crypto'

export class LocalD1 {
  constructor(file,migrations) {
    mkdirSync(resolve(file,'..'),{recursive:true,mode:0o700})
    this.raw=new DatabaseSync(file,{timeout:5000})
    this.raw.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;')
    if(!this.raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()){
      this.raw.exec('BEGIN IMMEDIATE')
      try{
        for(const name of readdirSync(migrations).filter(x=>x.endsWith('.sql')).sort())this.raw.exec(readFileSync(join(migrations,name),'utf8'))
        this.raw.exec('COMMIT')
      }catch(error){this.raw.exec('ROLLBACK');throw error}
    }
    // Imported D1 databases use the same schema; fail closed if incomplete.
    for(const table of ['users','sessions','limits','content','revisions','media','inquiries','daily_stats'])
      if(!this.raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table))throw new Error('Incomplete database schema')
    this.raw.prepare('SELECT render_version,site FROM content LIMIT 0').all()
  }
  prepare(sql) {
    const db=this.raw
    const query=(values=[])=>({
      bind(...args){return query(args)},
      first(column){const row=db.prepare(sql).get(...values);return column?(row?.[column]??null):(row??null)},
      all(){return {results:db.prepare(sql).all(...values),success:true}},
      run(){const r=db.prepare(sql).run(...values);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}},
    })
    return query()
  }
  batch(statements){
    this.raw.exec('BEGIN IMMEDIATE')
    try{const results=statements.map(s=>s.run());this.raw.exec('COMMIT');return results}
    catch(error){this.raw.exec('ROLLBACK');throw error}
  }
  close(){this.raw.close()}
}
export class FileKV {
  constructor(directory){mkdirSync(directory,{recursive:true,mode:0o700});this.directory=realpathSync(directory)}
  location(key){
    if(!/^uploads\/[a-f0-9]{32}\.(png|jpg|webp|mp4)$/.test(key))throw new Error('Invalid media key')
    return join(this.directory,key.slice(8)+'.json')
  }
  async put(key,value,{metadata}={}){
    if(!metadata||!['image/png','image/jpeg','image/webp','video/mp4'].includes(metadata.mime))throw new Error('Invalid media metadata')
    const bytes=Buffer.from(value)
    if(bytes.length>8*1024*1024)throw new Error('Media too large')
    const file=this.location(key),temporary=file+'.'+randomUUID()+'.tmp'
    try{
      writeFileSync(temporary,JSON.stringify({metadata,value:bytes.toString('base64')}),{mode:0o600,flag:'wx'})
      renameSync(temporary,file)
    }finally{if(existsSync(temporary))unlinkSync(temporary)}
  }
  async getWithMetadata(key){
    const file=this.location(key)
    if(!existsSync(file))return {value:null,metadata:null}
    if(!realpathSync(file).startsWith(this.directory+sep))throw new Error('Invalid media path')
    const row=JSON.parse(readFileSync(file,'utf8')),bytes=Buffer.from(row.value,'base64')
    return {value:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),metadata:row.metadata}
  }
  async delete(key){try{unlinkSync(this.location(key))}catch(error){if(error.code!=='ENOENT')throw error}}
}
