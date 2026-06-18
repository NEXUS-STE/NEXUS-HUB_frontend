'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, KeyRound } from 'lucide-react'
import { Card, Button, Input, PageHeader, Divider } from '@/components/ui'
import {
  profileSchema,
  changePasswordSchema,
  type ProfileInput,
  type ChangePasswordInput,
} from '@/lib/schemas'
import { useUpdateProfile, useChangePassword } from '@/hooks/use-nexus-queries'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate } from '@/lib/utils'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, email: user.email })
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const onProfileSubmit = async (data: ProfileInput) => {
    await updateProfile.mutateAsync({ name: data.name, email: data.email })
  }

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    passwordForm.reset()
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your account profile and security."
      />

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
            <User size={15} className="text-[--color-accent]" />
          </div>
          <h2 className="text-sm font-semibold text-[--color-text-primary]">Profile</h2>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full name"
            placeholder="John Doe"
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={profileForm.formState.errors.email?.message}
            {...profileForm.register('email')}
          />

          {user?.createdAt && (
            <p className="text-xs text-[--color-text-muted]">
              Member since {formatDate(user.createdAt)}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={updateProfile.isPending}
              disabled={!profileForm.formState.isDirty}
            >
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Divider />

      {/* Change password */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center">
            <KeyRound size={15} className="text-[--color-warning]" />
          </div>
          <h2 className="text-sm font-semibold text-[--color-text-primary]">Change Password</h2>
        </div>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            placeholder="••••••••"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            hint="Minimum 8 characters"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="secondary" loading={changePassword.isPending}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.03)]">
        <h2 className="text-sm font-semibold text-[--color-error] mb-2">Danger Zone</h2>
        <p className="text-sm text-[--color-text-secondary] mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="danger" size="sm">
          Delete account
        </Button>
      </Card>
    </div>
  )
}
