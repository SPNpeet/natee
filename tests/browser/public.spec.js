import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for(const width of [320,375,430,768,1024,1280,1440]){
  for(const lang of ['th','en']){
    test('layout '+lang+' '+width+'px',async({page},info)=>{
      const errors=[]
      page.on('pageerror',error=>errors.push(error.message))
      await page.setViewportSize({width,height:900})
      await page.goto(lang==='th'?'/':'/en.html')
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('lang',lang)
      await page.evaluate(async()=>{
        for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}
        scrollTo({top:0,behavior:'instant'})
      })
      await expect.poll(()=>page.evaluate(()=>[...document.images].filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.currentSrc||img.src))).toEqual([])
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
      expect(errors).toEqual([])
      if([375,1280].includes(width))await page.screenshot({path:'test-results/public-'+info.project.name+'-'+lang+'-'+width+'.png',fullPage:true})
    })
  }
}
test('all public controls, modal focus, video lifecycle and mobile menu',async({page},info)=>{
  await page.goto('/')
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  // Exercise contact click handlers without opening a dialer or contacting anyone.
  await page.evaluate(()=>{
    document.addEventListener('click',event=>{
      const a=event.target.closest('a')
      if(a&&/^(tel:|mailto:|https:)/.test(a.getAttribute('href')||''))event.preventDefault()
    },true)
  })
  const publicContent=await page.locator('#natee-content').textContent().then(JSON.parse)
  const phoneLinks=page.locator('a[href^="tel:"]')
  for(let i=0;i<await phoneLinks.count();i++){
    const link=phoneLinks.nth(i)
    expect([publicContent.CONTACT.phoneHref,publicContent.CONTACT.phone2Href]).toContain(await link.getAttribute('href'))
    if(await link.isVisible())await link.click()
  }
  const outbound=page.locator('a[href^="https:"],a[href^="mailto:"]')
  for(let i=0;i<await outbound.count();i++){const link=outbound.nth(i);expect(await link.getAttribute('href')).not.toContain('undefined');if(await link.isVisible())await link.click()}
  const prices=page.locator('.natee-price-summary')
  for(let i=0;i<await prices.count();i++){
    const button=prices.nth(i)
    if(await button.getAttribute('aria-expanded')==='true')await button.click()
    await button.click();await expect(button).toHaveAttribute('aria-expanded','true')
    await expect(page.locator('#'+await button.getAttribute('aria-controls'))).toBeVisible()
    await button.click();await expect(button).toHaveAttribute('aria-expanded','false')
  }
  const questions=page.locator('.natee-faq-question')
  for(let i=0;i<await questions.count();i++){
    const button=questions.nth(i);await button.click()
    await expect(button).toHaveAttribute('aria-expanded','true')
    await expect(page.locator('#'+await button.getAttribute('aria-controls'))).toBeVisible()
    await button.click();await expect(button).toHaveAttribute('aria-expanded','false')
  }
  const opener=page.locator('.natee-gallery-link').first()
  await opener.click()
  const dialog=page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  for(let i=0;i<8;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>Boolean(document.activeElement.closest('dialog')))).toBe(true)}
  const total=publicContent.GALLERY.length+publicContent.I18N.th.videos.length
  for(let i=0;i<total;i++){
    await page.locator('.natee-lightbox-next').click()
    await expect(page.locator('.natee-lightbox-counter')).toContainText('จาก '+total)
    const image=page.locator('.natee-lightbox-image')
    if(await image.count())await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true)
  }
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused()
  await page.locator('.natee-video-link').first().click()
  const video=page.locator('.natee-lightbox-video')
  await video.evaluate(async node=>{window.testVideo=node;node.muted=true;await node.play()})
  await expect.poll(()=>video.evaluate(node=>node.currentTime)).toBeGreaterThan(0)
  await page.locator('.natee-lightbox-close').click()
  await expect.poll(()=>page.evaluate(()=>window.testVideo.paused)).toBe(true)
  await expect(page.locator('body')).not.toHaveClass(/natee-no-scroll/)
  await page.locator('.natee-copy').first().click()
  await expect(page.getByRole('status')).toContainText(publicContent.CONTACT.phone)
  await page.setViewportSize({width:375,height:812});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
  const toggle=page.locator('.natee-nav-toggle')
  await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true')
  await page.locator('#natee-nav a').first().click();await expect(toggle).toHaveAttribute('aria-expanded','false')
  await toggle.click();await page.keyboard.press('Escape');await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded','false')
  await toggle.click();await page.setViewportSize({width:1280,height:900});await expect(toggle).toHaveAttribute('aria-expanded','false');await page.setViewportSize({width:375,height:812})
  await expect(toggle).toHaveAttribute('aria-expanded','false')
  const contactToggle=page.locator('.natee-contact-toggle')
  const contactOptions=page.locator('#natee-contact-options')
  await expect(contactOptions).toBeHidden()
  await contactToggle.click();await expect(contactOptions).toBeVisible()
  await page.keyboard.press('Tab');await expect(page.locator('.natee-floating-call')).toBeFocused()
  await page.keyboard.press('Escape');await expect(contactOptions).toBeHidden();await expect(contactToggle).toBeFocused()
  await contactToggle.click();await page.locator('h1').click();await expect(contactOptions).toBeHidden()
  await contactToggle.click();await page.locator('.natee-floating-call').click();await expect(contactOptions).toBeHidden()
  await contactToggle.click();await page.locator('.natee-floating-line').click();await expect(contactOptions).toBeHidden()
  await page.setViewportSize({width:1280,height:900})
  await expect(contactToggle).toBeVisible()
  await contactToggle.click();await expect(contactOptions).toBeVisible()
  await contactToggle.click();await expect(contactOptions).toBeHidden()
  await page.getByRole('link',{name:'EN',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en')
  await page.getByRole('link',{name:'ไทย',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','th')
  expect(errors).toEqual([])
  await page.screenshot({path:'test-results/public-controls-'+info.project.name+'.png',fullPage:true})
})
test('automated accessibility on public content and admin editor',async({page,browserName},info)=>{
  test.skip(browserName!=='chromium','Run the accessibility rules once; layout/actions run on all engines.')
  await page.goto('/')
  const publicResult=await new AxeBuilder({page}).exclude('iframe').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
  await info.attach('public-axe.json',{body:JSON.stringify(publicResult,null,2),contentType:'application/json'})
  expect(publicResult.violations).toEqual([])
  await page.goto('/admin/')
  await page.getByLabel('อีเมล',{exact:true}).fill('admin@example.test')
  await page.getByLabel('รหัสผ่าน',{exact:true}).fill('Natee-CI-only-passphrase-2026!')
  await page.getByRole('button',{name:'เข้าสู่ระบบ',exact:true}).click()
  await expect(page.getByLabel('เบอร์โทรหลัก',{exact:true})).toBeVisible()
  const adminResult=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
  await info.attach('admin-axe.json',{body:JSON.stringify(adminResult,null,2),contentType:'application/json'})
  expect(adminResult.violations).toEqual([])
})

test('header brand and navigation never overlap at responsive boundaries',async({page})=>{
  for(const lang of ['th','en']){
    await page.goto(lang==='th'?'/':'/en.html')
    for(const width of [320,999,1000,1333,1559,1560]){
      await page.setViewportSize({width,height:900})
      await page.locator('.natee-brand-tagline').evaluate((node,text)=>{node.textContent=text},
        lang==='th'?'บริการรถส่งน้ำประปาเชียงใหม่สำหรับบ้านพัก สระว่ายน้ำ และงานก่อสร้าง '.repeat(3):'Water delivery in Chiang Mai for homes, swimming pools and construction sites '.repeat(3))
      const geometry=await page.locator('.natee-header').evaluate(header=>{
        const rect=selector=>{const e=header.querySelector(selector);const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}}
        return {brand:rect('.natee-brand'),text:rect('.natee-brand-text'),nav:rect('.natee-nav'),language:rect('.natee-lang'),toggle:rect('.natee-nav-toggle'),scroll:document.documentElement.scrollWidth,viewport:innerWidth}
      })
      expect(geometry.scroll).toBeLessThanOrEqual(width+1)
      expect(geometry.text.right).toBeLessThanOrEqual(geometry.brand.right+1)
      expect(geometry.brand.right).toBeLessThanOrEqual(geometry.language.x+1)
      if(width>=1000){
        expect(geometry.brand.bottom).toBeLessThanOrEqual(geometry.nav.y+1)
        await expect(page.locator('.natee-brand-tagline')).toBeVisible()
      }else{
        expect(geometry.brand.right).toBeLessThanOrEqual(geometry.toggle.x+1)
        await expect(page.locator('.natee-brand-tagline')).toBeHidden()
      }
    }
  }
})
