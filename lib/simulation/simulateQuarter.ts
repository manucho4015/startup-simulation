import type { GameState, Decisions, QuarterResult } from "./types";

const INDUSTRY_SALARY = 30_000
const HIRING_COST = 5_000

export function simulateQuarter(state: GameState, decisions: Decisions): { nextState: GameState; result: QuarterResult } {
    const { price, new_engineers, new_sales_staff, salary_pct } = decisions

    // 1.Apply hiring
    const engineers = state.engineers + new_engineers
    const sales_staff = state.sales_staff + new_sales_staff

    const hiringCost = (new_engineers + new_sales_staff) * HIRING_COST

    // 2.Payroll
    const salaryPerPerson = (salary_pct / 100) * INDUSTRY_SALARY
    const totalPayroll = salaryPerPerson * (engineers + sales_staff)

    // 3.Imporve product quality
    const product_quality = Math.min(100, Math.round(state.product_quality + engineers * .5))

    // 4.Demand
    const demand = Math.max(0, product_quality * 10 - price * .0001)

    // 5.Units sold
    const units = Math.floor(demand * sales_staff * .5)

    // 6.Revenue
    const revenue = price * units

    // 7.Net income
    const net_income = revenue - totalPayroll - hiringCost

    // 8.Cash
    const cash = state.cash + net_income

    // 9. Advance time
    let year = state.year
    let quarter = state.quarter + 1

    if (quarter > 4) {
        quarter = 1
        year += 1
    }

    return {
        nextState: { cash, engineers, sales_staff, product_quality, year, quarter },
        result: { revenue, net_income, cash_end: cash, engineers, sales_staff }
    }
}