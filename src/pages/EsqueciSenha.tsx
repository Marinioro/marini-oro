import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TelaAcesso from '../components/TelaAcesso'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const volta = window.location.origin + import.meta.env.BASE_URL
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: volta })
    setEnviando(false)
    // Por segurança, a mensagem é a mesma exista ou não o e-mail.
    if (error && error.status === 429) {
      setErro('Muitas tentativas seguidas. Espere alguns minutos e tente de novo.')
      return
    }
    setEnviado(true)
  }

  return (
    <TelaAcesso titulo="Criar ou recuperar senha">
      {enviado ? (
        <div className="formulario">
          <p>
            Se este e-mail tiver acesso, você vai receber em instantes um link para criar uma senha nova.
            Abra o link <strong>neste mesmo aparelho e navegador</strong>.
          </p>
          <p className="texto-suave">Não chegou? Olhe a caixa de spam.</p>
          <Link to="/" className="link-discreto">Voltar para entrar</Link>
        </div>
      ) : (
        <form onSubmit={enviar} className="formulario">
          <p className="texto-suave">Digite o seu e-mail. Enviaremos um link para você criar uma senha nova.</p>
          <label>
            E-mail
            <input type="email" autoComplete="username" inputMode="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {erro && <p className="aviso-erro" role="alert">{erro}</p>}
          <button className="botao" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar link'}</button>
          <Link to="/" className="link-discreto">Voltar para entrar</Link>
        </form>
      )}
    </TelaAcesso>
  )
}
