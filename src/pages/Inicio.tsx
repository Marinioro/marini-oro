import { useAuth } from '../auth/AuthProvider'

const proximas = [
  { titulo: 'Clientes', texto: 'Cadastro, preferências e datas especiais com aviso.' },
  { titulo: 'Peças e custos', texto: 'Ouro, pedras, mão de obra e preço sugerido.' },
  { titulo: 'Estoque', texto: 'Onde está cada peça.' },
  { titulo: 'Vendas e encomendas', texto: 'Do pedido à entrega, sempre ligada à cliente.' },
  { titulo: 'Parcelas', texto: 'Quem paga, quando, e comprovantes.' },
  { titulo: 'Consertos', texto: 'Fotos de antes e depois, etapas e valores.' },
]

export default function Inicio() {
  const { perfil } = useAuth()
  const primeiroNome = perfil?.nome?.split(' ')[0]

  return (
    <div>
      <h1 className="titulo-pagina">{primeiroNome ? `Olá, ${primeiroNome}` : 'Olá'}</h1>
      <p className="texto-suave">Bem-vinda ao programa da Marini Oro. As próximas partes aparecerão aqui.</p>
      <div className="grade-cartoes">
        {proximas.map((p) => (
          <div key={p.titulo} className="cartao cartao-em-breve">
            <h2>{p.titulo}</h2>
            <p>{p.texto}</p>
            <span className="selo">em breve</span>
          </div>
        ))}
      </div>
    </div>
  )
}
