// src/App.jsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import AuthCallback from './components/AuthCallback.jsx' // [1] Import komponen ini
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // [2] State baru untuk mendeteksi mode verifikasi
  const [isVerifying, setIsVerifying] = useState(false) 

  useEffect(() => {
    // [3] Cek apakah ini adalah kembalian dari email (Redirect)
    // Supabase menggunakan hash (#) untuk implicit flow atau query (?) untuk PKCE
    const isRedirect = window.location.hash.includes('access_token') || 
                       window.location.search.includes('code') ||
                       window.location.hash.includes('type=recovery');

    if (isRedirect) {
      setIsVerifying(true)
      // Kita biarkan AuthCallback.jsx yang menangani session logic
      setLoading(false) 
      return 
    }

    // Normal session check (jika bukan redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Show loading spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb'
      }}>
        <div className="spinner" />
      </div>
    )
  }

  // [4] Tampilkan AuthCallback jika sedang verifikasi
  if (isVerifying) {
    return <AuthCallback />
  }

  // If no session, show Login page
  if (!session) {
    return <Login />
  }
  
  // If session exists, show Dashboard
  return <Dashboard session={session} />
}

export default App