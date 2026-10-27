import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      style={{ display: 'inline-flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #34322D' }}
    >
      {LANGS.map(({ code, label }) => {
        const active = current === code || current.startsWith(code.split('-')[0])
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => i18n.changeLanguage(code)}
            style={{
              minWidth: 36,
              height: 30,
              padding: '0 8px',
              border: 0,
              background: active ? '#34322D' : 'transparent',
              color: active ? '#fff' : '#8C877D',
              fontFamily: 'inherit',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '.06em',
              cursor: 'pointer',
              transition: 'background .2s, color .2s',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
