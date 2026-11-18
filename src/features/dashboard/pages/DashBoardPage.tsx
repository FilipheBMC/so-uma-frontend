import {
  ArrowUpRight,
  BookOpen,
  Target,
  Flame,
  Clock3,
  Play,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'


import { DashboardStatistics } from '../components/DashboardStatistics'

// const stats = [
//   {
//     title: 'Questões resolvidas',
//     value: '248',
//     description: '+12% em relação à semana passada',
//     icon: BookOpen,
//   },
//   {
//     title: 'Taxa de acertos',
//     value: '82%',
//     description: '+5% em relação à semana passada',
//     icon: Target,
//   },
//   {
//     title: 'Dias consecutivos',
//     value: '7 dias',
//     description: 'Continue mantendo o ritmo!',
//     icon: Flame,
//   },
//   {
//     title: 'Tempo de estudo',
//     value: '18h 30m',
//     description: 'Nesta semana',
//     icon: Clock3,
//   },
// ]

const weeklyActivity = [
  { day: 'Seg', value: 45 },
  { day: 'Ter', value: 70 },
  { day: 'Qua', value: 55 },
  { day: 'Qui', value: 90 },
  { day: 'Sex', value: 65 },
  { day: 'Sáb', value: 100 },
  { day: 'Dom', value: 35 },
]

export function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Saudação */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm text-slate-400">
            Domingo, 1 de novembro de 2026
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Olá, estudante! 👋
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Sua jornada de aprovação continua. Vamos estudar?
          </p>
        </div>

        {/* <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
          <Play size={17} />
          Começar a estudar
        </button> */}
        <Link
          to="/study"
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          <Play size={17} />
          Começar a estudar
        </Link>
      </section>

      {/* Indicadores */}
      {/* <section>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">
            Seu desempenho
          </h3>
          <p className="text-sm text-slate-500">
            Acompanhe sua evolução nos estudos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-800 bg-[#111827] p-5 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {stat.title}
                  </span>

                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Icon size={19} className="text-blue-400" />
                  </div>
                </div>

                <h4 className="mt-5 text-2xl font-bold text-white">
                  {stat.value}
                </h4>

                <p className="mt-2 text-xs text-emerald-400">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </div>
      </section> */}
      <DashboardStatistics />

      {/* Gráficos e progresso */}
      {/* <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">
                Atividade semanal
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Seu ritmo de estudos nos últimos dias.
              </p>
            </div>

            <span className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400">
              Esta semana
            </span>
          </div>

          <div className="mt-8 flex h-52 items-end justify-between gap-3">
            {weeklyActivity.map((item) => (
              <div
                key={item.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-3"
              >
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-blue-500/80 transition-colors hover:bg-blue-400"
                    style={{ height: `${item.value}%` }}
                  />
                </div>

                <span className="text-xs text-slate-500">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
          <h3 className="font-semibold text-white">
            Meta semanal
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Seu objetivo de estudos.
          </p>

          <div className="my-8 flex items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-slate-800">
              <div className="absolute inset-[-10px] rounded-full border-[10px] border-blue-500 border-r-transparent border-b-transparent rotate-45" />

              <div className="text-center">
                <p className="text-3xl font-bold text-white">75%</p>
                <p className="text-xs text-slate-500">Concluído</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">18h30 estudadas</span>
            <span className="text-white">25h</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-3/4 rounded-full bg-blue-500" />
          </div>
        </div>
      </section> */}

      {/* Ações rápidas */}
      <section>
        <div className="mb-4">
          <h3 className="font-semibold text-white">
            Continue sua preparação
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Escolha como deseja estudar hoje.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 transition-colors hover:border-blue-500/50">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
              <BookOpen className="text-blue-400" size={22} />
            </div>

            <h4 className="font-semibold text-white">
              Resolver questões
            </h4>

            <p className="mt-2 text-sm text-slate-400">
              Pratique com questões de diferentes bancas e disciplinas.
            </p>

            <a
              href="/questions"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Acessar questões
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 transition-colors hover:border-purple-500/50">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10">
              <Sparkles className="text-purple-400" size={22} />
            </div>

            <h4 className="font-semibold text-white">
              Estudar com inteligência artificial
            </h4>

            <p className="mt-2 text-sm text-slate-400">
              Utilize recursos de IA para auxiliar sua preparação.
            </p>

            <a
              href="/study"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Explorar recursos
              <ChevronRight size={16} />
            </a>
          </div>

        </div>
      </section>

    </div>
  )
}
