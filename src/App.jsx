import { useState, useEffect, useRef, useCallback } from 'react'
import Icon from './icons.jsx'
import { I18N, CONTACT, GALLERY, REVIEWS } from './data.js'
import { track } from './track.js'
import ContactForm from './ContactForm.jsx'
import ContactButtons from './ContactButtons.jsx'
import Knowledge from './Knowledge.jsx'

const SECTIONS = ['services', 'fleet', 'pricing', 'areas', 'gallery', 'faq', 'contact']

export default function App({ lang = 'th', page = 'home' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openPrice, setOpenPrice] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [viewer, setViewer] = useState(null)
  const [toast, setToast] = useState('')

  const L = I18N[lang]
  const home = page === 'home'
  const homeHref = lang === 'th' ? 'index.html' : 'en.html'
  const knowledgeHref = lang === 'th' ? 'knowledge.html' : 'knowledge-en.html'

  // สลับภาษาแล้วต้องอยู่หน้าเดิมเสมอ ไม่ใช่เด้งกลับหน้าแรกทุกครั้ง
  const otherLangHref = home
    ? (lang === 'th' ? 'en.html' : 'index.html')
    : (lang === 'th' ? 'knowledge-en.html' : 'knowledge.html')

  const media = [
    ...L.videos.map((v, i) => ({
      type: 'video',
      src: `videos/${v.file}.mp4`,
      poster: `images/${v.file}-poster.webp`,
      alt: v.caption,
      key: `v${i}`,
    })),
    ...GALLERY.map((name, i) => ({
      type: 'image',
      src: `images/${name}.webp`,
      thumb: `images/${name}-sm.webp`,
      alt: `${L.galleryAlt} ${L.siteName} ${i + 1}`,
      key: name,
    })),
  ]

  const showNext = useCallback((step) => {
    setViewer((v) => (v === null ? v : (v + step + media.length) % media.length))
  }, [media.length])

  // ปุ่มลูกศรและปุ่ม Esc ขณะเปิดตัวดูผลงาน
  useEffect(() => {
    if (viewer === null) return

    const onKey = (e) => {
      if (e.key === 'Escape') { setViewer(null); return }
      if (e.key === 'ArrowLeft') { e.preventDefault(); showNext(-1) }
      if (e.key === 'ArrowRight') { e.preventDefault(); showNext(1) }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewer, showNext])

  // ล็อกการเลื่อนหน้าเว็บและชดเชยความกว้างแถบเลื่อน ไม่ให้หน้าเว็บกระตุก
  useEffect(() => {
    if (viewer === null) return

    const bar = window.innerWidth - document.documentElement.clientWidth
    const prev = document.body.style.paddingRight

    document.body.classList.add('natee-no-scroll')
    if (bar > 0) document.body.style.paddingRight = `${bar}px`

    return () => {
      document.body.classList.remove('natee-no-scroll')
      document.body.style.paddingRight = prev
    }
  }, [viewer])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const swipe = useRef(null)
  const onTouchStart = (e) => { swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e) => {
    if (!swipe.current) return
    const dx = e.changedTouches[0].clientX - swipe.current.x
    const dy = e.changedTouches[0].clientY - swipe.current.y
    swipe.current = null
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return
    showNext(dx < 0 ? 1 : -1)
  }

  const copyPhone = async (number) => {
    try {
      await navigator.clipboard.writeText(number)
      setToast(`${L.copied} ${number}`)
      setTimeout(() => setToast(''), 1800)
    } catch {
      window.location.href = `tel:${number.replace(/[^0-9]/g, '')}`
    }
  }

  const current = viewer === null ? null : media[viewer]

  return (
    <>
      <a className="natee-skip" href="#natee-main">{L.skipToContent}</a>

      <header className="natee-header">
        <div className="natee-container natee-header-inner">
          <a className="natee-brand" href={home ? '#natee-hero' : homeHref}>
            <img className="natee-brand-logo" src={`images/logo.webp`} alt={L.siteName} width="240" height="338" />
            <span className="natee-brand-text">
              <span className="natee-brand-name">{L.siteName}</span>
            </span>
          </a>

          <button
            className="natee-nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="natee-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="natee-nav-toggle-bar" aria-hidden="true" />
            <span className="natee-screen-reader">{menuOpen ? L.closeMenu : L.openMenu}</span>
          </button>

          <nav className={`natee-nav${menuOpen ? ' is-open' : ''}`} id="natee-nav" aria-label={L.mainMenu}>
            <ul className="natee-nav-list">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a href={`${home ? '' : homeHref}#natee-${id}`} onClick={() => setMenuOpen(false)}>{L.nav[id]}</a>
                </li>
              ))}
              <li>
                <a
                  href={knowledgeHref}
                  className={home ? undefined : 'is-current'}
                  aria-current={home ? undefined : 'page'}
                  onClick={() => setMenuOpen(false)}
                >
                  {L.knowledge.navLabel}
                </a>
              </li>
            </ul>
          </nav>

          <div className="natee-lang" role="group" aria-label={L.changeLanguage}>
            {lang === 'th' ? (
              <span className="natee-lang-item is-active" lang="th" aria-current="true">ไทย</span>
            ) : (
              <a className="natee-lang-item" href={otherLangHref} hrefLang="th" lang="th"
                onClick={() => track('language_switch', { to: 'th' })}>ไทย</a>
            )}
            {lang === 'en' ? (
              <span className="natee-lang-item is-active" lang="en" aria-current="true">EN</span>
            ) : (
              <a className="natee-lang-item" href={otherLangHref} hrefLang="en" lang="en"
                onClick={() => track('language_switch', { to: 'en' })}>EN</a>
            )}
          </div>

          <a className="natee-header-call" href={CONTACT.phoneHref}
            onClick={() => track('call_click', { place: 'header', language: lang })}>
            <Icon name="phone" />
            <span className="natee-header-call-text">
              <span className="natee-header-call-label">{L.callHeader}</span>
              <span className="natee-nowrap natee-header-call-number">{CONTACT.phone}</span>
            </span>
          </a>
        </div>
      </header>

      <main id="natee-main" className="natee-main">
        {home ? (
          <>
          <section className="natee-hero" id="natee-hero">
            <div className="natee-container natee-hero-inner">
              <div className="natee-hero-text">
                <p className="natee-eyebrow">{L.heroEyebrow}</p>
                <h1 className="natee-hero-title">{L.heroTitle}</h1>
                <p className="natee-hero-subtitle">{L.heroSubtitle}</p>

                {REVIEWS.count > 0 && (
                  <p className="natee-rating">
                    <span className="natee-rating-score">{REVIEWS.rating.toFixed(1)}</span>
                    <span className="natee-rating-stars" aria-hidden="true">★★★★★</span>
                    <span className="natee-rating-text">
                      {REVIEWS.url ? (
                        <a href={REVIEWS.url} target="_blank" rel="noopener">
                          {REVIEWS.count} {L.reviewsLabel}
                        </a>
                      ) : (
                        <>{REVIEWS.count} {L.reviewsLabel}</>
                      )}
                    </span>
                  </p>
                )}

                <ContactButtons L={L} place="hero" />

                <p className="natee-hero-second-phone">
                  {L.orCall}{' '}
                  <a className="natee-nowrap" href={CONTACT.phone2Href}>{CONTACT.phone2}</a>
                </p>

                <p className="natee-hero-note">
                  <Icon name="check" className="natee-icon natee-icon-inline" />
                  <span>{L.heroNote}</span>
                </p>
              </div>

              <div className="natee-hero-media">
                <img
                  className="natee-hero-image"
                  src={`images/truck-6wheel.webp`}
                  srcSet={`images/truck-6wheel-sm.webp 560w, images/truck-6wheel.webp 1200w`}
                  sizes="(max-width: 719px) 92vw, (max-width: 999px) 46vw, 560px"
                  alt={L.heroTitle}
                  width="1200"
                  height="675"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          </section>

          <section className="natee-section natee-highlights" id="natee-highlights" aria-labelledby="natee-highlights-title">
            <div className="natee-container">
              <h2 className="natee-screen-reader" id="natee-highlights-title">{L.highlightsTitle}</h2>
              <ul className="natee-highlight-grid">
                {L.highlights.map((item) => (
                  <li className="natee-highlight" key={item.title}>
                    <span className="natee-highlight-icon"><Icon name={item.icon} /></span>
                    <h3 className="natee-highlight-title">{item.title}</h3>
                    <p className="natee-highlight-text">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="natee-section natee-about" id="natee-about">
            <div className="natee-container natee-about-inner">
              <div className="natee-about-media">
                <img
                  className="natee-about-image"
                  src={`images/work-11.webp`}
                  srcSet={`images/work-11-sm.webp 560w, images/work-11.webp 960w`}
                  sizes="(max-width: 719px) 92vw, 46vw"
                  alt={L.aboutTitle}
                  width="960"
                  height="720"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="natee-about-body">
                <h2 className="natee-section-title">{L.aboutTitle}</h2>
                <p className="natee-about-text">{L.aboutText}</p>
                <p className="natee-about-quote">{L.aboutQuote}</p>
              </div>
            </div>
          </section>

          <section className="natee-section natee-services" id="natee-services">
            <div className="natee-container">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.servicesTitle}</h2>
                <p className="natee-section-subtitle">{L.servicesSubtitle}</p>
              </header>
              <ul className="natee-card-grid">
                {L.services.map((item) => (
                  <li className="natee-card" key={item.title}>
                    <div className="natee-card-icon"><Icon name={item.icon} className="natee-icon natee-icon-lg" /></div>
                    <div className="natee-card-body">
                      <h3 className="natee-card-title">{item.title}</h3>
                      <p className="natee-card-text">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="natee-section natee-fleet" id="natee-fleet">
            <div className="natee-container">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.fleetTitle}</h2>
                <p className="natee-section-subtitle">{L.fleetSubtitle}</p>
              </header>
              <div className="natee-fleet-grid">
                {L.fleet.map((truck) => (
                  <article className="natee-fleet-item" key={truck.name}>
                    <div className="natee-fleet-media">
                      <img
                        className="natee-fleet-image"
                        src={`images/${truck.image}.webp`}
                        srcSet={`images/${truck.image}-sm.webp 560w, images/${truck.image}.webp 1200w`}
                        sizes="(max-width: 719px) 92vw, 46vw"
                        alt={truck.name}
                        width="1200"
                        height="675"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="natee-fleet-body">
                      <h3 className="natee-fleet-name">{truck.name}</h3>
                      <p className="natee-fleet-capacity">{truck.capacity}</p>
                      <p className="natee-fleet-text">{truck.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="natee-section natee-pricing" id="natee-pricing">
            <div className="natee-container">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.pricingTitle}</h2>
                <p className="natee-section-subtitle">{L.pricingSubtitle}</p>
              </header>

              <div className="natee-price-list">
                {L.pricing.map((row, index) => (
                  <div className={`natee-price-card${openPrice === index ? ' is-open' : ''}`} key={row.name}>
                    <button
                      type="button"
                      className="natee-price-summary"
                      aria-expanded={openPrice === index}
                      onClick={() => setOpenPrice(openPrice === index ? null : index)}
                    >
                      <span className="natee-price-info">
                        <span className="natee-price-name">{row.name}</span>
                        <span className="natee-price-detail">{row.detail}</span>
                      </span>
                      <span className="natee-price-side">
                        <span className="natee-price-value">{row.price}</span>
                        <Icon name="chevron" className="natee-icon natee-price-chevron" />
                      </span>
                    </button>

                    {openPrice === index && (
                      <div className="natee-price-body">
                        <ul className="natee-price-includes">
                          {row.includes.map((line) => (
                            <li key={line}>
                              <Icon name="check" className="natee-icon natee-icon-inline" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="natee-price-actions">
                          <a className="natee-btn natee-btn-call natee-btn-sm" href={CONTACT.phoneHref}
                            onClick={() => track('call_click', { place: 'pricing', language: lang })}>
                            <Icon name="phone" />
                            <span>{L.priceCallNow}</span>
                          </a>
                          <a className="natee-btn natee-btn-line natee-btn-sm" href={CONTACT.lineUrl} target="_blank" rel="noopener">
                            <Icon name="line" />
                            <span>{L.lineLabel}</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="natee-price-note">{L.pricingNote}</p>
            </div>
          </section>

          <section className="natee-section natee-steps" id="natee-steps">
            <div className="natee-container">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.stepsTitle}</h2>
              </header>
              <ol className="natee-step-list">
                {L.steps.map((step, index) => (
                  <li className="natee-step" key={step.title}>
                    <span className="natee-step-number" aria-hidden="true">{index + 1}</span>
                    <h3 className="natee-step-title">{step.title}</h3>
                    <p className="natee-step-text">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="natee-section natee-areas" id="natee-areas">
            <div className="natee-container">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.areasTitle}</h2>
                <p className="natee-section-subtitle">{L.areasSubtitle}</p>
              </header>
              <ul className="natee-area-list">
                {L.areas.map((area) => (
                  <li className="natee-area" key={area}>
                    <Icon name="pin" className="natee-icon natee-icon-inline" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="natee-section natee-gallery-section" id="natee-gallery">
            <div className="natee-container">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.galleryTitle}</h2>
                <p className="natee-section-subtitle">{L.gallerySubtitle}</p>
              </header>

              <ul className="natee-video-row">
                {media.filter((m) => m.type === 'video').map((item, index) => (
                  <li className="natee-video-cell" key={item.key}>
                    <button
                      type="button"
                      className="natee-media-link natee-video-link"
                      onClick={() => { setViewer(index); track('video_open', { clip: item.key, language: lang }) }}
                      aria-label={`${L.videoPlay} ${item.alt}`}
                    >
                      <img className="natee-video-poster" src={item.poster} alt={item.alt} width="432" height="768" loading="lazy" decoding="async" />
                      <span className="natee-video-play" aria-hidden="true"><Icon name="play" /></span>
                      <span className="natee-video-caption">{item.alt}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <ul className="natee-gallery-grid">
                {media.filter((m) => m.type === 'image').map((item, index) => (
                  <li className="natee-gallery-cell" key={item.key}>
                    <button
                      type="button"
                      className="natee-media-link natee-gallery-link"
                      onClick={() => setViewer(L.videos.length + index)}
                      aria-label={`${L.galleryOpen} ${index + 1} ${L.viewerOf} ${media.length}`}
                    >
                      <img
                        className="natee-gallery-image"
                        src={item.thumb}
                        srcSet={`${item.thumb} 560w, ${item.src} 1100w`}
                        sizes="(max-width: 719px) 45vw, (max-width: 999px) 30vw, 180px"
                        alt={item.alt}
                        width="560"
                        height="420"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="natee-gallery-zoom" aria-hidden="true"><Icon name="zoom" /></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="natee-section natee-faq" id="natee-faq">
            <div className="natee-container natee-narrow">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.faqTitle}</h2>
              </header>
              <div className="natee-faq-list">
                {L.faq.map((item, index) => (
                  <div className={`natee-faq-item${openFaq === index ? ' is-open' : ''}`} key={item.q}>
                    <button
                      type="button"
                      className="natee-faq-question"
                      aria-expanded={openFaq === index}
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span>{item.q}</span>
                      <Icon name="chevron" className="natee-icon natee-faq-chevron" />
                    </button>
                    {openFaq === index && (
                      <div className="natee-faq-answer"><p>{item.a}</p></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="natee-cta" id="natee-cta">
            <div className="natee-container natee-cta-inner">
              <div className="natee-cta-text">
                <h2 className="natee-cta-title">{L.ctaTitle}</h2>
                <p className="natee-cta-subtitle">{L.ctaSubtitle}</p>
              </div>
              <ContactButtons L={L} place="cta" />
            </div>
          </section>

          <section className="natee-section natee-contact" id="natee-contact">
            <div className="natee-container">
              <header className="natee-section-head">
                <h2 className="natee-section-title">{L.contactTitle}</h2>
                <p className="natee-section-subtitle">{L.contactSubtitle}</p>
              </header>

              <div className="natee-contact-grid">
                <div className="natee-contact-info">
                  <ul className="natee-contact-list">
                    {[CONTACT.phone, CONTACT.phone2].map((number, i) => (
                      <li key={number}>
                        <a className="natee-contact-item" href={i === 0 ? CONTACT.phoneHref : CONTACT.phone2Href}>
                          <span className="natee-contact-icon"><Icon name="phone" /></span>
                          <span>
                            <span className="natee-contact-label">{L.labelPhone}</span>
                            <span className="natee-contact-value natee-nowrap">{number}</span>
                          </span>
                        </a>
                        <button type="button" className="natee-copy" onClick={() => copyPhone(number)}>{L.copied.split(' ')[0]}</button>
                      </li>
                    ))}

                    <li>
                      <a className="natee-contact-item" href={CONTACT.lineUrl} target="_blank" rel="noopener">
                        <span className="natee-contact-icon"><Icon name="line" /></span>
                        <span>
                          <span className="natee-contact-label">{L.labelLine}</span>
                          <span className="natee-contact-value">{CONTACT.lineId}</span>
                        </span>
                      </a>
                    </li>

                    <li>
                      <a className="natee-contact-item" href={CONTACT.facebookUrl} target="_blank" rel="noopener">
                        <span className="natee-contact-icon"><Icon name="facebook" /></span>
                        <span>
                          <span className="natee-contact-label">{L.labelFacebook}</span>
                          <span className="natee-contact-value">{L.labelPage} {L.siteName}</span>
                        </span>
                      </a>
                    </li>

                    <li>
                      <a className="natee-contact-item" href={`mailto:${CONTACT.email}`}>
                        <span className="natee-contact-icon"><Icon name="mail" /></span>
                        <span>
                          <span className="natee-contact-label">{L.labelEmail}</span>
                          <span className="natee-contact-value">{CONTACT.email}</span>
                        </span>
                      </a>
                    </li>

                    <li>
                      <span className="natee-contact-item">
                        <span className="natee-contact-icon"><Icon name="pin" /></span>
                        <span>
                          <span className="natee-contact-label">{L.labelLocation}</span>
                          <span className="natee-contact-value">{L.address}</span>
                        </span>
                      </span>
                    </li>

                    <li>
                      <span className="natee-contact-item">
                        <span className="natee-contact-icon"><Icon name="clock" /></span>
                        <span>
                          <span className="natee-contact-label">{L.labelHours}</span>
                          <span className="natee-contact-value">{L.hours}</span>
                        </span>
                      </span>
                    </li>
                  </ul>

                  <div className="natee-qr">
                    <img src={`images/line-qr.webp`} alt={`${L.labelLine} ${L.siteName}`} width="480" height="480" loading="lazy" decoding="async" />
                    <div className="natee-qr-text">
                      <p className="natee-qr-title">{L.labelLine} {L.siteName}</p>
                      <p className="natee-qr-note">{L.ctaSubtitle}</p>
                      <p className="natee-qr-id">LINE ID: <span className="natee-nowrap">{CONTACT.lineId}</span></p>
                    </div>
                  </div>
                </div>

                <div className="natee-contact-map">
                  <ContactForm L={L} />

                  <div className="natee-map">
                    <iframe
                      src={CONTACT.mapEmbed}
                      title={`${L.mapTitle} ${L.siteName}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                  <a className="natee-map-link" href={CONTACT.mapUrl} target="_blank" rel="noopener">
                    <Icon name="pin" className="natee-icon natee-icon-inline" />
                    <span>{L.mapLink}</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
          </>
        ) : (
          <Knowledge L={L} lang={lang} homeHref={homeHref} />
        )}
      </main>

      <footer className="natee-footer">
        <div className="natee-container natee-footer-grid">
          <div className="natee-footer-col">
            <img className="natee-footer-logo" src={`images/logo.webp`} alt={L.siteName} width="240" height="338" loading="lazy" />
            <p className="natee-footer-name">{L.siteName}</p>
            <p className="natee-footer-text">{L.tagline}</p>
            <p className="natee-footer-text">{L.address}</p>
            <p className="natee-footer-text">{L.hours}</p>
          </div>

          <div className="natee-footer-col">
            <p className="natee-footer-heading">{L.footerContact}</p>
            <ul className="natee-footer-list">
              <li><a href={CONTACT.phoneHref}><Icon name="phone" /><span className="natee-nowrap">{CONTACT.phone}</span></a></li>
              <li><a href={CONTACT.phone2Href}><Icon name="phone" /><span className="natee-nowrap">{CONTACT.phone2}</span></a></li>
              <li><a href={CONTACT.lineUrl} target="_blank" rel="noopener"><Icon name="line" /><span>{CONTACT.lineId}</span></a></li>
              <li><a href={CONTACT.facebookUrl} target="_blank" rel="noopener"><Icon name="facebook" /><span>{L.labelFacebook}</span></a></li>
              <li><a href={`mailto:${CONTACT.email}`}><Icon name="mail" /><span>{CONTACT.email}</span></a></li>
            </ul>
          </div>

          <div className="natee-footer-col">
            <p className="natee-footer-heading">{L.footerAreas}</p>
            <ul className="natee-footer-areas">
              {L.areas.slice(0, 8).map((area) => <li key={area}>{area}</li>)}
            </ul>
          </div>
        </div>

        <div className="natee-container natee-footer-bottom">
          <p>{L.siteName} {new Date().getFullYear()} {L.footerRights}</p>
          <p>{L.footerNote}</p>
        </div>
      </footer>

      <div className="natee-sticky" role="complementary" aria-label={L.contactTitle}>
        <a className="natee-sticky-item natee-sticky-call" href={CONTACT.phoneHref}
          onClick={() => track('call_click', { place: 'sticky', language: lang })}>
          <Icon name="phone" /><span>{L.callLabel}</span>
        </a>
        <a className="natee-sticky-item natee-sticky-line" href={CONTACT.lineUrl} target="_blank" rel="noopener"
          onClick={() => track('line_click', { place: 'sticky', language: lang })}>
          <Icon name="line" /><span>{L.lineLabel}</span>
        </a>
      </div>

      {current && (
        <div className="natee-lightbox is-open" role="dialog" aria-modal="true" aria-label={L.viewerLabel}>
          <div className="natee-lightbox-backdrop" onClick={() => setViewer(null)} />
          <div className="natee-lightbox-inner">
            <div className="natee-lightbox-bar">
              <span className="natee-lightbox-counter" aria-live="polite">{viewer + 1} {L.viewerOf} {media.length}</span>
              <button type="button" className="natee-lightbox-btn natee-lightbox-close" onClick={() => setViewer(null)}>
                <Icon name="close" />
                <span className="natee-screen-reader">{L.viewerClose}</span>
              </button>
            </div>

            <div className="natee-lightbox-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <button type="button" className="natee-lightbox-btn natee-lightbox-prev" onClick={() => showNext(-1)}>
                <Icon name="arrow" />
                <span className="natee-screen-reader">{L.viewerPrev}</span>
              </button>

              <figure className="natee-lightbox-figure">
                {current.type === 'video' ? (
                  <video
                    className="natee-lightbox-video"
                    src={current.src}
                    poster={current.poster}
                    controls
                    playsInline
                    preload="auto"
                    aria-label={current.alt}
                  />
                ) : (
                  <img className="natee-lightbox-image" src={current.src} alt={current.alt} decoding="async" />
                )}
              </figure>

              <button type="button" className="natee-lightbox-btn natee-lightbox-next" onClick={() => showNext(1)}>
                <Icon name="arrow" />
                <span className="natee-screen-reader">{L.viewerNext}</span>
              </button>
            </div>

            <p className="natee-lightbox-caption">{current.alt}</p>
            <p className="natee-lightbox-hint">{L.viewerHint}</p>
          </div>
        </div>
      )}

      {toast && <div className="natee-toast" role="status">{toast}</div>}
    </>
  )
}
