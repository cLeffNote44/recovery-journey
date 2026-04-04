import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Guard: never seed a production database with test data
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot seed a production database. Aborting.')
    process.exit(1)
  }

  console.log('🌱 Seeding database...')

  // Create a test facility
  const facility = await prisma.facility.upsert({
    where: { id: 'facility-1' },
    update: {},
    create: {
      id: 'facility-1',
      name: 'Sunrise Recovery Center',
      address: '123 Recovery Lane',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '5125551234',
      email: 'admin@sunriserecovery.com',
      licenseNumber: 'TX-RC-2024-001',
      status: 'ACTIVE'
    }
  })
  console.log(`✅ Created facility: ${facility.name}`)

  // Create super admin
  const superAdminPassword = await bcrypt.hash('Admin123!', 12)
  const superAdmin = await prisma.staff.upsert({
    where: { email: 'superadmin@recoveryjourney.com' },
    update: {},
    create: {
      email: 'superadmin@recoveryjourney.com',
      passwordHash: superAdminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  })
  console.log(`✅ Created super admin: ${superAdmin.email}`)

  // Create facility admin
  const facilityAdminPassword = await bcrypt.hash('Admin123!', 12)
  const facilityAdmin = await prisma.staff.upsert({
    where: { email: 'admin@sunriserecovery.com' },
    update: {},
    create: {
      email: 'admin@sunriserecovery.com',
      passwordHash: facilityAdminPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'FACILITY_ADMIN',
      facilityId: facility.id,
      phone: '5125551235',
      status: 'ACTIVE'
    }
  })
  console.log(`✅ Created facility admin: ${facilityAdmin.email}`)

  // Create counselors
  const counselorPassword = await bcrypt.hash('Counselor123!', 12)

  const counselor1 = await prisma.staff.upsert({
    where: { email: 'mike.chen@sunriserecovery.com' },
    update: {},
    create: {
      email: 'mike.chen@sunriserecovery.com',
      passwordHash: counselorPassword,
      firstName: 'Mike',
      lastName: 'Chen',
      role: 'COUNSELOR',
      facilityId: facility.id,
      phone: '5125551236',
      status: 'ACTIVE'
    }
  })
  console.log(`✅ Created counselor: ${counselor1.email}`)

  const counselor2 = await prisma.staff.upsert({
    where: { email: 'lisa.martinez@sunriserecovery.com' },
    update: {},
    create: {
      email: 'lisa.martinez@sunriserecovery.com',
      passwordHash: counselorPassword,
      firstName: 'Lisa',
      lastName: 'Martinez',
      role: 'COUNSELOR',
      facilityId: facility.id,
      phone: '5125551237',
      status: 'ACTIVE'
    }
  })
  console.log(`✅ Created counselor: ${counselor2.email}`)

  // Create treatment plan template
  const treatmentPlan = await prisma.treatmentPlan.upsert({
    where: { id: 'plan-30day' },
    update: {},
    create: {
      id: 'plan-30day',
      facilityId: facility.id,
      name: '30-Day Intensive Recovery Program',
      description: 'Comprehensive 30-day program for early recovery with focus on building foundational skills.',
      duration: 30,
      durationUnit: 'DAYS',
      status: 'ACTIVE',
      createdById: facilityAdmin.id,
      phases: {
        create: [
          {
            name: 'Detox & Stabilization',
            description: 'Medical supervision and initial stabilization',
            duration: 7,
            durationUnit: 'DAYS',
            orderIndex: 0,
            goals: [
              'Complete medical detoxification safely',
              'Establish daily routine',
              'Begin attending group sessions'
            ],
            activities: [
              'Daily medical check-ins',
              'Introduction to 12-step meetings',
              'Journaling exercises'
            ]
          },
          {
            name: 'Intensive Therapy',
            description: 'Individual and group therapy focus',
            duration: 14,
            durationUnit: 'DAYS',
            orderIndex: 1,
            goals: [
              'Identify triggers and high-risk situations',
              'Develop coping strategies',
              'Work on steps 1-3'
            ],
            activities: [
              'Daily group therapy',
              'Individual counseling 3x/week',
              'CBT skills training',
              'Family session (if applicable)'
            ]
          },
          {
            name: 'Transition Planning',
            description: 'Prepare for continued recovery outside facility',
            duration: 9,
            durationUnit: 'DAYS',
            orderIndex: 2,
            goals: [
              'Create relapse prevention plan',
              'Establish support network',
              'Plan for continued care'
            ],
            activities: [
              'Aftercare planning sessions',
              'Community meeting attendance',
              'Practice emergency protocols',
              'Final assessments'
            ]
          }
        ]
      }
    }
  })
  console.log(`✅ Created treatment plan: ${treatmentPlan.name}`)

  // Create test patients
  const patients = [
    {
      id: 'patient-1',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date('1985-03-15'),
      phone: '5125559001',
      email: 'john.s@email.com',
      admissionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      sobrietyDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      substancesOfChoice: ['Alcohol'],
      status: 'ACTIVE',
      assignedCounselorId: counselor1.id,
      emergencyContactName: 'Jane Smith',
      emergencyContactPhone: '5125559002',
      emergencyContactRelationship: 'Spouse'
    },
    {
      id: 'patient-2',
      firstName: 'Emily',
      lastName: 'Davis',
      dateOfBirth: new Date('1992-07-22'),
      phone: '5125559003',
      email: 'emily.d@email.com',
      admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      sobrietyDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      substancesOfChoice: ['Opioids', 'Benzodiazepines'],
      status: 'ACTIVE',
      assignedCounselorId: counselor2.id,
      emergencyContactName: 'Robert Davis',
      emergencyContactPhone: '5125559004',
      emergencyContactRelationship: 'Father'
    },
    {
      id: 'patient-3',
      firstName: 'Michael',
      lastName: 'Brown',
      dateOfBirth: new Date('1978-11-08'),
      phone: '5125559005',
      admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      sobrietyDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      substancesOfChoice: ['Alcohol', 'Cocaine'],
      status: 'PENDING',
      assignedCounselorId: counselor1.id
    }
  ]

  for (const patientData of patients) {
    const patient = await prisma.patient.upsert({
      where: { id: patientData.id },
      update: {},
      create: {
        ...patientData,
        facilityId: facility.id
      }
    })

    // Generate registration key for each patient
    const regKey = `TEST-${patient.id.toUpperCase().slice(-4)}-KEY1`
    await prisma.registrationKey.upsert({
      where: { patientId: patient.id },
      update: {},
      create: {
        key: regKey,
        patientId: patient.id,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        createdById: facilityAdmin.id
      }
    })

    console.log(`✅ Created patient: ${patient.firstName} ${patient.lastName} (key: ${regKey})`)
  }

  // Assign treatment plan to first patient
  await prisma.treatmentAssignment.upsert({
    where: { patientId: 'patient-1' },
    update: {},
    create: {
      patientId: 'patient-1',
      treatmentPlanId: treatmentPlan.id,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      currentPhaseIndex: 1, // In "Intensive Therapy" phase
      status: 'ACTIVE'
    }
  })
  console.log('✅ Assigned treatment plan to patient-1')

  // Create some check-ins for patient-1
  const checkInDates = Array.from({ length: 10 }, (_, i) =>
    new Date(Date.now() - i * 24 * 60 * 60 * 1000)
  )

  for (const date of checkInDates) {
    await prisma.checkIn.create({
      data: {
        patientId: 'patient-1',
        date,
        mood: Math.floor(Math.random() * 4) + 6, // 6-9
        notes: ['Feeling good today', 'Had a good group session', 'Making progress'][Math.floor(Math.random() * 3)],
        haltHungry: Math.floor(Math.random() * 3) + 1,
        haltAngry: Math.floor(Math.random() * 3) + 1,
        haltLonely: Math.floor(Math.random() * 4) + 1,
        haltTired: Math.floor(Math.random() * 4) + 1,
        hoursSlept: 6 + Math.random() * 3,
        sleepQuality: Math.floor(Math.random() * 3) + 6,
        wellnessScore: Math.floor(Math.random() * 2) + 7
      }
    })
  }
  console.log('✅ Created check-ins for patient-1')

  // Create a craving entry
  await prisma.craving.create({
    data: {
      patientId: 'patient-1',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      intensity: 6,
      trigger: 'Stress',
      triggerNotes: 'Received difficult news from home',
      copingStrategy: 'Called sponsor, went for a walk',
      overcame: true,
      haltTired: 5,
      haltLonely: 4
    }
  })
  console.log('✅ Created craving entry for patient-1')

  // Create some messages
  await prisma.message.createMany({
    data: [
      {
        patientId: 'patient-1',
        staffId: counselor1.id,
        senderType: 'STAFF',
        content: 'Hi John, just checking in. How are you feeling today?',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: 'patient-1',
        staffId: counselor1.id,
        senderType: 'PATIENT',
        content: 'Doing better today. The group session was really helpful.',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000),
        readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 7200000)
      },
      {
        patientId: 'patient-1',
        staffId: counselor1.id,
        senderType: 'STAFF',
        content: "That's great to hear! Remember we have our individual session tomorrow at 2pm.",
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]
  })
  console.log('✅ Created messages')

  console.log('\n✨ Database seeded successfully!\n')
  console.log('📋 Test Credentials:')
  console.log('─'.repeat(50))
  console.log('Super Admin:    superadmin@recoveryjourney.com / Admin123!')
  console.log('Facility Admin: admin@sunriserecovery.com / Admin123!')
  console.log('Counselor:      mike.chen@sunriserecovery.com / Counselor123!')
  console.log('Counselor:      lisa.martinez@sunriserecovery.com / Counselor123!')
  console.log('─'.repeat(50))
  console.log('\n📱 Patient Registration Keys:')
  console.log('─'.repeat(50))
  console.log('John Smith:    TEST-NT-1-KEY1')
  console.log('Emily Davis:   TEST-NT-2-KEY1')
  console.log('Michael Brown: TEST-NT-3-KEY1')
  console.log('─'.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
