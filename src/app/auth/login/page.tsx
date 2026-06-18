'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/schemas'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const { onBlur: emailOnBlur, ...emailReg } = register('email')
  const { onBlur: passwordOnBlur, ...passwordReg } = register('password')

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { user, accessToken, refreshToken } = res.data.data
      setTokens(accessToken, refreshToken)
      setUser(user)
      router.push('/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0A0F1E', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#00D4FF',
              marginBottom: '16px',
              boxShadow: '0 0 30px rgba(0,212,255,0.4)',
            }}
          >
            <Zap size={24} color="#0A0F1E" strokeWidth={2.5} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#F0F6FF',
              letterSpacing: '-0.5px',
              margin: 0,
            }}
          >
            NEXUS-HUB
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Secure escrow infrastructure
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1E2D45',
            borderRadius: '16px',
            padding: '36px',
            boxShadow: '0 0 0 1px rgba(0,212,255,0.08), 0 32px 64px rgba(0,0,0,0.4)',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#F0F6FF',
              margin: '0 0 4px',
            }}
          >
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 28px' }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email */}
            <div>
              <label
                style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94A3B8', marginBottom: '6px' }}
              >
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  color="#475569"
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '11px 13px 11px 38px',
                    backgroundColor: '#1A2335',
                    border: errors.email ? '1px solid #EF4444' : '1px solid #1E2D45',
                    borderRadius: '10px',
                    color: '#F0F6FF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { if (!errors.email) e.target.style.borderColor = '#00D4FF' }}
                  onBlur={(e) => { emailOnBlur(e); if (!errors.email) e.target.style.borderColor = '#1E2D45' }}
                  {...emailReg}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '5px' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8' }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: '13px', color: '#00D4FF', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  color="#475569"
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '11px 13px 11px 38px',
                    backgroundColor: '#1A2335',
                    border: errors.password ? '1px solid #EF4444' : '1px solid #1E2D45',
                    borderRadius: '10px',
                    color: '#F0F6FF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { if (!errors.password) e.target.style.borderColor = '#00D4FF' }}
                  onBlur={(e) => { passwordOnBlur(e); if (!errors.password) e.target.style.borderColor = '#1E2D45' }}
                  {...passwordReg}
                />
              </div>
              {errors.password && (
                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '5px' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '13px',
                backgroundColor: loading ? '#00a8cc' : '#00D4FF',
                color: '#0A0F1E',
                fontWeight: '700',
                fontSize: '15px',
                borderRadius: '10px',
                border: 'none',
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
                <>
                  Sign in
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#475569' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: '#00D4FF', fontWeight: '600', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>

        {/* Bottom badge */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#475569',
              padding: '5px 12px',
              borderRadius: '99px',
              border: '1px solid #1E2D45',
              backgroundColor: 'rgba(17,24,39,0.5)',
            }}
          >
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
