'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// types
import type { Game } from "@/types/game";
import type { Decisions } from "@/lib/simulation/types";

export default function Home() {
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState<any>(true)
  const [decisions, setDecisions] = useState<Decisions>({
    price: 50_000,
    new_engineers: 0,
    new_sales_staff: 0,
    salary_pct: 100
  })
  const [submitting, setSubmitting] = useState(false)

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

    loadGame()
  }, [router])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Startup Dashboard</h1>
      {
        game && (
          <>
            <p>Cash ${game.cash}</p>
            <p>Year ${game.year}, Quarter {game.quarter}</p>
            <p>Engineers ${game.engineers}</p>
            <p>Sales Staff ${game.sales_staff}</p>
          </>
        )
      }

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

        <button disabled={submitting} onClick={advanceQuarter} className="border rounded-xl py-2 px-4">
          {submitting ? 'Advancing...' : 'Advance Quarter'}
        </button>

      </div>
    </div>
  );
}
