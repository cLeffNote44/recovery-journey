import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { User, Bell, Shield, Building, LogOut, Moon, Sun, Save, Key, Smartphone, Copy, Check, ShieldCheck, RefreshCw, AlertTriangle, Download } from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import { FormField, Input, Button } from '../components/ui/Form'
import { showToast } from '../components/Toast'
import { useFormDirtyState, useBeforeUnload } from '../hooks'
import api from '../services/api'
import { SectionErrorBoundary } from '../components/ErrorBoundary'
import { validateForm, twoFactorVerifySchema, twoFactorDisableSchema } from '../validation/schemas'

interface ProfileFormData {
  first_name: string
  last_name: string
}

interface NotificationSettings {
  newCheckIns: boolean
  missedCheckIns: boolean
  newMessages: boolean
  appointmentReminders: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
}

export default function Settings() {
  const { user, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useThemeStore()

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  })
  const { isDirty: isProfileDirty, resetDirtyState: resetProfileDirty } = useFormDirtyState(
    { first_name: user?.first_name || '', last_name: user?.last_name || '' },
    profileData
  )

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newCheckIns: true,
    missedCheckIns: true,
    newMessages: true,
    appointmentReminders: true,
  })
  const [initialNotifications] = useState<NotificationSettings>(notifications)
  const isNotificationsDirty = JSON.stringify(notifications) !== JSON.stringify(initialNotifications)

  // Security settings state
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
  })

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)

  // Password change modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // 2FA setup modal
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
  const [twoFactorStep, setTwoFactorStep] = useState<'qr' | 'verify' | 'backup'>('qr')
  const [qrCodeData, setQrCodeData] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false)
  const [secretCopied, setSecretCopied] = useState(false)

  // Backup codes
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false)
  const [backupCodesCopied, setBackupCodesCopied] = useState(false)
  const [isRegeneratingBackupCodes, setIsRegeneratingBackupCodes] = useState(false)

  // 2FA verification errors
  const [verificationError, setVerificationError] = useState('')
  const [disableErrors, setDisableErrors] = useState<Record<string, string>>({})

  // 2FA disable modal
  const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [isDisabling2FA, setIsDisabling2FA] = useState(false)

  // Unsaved changes warning
  const hasUnsavedChanges = isProfileDirty || isNotificationsDirty
  useBeforeUnload(hasUnsavedChanges)

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      })
    }
  }, [user])

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      await api.put('/users/profile', profileData)
      resetProfileDirty(profileData)
      showToast.success('Profile updated successfully!')
    } catch (error) {
      showToast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle notifications save
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    try {
      await api.put('/users/notifications', notifications)
      showToast.success('Notification preferences saved!')
    } catch (error) {
      showToast.error('Failed to save notification preferences.')
    } finally {
      setIsSavingNotifications(false)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    // Validate
    const errors: Record<string, string> = {}
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsChangingPassword(true)
    setPasswordErrors({})

    try {
      await api.post('/users/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })
      showToast.success('Password changed successfully!')
      setIsPasswordModalOpen(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } }
      if (apiError.response?.data?.detail === 'Invalid current password') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' })
      } else {
        showToast.error('Failed to change password. Please try again.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Fetch 2FA status on mount
  useEffect(() => {
    api.get('/2fa/status').then((res) => {
      if (res.data?.enabled !== undefined) {
        setSecurity({ twoFactorEnabled: res.data.enabled })
      }
    }).catch(() => {
      // API unavailable, keep default
    })
  }, [])

  // Handle 2FA toggle
  const handleToggle2FA = async () => {
    if (!security.twoFactorEnabled) {
      // Start 2FA setup
      setIsSettingUp2FA(true)
      try {
        const res = await api.post('/2fa/setup')
        setQrCodeData(res.data.qrCode)
        setTotpSecret(res.data.secret)
        setTwoFactorStep('qr')
        setVerificationCode('')
        setVerificationError('')
        setBackupCodes([])
        setIs2FAModalOpen(true)
      } catch (error) {
        showToast.error('Failed to start 2FA setup.')
      } finally {
        setIsSettingUp2FA(false)
      }
    } else {
      // Open disable modal
      setDisableCode('')
      setDisablePassword('')
      setIsDisable2FAModalOpen(true)
    }
  }

  const handleVerify2FA = async () => {
    const result = validateForm(twoFactorVerifySchema, { code: verificationCode })
    if (!result.success) {
      setVerificationError(result.errors?.code || 'Invalid verification code')
      return
    }

    setIsSettingUp2FA(true)
    setVerificationError('')
    try {
      const res = await api.post('/2fa/verify', { code: verificationCode })
      setSecurity({ twoFactorEnabled: true })
      setIs2FAModalOpen(false)

      // Show backup codes if returned by the API
      if (res.data?.backupCodes && res.data.backupCodes.length > 0) {
        setBackupCodes(res.data.backupCodes)
        setIsBackupCodesModalOpen(true)
      }

      showToast.success('Two-factor authentication enabled!')
    } catch (error) {
      setVerificationError('Invalid code. Please check your authenticator and try again.')
    } finally {
      setIsSettingUp2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    const result = validateForm(twoFactorDisableSchema, { code: disableCode, password: disablePassword })
    if (!result.success) {
      setDisableErrors(result.errors || {})
      return
    }

    setIsDisabling2FA(true)
    setDisableErrors({})
    try {
      await api.post('/2fa/disable', { code: disableCode, password: disablePassword })
      setSecurity({ twoFactorEnabled: false })
      setBackupCodes([])
      setIsDisable2FAModalOpen(false)
      showToast.success('Two-factor authentication disabled.')
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } }
      const errorMessage = apiError.response?.data?.error || 'Failed to disable 2FA.'
      if (errorMessage.toLowerCase().includes('password')) {
        setDisableErrors({ password: errorMessage })
      } else if (errorMessage.toLowerCase().includes('code')) {
        setDisableErrors({ code: errorMessage })
      } else {
        showToast.error(errorMessage)
      }
    } finally {
      setIsDisabling2FA(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    setIsRegeneratingBackupCodes(true)
    try {
      const res = await api.post('/2fa/backup-codes/regenerate')
      setBackupCodes(res.data.backupCodes)
      setBackupCodesCopied(false)
      showToast.success('New backup codes generated. Save them securely!')
    } catch (error) {
      showToast.error('Failed to regenerate backup codes.')
    } finally {
      setIsRegeneratingBackupCodes(false)
    }
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setBackupCodesCopied(true)
    setTimeout(() => setBackupCodesCopied(false), 2000)
  }

  const downloadBackupCodes = () => {
    const codesText = [
      'Recovery Journey - Two-Factor Authentication Backup Codes',
      '='.repeat(55),
      '',
      'Keep these codes in a safe place. Each code can only be used once.',
      '',
      ...backupCodes.map((code, i) => `${i + 1}. ${code}`),
      '',
      `Generated: ${new Date().toLocaleDateString()}`,
    ].join('\n')

    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recovery-journey-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret)
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  return (
    <SectionErrorBoundary>
    <div className="animate-fadeIn max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        {hasUnsavedChanges && (
          <span className="text-sm text-amber-600 flex items-center gap-1" role="status" aria-live="polite">
            <span className="w-2 h-2 bg-amber-500 rounded-full" aria-hidden="true" />
            Unsaved changes
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            {isDarkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
            <h2 className="font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
              </div>
              <button
                onClick={toggleDarkMode}
                role="switch"
                aria-checked={isDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Profile</h2>
            </div>
            {isProfileDirty && (
              <Button
                size="sm"
                onClick={handleSaveProfile}
                isLoading={isSavingProfile}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="First Name" name="first_name">
              <Input
                name="first_name"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                placeholder="Enter first name"
              />
            </FormField>
            <FormField label="Last Name" name="last_name">
              <Input
                name="last_name"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                placeholder="Enter last name"
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Email" name="email" helperText="Contact your administrator to change email">
                <Input
                  name="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            {isNotificationsDirty && (
              <Button
                size="sm"
                onClick={handleSaveNotifications}
                isLoading={isSavingNotifications}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-200">New patient check-ins</span>
              <input
                type="checkbox"
                checked={notifications.newCheckIns}
                onChange={(e) => setNotifications({ ...notifications, newCheckIns: e.target.checked })}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-200">Missed check-in alerts</span>
              <input
                type="checkbox"
                checked={notifications.missedCheckIns}
                onChange={(e) => setNotifications({ ...notifications, missedCheckIns: e.target.checked })}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-200">New messages</span>
              <input
                type="checkbox"
                checked={notifications.newMessages}
                onChange={(e) => setNotifications({ ...notifications, newMessages: e.target.checked })}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 dark:text-gray-200">Appointment reminders</span>
              <input
                type="checkbox"
                checked={notifications.appointmentReminders}
                onChange={(e) => setNotifications({ ...notifications, appointmentReminders: e.target.checked })}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
            </label>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>

            {/* Two-Factor Authentication */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${security.twoFactorEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {security.twoFactorEnabled ? (
                      <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Shield className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Two-factor authentication</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {security.twoFactorEnabled
                        ? 'Your account is protected with 2FA'
                        : 'Add an extra layer of security to your account'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  disabled={isSettingUp2FA}
                  role="switch"
                  aria-checked={security.twoFactorEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    security.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-300'
                  } ${isSettingUp2FA ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Backup codes actions (visible when 2FA is enabled) */}
              {security.twoFactorEnabled && (
                <div className="mt-3 ml-10 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (backupCodes.length > 0) {
                        setIsBackupCodesModalOpen(true)
                      } else {
                        handleRegenerateBackupCodes()
                      }
                    }}
                    disabled={isRegeneratingBackupCodes}
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    <Key className="w-3.5 h-3.5" />
                    {isRegeneratingBackupCodes ? 'Loading...' : 'View Backup Codes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Facility Section (Admin only) */}
        {user?.role === 'super_admin' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <Building className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Facility Management</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Manage facilities, staff accounts, and system settings.
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/super-admin'}
            >
              Manage Facilities
            </Button>
          </div>
        )}

        {/* Logout */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
          <button
            onClick={() => logout('manual')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false)
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
          setPasswordErrors({})
        }}
        title="Change Password"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} isLoading={isChangingPassword}>
              Change Password
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Current Password"
            name="currentPassword"
            error={passwordErrors.currentPassword}
            required
          >
            <Input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              error={!!passwordErrors.currentPassword}
              placeholder="Enter current password"
            />
          </FormField>
          <FormField
            label="New Password"
            name="newPassword"
            error={passwordErrors.newPassword}
            helperText="Must be at least 8 characters"
            required
          >
            <Input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              error={!!passwordErrors.newPassword}
              placeholder="Enter new password"
            />
          </FormField>
          <FormField
            label="Confirm New Password"
            name="confirmPassword"
            error={passwordErrors.confirmPassword}
            required
          >
            <Input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              error={!!passwordErrors.confirmPassword}
              placeholder="Confirm new password"
            />
          </FormField>
        </div>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        title="Set Up Two-Factor Authentication"
        size="sm"
        footer={
          twoFactorStep === 'qr' ? (
            <Button onClick={() => setTwoFactorStep('verify')}>
              Next
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setTwoFactorStep('qr')}>
                Back
              </Button>
              <Button
                onClick={handleVerify2FA}
                isLoading={isSettingUp2FA}
                disabled={verificationCode.length !== 6}
              >
                Enable 2FA
              </Button>
            </>
          )
        }
      >
        {twoFactorStep === 'qr' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Smartphone className="w-4 h-4" />
              <span>Scan this QR code with your authenticator app</span>
            </div>
            {qrCodeData && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCodeData} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p className="mb-1">Or enter this key manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded font-mono text-xs break-all">
                  {totpSecret}
                </code>
                <button
                  onClick={copySecret}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  title="Copy secret"
                >
                  {secretCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app to verify setup.
            </p>
            <FormField label="Verification Code" name="verification_code" error={verificationError}>
              <Input
                name="verification_code"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setVerificationError('')
                }}
                error={!!verificationError}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </FormField>
          </div>
        )}
      </Modal>

      {/* 2FA Disable Modal */}
      <Modal
        isOpen={isDisable2FAModalOpen}
        onClose={() => {
          setIsDisable2FAModalOpen(false)
          setDisableErrors({})
        }}
        title="Disable Two-Factor Authentication"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDisable2FAModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDisable2FA}
              isLoading={isDisabling2FA}
              disabled={disableCode.length !== 6 || !disablePassword}
            >
              Disable 2FA
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Disabling 2FA will reduce the security of your account. You can re-enable it at any time.
            </p>
          </div>
          <FormField label="Authenticator Code" name="disable_code" error={disableErrors.code}>
            <Input
              name="disable_code"
              value={disableCode}
              onChange={(e) => {
                setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setDisableErrors((prev) => ({ ...prev, code: '' }))
              }}
              error={!!disableErrors.code}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </FormField>
          <FormField label="Password" name="disable_password" error={disableErrors.password} required>
            <Input
              type="password"
              name="disable_password"
              value={disablePassword}
              onChange={(e) => {
                setDisablePassword(e.target.value)
                setDisableErrors((prev) => ({ ...prev, password: '' }))
              }}
              error={!!disableErrors.password}
              placeholder="Enter your password"
            />
          </FormField>
        </div>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={isBackupCodesModalOpen}
        onClose={() => setIsBackupCodesModalOpen(false)}
        title="Backup Codes"
        size="sm"
        closeOnBackdropClick={false}
        footer={
          <Button onClick={() => setIsBackupCodesModalOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Save these backup codes in a safe place. Each code can only be used once to sign in if you lose access to your authenticator app.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 px-3 py-2 rounded border border-gray-200 dark:border-gray-500 text-center"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyBackupCodes}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-550 transition-colors"
            >
              {backupCodesCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Codes
                </>
              )}
            </button>
            <button
              onClick={downloadBackupCodes}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-550 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleRegenerateBackupCodes}
              disabled={isRegeneratingBackupCodes}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRegeneratingBackupCodes ? 'animate-spin' : ''}`} />
              {isRegeneratingBackupCodes ? 'Regenerating...' : 'Regenerate Codes'}
            </button>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will invalidate all previously generated backup codes.
            </p>
          </div>
        </div>
      </Modal>
    </div>
    </SectionErrorBoundary>
  )
}
