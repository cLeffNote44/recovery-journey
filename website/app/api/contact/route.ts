import { NextResponse } from 'next/server'

const CONTACT_EMAIL = 'contact@recoveryjourney.app'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, email, organization, role, patientCount, message } = body

    // Basic validation
    if (!name || !email || !organization) {
      return NextResponse.json(
        { error: 'Name, email, and organization are required' },
        { status: 400 }
      )
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Log the submission (in production, send via email service like Resend/SendGrid)
    const submission = {
      name,
      email,
      organization,
      role: role || 'Not specified',
      patientCount: patientCount || 'Not specified',
      message: message || '',
      submittedAt: new Date().toISOString(),
    }

    // TODO: Replace with actual email service (Resend, SendGrid, etc.)
    // For now, log to server console so submissions aren't lost
    console.info('[Contact Form Submission]', JSON.stringify(submission))

    return NextResponse.json({
      success: true,
      message: 'Demo request received. We will contact you within one business day.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
