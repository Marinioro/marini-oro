import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_KEY as string

if (!url || !key) {
  throw new Error('Configuração do Supabase ausente (.env).')
}

export const ambiente = (import.meta.env.VITE_AMBIENTE as string) || 'teste'

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: `marini-${ambiente}`,
  },
})
