import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type Perfil = { id: string; nome: string }

type AuthState = {
  carregando: boolean
  sessao: Session | null
  perfil: Perfil | null
  recuperandoSenha: boolean
  sair: () => Promise<void>
  fimRecuperacao: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true)
  const [sessao, setSessao] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [recuperandoSenha, setRecuperandoSenha] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === 'PASSWORD_RECOVERY') setRecuperandoSenha(true)
      setSessao(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sessao) {
      setPerfil(null)
      return
    }
    supabase
      .from('perfis')
      .select('id, nome')
      .eq('id', sessao.user.id)
      .maybeSingle()
      .then(({ data }) => setPerfil(data ?? null))
  }, [sessao])

  const valor: AuthState = {
    carregando,
    sessao,
    perfil,
    recuperandoSenha,
    sair: async () => {
      await supabase.auth.signOut()
    },
    fimRecuperacao: () => setRecuperandoSenha(false),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
