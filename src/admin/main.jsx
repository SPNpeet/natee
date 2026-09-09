import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import * as seed from '../data.js'
import './admin.css'

const labels = {
  CONTACT:'ช่องทางติดต่อ', ASSETS:'รูปหลัก', GALLERY:'รูปผลงาน', FORM:'แบบฟอร์มติดต่อ', REVIEWS:'คะแนนรีวิว',
  phone:'เบอร์โทรหลัก',phone2:'เบอร์โทรสำรอง',email:'อีเมล',lineId:'LINE ID',lineUrl:'ลิงก์ LINE',facebookUrl:'ลิงก์ Facebook',mapUrl:'ลิงก์เปิดเส้นทาง',mapEmbed:'ลิงก์แผนที่ฝัง',
  logo:'โลโก้',hero:'รูปหน้าแรก',about:'รูปแนะนำร้าน',qr:'คิวอาร์โค้ด LINE',enabled:'เปิดรับข้อความติดต่อ',
  rating:'คะแนนเฉลี่ยจริง (0–5)',count:'จำนวนรีวิวจริง',url:'ลิงก์รีวิว',
  siteName:'ชื่อร้าน',tagline:'คำโปรยร้าน',address:'ที่อยู่',hours:'เวลาทำการ',heroTitle:'หัวข้อหน้าแรก',heroSubtitle:'รายละเอียดหน้าแรก',heroEyebrow:'ข้อความเหนือหัวข้อ',heroNote:'หมายเหตุหน้าแรก',
  aboutTitle:'หัวข้อแนะนำร้าน',aboutText:'รายละเอียดร้าน',aboutQuote:'คำกล่าวแนะนำร้าน',
  name:'ชื่อ',title:'หัวข้อ',text:'รายละเอียด',detail:'รายละเอียด',price:'ราคา',includes:'สิ่งที่ได้รับ',image:'รูปภาพ',icon:'ไอคอน',
  capacity:'ความจุ',q:'คำถาม',a:'คำตอบ',file:'คลิปวิดีโอ',poster:'ภาพหน้าปก',caption:'คำบรรยาย',
  highlights:'จุดเด่น',services:'บริการ',fleet:'ประเภทรถ',pricing:'รายการราคา',steps:'ขั้นตอนใช้บริการ',areas:'พื้นที่ให้บริการ',videos:'คลิปผลงาน',faq:'คำถามที่พบบ่อย',nav:'ชื่อเมนู',
}
const sections = [
  ['contact','ข้อมูลร้าน'],['home','หน้าแรก'],['services','บริการ'],['fleet','ประเภทรถ'],['pricing','ราคา'],
  ['steps','ขั้นตอน'],['areas','พื้นที่บริการ'],['gallery','ผลงาน'],['faq','คำถามที่พบบ่อย'],
  ['texts','ข้อความและปุ่ม'],['settings','แบบฟอร์มและรีวิว'],['inbox','ข้อความติดต่อ'],['media','คลังสื่อ'],['history','ประวัติ'],['users','ผู้ดูแล'],['account','บัญชีของฉัน'],
]
const clone = value => structuredClone(value)
function updateAt(object,path,value) {
  const next=clone(object)
  let target=next
  for (const key of path.slice(0,-1)) target=target[key]
  target[path.at(-1)]=value
  return next
}
const initial = (path) => path.reduce((o,k)=>o?.[k],seed)
const titleFor = (key,model) => labels[key] || ('ข้อความเดิม: '+String(model ?? '').slice(0,55))
const imageFields = new Set(['image','logo','hero','about','qr','poster','GALLERY'])
const bundledImages=['logo','truck-4wheel','truck-6wheel','line-qr',...Array.from({length:12},(_,i)=>'work-'+String(i+1).padStart(2,'0')),...Array.from({length:4},(_,i)=>'work-video-'+String(i+1).padStart(2,'0')+'-poster')]
const icons=['tank','pool','construction','leaf','road','event','truck','clock','shield','check','water','pin']
function Field({value,path,onChange,media,upload,model}) {
  const key=String(path.at(-1))
  const label=titleFor(key,model)
  const fieldId='field-'+path.join('-')
  const image=imageFields.has(key) || path.includes('GALLERY')
  const video=key === 'file'
  if (Array.isArray(value)) {
    return <fieldset className="collection"><legend>{labels[key] || 'รายการ'}</legend>
      {value.map((row,i)=><div className="repeat-row" key={i}>
        <div className="row-heading"><strong>{typeof row==='object' ? row.name || row.title || row.q || row.caption || 'รายการ '+(i+1) : 'รายการ '+(i+1)}</strong>
          <div className="row-actions">
            <button type="button" disabled={i===0} aria-label={'เลื่อนรายการ '+(i+1)+' ขึ้น'} onClick={()=>{const n=[...value];[n[i-1],n[i]]=[n[i],n[i-1]];onChange(path,n)}}>↑</button>
            <button type="button" disabled={i===value.length-1} aria-label={'เลื่อนรายการ '+(i+1)+' ลง'} onClick={()=>{const n=[...value];[n[i+1],n[i]]=[n[i],n[i+1]];onChange(path,n)}}>↓</button>
            <button type="button" className="danger" onClick={()=>{if(confirm('ลบรายการนี้จากแบบร่าง?'))onChange(path,value.filter((_,j)=>i!==j))}}>ลบรายการ</button>
          </div>
        </div>
        <Field value={row} path={[...path,i]} onChange={onChange} media={media} upload={upload} model={model?.[0]} />
      </div>)}
      <button type="button" onClick={()=>onChange(path,[...value,clone(model?.[0] ?? (typeof value[0]==='object' ? value[0] : ''))])}>+ เพิ่มรายการ</button>
    </fieldset>
  }
  if (value && typeof value==='object') return <div className="field-grid">{Object.entries(value).filter(([k])=>!['lang','phoneHref','phone2Href','accessKey','endpoint'].includes(k)).map(([k,v])=><Field key={k} value={v} path={[...path,k]} onChange={onChange} media={media} upload={upload} model={model?.[k]} />)}</div>
  if (typeof value==='boolean') return <label className="check-label"><input type="checkbox" checked={value} onChange={event=>onChange(path,event.target.checked)} />{label}</label>
  if (image || video) {
    const options=video ? ['work-video-01','work-video-02','work-video-03','work-video-04'] : bundledImages
    const uploads=media.filter(m=>video ? m.mime==='video/mp4' : m.mime.startsWith('image/'))
    return <div className="field media-field"><label htmlFor={fieldId}>{label}</label>
      <select id={fieldId} value={value} onChange={event=>onChange(path,event.target.value)}>
        <option value="">เลือกไฟล์{key==='poster' ? ' (ว่าง = ใช้ภาพเดิม)' : ''}</option>
        {[...new Set([...options,...uploads.map(m=>m.path),...(value ? [value] : [])])].map((v,i)=><option key={v} value={v}>{v.startsWith('uploads/') ? 'ไฟล์อัปโหลด '+(i-options.length+1)+' · '+v.slice(-12) : v}</option>)}
      </select>
      {image && value && <img className="field-preview" src={'../'+(value.startsWith('uploads/') ? value : 'images/'+value+'.webp')} alt="ภาพที่เลือก" />}
      <label className="upload-label">อัปโหลด{video ? 'คลิปใหม่' : 'รูปใหม่'}<input type="file" accept={video ? 'video/mp4' : 'image/png,image/jpeg,image/webp'} onChange={async event=>{const file=event.target.files[0];if(file){const result=await upload(file);if(result)onChange(path,result.path)}event.target.value=''}} /></label>
    </div>
  }
  if (key==='icon') return <div className="field"><label htmlFor={fieldId}>{label}</label><select id={fieldId} value={value} onChange={event=>onChange(path,event.target.value)}>{[...new Set([value,...icons])].map(v=><option key={v}>{v}</option>)}</select></div>
  return <div className="field"><label htmlFor={fieldId}>{label}</label>
    {typeof value==='number' ? <input id={fieldId} type="number" min="0" step={key==='rating' ? '0.1' : '1'} max={key==='rating' ? 5 : undefined} value={value} onChange={event=>onChange(path,Number(event.target.value))} /> :
    <textarea id={fieldId} rows={value.length>100 || value.includes('\n') ? 3 : 2} value={value} maxLength={6000} onChange={event=>onChange(path,event.target.value)} />}
  </div>
}
function Admin() {
  const [auth,setAuth]=useState(null),[ready,setReady]=useState(false),[setup,setSetup]=useState(false)
  const [section,setSection]=useState('contact'),[lang,setLang]=useState('th')
  const [data,setData]=useState(null),[version,setVersion]=useState(0),[dirty,setDirty]=useState(false)
  const [media,setMedia]=useState([]),[inquiries,setInquiries]=useState([]),[users,setUsers]=useState([]),[history,setHistory]=useState([])
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
  async function api(path,method='GET',body) {
    const headers={}
    if (auth?.csrf) headers['X-CSRF-Token']=auth.csrf
    if (body && !(body instanceof File)) headers['Content-Type']='application/json'
    const response=await fetch('../api/'+path,{method,headers,body:body ? (body instanceof File ? body : JSON.stringify(body)) : undefined,credentials:'same-origin'})
    let result
    try { result=await response.json() } catch { throw new Error('เชื่อมต่อหลังบ้านไม่ได้ กรุณาลองโหลดหน้าใหม่') }
    if (!response.ok) throw new Error(result.error || 'ทำรายการไม่สำเร็จ')
    return result
  }
  useEffect(()=>{api('session').then(result=>{setAuth(result.user ? result : null);setSetup(Boolean(result.setupRequired))}).catch(err=>setError(err.message)).finally(()=>setReady(true))},[])
  useEffect(()=>{
    if(!auth)return
    Promise.all([api('content'),api('media')]).then(([c,m])=>{setData(c.content);setVersion(c.version);setMedia(m);setDirty(false)}).catch(err=>setError(err.message))
  },[auth?.user?.id])
  useEffect(()=>{
    const fn=event=>{if(dirty){event.preventDefault();event.returnValue=''}}
    window.addEventListener('beforeunload',fn)
    return ()=>window.removeEventListener('beforeunload',fn)
  },[dirty])
  useEffect(()=>{
    if(!auth)return
    const key={inbox:'inquiries',users:'users',history:'revisions'}[section]
    if(!key)return
    api(key).then(result=>({inbox:setInquiries,users:setUsers,history:setHistory}[section])(result)).catch(err=>setError(err.message))
  },[section,auth?.user?.id])
  async function action(fn) {
    setBusy(true);setError('');setMessage('')
    try {await fn()} catch(err){setError(err.message)} finally{setBusy(false)}
  }
  async function upload(file) {
    setError('')
    try {
      if(file.size>8*1024*1024)throw new Error('ไฟล์ต้องไม่เกิน 8 MB และรูปต้องไม่เกิน 5 MB')
      const result=await api('media','POST',file)
      setMedia(m=>[result,...m]);setMessage('อัปโหลดแล้ว ไฟล์อาจใช้เวลาหนึ่งนาทีหรือมากกว่ากว่าจะเปิดได้ทุกพื้นที่')
      return result
    }catch(err){setError(err.message);return null}
  }
  const change=(path,value)=>{setData(d=>updateAt(d,path,value));setDirty(true);setMessage('')}
  const field=path=>data && <Field key={path.join('.')} value={path.reduce((o,k)=>o[k],data)} path={path} model={initial(path)} onChange={change} media={media} upload={upload} />
  const save=()=>action(async()=>{const result=await api('content','PUT',{content:data,version});setData(result.content);setVersion(result.version);setDirty(false);setMessage('บันทึกและเผยแพร่เนื้อหาแล้ว · รุ่น '+result.version)})
  if(!ready)return <main className="login"><p role="status">กำลังเชื่อมต่อ…</p></main>
  if(!auth)return <main className="login"><div className="login-card"><p className="eyebrow">ธารนที · ผู้ดูแลเว็บไซต์</p><h1>{setup ? 'ตั้งค่าบัญชีแอดมิน' : 'เข้าสู่ระบบ'}</h1>
    <p>จัดการข้อความ รูปผลงาน และข้อมูลติดต่อของร้าน</p>
    {error&&<p className="notice error" role="alert">{error}</p>}
    <form onSubmit={event=>{event.preventDefault();const body=Object.fromEntries(new FormData(event.currentTarget));action(async()=>{const result=await api(setup?'setup':'login','POST',body);setAuth(result);setSetup(false)})}}>
      {setup&&<label>รหัสตั้งค่าระบบ<input name="token" type="password" autoComplete="off" required minLength={32}/><small>รับจากผู้ติดตั้งระบบของร้าน ใช้ได้เฉพาะครั้งแรก</small></label>}
      <label>อีเมล<input name="email" type="email" autoComplete="username" required /></label>
      <label>รหัสผ่าน<input name="password" type="password" minLength={setup?12:undefined} maxLength={128} autoComplete={setup?'new-password':'current-password'} required /></label>
      {setup&&<small>ใช้รหัสผ่านเฉพาะระบบนี้ อย่างน้อย 12 ตัวอักษร</small>}
      <button className="primary" disabled={busy}>{busy?'กำลังดำเนินการ…':setup?'สร้างบัญชีแอดมิน':'เข้าสู่ระบบ'}</button>
    </form><a href="../">กลับหน้าเว็บไซต์</a></div></main>
  return <div className="admin-layout">
    <aside><a className="admin-brand" href="../" target="_blank" rel="noopener">ธารนที <span>จัดการเว็บไซต์</span></a><nav aria-label="เมนูหลังบ้าน">{sections.filter(([id])=>id!=='users'||auth.user.role==='admin').map(([id,label])=><button key={id} aria-current={section===id?'page':undefined} onClick={()=>{setSection(id);setError('');setMessage('')}}>{label}</button>)}</nav></aside>
    <main className="admin-main">
      <header className="admin-top"><div><p className="eyebrow">{'แอดมิน'} · {auth.user.email}</p><h1>{sections.find(([id])=>id===section)?.[1]}</h1></div><div className="top-actions"><a className="button" href="../" target="_blank" rel="noopener">ดูหน้าเว็บ ↗</a><button onClick={()=>{if(!dirty||confirm('มีแบบร่างที่ยังไม่ได้บันทึก ต้องการออกจากระบบ?'))action(async()=>{await api('logout','POST',{});setAuth(null);setData(null);setDirty(false)})}}>ออกจากระบบ</button></div></header>
      <div className="status-line"><span className={dirty?'dirty':''}>{dirty?'มีการเปลี่ยนแปลงที่ยังไม่บันทึก':'ข้อมูลที่เผยแพร่ · รุ่น '+version}</span><span>ข้อมูลไทยและอังกฤษบันทึกพร้อมกัน</span></div>
      {error&&<p className="notice error" role="alert">{error}</p>}{message&&<p className="notice success" role="status">{message}</p>}
      {data && !['inbox','media','users','account','history'].includes(section) && <>
        <div className="editor-tools"><div role="group" aria-label="ภาษาที่แก้ไข"><button aria-pressed={lang==='th'} onClick={()=>setLang('th')}>ไทย</button><button aria-pressed={lang==='en'} onClick={()=>setLang('en')}>English</button></div><button onClick={()=>{if(!dirty||confirm('ทิ้งแบบร่างแล้วโหลดข้อมูลล่าสุด?'))action(async()=>{const c=await api('content');setData(c.content);setVersion(c.version);setDirty(false)})}}>โหลดล่าสุด</button></div>
        <div className="editor-panel">
        {section==='contact'&&<>{field(['CONTACT'])}{['siteName','tagline','address','hours'].map(key=>field(['I18N',lang,key]))}{field(['ASSETS'])}</>}
        {section==='home'&&<>{['heroEyebrow','heroTitle','heroSubtitle','heroNote','aboutTitle','aboutText','aboutQuote','highlights'].map(key=>field(['I18N',lang,key]))}</>}
        {['services','fleet','pricing','steps','areas','faq'].includes(section)&&field(['I18N',lang,section])}
        {section==='gallery'&&<><p>รูปใช้ร่วมกันสองภาษา คลิปต้องมีจำนวนเท่ากันทั้งไทยและอังกฤษ</p>{field(['GALLERY'])}{field(['I18N',lang,'videos'])}</>}
        {section==='texts'&&<>{field(['I18N',lang,'nav'])}{Object.keys(data.I18N[lang]).filter(key=>typeof data.I18N[lang][key]==='string'&&key!=='lang').map(key=>field(['I18N',lang,key]))}</>}
        {section==='settings'&&<><h2>แบบฟอร์มฝากข้อความ</h2><p>ข้อความจะเข้ากล่อง “ข้อความติดต่อ” ในหลังบ้าน เจ้าหน้าที่ต้องตรวจกล่องนี้เป็นประจำ</p>{field(['FORM'])}<h2>รีวิว</h2><p>กรอกเฉพาะคะแนนและจำนวนรีวิวจริง หากยังไม่มีให้ใช้ 0</p>{field(['REVIEWS'])}</>}
        </div><div className="save-bar"><span>{dirty?'ตรวจข้อความทั้งสองภาษาก่อนบันทึก':'หน้าเว็บใช้ข้อมูลรุ่นนี้อยู่'}</span><button className="primary" disabled={busy||!dirty} onClick={save}>{busy?'กำลังบันทึก…':'บันทึกและเผยแพร่เนื้อหา'}</button></div>
      </>}
      {section==='inbox'&&<section className="editor-panel"><p>ข้อมูลติดต่อเก็บไว้ 90 วัน กรุณาตรวจและติดต่อกลับเป็นประจำ ไม่มีการส่งอีเมลอัตโนมัติในรุ่นนี้</p><button onClick={()=>action(async()=>setInquiries(await api('inquiries')))}>รีเฟรชข้อความ</button>{!inquiries.length&&<p className="empty">ยังไม่มีข้อความติดต่อ</p>}{inquiries.map(row=><article className="inquiry" key={row.id}><div className="row-heading"><h2>{row.name}</h2><span className="badge">{row.status==='new'?'ใหม่':'อ่านแล้ว'}</span></div><p><a href={'tel:'+row.phone}>{row.phone}</a> · {row.language==='en'?'ภาษาอังกฤษ':'ภาษาไทย'} · {new Date(row.created).toLocaleString('th-TH')}</p><p>{row.area}</p><p className="prewrap">{row.message}</p><div className="row-actions"><button disabled={busy||row.status==='read'} onClick={()=>action(async()=>{await api('inquiries/'+row.id,'PATCH',{});setInquiries(await api('inquiries'))})}>ทำเครื่องหมายว่าอ่านแล้ว</button><button className="danger" disabled={busy} onClick={()=>{if(confirm('ลบข้อความนี้ถาวร?'))action(async()=>{await api('inquiries/'+row.id,'DELETE',{});setInquiries(await api('inquiries'))})}}>ลบข้อความ</button></div></article>)}</section>}
      {section==='media'&&<section className="editor-panel"><h2>คลังรูปและคลิป</h2><p>PNG, JPEG, WebP ไม่เกิน 5 MB · MP4 ไม่เกิน 8 MB · ไฟล์ใหม่อาจรอหนึ่งนาทีหรือมากกว่ากว่าจะเปิดได้ทุกพื้นที่</p><label className="upload-label">เพิ่มไฟล์<input type="file" accept="image/png,image/jpeg,image/webp,video/mp4" onChange={async event=>{if(event.target.files[0])await upload(event.target.files[0]);event.target.value=''}}/></label><p>ใช้แล้ว {(media.reduce((n,m)=>n+m.bytes,0)/1048576).toFixed(1)} MB / ประมาณ 763 MB ที่กำหนดให้ระบบนี้</p><div className="media-grid">{media.map(m=><article key={m.path}>{m.mime.startsWith('image/')?<img src={'../'+m.path} alt="ไฟล์ในคลังสื่อ" loading="lazy"/>:<video src={'../'+m.path} controls preload="none"/>}<p>{m.path.slice(-16)} · {(m.bytes/1024).toFixed(0)} KB</p><a href={'../'+m.path} download>ดาวน์โหลด</a><button className="danger" onClick={()=>{if(confirm('ลบไฟล์ที่ไม่ได้ใช้แล้ว?'))action(async()=>{await api('media','DELETE',{path:m.path});setMedia(await api('media'))})}}>ลบไฟล์</button></article>)}</div></section>}
      {section==='history'&&<section className="editor-panel"><h2>ข้อมูลก่อนบันทึก 20 รุ่นล่าสุด</h2><p>กู้คืนเป็นแบบร่างก่อน แล้วตรวจและกดบันทึกเพื่อเผยแพร่</p>{history.map(row=><div className="history-row" key={row.version}><span>รุ่น {row.version} · {new Date(row.updated).toLocaleString('th-TH')}</span><button onClick={()=>{if(!dirty||confirm('แทนแบบร่างปัจจุบันด้วยรุ่นนี้?'))action(async()=>{const result=await api('revisions/'+row.version);setData(result.content);setDirty(true);setSection('contact');setMessage('กู้คืนเป็นแบบร่างแล้ว กรุณาตรวจและบันทึก')})}}>กู้คืนเป็นแบบร่าง</button></div>)}<button onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='natee-content-v'+version+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>ดาวน์โหลดข้อมูลเนื้อหา</button></section>}
      {section==='users'&&auth.user.role==='admin'&&<section className="editor-panel"><h2>เพิ่มผู้ดูแล</h2><form className="account-form" onSubmit={event=>{event.preventDefault();const form=event.currentTarget;const body=Object.fromEntries(new FormData(form));action(async()=>{await api('users','POST',body);form.reset();setUsers(await api('users'));setMessage('เพิ่มผู้ดูแลแล้ว ส่งรหัสผ่านผ่านช่องทางส่วนตัวและให้เปลี่ยนเมื่อเข้าใช้ครั้งแรก')})}}><label>อีเมลผู้ดูแล<input name="email" type="email" required/></label><label>รหัสผ่านเริ่มต้น<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button className="primary" disabled={busy}>เพิ่มผู้ดูแล</button></form><h2>บัญชีที่มีอยู่</h2>{users.map(user=><article className="inquiry" key={user.id}><strong>{user.email}</strong><p>{'แอดมิน'} · {user.active?'ใช้งานได้':'ปิดใช้งาน'}</p>{user.id!==auth.user.id&&<><button onClick={()=>{if(confirm((user.active?'ปิด':'เปิด')+'ใช้งานบัญชีนี้?'))action(async()=>{await api('users/'+user.id,'PATCH',{active:!user.active});setUsers(await api('users'))})}}>{user.active?'ปิดใช้งาน':'เปิดใช้งาน'}</button><form onSubmit={event=>{event.preventDefault();const form=event.currentTarget;const body=Object.fromEntries(new FormData(form));action(async()=>{await api('users/'+user.id,'PATCH',body);form.reset();setMessage('ตั้งรหัสผ่านใหม่แล้ว และออกจากระบบทุกอุปกรณ์ของบัญชีนี้')})}}><label>ตั้งรหัสผ่านใหม่<input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required/></label><button disabled={busy}>ตั้งรหัสผ่านใหม่</button></form></>}</article>)}</section>}
      {section==='account'&&<section className="editor-panel"><h2>เปลี่ยนรหัสผ่าน</h2><form className="account-form" onSubmit={event=>{event.preventDefault();const body=Object.fromEntries(new FormData(event.currentTarget));action(async()=>{await api('password','POST',body);setAuth(null);setDirty(false);setMessage('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่')})}}><label>รหัสผ่านเดิม<input name="currentPassword" type="password" autoComplete="current-password" required/></label><label>รหัสผ่านใหม่<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button className="primary" disabled={busy}>เปลี่ยนรหัสผ่านและออกจากระบบ</button></form></section>}
    </main>
  </div>
}
createRoot(document.getElementById('admin-root')).render(<Admin />)
