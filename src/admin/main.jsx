import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import * as seed from '../data.js'
import { imageAsset } from '../brand.js'
import { mapEmbedUrl } from '../map.js'
import './admin.css'

const labels = {
  CONTACT:'ช่องทางติดต่อ', ASSETS:'รูปหลัก', GALLERY:'รูปผลงาน', FORM:'แบบฟอร์มติดต่อ', REVIEWS:'คะแนนรีวิว',
  phone:'เบอร์โทรหลัก',phone2:'เบอร์โทรสำรอง',email:'อีเมล',lineId:'LINE ID',lineUrl:'ลิงก์ LINE',facebookUrl:'ลิงก์ Facebook',mapUrl:'ลิงก์เปิดเส้นทาง',mapEmbed:'ตำแหน่งร้านบนแผนที่',
  share:'ภาพเมื่อแชร์ลิงก์',BRAND:'สีเว็บไซต์',color:'สีหลักเว็บไซต์',description:'คำอธิบายสำหรับผลค้นหา',logo:'โลโก้',hero:'รูปหน้าแรก',about:'รูปแนะนำร้าน',qr:'คิวอาร์โค้ด LINE',enabled:'เปิดรับข้อความติดต่อ',
  rating:'คะแนนเฉลี่ยจริง (0–5)',count:'จำนวนรีวิวจริง',url:'ลิงก์รีวิว',
  siteName:'ชื่อร้าน',tagline:'คำโปรยร้าน',address:'ที่อยู่',hours:'เวลาทำการ',heroTitle:'หัวข้อหน้าแรก',heroSubtitle:'รายละเอียดหน้าแรก',heroEyebrow:'ข้อความเหนือหัวข้อ',heroNote:'หมายเหตุหน้าแรก',
  aboutTitle:'หัวข้อแนะนำร้าน',aboutText:'รายละเอียดร้าน',aboutQuote:'คำกล่าวแนะนำร้าน',
  name:'ชื่อ',title:'หัวข้อ',text:'รายละเอียด',detail:'รายละเอียด',price:'ราคา',includes:'สิ่งที่ได้รับ',image:'รูปภาพ',icon:'ไอคอน',
  capacity:'ความจุ',q:'คำถาม',a:'คำตอบ',file:'คลิปวิดีโอ',poster:'ภาพหน้าปก',caption:'คำบรรยาย',
  highlights:'จุดเด่น',services:'บริการ',fleet:'ประเภทรถ',pricing:'รายการราคา',steps:'ขั้นตอนใช้บริการ',areas:'พื้นที่ให้บริการ',videos:'คลิปผลงาน',faq:'คำถามที่พบบ่อย',nav:'ชื่อเมนู',
  knowledge:'บทความ',navLabel:'ชื่อในเมนู',metaTitle:'ชื่อหน้าบนผลค้นหา',metaDescription:'คำอธิบายบนผลค้นหา',eyebrow:'ป้ายเหนือหัวข้อ',subtitle:'คำโปรย',quote:'คำพูดยกมา',quoteBy:'ที่มาของคำพูด',intro:'ย่อหน้าแรก',heroImage:'รูปหัวบทความ',heroAlt:'คำอธิบายรูปหัวบทความ',heroCaption:'คำบรรยายใต้รูปหัวบทความ',tocTitle:'หัวข้อสารบัญ',groupsTitle:'หัวข้อความสำคัญของน้ำ',groups:'ความสำคัญของน้ำ',usesTitle:'หัวข้อการใช้น้ำ',uses:'การใช้น้ำแต่ละภาคส่วน',benefitsTitle:'หัวข้อความสำคัญของน้ำประปา',benefitsSubtitle:'คำโปรยความสำคัญของน้ำประปา',benefits:'ความสำคัญของน้ำประปา',benefitsImage:'รูปประกอบความสำคัญของน้ำประปา',benefitsAlt:'คำอธิบายรูปความสำคัญของน้ำประปา',benefitsCaption:'คำบรรยายรูปความสำคัญของน้ำประปา',summaryTitle:'หัวข้อสรุป',summaryText:'ข้อความสรุป',summaryImage:'รูปประกอบสรุป',summaryAlt:'คำอธิบายรูปสรุป',summaryCaption:'คำบรรยายรูปสรุป',ctaText:'ข้อความชวนติดต่อ',backLabel:'ข้อความลิงก์กลับหน้าแรก',alt:'คำอธิบายรูป',
  servicePages:'หน้าบริการ',imageAlt:'คำอธิบายรูป',imageCaption:'คำบรรยายใต้รูป',fitTitle:'หัวข้อ เหมาะกับงานแบบไหน',fits:'งานที่เหมาะ',tipsTitle:'หัวข้อข้อแนะนำ',tips:'ข้อแนะนำ',
  serviceMore:'ปุ่มดูรายละเอียดบริการ',serviceRelated:'หัวข้อบริการอื่น',serviceFaqTitle:'หัวข้อคำถามในหน้าบริการ',serviceBack:'ลิงก์กลับหน้าแรกในหน้าบริการ',
}
const sections = [
  ['stats','สถิติ'],['contact','ข้อมูลร้าน'],['home','หน้าแรก'],['services','บริการ'],['fleet','ประเภทรถ'],['pricing','ราคา'],
  ['steps','ขั้นตอน'],['areas','พื้นที่บริการ'],['gallery','ผลงาน'],['faq','คำถามที่พบบ่อย'],['knowledge','บทความความรู้'],
  ['servicePages','หน้าบริการ'],['texts','ข้อความและปุ่ม'],['seo','ค้นหาและแชร์'],['settings','แบบฟอร์มและรีวิว'],['inbox','ข้อความติดต่อ'],['media','คลังสื่อ'],['history','ประวัติ'],['users','ผู้ดูแล'],['account','บัญชีของฉัน'],
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
const imageFields = new Set(['image','logo','hero','about','qr','poster','share','GALLERY','heroImage','benefitsImage','summaryImage'])
const bundledImages=['og-banner','logo','truck-4wheel','truck-6wheel','line-qr',...Array.from({length:12},(_,i)=>'work-'+String(i+1).padStart(2,'0')),...Array.from({length:4},(_,i)=>'work-video-'+String(i+1).padStart(2,'0')+'-poster')]
// บอกขนาดที่เหมาะกับแต่ละช่องรูป เจ้าของร้านจะได้ไม่ต้องเดา
const imageHints={
  hero:'แสดงเต็มภาพ ไม่ตัดขอบ แนะนำภาพแนวนอน กว้าง 1600 พิกเซลขึ้นไป ไฟล์ไม่เกิน 1 MB',
  about:'แสดงเต็มภาพ ไม่ตัดขอบ แนะนำภาพแนวนอน กว้าง 1600 พิกเซลขึ้นไป ไฟล์ไม่เกิน 1 MB',
  image:'แสดงเต็มภาพ ไม่ตัดขอบ แนะนำภาพแนวนอน กว้าง 1200 พิกเซลขึ้นไป',
  heroImage:'แสดงเต็มภาพ แนะนำภาพแนวนอน กว้าง 1200 พิกเซลขึ้นไป',benefitsImage:'แสดงเต็มภาพ แนะนำภาพแนวนอน กว้าง 1200 พิกเซลขึ้นไป',summaryImage:'แสดงเต็มภาพ แนะนำภาพแนวนอน กว้าง 1200 พิกเซลขึ้นไป',
  share:'ภาพที่ขึ้นเมื่อแชร์ลิงก์ใน LINE และ Facebook ขนาดที่เหมาะคือ 1200 × 630 พิกเซล',
  logo:'ภาพสี่เหลี่ยมจัตุรัส พื้นหลังโปร่งใส กว้าง 512 พิกเซลขึ้นไป',qr:'ภาพสี่เหลี่ยมจัตุรัส กว้าง 600 พิกเซลขึ้นไป',
  poster:'ภาพหน้าปกคลิป แนวตั้ง 9:16 เช่น 1080 × 1920 พิกเซล',
  GALLERY:'หน้ารวมผลงานแสดงเป็นกรอบ 4:3 เช่น 1600 × 1200 พิกเซล เมื่อกดดูจะเห็นเต็มภาพ',
}
// รูปและคลิปใช้ร่วมกันสองภาษา เปลี่ยนในภาษาหนึ่งแล้วอีกภาษาต้องเปลี่ยนตาม ไม่งั้นหน้าอังกฤษยังโชว์รูปเก่า
const sharedMedia=new Set(['image','file','poster','heroImage','benefitsImage','summaryImage'])
function mirrorMedia(data,path,value){
  if(path[0]!=='I18N'||!sharedMedia.has(String(path.at(-1))))return data
  const other=path[1]==='th'?'en':'th'
  const target=[ 'I18N',other,...path.slice(2)]
  const parent=target.slice(0,-1).reduce((o,k)=>o?.[k],data)
  return parent && Object.hasOwn(parent,target.at(-1)) ? updateAt(data,target,value) : data
}
// รูปจากมือถือหรือโปสเตอร์มักใหญ่เกินจำเป็น ย่อให้กว้างไม่เกิน 1920 และแปลงเป็น WebP ก่อนส่งขึ้น หน้าเว็บจะโหลดเร็วขึ้น
// ถ้าย่อแล้วไม่เล็กลง หรือเบราว์เซอร์ทำไม่ได้ ใช้ไฟล์เดิม
async function shrinkImage(file,maxWidth=1920,keepSmall=600*1024) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== 'function') return file
  const bitmap=await createImageBitmap(file).catch(()=>null)
  if (!bitmap) return file
  const scale=Math.min(1,maxWidth/bitmap.width)
  if (scale===1 && file.size<=keepSmall) return file
  const canvas=document.createElement('canvas')
  canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale)
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height)
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.85))
  return blob && blob.size<file.size && blob.type==='image/webp' ? new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'}) : file
}
const icons=['tank','pool','construction','leaf','road','event','truck','clock','shield','check','water','pin','drop','factory']
function Field({value,path,onChange,media,upload,model}) {
  const key=String(path.at(-1))
  const label=titleFor(key,model)
  const fieldId='field-'+path.join('-')
  const image=imageFields.has(key) || path.includes('GALLERY')
  const video=key === 'file'
  if (Array.isArray(value)) {
    // หน้าบริการมีที่อยู่ตายตัวที่ Google เก็บไว้ แก้ได้เฉพาะเนื้อหา ไม่ให้เพิ่ม ลบ หรือสลับ
    const fixed=key==='servicePages'
    return <fieldset className="collection"><legend>{labels[key] || 'รายการ'}</legend>
      {value.map((row,i)=><div className="repeat-row" key={i}>
        <div className="row-heading"><strong>{typeof row==='object' ? row.navLabel || row.name || row.title || row.q || row.caption || 'รายการ '+(i+1) : 'รายการ '+(i+1)}</strong>
          {!fixed && <div className="row-actions">
            <button type="button" disabled={i===0} aria-label={'เลื่อนรายการ '+(i+1)+' ขึ้น'} onClick={()=>{const n=[...value];[n[i-1],n[i]]=[n[i],n[i-1]];onChange(path,n)}}>↑</button>
            <button type="button" disabled={i===value.length-1} aria-label={'เลื่อนรายการ '+(i+1)+' ลง'} onClick={()=>{const n=[...value];[n[i+1],n[i]]=[n[i],n[i+1]];onChange(path,n)}}>↓</button>
            <button type="button" className="danger" onClick={()=>{if(confirm('ลบรายการนี้จากแบบร่าง?'))onChange(path,value.filter((_,j)=>i!==j))}}>ลบรายการ</button>
          </div>}
        </div>
        <Field value={row} path={[...path,i]} onChange={onChange} media={media} upload={upload} model={model?.[0]} />
      </div>)}
      {!fixed && <button type="button" onClick={()=>onChange(path,[...value,clone(model?.[0] ?? (typeof value[0]==='object' ? value[0] : ''))])}>+ เพิ่มรายการ</button>}
    </fieldset>
  }
  if (value && typeof value==='object') return <div className="field-grid">{Object.entries(value).filter(([k])=>!['lang','phoneHref','phone2Href','accessKey','endpoint','slug'].includes(k)).map(([k,v])=><Field key={k} value={v} path={[...path,k]} onChange={onChange} media={media} upload={upload} model={model?.[k]} />)}</div>
  if (typeof value==='boolean') return <label className="check-label"><input type="checkbox" checked={value} onChange={event=>onChange(path,event.target.checked)} />{label}</label>
  if (image || video) {
    const options=video ? ['work-video-01','work-video-02','work-video-03','work-video-04'] : bundledImages
    const uploads=media.filter(m=>video ? m.mime==='video/mp4' : m.mime.startsWith('image/'))
    return <div className="field media-field"><label htmlFor={fieldId}>{label}</label>
      <select id={fieldId} value={value} onChange={event=>onChange(path,event.target.value)}>
        <option value="">เลือกไฟล์{key==='poster' ? ' (ว่าง = ใช้ภาพเดิม)' : ''}</option>
        {[...new Set([...options,...uploads.map(m=>m.path),...(value ? [value] : [])])].map((v,i)=><option key={v} value={v}>{v.startsWith('uploads/') ? 'ไฟล์อัปโหลด '+(i-options.length+1)+' · '+v.slice(-12) : v}</option>)}
      </select>
      {image && value && <img className="field-preview" src={'../'+imageAsset(value)} alt="ภาพที่เลือก" />}
      {image && <small>{imageHints[path.includes('GALLERY') ? 'GALLERY' : key] || 'แนะนำภาพแนวนอน กว้าง 1200 พิกเซลขึ้นไป'}</small>}
      {video && <small>ใช้ไฟล์เดียวกันทั้งหน้าไทยและหน้าอังกฤษ เปลี่ยนที่ภาษาไหนก็ได้</small>}
      <label className="upload-label">อัปโหลด{video ? 'คลิปใหม่' : 'รูปใหม่'}<input type="file" accept={video ? 'video/mp4' : 'image/png,image/jpeg,image/webp'} onChange={async event=>{const file=event.target.files[0];if(file){const result=await upload(file);if(result)onChange(path,result.path)}event.target.value=''}} /></label>
    </div>
  }
  if (key==='mapEmbed') {
    const preview=mapEmbedUrl(value)
    return <div className="field map-field"><label htmlFor={fieldId}>{label}</label>
      <textarea id={fieldId} rows={3} value={value} maxLength={6000} onChange={event=>onChange(path,event.target.value)} />
      <small>เปิดร้านใน Google Maps แล้วคัดลอกลิงก์จากแถบที่อยู่ หรือใส่พิกัด เช่น 18.8509, 98.9881 ระบบแปลงเป็นแผนที่ให้เอง ลิงก์ย่อ maps.app.goo.gl ใช้ได้เมื่อกดบันทึก</small>
      {preview ? <iframe className="map-preview" src={preview} title="ตัวอย่างแผนที่" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <p className="notice">ยังอ่านตำแหน่งจากข้อความนี้ไม่ได้ ระบบจะลองอีกครั้งตอนกดบันทึก</p>}
    </div>
  }
  if (key==='color')return <div className="field"><label htmlFor={fieldId}>{label}</label><input id={fieldId} type="color" value={value} onChange={event=>onChange(path,event.target.value)}/><small>{value}</small></div>
  if (key==='icon') return <div className="field"><label htmlFor={fieldId}>{label}</label><select id={fieldId} value={value} onChange={event=>onChange(path,event.target.value)}>{[...new Set([value,...icons])].map(v=><option key={v}>{v}</option>)}</select></div>
  return <div className="field"><label htmlFor={fieldId}>{label}</label>
    {typeof value==='number' ? <input id={fieldId} type="number" min="0" step={key==='rating' ? '0.1' : '1'} max={key==='rating' ? 5 : undefined} value={value} onChange={event=>onChange(path,Number(event.target.value))} /> :
    <textarea id={fieldId} rows={value.length>100 || value.includes('\n') ? 3 : 2} value={value} maxLength={6000} onChange={event=>onChange(path,event.target.value)} />}
  </div>
}
function Admin() {
  const [auth,setAuth]=useState(null),[ready,setReady]=useState(false),[setup,setSetup]=useState(false),[reauth,setReauth]=useState(false)
  const [section,setSection]=useState('contact'),[lang,setLang]=useState('th')
  const [data,setData]=useState(null),[version,setVersion]=useState(0),[dirty,setDirty]=useState(false)
  const [stats,setStats]=useState([])
  const [media,setMedia]=useState([]),[inquiries,setInquiries]=useState([]),[users,setUsers]=useState([]),[history,setHistory]=useState([])
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
  async function api(path,method='GET',body) {
    const headers={}
    if (auth?.csrf) headers['X-CSRF-Token']=auth.csrf
    if (body && !(body instanceof File)) headers['Content-Type']='application/json'
    const options={method,headers,credentials:'same-origin'}
    if(body && !['GET','HEAD'].includes(method))options.body=body instanceof File ? body : JSON.stringify(body)
    const response=await fetch('../api/'+path,options)
    let result
    try { result=await response.json() } catch { throw new Error('เชื่อมต่อหลังบ้านไม่ได้ กรุณาลองโหลดหน้าใหม่') }
    if (!response.ok) {
      if(response.status===401 && auth?.user)setReauth(true)
      throw new Error(result.error || 'ทำรายการไม่สำเร็จ')
    }
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
    const key={inbox:'inquiries',users:'users',history:'revisions',stats:'stats'}[section]
    if(!key)return
    api(key).then(result=>({inbox:setInquiries,users:setUsers,history:setHistory,stats:setStats}[section])(result)).catch(err=>setError(err.message))
  },[section,auth?.user?.id])
  async function action(fn) {
    setBusy(true);setError('');setMessage('')
    try {await fn()} catch(err){setError(err.message)} finally{setBusy(false)}
  }
  async function upload(original) {
    if(busy)return null
    setBusy(true);setError('')
    try {
      const file=await shrinkImage(original)
      if(file.size>8*1024*1024)throw new Error('ไฟล์ต้องไม่เกิน 8 MB และรูปต้องไม่เกิน 5 MB')
      const result=await api('media','POST',file)
      // รุ่นเล็กกว้าง 960 สำหรับมือถือ ถ้าส่งไม่สำเร็จหน้าเว็บยังใช้รูปเต็มแทนได้ จึงไม่ต้องหยุดงาน
      if (result.mime.startsWith('image/')) {
        const small=await shrinkImage(file,960,0)
        if (small.type==='image/webp' && small!==file) await api('media/variant?of='+encodeURIComponent(result.path),'POST',small).catch(()=>null)
      }
      setMedia(m=>[result,...m]);setMessage('อัปโหลดแล้ว ไฟล์อาจใช้เวลาหนึ่งนาทีหรือมากกว่ากว่าจะเปิดได้ทุกพื้นที่')
      return result
    }catch(err){setError(err.message);return null}finally{setBusy(false)}
  }
  const change=(path,value)=>{setData(d=>mirrorMedia(updateAt(d,path,value),path,value));setDirty(true);setMessage('')}
  const field=path=>data && <Field key={path.join('.')} value={path.reduce((o,k)=>o[k],data)} path={path} model={initial(path)} onChange={change} media={media} upload={upload} />
  const save=()=>action(async()=>{const result=await api('content','PUT',{content:data,version});setData(result.content);setVersion(result.version);setDirty(false);setMessage('บันทึกและเผยแพร่เนื้อหาแล้ว · รุ่น '+result.version)})
  if(!ready)return <main className="login"><p role="status">กำลังเชื่อมต่อ…</p></main>
  if(!auth||reauth)return <main className="login"><div className="login-card"><p className="eyebrow">ธารนที · ผู้ดูแลเว็บไซต์</p><h1>{setup ? 'ตั้งค่าบัญชีแอดมิน' : 'เข้าสู่ระบบ'}</h1>
    <p>{reauth?'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง แบบร่างในหน้านี้ยังอยู่':'จัดการข้อความ รูปผลงาน และข้อมูลติดต่อของร้าน'}</p>
    {error&&<p className="notice error" role="alert">{error}</p>}
    <form onSubmit={event=>{event.preventDefault();const body=Object.fromEntries(new FormData(event.currentTarget));action(async()=>{const result=await api(setup?'setup':'login','POST',body);setAuth(result);setSetup(false);setReauth(false)})}}>
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
      {data && !['inbox','media','users','account','history','stats'].includes(section) && <>
        <div className="editor-tools"><div role="group" aria-label="ภาษาที่แก้ไข"><button aria-pressed={lang==='th'} onClick={()=>setLang('th')}>ไทย</button><button aria-pressed={lang==='en'} onClick={()=>setLang('en')}>English</button></div><button onClick={()=>{if(!dirty||confirm('ทิ้งแบบร่างแล้วโหลดข้อมูลล่าสุด?'))action(async()=>{const c=await api('content');setData(c.content);setVersion(c.version);setDirty(false)})}}>โหลดล่าสุด</button></div>
        <fieldset className="editor-panel" disabled={busy}>
        {section==='contact'&&<>{field(['CONTACT'])}{['siteName','tagline','address','hours'].map(key=>field(['I18N',lang,key]))}{field(['ASSETS'])}{field(['BRAND'])}</>}
        {section==='home'&&<>{['heroEyebrow','heroTitle','heroSubtitle','heroNote','aboutTitle','aboutText','aboutQuote','highlights'].map(key=>field(['I18N',lang,key]))}</>}
        {['services','fleet','pricing','steps','areas','faq'].includes(section)&&field(['I18N',lang,section])}
        {section==='servicePages'&&<><p>หน้าเฉพาะของแต่ละบริการ ช่วยให้คนที่ค้นหาบริการนั้นใน Google เจอร้าน แก้ข้อความและรูปได้ ส่วนที่อยู่ของหน้าคงที่ ไอคอนของหน้าบริการต้องตรงกับไอคอนในเมนูบริการ ปุ่มดูรายละเอียดจึงจะขึ้นในหน้าแรก</p>{field(['I18N',lang,'servicePages'])}</>}
        {section==='knowledge'&&<><p>บทความในหน้าความรู้ รูปเลือกจากคลังสื่อได้ ทุกรูปต้องมีคำอธิบายรูปสำหรับผู้ใช้ที่มองไม่เห็น</p>{field(['I18N',lang,'knowledge'])}</>}
        {section==='gallery'&&<><p>รูปใช้ร่วมกันสองภาษา คลิปต้องมีจำนวนเท่ากันทั้งไทยและอังกฤษ</p>{field(['GALLERY'])}{field(['I18N',lang,'videos'])}</>}
        {section==='texts'&&<>{field(['I18N',lang,'nav'])}{Object.keys(data.I18N[lang]).filter(key=>typeof data.I18N[lang][key]==='string'&&key!=='lang').map(key=>field(['I18N',lang,key]))}</>}
        {section==='seo'&&<><p>เว้นว่างเพื่อใช้หัวข้อและรายละเอียดหน้าแรกอัตโนมัติ แก้ภาพแชร์ได้ใน “ข้อมูลร้าน”</p>{field(['SEO',lang])}</>}
        {section==='settings'&&<><h2>แบบฟอร์มฝากข้อความ</h2><p>ข้อความจะเข้ากล่อง “ข้อความติดต่อ” ในหลังบ้าน เจ้าหน้าที่ต้องตรวจกล่องนี้เป็นประจำ</p>{field(['FORM'])}<h2>รีวิว</h2><p>กรอกเฉพาะคะแนนและจำนวนรีวิวจริง หากยังไม่มีให้ใช้ 0</p>{field(['REVIEWS'])}</>}
        </fieldset><div className="save-bar"><span>{dirty?'ตรวจข้อความทั้งสองภาษาก่อนบันทึก':'หน้าเว็บใช้ข้อมูลรุ่นนี้อยู่'}</span><button className="primary" disabled={busy||!dirty} onClick={save}>{busy?'กำลังบันทึก…':'บันทึกและเผยแพร่เนื้อหา'}</button></div>
      </>}
      {section==='stats'&&<section className="editor-panel"><h2>การติดต่อผ่านเว็บไซต์ใน 30 วันที่ผ่านมา</h2><p>นับจำนวนการกดปุ่มและส่งฟอร์ม ไม่ใช่จำนวนลูกค้าหรือยอดขาย ไม่เก็บรหัสระบุตัวผู้เข้าชม</p><div className="field-grid">{Object.entries({call_click:'กดโทร',line_click:'กด LINE',form_submit:'ส่งฟอร์ม',video_open:'เปิดคลิป',language_switch:'สลับภาษา'}).map(([key,label])=><article className="inquiry" key={key}><h2>{label}</h2><strong>{stats.find(s=>s.event===key)?.count||0}</strong></article>)}</div><button onClick={()=>action(async()=>setStats(await api('stats')))}>รีเฟรชสถิติ</button></section>}
      {section==='inbox'&&<section className="editor-panel"><p>ข้อมูลติดต่อเก็บไว้ 90 วัน กรุณาตรวจและติดต่อกลับเป็นประจำ ไม่มีการส่งอีเมลอัตโนมัติในรุ่นนี้</p><button onClick={()=>action(async()=>setInquiries(await api('inquiries')))}>รีเฟรชข้อความ</button>{!inquiries.length&&<p className="empty">ยังไม่มีข้อความติดต่อ</p>}{inquiries.map(row=><article className="inquiry" key={row.id}><div className="row-heading"><h2>{row.name}</h2><span className="badge">{row.status==='new'?'ใหม่':'อ่านแล้ว'}</span></div><p><a href={'tel:'+row.phone}>{row.phone}</a> · {row.language==='en'?'ภาษาอังกฤษ':'ภาษาไทย'} · {new Date(row.created).toLocaleString('th-TH')}</p><p>{row.area}</p><p className="prewrap">{row.message}</p><div className="row-actions"><button disabled={busy||row.status==='read'} onClick={()=>action(async()=>{await api('inquiries/'+row.id,'PATCH',{});setInquiries(await api('inquiries'))})}>ทำเครื่องหมายว่าอ่านแล้ว</button><button className="danger" disabled={busy} onClick={()=>{if(confirm('ลบข้อความนี้ถาวร?'))action(async()=>{await api('inquiries/'+row.id,'DELETE',{});setInquiries(await api('inquiries'))})}}>ลบข้อความ</button></div></article>)}{inquiries.length>0&&inquiries.length%500===0&&<button disabled={busy} onClick={()=>action(async()=>{const older=await api('inquiries?before='+inquiries.at(-1).id);setInquiries(rows=>[...rows,...older]);if(!older.length)setMessage('ไม่มีข้อความเก่ากว่านี้แล้ว')})}>โหลดข้อความเก่ากว่า</button>}</section>}
      {section==='media'&&<section className="editor-panel"><h2>คลังรูปและคลิป</h2><p>PNG, JPEG, WebP ไม่เกิน 5 MB · MP4 ไม่เกิน 8 MB · ไฟล์ใหม่อาจรอหนึ่งนาทีหรือมากกว่ากว่าจะเปิดได้ทุกพื้นที่</p><label className="upload-label">เพิ่มไฟล์<input type="file" accept="image/png,image/jpeg,image/webp,video/mp4" onChange={async event=>{if(event.target.files[0])await upload(event.target.files[0]);event.target.value=''}}/></label><p>มี {media.length} / 500 ไฟล์ · ใช้แล้ว {(media.reduce((n,m)=>n+m.bytes,0)/1048576).toFixed(1)} MB / ประมาณ 763 MB ที่กำหนดให้ระบบนี้</p><div className="media-grid">{media.map(m=><article key={m.path}>{m.mime.startsWith('image/')?<img src={'../'+m.path} alt="ไฟล์ในคลังสื่อ" loading="lazy"/>:<video src={'../'+m.path} controls preload="none"/>}<p>{m.path.slice(-16)} · {(m.bytes/1024).toFixed(0)} KB</p><a href={'../'+m.path} download>ดาวน์โหลด</a><button className="danger" onClick={()=>{if(confirm('ลบไฟล์ที่ไม่ได้ใช้แล้ว?'))action(async()=>{await api('media','DELETE',{path:m.path});setMedia(await api('media'))})}}>ลบไฟล์</button></article>)}</div></section>}
      {section==='history'&&<section className="editor-panel"><h2>ข้อมูลก่อนบันทึก 20 รุ่นล่าสุด</h2><p>กู้คืนเป็นแบบร่างก่อน แล้วตรวจและกดบันทึกเพื่อเผยแพร่</p>{history.map(row=><div className="history-row" key={row.version}><span>รุ่น {row.version} · {new Date(row.updated).toLocaleString('th-TH')}</span><button onClick={()=>{if(!dirty||confirm('แทนแบบร่างปัจจุบันด้วยรุ่นนี้?'))action(async()=>{const result=await api('revisions/'+row.version);setData(result.content);setDirty(true);setSection('contact');setMessage('กู้คืนเป็นแบบร่างแล้ว กรุณาตรวจและบันทึก')})}}>กู้คืนเป็นแบบร่าง</button></div>)}<button onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='natee-content-'+(dirty?'draft':'v'+version)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>ดาวน์โหลดข้อมูลเนื้อหา</button></section>}
      {section==='users'&&auth.user.role==='admin'&&<section className="editor-panel"><h2>เพิ่มผู้ดูแล</h2><form className="account-form" onSubmit={event=>{event.preventDefault();const form=event.currentTarget;const body=Object.fromEntries(new FormData(form));action(async()=>{await api('users','POST',body);form.reset();setUsers(await api('users'));setMessage('เพิ่มผู้ดูแลแล้ว ส่งรหัสผ่านผ่านช่องทางส่วนตัวและให้เปลี่ยนเมื่อเข้าใช้ครั้งแรก')})}}><label>อีเมลผู้ดูแล<input name="email" type="email" required/></label><label>รหัสผ่านเริ่มต้น<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button className="primary" disabled={busy}>เพิ่มผู้ดูแล</button></form><h2>บัญชีที่มีอยู่</h2>{users.map(user=><article className="inquiry" key={user.id}><strong>{user.email}</strong><p>{'แอดมิน'} · {user.active?'ใช้งานได้':'ปิดใช้งาน'}</p>{user.id!==auth.user.id&&<><button onClick={()=>{if(confirm((user.active?'ปิด':'เปิด')+'ใช้งานบัญชีนี้?'))action(async()=>{await api('users/'+user.id,'PATCH',{active:!user.active});setUsers(await api('users'))})}}>{user.active?'ปิดใช้งาน':'เปิดใช้งาน'}</button><form onSubmit={event=>{event.preventDefault();const form=event.currentTarget;const body=Object.fromEntries(new FormData(form));action(async()=>{await api('users/'+user.id,'PATCH',body);form.reset();setMessage('ตั้งรหัสผ่านใหม่แล้ว และออกจากระบบทุกอุปกรณ์ของบัญชีนี้')})}}><label>ตั้งรหัสผ่านใหม่<input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required/></label><button disabled={busy}>ตั้งรหัสผ่านใหม่</button></form></>}</article>)}</section>}
      {section==='account'&&<section className="editor-panel"><h2>เปลี่ยนรหัสผ่าน</h2><form className="account-form" onSubmit={event=>{event.preventDefault();const body=Object.fromEntries(new FormData(event.currentTarget));if(dirty&&!confirm('มีแบบร่างที่ยังไม่บันทึก ต้องการเปลี่ยนรหัสผ่านและออกจากระบบ?'))return;action(async()=>{await api('password','POST',body);setAuth(null);setDirty(false);setMessage('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่')})}}><label>รหัสผ่านเดิม<input name="currentPassword" type="password" autoComplete="current-password" required/></label><label>รหัสผ่านใหม่<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button className="primary" disabled={busy}>เปลี่ยนรหัสผ่านและออกจากระบบ</button></form></section>}
    </main>
  </div>
}
createRoot(document.getElementById('admin-root')).render(<Admin />)
