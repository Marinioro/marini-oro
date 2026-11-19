import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TelaAcesso from '../components/TelaAcesso'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    setEnviando(false)
    if (error) setErro('E-mail ou senha incorretos. Confira e tente de novo.')
  }

  return (
    <TelaAcesso titulo="Entrar">
      <form onSubmit={entrar} className="formulario">
        <label>
          E-mail
          <input type="email" autoComplete="username" inputMode="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" required
            value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <p className="aviso-erro" role="alert">{erro}</p>}
        <button className="botao" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/esqueci-senha" className="link-discreto">Esqueci minha senha / primeiro acesso</Link>
      </form>
    </TelaAcesso>
  )
}
