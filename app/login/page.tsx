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
        <div className='flex items-center justify-center h-screen'>
            <div className=" w-[50%] rounded-xl border border-[#ffffff46] flex flex-col items-center justify-center py-14">
                <h2 className="text-center text-[22px] font-bold mb-12">Account Management</h2>
                <div className="w-[50%]">
                    <p className='text-[16px] font-medium'>Email</p>
                    <input placeholder='Email' type="email" name="email" id="email" className='h-9.5 w-full bg-transparent border-[1.65px] border-[#ffffff46] px-5 text-sm  outline-none focus:border-primary focus:border-b-[1.65px] ease-in-out duration-200 rounded-xl mb-8'
                        value={email} onChange={e => setEmail(e.target.value)} />

                    <p className='text-[16px] font-medium'>Password</p>
                    <input placeholder='Password' type="password" name="password" id="password" className='h-9.5 w-full bg-transparent border-[1.65px] border-[#ffffff46] px-5 text-sm  outline-none focus:border-primary focus:border-b-[1.65px] ease-in-out duration-200 rounded-xl mb-8'
                        value={password} onChange={e => setPassword(e.target.value)} />


                    <div className="flex justify-center items-center gap-8">
                        <button className="border rounded-xl py-2 px-4 w-1/3" onClick={() => handleLogin(false)}>Login</button>
                        <button className="border rounded-xl py-2 px-4 w-1/3" onClick={() => handleLogin(true)}>Sign up</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default LoginPage
