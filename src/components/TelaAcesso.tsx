import type { ReactNode } from 'react'
import { ambiente } from '../lib/supabase'

/** Moldura elegante das telas sem login (entrar, esqueci a senha, nova senha). */
export default function TelaAcesso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="acesso">
      <div className="acesso-cartao">
        <div className="acesso-marca">
          <span className="marca-grande">marini</span>
          <span className="marca-sub">oro</span>
        </div>
        {ambiente === 'teste' && <div className="selo-teste">versão de teste</div>}
        <h1 className="acesso-titulo">{titulo}</h1>
        {children}
      </div>
    </div>
  )
}
