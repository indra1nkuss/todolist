// src/components/Login.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✅ Cek email Anda untuk link login!')
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px',
        animation: 'fadeIn 0.5s ease-in-out'
      }}>
        {/* Icon Shield */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" style={{ margin: '0 auto' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '0.5rem',
          color: '#1f2937'
        }}>
          Audit Tracker Login
        </h2>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          fontSize: '0.875rem',
          marginBottom: '2rem'
        }}>
          Masuk dengan Magic Link (tanpa password)
        </p>
        
        {message && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: message.includes('Error') ? '#fee2e2' : '#d1fae5',
            color: message.includes('Error') ? '#991b1b' : '#065f46',
            border: `1px solid ${message.includes('Error') ? '#fecaca' : '#a7f3d0'}`
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
            }}
          >
            {loading ? 'Mengirim Magic Link...' : 'Kirim Link Login'}
          </button>
        </form>
        
        <p style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          fontSize: '0.75rem',
          color: '#9ca3af'
        }}>
          🔒 Powered by Supabase Auth
        </p>
      </div>
    </div>
  )
}