import { useStore } from './store'
import { translations } from './translations'

export function useTranslation() {
  const language = useStore((state) => state.language)
  const setLanguage = useStore((state) => state.setLanguage)

  const t = translations[language] || translations['ENG']

  return { t, language, setLanguage }
}
