'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// types
import type { Game } from "@/types/game";

export default function Home() {
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState<any>(true)

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
    </div>
  );
}
