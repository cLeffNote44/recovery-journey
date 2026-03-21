import { useState } from 'react'
import { Building2, User, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { superAdminAPI } from '../../services/api'
import { showToast } from '../../components/Toast'

interface WizardProps {
  onComplete: () => void
}

interface FacilityFormData {
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  license_number: string
}

interface CreatedFacility extends FacilityFormData {
  id: string
}

export default function WelcomeWizard({ onComplete }: WizardProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [facilityData, setFacilityData] = useState<FacilityFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    license_number: '',
  })
  const [adminData, setAdminData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    temp_password: '',
  })
  const [createdFacility, setCreatedFacility] = useState<CreatedFacility | null>(null)

  const handleFacilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFacilityData({ ...facilityData, [e.target.name]: e.target.value })
  }

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value })
  }

  const handleCreateFacility = async () => {
    setIsSubmitting(true)
    try {
      const response = await superAdminAPI.createFacility(facilityData)
      if (response.success) {
        setCreatedFacility({
          id: response.facility?.id || response.id,
          ...facilityData,
        })
        setStep(2)
      } else {
        showToast.error(response.error || 'Failed to create facility.')
      }
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : 'Failed to create facility. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!createdFacility) return
    setIsSubmitting(true)
    try {
      const response = await superAdminAPI.createAdministrator({
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        email: adminData.email,
        phone: adminData.phone,
        temp_password: adminData.temp_password,
        facility_id: createdFacility.id,
      })
      if (response.success) {
        showToast.success('Facility administrator created!')
        setStep(3)
      } else {
        showToast.error(response.error || 'Failed to create administrator.')
      }
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : 'Failed to create administrator. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setAdminData({ ...adminData, temp_password: password })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Create Facility */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Recover</h2>
              <p className="text-gray-600 mt-2">Let's set up your first facility</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={facilityData.name}
                  onChange={handleFacilityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hope Recovery Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={facilityData.address}
                  onChange={handleFacilityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Recovery Lane"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={facilityData.city}
                    onChange={handleFacilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={facilityData.state}
                    onChange={handleFacilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
                  <input
                    type="text"
                    name="zip"
                    value={facilityData.zip}
                    onChange={handleFacilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={facilityData.phone}
                    onChange={handleFacilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={facilityData.email}
                    onChange={handleFacilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@facility.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number (Optional)
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={facilityData.license_number}
                  onChange={handleFacilityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleCreateFacility}
              disabled={!facilityData.name || !facilityData.address || !facilityData.city || !facilityData.state || !facilityData.zip || !facilityData.phone || !facilityData.email || isSubmitting}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Facility'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Step 2: Create Facility Admin */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Add Facility Administrator</h2>
              <p className="text-gray-600 mt-2">
                Create the admin account for {createdFacility?.name || facilityData.name}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={adminData.first_name}
                    onChange={handleAdminChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={adminData.last_name}
                    onChange={handleAdminChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={adminData.email}
                  onChange={handleAdminChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@facility.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={adminData.phone}
                  onChange={handleAdminChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="temp_password"
                    value={adminData.temp_password}
                    onChange={handleAdminChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  The admin will be required to change this on first login
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={!adminData.first_name || !adminData.last_name || !adminData.email || !adminData.temp_password || isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Creating...' : 'Create Admin'}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your first facility has been created successfully.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Facility:</span>
                  <span className="font-medium">{facilityData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin:</span>
                  <span className="font-medium">{adminData.first_name} {adminData.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin Email:</span>
                  <span className="font-medium">{adminData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temp Password:</span>
                  <span className="font-mono bg-yellow-100 px-2 py-0.5 rounded">{adminData.temp_password}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Save these credentials and share them securely with the facility administrator. They will need to change their password on first login.
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
