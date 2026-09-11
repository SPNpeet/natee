import Icon from './icons.jsx'
import ContactButtons from './ContactButtons.jsx'
import { imageAsset as asset } from './brand.js'

/**
 * หน้าความรู้เรื่องน้ำและน้ำประปา
 *
 * เนื้อหาทั้งหมดมาจาก src/data.js ก้อน knowledge จึงแก้ที่เดียวได้ทั้งสองภาษา
 * ส่วนหัวและส่วนท้ายของเว็บใช้ร่วมกับหน้าแรก หน้านี้จึงมีแต่ตัวบทความ
 */
/** รูปประกอบบทความ ใช้ไฟล์ย่อบนมือถือและไฟล์เต็มบนจอใหญ่ รูปที่อัปโหลดจากหลังบ้านใช้ไฟล์เดียว */
function ArticleImage({ name, alt, sizes, priority = false }) {
  return (
    <img
      className="natee-article-img"
      src={asset(name)}
      srcSet={`${asset(name, '-sm.webp')} 560w, ${asset(name)} 1100w`}
      sizes={sizes}
      alt={alt}
      width="1100"
      height="825"
      loading={priority ? undefined : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  )
}

function Figure({ name, alt, caption, className = '', priority = false }) {
  return (
    <figure className={`natee-article-figure ${className}`.trim()}>
      <ArticleImage name={name} alt={alt} sizes="(max-width: 799px) 92vw, 720px" priority={priority} />
      <figcaption className="natee-article-caption">{caption}</figcaption>
    </figure>
  )
}

export default function Knowledge({ L, CONTACT, homeHref }) {
  const K = L.knowledge

  const toc = [
    { id: 'natee-k-groups', label: K.groupsTitle },
    { id: 'natee-k-uses', label: K.usesTitle },
    { id: 'natee-k-benefits', label: K.benefitsTitle },
    { id: 'natee-k-summary', label: K.summaryTitle },
  ]

  return (
    <article className="natee-article">
      <header className="natee-article-head">
        <div className="natee-container natee-narrow">
          <p className="natee-eyebrow">{K.eyebrow}</p>
          <h1 className="natee-article-title">{K.title}</h1>
          <p className="natee-article-subtitle">{K.subtitle}</p>
        </div>
      </header>

      <div className="natee-container natee-narrow natee-article-body">
        <Figure
          name={K.heroImage}
          alt={K.heroAlt}
          caption={K.heroCaption}
          className="natee-article-hero"
          priority
        />

        <p className="natee-article-intro">{K.intro}</p>

        <blockquote className="natee-article-quote">
          <p className="natee-article-quote-text">{K.quote}</p>
          <cite className="natee-article-quote-by">{K.quoteBy}</cite>
        </blockquote>

        <nav className="natee-toc" aria-label={K.tocTitle}>
          <p className="natee-toc-title">{K.tocTitle}</p>
          <ul className="natee-toc-list">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="natee-article-section" id="natee-k-groups">
          <h2 className="natee-article-heading">{K.groupsTitle}</h2>
          <ul className="natee-fact-list">
            {K.groups.map((item) => (
              <li className="natee-fact" key={item.title}>
                <span className="natee-fact-icon"><Icon name={item.icon} /></span>
                <div>
                  <h3 className="natee-fact-title">{item.title}</h3>
                  <p className="natee-fact-text">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="natee-article-section" id="natee-k-uses">
          <h2 className="natee-article-heading">{K.usesTitle}</h2>
          <ul className="natee-use-list">
            {K.uses.map((item) => (
              <li className="natee-use" key={item.title}>
                <ArticleImage name={item.image} alt={item.alt} sizes="(max-width: 719px) 92vw, 240px" />
                <div className="natee-use-body">
                  <h3 className="natee-use-title">{item.title}</h3>
                  <p className="natee-use-text">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="natee-article-section" id="natee-k-benefits">
          <h2 className="natee-article-heading">{K.benefitsTitle}</h2>
          <p className="natee-article-lead">{K.benefitsSubtitle}</p>
          <Figure name={K.benefitsImage} alt={K.benefitsAlt} caption={K.benefitsCaption} />
          <ol className="natee-point-list">
            {K.benefits.map((item, index) => (
              <li className="natee-point" key={item.title}>
                <span className="natee-point-number" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="natee-point-title">{item.title}</h3>
                  <p className="natee-point-text">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="natee-article-section" id="natee-k-summary">
          <h2 className="natee-article-heading">{K.summaryTitle}</h2>
          <Figure name={K.summaryImage} alt={K.summaryAlt} caption={K.summaryCaption} />
          <p className="natee-article-text">{K.summaryText}</p>
        </section>
      </div>

      <section className="natee-section natee-cta natee-article-cta">
        <div className="natee-container natee-narrow natee-cta-inner">
          <h2 className="natee-cta-title">{K.ctaTitle}</h2>
          <p className="natee-cta-subtitle">{K.ctaText}</p>
          <ContactButtons CONTACT={CONTACT} L={L} place="article" />
          <p className="natee-article-back">
            <a href={homeHref}>
              <Icon name="arrow" className="natee-icon natee-icon-inline" />
              <span>{K.backLabel}</span>
            </a>
          </p>
        </div>
      </section>
    </article>
  )
}
