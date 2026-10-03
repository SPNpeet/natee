import Icon from './icons.jsx'
import ContactButtons from './ContactButtons.jsx'
import { imageAsset as asset, imageSrcSet } from './brand.js'
import { pageHref } from './pages.js'
import Backdrop from './Backdrop.jsx'
import Phrases from './Phrases.jsx'

/**
 * หน้าบริการแต่ละอย่าง เช่น เติมสระว่ายน้ำ หรือรถน้ำสงกรานต์
 *
 * แต่ละหน้าตอบคำค้นของบริการนั้นโดยตรง Google จึงส่งคนที่ค้นหาบริการนั้นมาที่หน้านี้ได้แม่นกว่าหน้าแรก
 * ขั้นตอนสั่งน้ำและปุ่มติดต่อใช้ชุดเดียวกับหน้าแรก แก้ที่เดียวเปลี่ยนทุกหน้า
 */
export default function ServicePage({ L, CONTACT, service, lang, homeHref }) {
  const others = L.servicePages.filter((p) => p.slug !== service.slug)

  return (
    <article className="natee-article natee-service-page">
      <header className="natee-article-head">
        <div className="natee-container natee-narrow">
          <nav className="natee-breadcrumb" aria-label="breadcrumb">
            <a href={homeHref}>{L.siteName}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{service.navLabel}</span>
          </nav>
          <p className="natee-eyebrow">{service.eyebrow}</p>
          <h1 className="natee-article-title"><Phrases text={service.title} /></h1>
          <p className="natee-article-subtitle">{service.subtitle}</p>
          <ContactButtons CONTACT={CONTACT} L={L} place="service" />
        </div>
      </header>

      <div className="natee-container natee-narrow natee-article-body">
        <figure className="natee-article-figure natee-article-hero">
          <span className="natee-article-frame natee-frame">
            <Backdrop name={service.image} />
            <img
              className={service.image.startsWith('uploads/') ? 'natee-article-img is-custom' : 'natee-article-img'}
              src={asset(service.image)}
              srcSet={imageSrcSet(service.image, 1100)}
              sizes="(max-width: 799px) 92vw, 720px"
              alt={service.imageAlt}
              width="1100"
              height="825"
              fetchPriority="high"
              decoding="async"
            />
          </span>
          <figcaption className="natee-article-caption">{service.imageCaption}</figcaption>
        </figure>

        <p className="natee-article-intro">{service.intro}</p>

        <section className="natee-article-section">
          <h2 className="natee-article-heading"><Phrases text={service.fitTitle} /></h2>
          <ul className="natee-check-list">
            {service.fits.map((item) => (
              <li key={item}>
                <Icon name="check" className="natee-icon natee-icon-inline" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="natee-article-section">
          <h2 className="natee-article-heading"><Phrases text={L.stepsTitle} /></h2>
          <ol className="natee-point-list">
            {L.steps.map((step, index) => (
              <li className="natee-point" key={step.title}>
                <span className="natee-point-number" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="natee-point-title">{step.title}</h3>
                  <p className="natee-point-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="natee-article-section">
          <h2 className="natee-article-heading"><Phrases text={service.tipsTitle} /></h2>
          <ul className="natee-tip-list">
            {service.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </section>

        <section className="natee-article-section">
          <h2 className="natee-article-heading"><Phrases text={L.serviceFaqTitle} /></h2>
          <div className="natee-service-faq">
            {service.faq.map((item) => (
              <div className="natee-service-faq-item" key={item.q}>
                <h3 className="natee-service-faq-q">{item.q}</h3>
                <p className="natee-service-faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav className="natee-article-section" aria-label={L.serviceRelated}>
          <h2 className="natee-article-heading"><Phrases text={L.serviceRelated} /></h2>
          <ul className="natee-related-list">
            {others.map((p) => (
              <li key={p.slug}>
                <a href={pageHref('service:' + p.slug, lang)}>
                  <Icon name={p.icon} className="natee-icon natee-icon-inline" />
                  <span>{p.navLabel}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section className="natee-section natee-cta natee-article-cta">
        <div className="natee-container natee-narrow natee-cta-inner">
          <h2 className="natee-cta-title">{L.ctaTitle}</h2>
          <p className="natee-cta-subtitle">{L.ctaSubtitle}</p>
          <ContactButtons CONTACT={CONTACT} L={L} place="service" />
          <p className="natee-article-back">
            <a href={homeHref}>
              <Icon name="arrow" className="natee-icon natee-icon-inline" />
              <span>{L.serviceBack}</span>
            </a>
          </p>
        </div>
      </section>
    </article>
  )
}
