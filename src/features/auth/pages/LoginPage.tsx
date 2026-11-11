import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LockKeyhole, Mail, Zap } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
    const navigate = useNavigate()

    const { login, isAuthenticated } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setError('')
        setIsSubmitting(true)

        try {
            await login({ email, password })

            navigate('/', { replace: true })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ??
                    'E-mail ou senha inválidos.',
                )
            } else {
                setError('Não foi possível realizar o login.')
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

                {/* Identidade da plataforma */}
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

                {/* Card de login */}
                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-2xl">

                    <div className="mb-7">
                        <h2 className="text-xl font-semibold text-white">
                            Bem-vindo de volta!
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Entre na sua conta para continuar estudando.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* E-mail */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                E-mail
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-[#090D18] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Senha
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-[#090D18] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        {/* Mensagem de erro */}
                        {error && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
                        </button>

                    </form>

                </div>

                <p className="mt-6 p-4 text-center text-xs text-slate-600">
                    Só Uma? — Plataforma de estudos para concursos.
                </p>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Ainda não possui uma conta?{' '}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-400 hover:text-blue-300"
                    >
                        Criar conta
                    </Link>
                </p>

            </div>

        </main>
    )
}