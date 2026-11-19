import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import TelaAcesso from '../components/TelaAcesso'

export default function NovaSenha() {
  const { fimRecuperacao } = useAuth()
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha.length < 10) return setErro('A senha precisa ter pelo menos 10 caracteres.')
    if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/\d/.test(senha))
      return setErro('Use letras minúsculas, maiúsculas e pelo menos um número.')
    if (senha !== confirma) return setErro('As duas senhas não são iguais.')
    setEnviando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setEnviando(false)
    if (error) return setErro('Não foi possível salvar. Peça um link novo e tente de novo.')
    window.history.replaceState(null, '', import.meta.env.BASE_URL)
    fimRecuperacao()
  }

  return (
    <TelaAcesso titulo="Criar senha nova">
      <form onSubmit={salvar} className="formulario">
        <p className="texto-suave">Mínimo de 10 caracteres, com letras maiúsculas, minúsculas e números.</p>
        <label>
          Senha nova
          <input type="password" autoComplete="new-password" required
            value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        <label>
          Repita a senha
          <input type="password" autoComplete="new-password" required
            value={confirma} onChange={(e) => setConfirma(e.target.value)} />
        </label>
        {erro && <p className="aviso-erro" role="alert">{erro}</p>}
        <button className="botao" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar senha'}</button>
      </form>
    </TelaAcesso>
  )
}
