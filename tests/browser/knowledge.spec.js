import {test,expect} from '@playwright/test'

for(const width of [320,375,768,1024,1440]){
  for(const lang of ['th','en']){
    test('knowledge '+lang+' '+width+'px',async({page})=>{
      const errors=[]
      page.on('pageerror',error=>errors.push(error.message))
      await page.setViewportSize({width,height:900})
      await page.goto(lang==='th'?'/knowledge.html':'/knowledge-en.html')
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('lang',lang)
      await expect(page.locator('html')).toHaveAttribute('data-page','knowledge')
      await page.evaluate(async()=>{
        for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}
        scrollTo({top:0,behavior:'instant'})
      })
      await expect.poll(()=>page.evaluate(()=>[...document.images].filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.currentSrc||img.src))).toEqual([])
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
      await expect(page.locator('.natee-article-img')).toHaveCount(6)
      await expect(page.locator('.natee-nav-list a[aria-current="page"]')).toHaveCount(1)
      expect(errors).toEqual([])
      if([375,1440].includes(width))await page.screenshot({path:'test-results/knowledge-'+lang+'-'+width+'.png',fullPage:true})
    })
  }
}

test('knowledge page keeps the language and links back to home sections',async({page})=>{
  await page.goto('/knowledge.html')
  await expect(page.locator('.natee-lang a[hreflang="en"]')).toHaveAttribute('href','knowledge-en.html')
  await expect(page.locator('.natee-nav-list a').first()).toHaveAttribute('href',/^index\.html#natee-/)
})
