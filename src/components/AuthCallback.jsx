// src/components/AuthCallback.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function AuthCallback() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    // Handle the auth callback
    const handleCallback = async () => {
      try {
        // Get the session from URL hash
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          return
        }

        if (data.session) {
          console.log('✅ Email confirmed, session created:', data.session)
          setStatus('success')
          
          // Redirect to main app after 2 seconds
          setTimeout(() => {
            window.location.replace('/')
          }, 2000)
        } else {
          setStatus('error')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">
            {status === 'loading' && '⏳'}
            {status === 'success' && '✅'}
            {status === 'error' && '❌'}
          </span>
          <h1>
            {status === 'loading' && 'Memverifikasi Email...'}
            {status === 'success' && 'Email Terverifikasi!'}
            {status === 'error' && 'Verifikasi Gagal'}
          </h1>
          <p>
            {status === 'loading' && 'Mohon tunggu sebentar...'}
            {status === 'success' && 'Redirect ke dashboard...'}
            {status === 'error' && 'Ada masalah dengan verifikasi. Coba login manual.'}
          </p>
        </div>

        {status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-submit"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}