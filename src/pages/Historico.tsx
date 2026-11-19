import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Linha = {
  id: number
  quando: string
  tabela: string
  acao: string
  quem: string | null
}

const acoes: Record<string, string> = { INSERT: 'criou', UPDATE: 'alterou', DELETE: 'apagou' }
const tabelas: Record<string, string> = { perfis: 'perfil' }

export default function Historico() {
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [nomes, setNomes] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('historico').select('id, quando, tabela, acao, quem').order('quando', { ascending: false }).limit(100),
      supabase.from('perfis').select('id, nome'),
    ]).then(([h, p]) => {
      setLinhas(h.data ?? [])
      setNomes(Object.fromEntries((p.data ?? []).map((x) => [x.id, x.nome])))
      setCarregando(false)
    })
  }, [])

  return (
    <div>
      <h1 className="titulo-pagina">Histórico</h1>
      <p className="texto-suave">Tudo o que foi criado, alterado ou apagado, e por quem.</p>
      {carregando ? (
        <p className="texto-suave">Carregando…</p>
      ) : linhas.length === 0 ? (
        <p className="texto-suave">Nada registrado ainda.</p>
      ) : (
        <ul className="lista">
          {linhas.map((l) => (
            <li key={l.id} className="lista-item">
              <strong>{l.quem ? nomes[l.quem] ?? 'Alguém' : 'Sistema'}</strong>{' '}
              {acoes[l.acao] ?? l.acao} {tabelas[l.tabela] ?? l.tabela}
              <span className="texto-suave lista-data">
                {new Date(l.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
