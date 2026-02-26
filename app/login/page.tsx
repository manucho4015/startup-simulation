'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (isSignup = false) => {
        const { error } = isSignup ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password })

        if (!error) router.push('/')

    }

    return (
        <div>
            <input placeholder='email' onChange={e => setEmail(e.target.value)} />
            <input placeholder='password' type='password' onChange={e => setPassword(e.target.value)} />
            <button onClick={() => handleLogin(false)}>Login</button>
            <button onClick={() => handleLogin(true)}>Sign up</button>
        </div>
    )
}

export default LoginPage
