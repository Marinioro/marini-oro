import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { ambiente } from '../lib/supabase'

const itens = [
  { para: '/', rotulo: 'Início', icone: '◇' },
  { para: '/historico', rotulo: 'Histórico', icone: '☰' },
]

export default function Layout() {
  const { perfil, sessao, sair } = useAuth()
  const nome = perfil?.nome ?? sessao?.user.email ?? ''

  return (
    <div className="app">
      {ambiente === 'teste' && <div className="faixa-teste">Versão de teste: use apenas dados de mentira</div>}
      <header className="topo">
        <div className="topo-marca">
          <span className="marca">marini</span>
          <span className="marca-sub">oro</span>
        </div>
        <div className="topo-usuaria">
          <span className="texto-suave">{nome}</span>
          <button className="botao-texto" onClick={sair}>Sair</button>
        </div>
      </header>
      <nav className="menu" aria-label="Menu principal">
        {itens.map((i) => (
          <NavLink key={i.para} to={i.para} end className="menu-item">
            <span aria-hidden="true">{i.icone}</span>
            {i.rotulo}
          </NavLink>
        ))}
      </nav>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}
