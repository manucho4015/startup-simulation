'use client'

const OFFICE_CAPACITY = 20

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// types
import type { Game } from "@/types/game";
import type { Decisions } from "@/lib/simulation/types";

function OfficeVisualization({ engineers, sales }: { engineers: number, sales: number }) {
  const desks = [...Array(engineers).fill('engineer'), ...Array(sales).fill('sales')]

  const emptyDesks = OFFICE_CAPACITY - desks.length

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Office</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 40px)', gap: 8 }}>
        {desks.map((role, i) => (
          <div key={i} title={role} className={`h-10 w-10 rounded ${role === 'engineer' ? 'bg-[#3b82f6]' : 'bg-[#22c55e]'}`} />
        ))}

        {Array.from({ length: emptyDesks }).map((_, i) => (
          <div key={`empty-${i}`} title="Empty desk" className="bg-[#e5e7eb] h-10 w-10 rounded" />
        ))}
      </div>

      <div className="mt-8 text-sm">
        <span className="mr-12">🔵 Engineers</span>
        <span className="mr-12">🟢 Sales</span>
        <span>⚪ Empty</span>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState<any>(true)
  const [decisions, setDecisions] = useState<Decisions>({
    price: 500,
    new_engineers: 0,
    new_sales_staff: 0,
    salary_pct: 100
  })
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  let isGameOver = false
  let isWin = false

  if (game) {
    isGameOver = game.cash <= 0
    isWin = game.year >= 10 && game.cash > 0
  }



  async function advanceQuarter() {
    setSubmitting(true)

    const res = await fetch('/api/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decisions)
    })

    const data = await res.json()

    if (!res.ok) {
      console.error(data.error)
      setSubmitting(false)
      return
    }

    // Update dashboard state
    setGame(data.game)

    // reset hires
    setDecisions({ ...decisions, new_engineers: 0, new_sales_staff: 0 })

    setSubmitting(false)
  }

  // load game every time route changes
  useEffect(() => {
    async function loadGame() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Try to fetch existing game
      const { data: existingGame } = await supabase.from('game_state').select('*').maybeSingle()

      // If none exists → create it
      if (!existingGame) {
        const { data: newGame, error } = await supabase.from('game_state').insert({
          user_id: user.id,
          cash: 1_000_000,
          engineers: 4,
          sales_staff: 2,
          product_quality: 50,
          year: 1,
          quarter: 1
        }).select().single()

        if (error) {
          console.error(error)
          return
        }
        setGame(newGame)
      } else {
        setGame(existingGame)
      }

      setLoading(false)
    }

    async function loadHistory() {
      const { data: history } = await supabase.from('quarter_history').select('*').order('created_at', { ascending: false }).limit(4)

      setHistory(history ?? [])
    }

    loadHistory()
    loadGame()


  }, [router])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="font-semibold text-xl">Last 4 Quarters</h2>

          <div className="rounded-xl border border-[#ffffff46] inline-block overflow-x-auto">
            <table className="">
              <thead className="bg-[#4747474b] ">
                <tr className="font-medium pb-5 border-b border-[#ffffff46] text-[#ffffffd8]">
                  <th className="px-6 py-3">Year</th>
                  <th className="px-6 py-3">Quarter</th>
                  <th className="px-6 py-3">Revenue</th>
                  <th className="px-6 py-3">Net Income</th>
                  <th className="px-6 py-3">Cash</th>
                </tr>
              </thead>
              <tbody>
                {history.map((q, i) => (
                  <tr className="text-[#ffffffc3] border-[#ffffff46]" key={q.id}>
                    <td className={`${i !== history.length - 1 && 'border-b border-[#ffffff46]'} px-6 py-4`}>{q.year}</td>
                    <td className={`${i !== history.length - 1 && 'border-b border-[#ffffff46]'} px-6 py-4`}> {q.quarter}</td>
                    <td className={`${i !== history.length - 1 && 'border-b border-[#ffffff46]'} px-6 py-4`}> {q.revenue}</td>
                    <td className={`${i !== history.length - 1 && 'border-b border-[#ffffff46]'} px-6 py-4`}> {q.net_income}</td>
                    <td className={`${i !== history.length - 1 && 'border-b border-[#ffffff46]'} px-6 py-4`}> {q.cash_end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <h1>Startup Dashboard</h1>
      {
        game && (
          <>
            <p>Cash: ${game.cash}</p>
            <p>Year {game.year}, Quarter {game.quarter}</p>
            <p>Engineers: {game.engineers}</p>
            <p>Sales Staff: {game.sales_staff}</p>
          </>
        )
      }



      {game && (
        <OfficeVisualization engineers={game?.engineers} sales={game?.sales_staff} />
      )}

      {isGameOver && (
        <div className="text-red-500 mt-16">
          <h2>Game Over</h2>
          <p>You ran out of cash</p>
        </div>
      )}

      {isWin && (
        <div className="text-green-500 mt-16">
          <h2>You Win</h2>
          <p>You successfully ran the company for 10 years.</p>
        </div>
      )}


      <div style={{ marginTop: 24 }}>
        <h2>Quarter Decisions</h2>

        <label>
          Unit Price
          <input type="number" value={decisions.price} onChange={e => setDecisions({ ...decisions, price: Number(e.target.value) })} />
        </label>

        <label>
          Hire Egineers
          <input type="number" value={decisions.new_engineers} onChange={e => setDecisions({ ...decisions, new_engineers: Number(e.target.value) })} />
        </label>

        <label>
          Hire Sales Staff
          <input type="number" value={decisions.new_sales_staff} onChange={e => setDecisions({ ...decisions, new_sales_staff: Number(e.target.value) })} />
        </label>

        <label>
          Salary (% of industry avg)
          <input type="number" value={decisions.salary_pct} onChange={e => setDecisions({ ...decisions, salary_pct: Number(e.target.value) })} />
        </label>

        <button disabled={submitting || isGameOver || isWin} onClick={advanceQuarter} className="border rounded-xl py-2 px-4">
          {isGameOver ? 'Game Over' : isWin ? 'You Win' : submitting ? 'Advancing...' : 'Advance Quarter'}
        </button>

      </div>
    </div>
  );
}
