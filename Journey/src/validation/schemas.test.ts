import { describe, it, expect } from 'vitest'
import {
  patientFormSchema,
  loginSchema,
  messageSchema,
  facilitySchema,
  validateForm,
} from './schemas'

describe('Validation Schemas', () => {
  describe('patientFormSchema', () => {
    const validPatient = {
      first_name: 'John',
      last_name: "O'Connor",
      date_of_birth: '1990-01-15',
      phone: '555-123-4567',
      email: 'john@example.com',
      sobriety_date: '2023-06-01',
    }

    it('should validate a valid patient', () => {
      const result = patientFormSchema.safeParse(validPatient)
      expect(result.success).toBe(true)
    })

    it('should reject empty first name', () => {
      const result = patientFormSchema.safeParse({
        ...validPatient,
        first_name: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('First name is required')
      }
    })

    it('should reject first name with numbers', () => {
      const result = patientFormSchema.safeParse({
        ...validPatient,
        first_name: 'John123',
      })
      expect(result.success).toBe(false)
    })

    it('should accept names with hyphens and apostrophes', () => {
      const result = patientFormSchema.safeParse({
        ...validPatient,
        first_name: 'Mary-Jane',
        last_name: "O'Brien-Smith",
      })
      expect(result.success).toBe(true)
    })

    it('should reject patients under 13 years old', () => {
      const today = new Date()
      const tenYearsAgo = new Date(
        today.getFullYear() - 10,
        today.getMonth(),
        today.getDate()
      )
      const result = patientFormSchema.safeParse({
        ...validPatient,
        date_of_birth: tenYearsAgo.toISOString().split('T')[0],
      })
      expect(result.success).toBe(false)
    })

    it('should reject patients over 120 years old', () => {
      const result = patientFormSchema.safeParse({
        ...validPatient,
        date_of_birth: '1880-01-01',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid phone numbers', () => {
      const validPhones = [
        '555-123-4567',
        '(555) 123-4567',
        '5551234567',
        '+1 555 123 4567',
        '+15551234567',
      ]

      for (const phone of validPhones) {
        const result = patientFormSchema.safeParse({ ...validPatient, phone })
        expect(result.success).toBe(true)
      }
    })

    it('should accept empty phone (optional field)', () => {
      const result = patientFormSchema.safeParse({
        ...validPatient,
        phone: '',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      const result = patientFormSchema.safeParse({
        ...validPatient,
        phone: '123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject future sobriety dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const result = patientFormSchema.safeParse({
        ...validPatient,
        sobriety_date: futureDate.toISOString().split('T')[0],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'securepassword123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'securepassword',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is required')
      }
    })

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'securepassword',
      })
      expect(result.success).toBe(false)
    })

    it('should reject passwords shorter than 8 characters', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Password must be at least 8 characters'
        )
      }
    })

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('messageSchema', () => {
    it('should validate a valid message', () => {
      const result = messageSchema.safeParse({
        text: 'Hello, how are you doing today?',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty messages', () => {
      const result = messageSchema.safeParse({ text: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Message cannot be empty')
      }
    })

    it('should reject messages over 5000 characters', () => {
      const result = messageSchema.safeParse({
        text: 'a'.repeat(5001),
      })
      expect(result.success).toBe(false)
    })

    it('should accept messages at exactly 5000 characters', () => {
      const result = messageSchema.safeParse({
        text: 'a'.repeat(5000),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('facilitySchema', () => {
    const validFacility = {
      name: 'Recovery Center',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      phone: '555-123-4567',
      email: 'info@recovery.com',
    }

    it('should validate a valid facility', () => {
      const result = facilitySchema.safeParse(validFacility)
      expect(result.success).toBe(true)
    })

    it('should validate facility with optional license number', () => {
      const result = facilitySchema.safeParse({
        ...validFacility,
        license_number: 'LIC-12345',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid ZIP code', () => {
      const result = facilitySchema.safeParse({
        ...validFacility,
        zip: '123',
      })
      expect(result.success).toBe(false)
    })

    it('should accept ZIP+4 format', () => {
      const result = facilitySchema.safeParse({
        ...validFacility,
        zip: '62701-1234',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty facility name', () => {
      const result = facilitySchema.safeParse({
        ...validFacility,
        name: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validateForm helper', () => {
    it('should return success with data for valid input', () => {
      const result = validateForm(loginSchema, {
        email: 'user@example.com',
        password: 'securepassword',
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        email: 'user@example.com',
        password: 'securepassword',
      })
      expect(result.errors).toBeUndefined()
    })

    it('should return errors for invalid input', () => {
      const result = validateForm(loginSchema, {
        email: 'invalid',
        password: 'short',
      })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.email).toBeDefined()
      expect(result.errors?.password).toBeDefined()
    })

    it('should only return the first error per field', () => {
      const result = validateForm(loginSchema, {
        email: '',
        password: '',
      })
      expect(result.success).toBe(false)
      // email has "required" error, not both required and format
      expect(result.errors?.email).toBe('Email is required')
    })
  })
})
