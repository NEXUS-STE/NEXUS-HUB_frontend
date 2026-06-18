'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Zap, User, Mail, Lock, ArrowRight } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/schemas'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '11px 13px 11px 38px',
  backgroundColor: '#1A2335',
  border: hasError ? '1px solid #EF4444' : '1px solid #1E2D45',
  borderRadius: '10px',
  color: '#F0F6FF',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
})

function Field({
  label,
  hint,
  error,
  icon,
  children,
}: {
  label: string
  hint?: string
  error?: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94A3B8', marginBottom: '6px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          {icon}
        </span>
        {children}
      </div>
      {error && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '5px' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '12px', color: '#475569', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const { onBlur: nameOnBlur, ...nameReg } = register('name')
  const { onBlur: emailOnBlur, ...emailReg } = register('email')
  const { onBlur: passwordOnBlur, ...passwordReg } = register('password')
  const { onBlur: confirmOnBlur, ...confirmReg } = register('confirmPassword')

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    try {
      const res = await authApi.register(data.name, data.email, data.password)
      const { user, accessToken, refreshToken } = res.data.data
      setTokens(accessToken, refreshToken)
      setUser(user)
      router.push('/dashboard')
    } catch {
      toast.error('Registration failed. This email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#0A0F1E', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#00D4FF', marginBottom: '16px', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}>
            <Zap size={24} color="#0A0F1E" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F6FF', letterSpacing: '-0.5px', margin: 0 }}>
            NEXUS-HUB
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>Secure escrow infrastructure</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#111827', border: '1px solid #1E2D45', borderRadius: '16px', padding: '36px', boxShadow: '0 0 0 1px rgba(0,212,255,0.08), 0 32px 64px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F0F6FF', margin: '0 0 4px' }}>Create an account</h2>
          <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 28px' }}>Get started with NEXUS-HUB today</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Full name" error={errors.name?.message} icon={<User size={15} color="#475569" />}>
              <input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                style={inputStyle(!!errors.name)}
                onFocus={(e) => { if (!errors.name) e.target.style.borderColor = '#00D4FF' }}
                onBlur={(e) => { nameOnBlur(e); if (!errors.name) e.target.style.borderColor = '#1E2D45' }}
                {...nameReg}
              />
            </Field>

            <Field label="Email address" error={errors.email?.message} icon={<Mail size={15} color="#475569" />}>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                style={inputStyle(!!errors.email)}
                onFocus={(e) => { if (!errors.email) e.target.style.borderColor = '#00D4FF' }}
                onBlur={(e) => { emailOnBlur(e); if (!errors.email) e.target.style.borderColor = '#1E2D45' }}
                {...emailReg}
              />
            </Field>

            <Field label="Password" hint="Minimum 8 characters" error={errors.password?.message} icon={<Lock size={15} color="#475569" />}>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                style={inputStyle(!!errors.password)}
                onFocus={(e) => { if (!errors.password) e.target.style.borderColor = '#00D4FF' }}
                onBlur={(e) => { passwordOnBlur(e); if (!errors.password) e.target.style.borderColor = '#1E2D45' }}
                {...passwordReg}
              />
            </Field>

            <Field label="Confirm password" error={errors.confirmPassword?.message} icon={<Lock size={15} color="#475569" />}>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                style={inputStyle(!!errors.confirmPassword)}
                onFocus={(e) => { if (!errors.confirmPassword) e.target.style.borderColor = '#00D4FF' }}
                onBlur={(e) => { confirmOnBlur(e); if (!errors.confirmPassword) e.target.style.borderColor = '#1E2D45' }}
                {...confirmReg}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '13px',
                backgroundColor: loading ? '#00a8cc' : '#00D4FF',
                color: '#0A0F1E', fontWeight: '700', fontSize: '15px',
                borderRadius: '10px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '6px',
                boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                transition: 'all 0.15s',
                letterSpacing: '-0.2px',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#33dcff'; e.currentTarget.style.boxShadow = '0 0 28px rgba(0,212,255,0.5)' } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#00D4FF'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.3)' } }}
            >
              {loading ? (
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #0A0F1E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>Create account <ArrowRight size={16} strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          {/* T&C note */}
          <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', marginTop: '18px', lineHeight: '1.6' }}>
            By creating an account you agree to our{' '}
            <a href="#" style={{ color: '#00D4FF', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#00D4FF', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#475569' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#00D4FF', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', padding: '5px 12px', borderRadius: '99px', border: '1px solid #1E2D45', backgroundColor: 'rgba(17,24,39,0.5)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            End-to-end encrypted · SOC 2 compliant
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>
    </div>
  )
}
