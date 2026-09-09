import { createRoot } from 'react-dom/client'
import { useEffect,useState } from 'react'
import './admin.css'
function Admin(){
  const [session,setSession]=useState(null),[setup,setSetup]=useState(false),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
  async function api(path,body){
    const headers=body?{'Content-Type':'application/json'}:{}
    if(session?.csrf)headers['X-CSRF-Token']=session.csrf
    const response=await fetch('../api/'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,credentials:'same-origin'})
    let result
    try{result=await response.json()}catch{throw new Error('เชื่อมต่อระบบไม่ได้ กรุณาโหลดหน้าใหม่')}
    if(!response.ok)throw new Error(result.error||'ทำรายการไม่สำเร็จ')
    return result
  }
  useEffect(()=>{api('session').then(data=>{setSession(data.user?data:null);setSetup(Boolean(data.setupRequired))}).catch(e=>setError(e.message)).finally(()=>setReady(true))},[])
  async function act(fn){setBusy(true);setError('');setNotice('');try{await fn()}catch(e){setError(e.message)}finally{setBusy(false)}}
  if(!ready)return <main className="login"><p role="status">กำลังเชื่อมต่อ…</p></main>
  return <main className="login"><div className="login-card"><p className="eyebrow">ธารนที · แอดมิน</p><h1>{session?'บัญชีแอดมิน':setup?'ตั้งค่าบัญชีแอดมิน':'เข้าสู่ระบบ'}</h1>
    {error&&<p className="notice error" role="alert">{error}</p>}{notice&&<p className="notice success" role="status">{notice}</p>}
    {!session?<form onSubmit={event=>{event.preventDefault();const body=Object.fromEntries(new FormData(event.currentTarget));act(async()=>{const data=await api(setup?'setup':'login',body);setSession(data);setSetup(false)})}}>
      {setup&&<label>รหัสตั้งค่าระบบ<input name="token" type="password" autoComplete="off" minLength={32} required/><small>รับจากผู้ติดตั้งระบบของร้าน ใช้ได้เฉพาะครั้งแรก</small></label>}
      <label>อีเมล<input name="email" type="email" autoComplete="username" required/></label><label>รหัสผ่าน<input name="password" type="password" minLength={setup?12:undefined} maxLength={128} autoComplete={setup?'new-password':'current-password'} required/></label>
      <button className="primary" disabled={busy}>{busy?'กำลังดำเนินการ…':setup?'สร้างบัญชีแอดมิน':'เข้าสู่ระบบ'}</button></form>:
      <><p role="status">เข้าสู่ระบบแล้ว: {session.user.email}</p><button disabled={busy} onClick={()=>act(async()=>{await api('logout',{});setSession(null)})}>ออกจากระบบ</button>
      <h2>เปลี่ยนรหัสผ่าน</h2><form onSubmit={event=>{event.preventDefault();const body=Object.fromEntries(new FormData(event.currentTarget));act(async()=>{await api('password',body);setSession(null);setNotice('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่')})}}>
      <label>รหัสผ่านเดิม<input name="currentPassword" type="password" autoComplete="current-password" required/></label>
      <label>รหัสผ่านใหม่<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button disabled={busy}>เปลี่ยนรหัสผ่านและออกจากระบบ</button></form></>}
    <a href="../">กลับหน้าเว็บไซต์</a></div></main>
}
createRoot(document.getElementById('admin-root')).render(<Admin/>)
