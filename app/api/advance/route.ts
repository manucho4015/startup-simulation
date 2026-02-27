import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { simulateQuarter } from "@/lib/simulation/simulateQuarter";

export async function POST(req: Request) {
    const supabase = await createSupabaseServerClient()

    // get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // parse decisions from client
    const decisions = await req.json()


    // fetch the current game state
    const { data: game, error: fetchError } = await supabase.from('game_state').select('*').single()

    if (!game || fetchError) {
        return NextResponse.json(
            { error: 'Game state not found' },
            { status: 400 }
        )
    }

    // run simulation
    const { nextState, result } = simulateQuarter(game, decisions)


    // persist updated game state
    const { error: updateError } = await supabase.from('game_state').update({
        cash: nextState.cash,
        engineers: nextState.engineers,
        sales_staff: nextState.sales_staff,
        product_quality: nextState.product_quality,
        year: nextState.year,
        quarter: nextState.quarter,
    }).eq('user_id', user.id)

    if (updateError) {

        return NextResponse.json(
            { error: 'Failed to update game state' },
            { status: 500 }
        )
    }

    // insert new quarter history in DB
    const { error: historyError } = await supabase.from('quarter_history').insert({
        user_id: user.id,
        year: nextState.year,
        quarter: nextState.quarter,
        revenue: result.revenue,
        net_income: result.net_income,
        cash_end: result.cash_end,
        engineers: result.engineers,
        sales_staff: result.sales_staff,
    })

    if (historyError) {
        return NextResponse.json(
            { error: 'Failed to save history' },
            { status: 500 }
        )
    }

    return NextResponse.json({
        game: nextState,
        result
    })
}