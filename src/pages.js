// ที่อยู่ของทุกหน้าในทั้งสองภาษา ใช้ร่วมกันทั้งลิงก์ในหน้าเว็บ canonical hreflang แผนผังเว็บ และการเลือกหน้าของ Worker
// หน้าบริการสร้างจากรายการ servicePages ในค่าตั้งต้น ชื่อในลิงก์ (slug) แก้ในหลังบ้านไม่ได้ ลิงก์ที่ Google เก็บไว้จึงไม่พัง
import { I18N } from './data.js'

export const SERVICE_SLUGS = I18N.th.servicePages.map((p) => p.slug)

export const PAGES = {
  home: { th: '/', en: '/en.html' },
  knowledge: { th: '/knowledge.html', en: '/knowledge-en.html' },
  ...Object.fromEntries(SERVICE_SLUGS.map((slug) => ['service:' + slug, { th: '/service-' + slug + '.html', en: '/service-' + slug + '-en.html' }])),
}

// ลิงก์แบบสัมพัทธ์สำหรับใช้ในหน้า หน้าแรกภาษาไทยใช้ index.html เหมือนเดิม
export function pageHref(page, lang) {
  const path = (PAGES[page] || PAGES.home)[lang]
  return path === '/' ? 'index.html' : path.slice(1)
}

export function pageFromPath(path) {
  for (const [page, paths] of Object.entries(PAGES)) {
    for (const lang of ['th', 'en']) if (paths[lang] === path) return { page, lang }
  }
  return null
}

export const isPage = (page) => Object.hasOwn(PAGES, page)
