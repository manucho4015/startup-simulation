export type GameState = {
    cash: number
    engineers: number
    sales_staff: number
    product_quality: number
    year: number
    quarter: number
}

export type Decisions = {
    price: number
    new_engineers: number
    new_sales_staff: number
    salary_pct: number
}

export type QuarterResult = {
    revenue: number
    net_income: number
    cash_end: number
    engineers: number
    sales_staff: number
}