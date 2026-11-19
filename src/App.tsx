import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import Login from './pages/Login'
import EsqueciSenha from './pages/EsqueciSenha'
import NovaSenha from './pages/NovaSenha'
import Inicio from './pages/Inicio'
import Historico from './pages/Historico'
import Layout from './components/Layout'
import Carregando from './components/Carregando'

export default function App() {
  const { carregando, sessao, recuperandoSenha } = useAuth()

  if (carregando) return <Carregando />

  // Chegou pelo link de "esqueci minha senha": só deixa criar a senha nova.
  if (recuperandoSenha) return <NovaSenha />

  if (!sessao) {
    return (
      <Routes>
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
