// Verificação automática de segurança do acesso (somente no projeto de TESTE).
// Uso: node scripts/verificar-acesso.mjs
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const ler = (arq) =>
  Object.fromEntries(
    readFileSync(arq, 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
  )

const pub = ler('.env.teste')
const sec = ler('.segredos/teste.env')
if (!pub.VITE_SUPABASE_URL.includes('tkmzwaydxgcopntaoopr')) throw new Error('Só rodar no projeto de teste!')

const admin = createClient(sec.SUPABASE_URL, sec.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const novoCliente = () => createClient(pub.VITE_SUPABASE_URL, pub.VITE_SUPABASE_KEY, { auth: { persistSession: false } })

let falhas = 0
const ok = (cond, msg) => { console.log(`${cond ? 'OK   ' : 'FALHA'} ${msg}`); if (!cond) falhas++ }
const senha = () => randomBytes(12).toString('base64url') + 'Aa1'

async function criarUsuaria(email, nome) {
  const p = senha()
  const { data, error } = await admin.auth.admin.createUser({ email, password: p, email_confirm: true })
  if (error) throw error
  if (nome) {
    const { error: e2 } = await admin.from('perfis').insert({ id: data.user.id, nome })
    if (e2) throw e2
  }
  return { id: data.user.id, email, senha: p }
}

const membro = await criarUsuaria(`verif.membro.${Date.now()}@marinioro.test`, 'Verificação (membro)')
const estranha = await criarUsuaria(`verif.estranha.${Date.now()}@marinioro.test`, null)

try {
  // 1. Sem login
  const anon = novoCliente()
  const a1 = await anon.from('perfis').select('*')
  ok(a1.error || (a1.data ?? []).length === 0, 'sem login: não vê perfis')
  const a2 = await anon.from('historico').select('*')
  ok(a2.error || (a2.data ?? []).length === 0, 'sem login: não vê histórico')
  const a3 = await anon.auth.signUp({ email: `intrusa.${Date.now()}@marinioro.test`, password: senha() })
  ok(!!a3.error, 'cadastro público está desligado')

  // 2. Membro logado
  const m = novoCliente()
  const lm = await m.auth.signInWithPassword({ email: membro.email, password: membro.senha })
  ok(!lm.error, 'membro consegue entrar')
  const m1 = await m.from('perfis').select('id, nome')
  ok(!m1.error && m1.data.some((x) => x.id === membro.id), 'membro vê os perfis')
  const m2 = await m.from('perfis').update({ nome: 'Verificação (membro) alterado' }).eq('id', membro.id).select()
  ok(!m2.error && m2.data.length === 1, 'membro altera o próprio nome')
  const m3 = await m.from('historico').select('*').eq('registro_id', membro.id)
  const alteracao = (m3.data ?? []).find((h) => h.acao === 'UPDATE')
  ok(!!alteracao && alteracao.quem === membro.id, 'histórico registrou QUEM alterou')
  const m4 = await m.from('historico').delete().eq('registro_id', membro.id).select()
  ok(!!m4.error || (m4.data ?? []).length === 0, 'membro NÃO consegue apagar o histórico')
  const m5 = await m.from('historico').insert({ tabela: 'x', acao: 'INSERT' })
  ok(!!m5.error, 'membro NÃO consegue inventar linhas no histórico')

  // 3. Pessoa logada mas sem perfil (não é sócia)
  const e = novoCliente()
  await e.auth.signInWithPassword({ email: estranha.email, password: estranha.senha })
  const e1 = await e.from('perfis').select('*')
  ok(!e1.error && e1.data.length === 0, 'logada sem perfil: não vê nada')
  const e2 = await e.from('historico').select('*')
  ok(!e2.error && e2.data.length === 0, 'logada sem perfil: não vê o histórico')
} finally {
  // Limpa as usuárias temporárias criadas só para esta verificação.
  await admin.auth.admin.deleteUser(membro.id)
  await admin.auth.admin.deleteUser(estranha.id)
}

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.')
process.exit(falhas ? 1 : 0)
