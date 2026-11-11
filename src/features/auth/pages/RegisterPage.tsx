import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LockKeyhole, Mail, User, Zap } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/auth.service'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 8 || password.length > 128) {
      setError('A senha deve ter entre 8 e 128 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      // Após cadastrar, autentica automaticamente.
      await login({
        email: email.trim().toLowerCase(),
        password,
      })

      navigate('/', { replace: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status

        if (status === 409) {
          setError('Este e-mail já está cadastrado.')
        } else if (status === 400) {
          setError(
            error.response?.data?.message ??
            'Verifique os dados informados.',
          )
        } else if (!error.response) {
          setError('Não foi possível conectar ao servidor.')
        } else {
          setError('Não foi possível concluir o cadastro.')
        }
      } else {
        setError(
          'Conta criada, mas não foi possível iniciar a sessão. Tente entrar pelo login.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090D18] px-4 py-10">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
            <Zap size={30} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Só Uma?
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sua preparação começa aqui.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-2xl">

          <div className="mb-7">
            <h2 className="text-xl font-semibold text-white">
              Crie sua conta
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Comece a organizar sua preparação para concursos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                Nome completo
              </label>

              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  id="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#090D18] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                E-mail
              </label>

              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  id="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#090D18] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Senha
              </label>

              <div className="relative">
                <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#090D18] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">
                Confirmar senha
              </label>

              <input
                id="confirmPassword"
                type="password"
                required
                maxLength={128}
                autoComplete="new-password"
                placeholder="Digite sua senha novamente"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#090D18] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar minha conta'}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Já possui uma conta?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Entrar
            </Link>
          </p>

        </div>
      </div>
    </main>
  )
}