// Cria o login de uma sócia. A senha inicial é aleatória e descartada:
// a pessoa cria a própria senha pelo link "Esqueci minha senha / primeiro acesso".
// Uso: node scripts/criar-usuaria.mjs <teste|oficial> <email> <nome>
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const [ambiente, email, ...resto] = process.argv.slice(2)
const nome = resto.join(' ')
if (!['teste', 'oficial'].includes(ambiente) || !email || !nome) {
  console.error('Uso: node scripts/criar-usuaria.mjs <teste|oficial> <email> <nome>')
  process.exit(1)
}

const sec = Object.fromEntries(
  readFileSync(`.segredos/${ambiente}.env`, 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => {
    const i = l.indexOf('=')
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  }),
)
const admin = createClient(sec.SUPABASE_URL, sec.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

const { data, error } = await admin.auth.admin.createUser({
  email,
  password: randomBytes(24).toString('base64url') + 'Aa1',
  email_confirm: true,
})
if (error) {
  console.error('Erro ao criar login:', error.message)
  process.exit(1)
}
const { error: e2 } = await admin.from('perfis').insert({ id: data.user.id, nome })
if (e2) {
  console.error('Login criado, mas erro ao criar perfil:', e2.message)
  process.exit(1)
}
console.log(`Login criado no ambiente "${ambiente}" para ${nome}.`)
