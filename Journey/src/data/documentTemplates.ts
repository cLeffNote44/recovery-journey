/**
 * Document Templates Library
 *
 * Healthcare facility document templates for patient intake, consent forms,
 * assessments, progress notes, and discharge documentation.
 *
 * These templates are used by the Documents page to create new patient documents.
 */

export const documentTemplates = {
  // INTAKE & ADMISSION TEMPLATES
  patientIntake: `<h1>Patient Intake Form</h1>
<h2>Confidential Patient Information</h2>
<hr>
<h3>Personal Information</h3>
<p><strong>Full Legal Name:</strong> _______________________________________</p>
<p><strong>Preferred Name:</strong> _______________________________________</p>
<p><strong>Date of Birth:</strong> ____/____/________ <strong>Age:</strong> ______</p>
<p><strong>Gender:</strong> ☐ Male ☐ Female ☐ Non-binary ☐ Other: ________</p>
<p><strong>Social Security Number:</strong> _______-______-_________</p>
<p><strong>Driver's License #:</strong> _________________ <strong>State:</strong> ______</p>

<h3>Contact Information</h3>
<p><strong>Current Address:</strong> _______________________________________</p>
<p><strong>City:</strong> _________________ <strong>State:</strong> ______ <strong>ZIP:</strong> ________</p>
<p><strong>Phone (Primary):</strong> (____) ____-________ ☐ Cell ☐ Home</p>
<p><strong>Phone (Secondary):</strong> (____) ____-________</p>
<p><strong>Email:</strong> _______________________________________</p>

<h3>Emergency Contact</h3>
<p><strong>Name:</strong> _______________________________________ <strong>Relationship:</strong> _______________</p>
<p><strong>Phone:</strong> (____) ____-________ <strong>Alt Phone:</strong> (____) ____-________</p>
<p><strong>Address:</strong> _______________________________________</p>

<h3>Employment Information</h3>
<p><strong>Employment Status:</strong> ☐ Employed ☐ Unemployed ☐ Disabled ☐ Student ☐ Retired</p>
<p><strong>Employer Name:</strong> _______________________________________</p>
<p><strong>Occupation:</strong> _______________________________________</p>
<p><strong>Work Phone:</strong> (____) ____-________</p>

<h3>Referral Information</h3>
<p><strong>How did you hear about us?</strong></p>
<p>☐ Physician Referral ☐ Court/Legal ☐ Family/Friend ☐ Internet ☐ Insurance ☐ Other: ________</p>
<p><strong>Referring Physician/Agency:</strong> _______________________________________</p>
<p><strong>Phone:</strong> (____) ____-________</p>

<hr>
<p><strong>Admission Date:</strong> ____/____/________ <strong>Time:</strong> ________</p>
<p><strong>Admitted By:</strong> _______________________________________ <strong>Title:</strong> _______________</p>`,

  medicalHistory: `<h1>Medical History Questionnaire</h1>
<h2>Comprehensive Health Assessment</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>Date:</strong> ____/____/________</p>

<h3>Current Medical Conditions</h3>
<p>Please check all conditions that apply to you:</p>
<p>☐ Diabetes ☐ High Blood Pressure ☐ Heart Disease ☐ Liver Disease</p>
<p>☐ Kidney Disease ☐ Seizure Disorder ☐ Thyroid Problems ☐ Hepatitis (Type: ____)</p>
<p>☐ HIV/AIDS ☐ Cancer (Type: ____________) ☐ Chronic Pain ☐ Asthma/COPD</p>
<p>☐ Arthritis ☐ Migraines ☐ Blood Clotting Disorder ☐ Other: ________________</p>

<h3>Surgical History</h3>
<table><tr><th>Surgery/Procedure</th><th>Date</th><th>Hospital</th></tr>
<tr><td>_____________________</td><td>________</td><td>_____________________</td></tr>
<tr><td>_____________________</td><td>________</td><td>_____________________</td></tr>
<tr><td>_____________________</td><td>________</td><td>_____________________</td></tr></table>

<h3>Current Medications</h3>
<table><tr><th>Medication Name</th><th>Dosage</th><th>Frequency</th><th>Prescribing Doctor</th></tr>
<tr><td>_________________</td><td>________</td><td>________</td><td>_________________</td></tr>
<tr><td>_________________</td><td>________</td><td>________</td><td>_________________</td></tr>
<tr><td>_________________</td><td>________</td><td>________</td><td>_________________</td></tr>
<tr><td>_________________</td><td>________</td><td>________</td><td>_________________</td></tr></table>

<h3>Allergies</h3>
<p><strong>Drug Allergies:</strong> ☐ None Known</p>
<p>_______________________________________</p>
<p><strong>Food Allergies:</strong> ☐ None Known</p>
<p>_______________________________________</p>
<p><strong>Environmental Allergies:</strong> ☐ None Known</p>
<p>_______________________________________</p>

<h3>Family Medical History</h3>
<p>Has anyone in your immediate family had:</p>
<p>☐ Substance Abuse ☐ Mental Health Issues ☐ Heart Disease ☐ Diabetes</p>
<p>☐ Cancer ☐ High Blood Pressure ☐ Liver Disease ☐ Suicide/Suicide Attempt</p>

<h3>For Women Only</h3>
<p><strong>Are you currently pregnant?</strong> ☐ Yes ☐ No ☐ Unsure</p>
<p><strong>Last Menstrual Period:</strong> ____/____/________</p>
<p><strong>Number of Pregnancies:</strong> ______ <strong>Live Births:</strong> ______</p>

<hr>
<p><strong>Patient Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  consentTreatment: `<h1>Consent for Treatment</h1>
<h2>Informed Consent and Authorization</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>

<h3>Consent for Treatment</h3>
<p>I, the undersigned, hereby voluntarily consent to treatment at <strong>[Facility Name]</strong> for substance use disorder and/or mental health conditions. I understand that:</p>

<ol>
<li><strong>Nature of Treatment:</strong> Treatment may include but is not limited to: medical evaluation, medication management, individual therapy, group therapy, family therapy, educational sessions, recreational therapy, and discharge planning.</li>

<li><strong>Risks and Benefits:</strong> I understand that treatment involves certain risks including but not limited to: medication side effects, emotional discomfort during therapy, and the possibility that treatment may not achieve desired results. Benefits may include improved physical and mental health, development of coping skills, and sustained recovery.</li>

<li><strong>Voluntary Participation:</strong> My participation in treatment is voluntary. I have the right to refuse any treatment or procedure and to leave treatment at any time, although leaving against medical advice may have consequences.</li>

<li><strong>Confidentiality:</strong> My treatment records are protected under federal (42 CFR Part 2) and state confidentiality laws. Information will not be disclosed without my written consent except as permitted by law.</li>

<li><strong>Emergency Care:</strong> I authorize the facility to provide emergency medical care if needed and to transport me to a hospital if necessary.</li>

<li><strong>Medication:</strong> If medication is prescribed as part of my treatment, I agree to take it as directed and to report any side effects immediately.</li>

<li><strong>Rules and Expectations:</strong> I agree to follow all facility rules, participate actively in treatment, and treat staff and other patients with respect.</li>
</ol>

<h3>Acknowledgment</h3>
<p>I have read this consent form and have had the opportunity to ask questions. I understand the information provided and voluntarily consent to treatment.</p>

<p><strong>Patient Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Witness Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Staff Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  hipaaConsent: `<h1>HIPAA Authorization</h1>
<h2>Authorization for Use and Disclosure of Protected Health Information</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>

<h3>Authorization</h3>
<p>I hereby authorize <strong>[Facility Name]</strong> to use and/or disclose my protected health information (PHI) as described below:</p>

<h3>Information to be Disclosed</h3>
<p>☐ Complete Medical Record ☐ Discharge Summary ☐ Lab Results</p>
<p>☐ Medication List ☐ Treatment Plan ☐ Progress Notes</p>
<p>☐ Psychiatric Evaluation ☐ Psychological Testing ☐ Other: ________________</p>

<h3>Purpose of Disclosure</h3>
<p>☐ Continuity of Care ☐ Insurance/Billing ☐ Legal Proceedings</p>
<p>☐ Family Member Communication ☐ Employment ☐ Other: ________________</p>

<h3>Recipient(s) of Information</h3>
<p><strong>Name:</strong> _______________________________________</p>
<p><strong>Organization:</strong> _______________________________________</p>
<p><strong>Address:</strong> _______________________________________</p>
<p><strong>Phone:</strong> (____) ____-________ <strong>Fax:</strong> (____) ____-________</p>

<h3>Expiration</h3>
<p>This authorization expires on: ____/____/________ OR ☐ Upon discharge ☐ One year from signature</p>

<h3>Patient Rights</h3>
<ul>
<li>I understand I may revoke this authorization at any time by submitting a written request</li>
<li>I understand that revocation will not affect actions taken prior to revocation</li>
<li>I understand that information disclosed may be re-disclosed by the recipient</li>
<li>I understand that I may refuse to sign this authorization and it will not affect my treatment</li>
<li>I understand I am entitled to a copy of this signed authorization</li>
</ul>

<p><strong>Patient Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Legal Representative (if applicable):</strong> _______________________________________ <strong>Relationship:</strong> ________</p>`,

  biopsychosocial: `<h1>Biopsychosocial Assessment</h1>
<h2>Comprehensive Clinical Evaluation</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>
<p><strong>Assessment Date:</strong> ____/____/________ <strong>Clinician:</strong> _______________________________________</p>

<h3>I. PRESENTING PROBLEM</h3>
<p><strong>Chief Complaint:</strong></p>
<p>_______________________________________</p>
<p><strong>Reason for Seeking Treatment:</strong></p>
<p>_______________________________________</p>
<p><strong>Current Symptoms:</strong></p>
<p>_______________________________________</p>

<h3>II. SUBSTANCE USE HISTORY</h3>
<table>
<tr><th>Substance</th><th>Age 1st Use</th><th>Route</th><th>Freq.</th><th>Last Use</th><th>Amt.</th></tr>
<tr><td>Alcohol</td><td>______</td><td>______</td><td>______</td><td>______</td><td>______</td></tr>
<tr><td>Cannabis</td><td>______</td><td>______</td><td>______</td><td>______</td><td>______</td></tr>
<tr><td>Cocaine</td><td>______</td><td>______</td><td>______</td><td>______</td><td>______</td></tr>
<tr><td>Opioids</td><td>______</td><td>______</td><td>______</td><td>______</td><td>______</td></tr>
<tr><td>Benzos</td><td>______</td><td>______</td><td>______</td><td>______</td><td>______</td></tr>
<tr><td>Meth</td><td>______</td><td>______</td><td>______</td><td>______</td><td>______</td></tr>
<tr><td>Other: ________</td><td>______</td><td>______</td><td>______</td><td>______</td><td>______</td></tr>
</table>

<p><strong>Primary Drug of Choice:</strong> _______________________________________</p>
<p><strong>Previous Treatment Episodes:</strong> ☐ None ☐ 1-2 ☐ 3-5 ☐ More than 5</p>
<p><strong>Treatment History Details:</strong> _______________________________________</p>
<p><strong>Longest Period of Sobriety:</strong> _______ <strong>How Achieved:</strong> _______________________________________</p>

<h3>III. MENTAL HEALTH HISTORY</h3>
<p><strong>Current Psychiatric Diagnoses:</strong></p>
<p>☐ Depression ☐ Anxiety ☐ Bipolar Disorder ☐ PTSD ☐ Schizophrenia ☐ Other: ________</p>
<p><strong>Previous Psychiatric Hospitalizations:</strong> ☐ Yes ☐ No</p>
<p>If yes, describe: _______________________________________</p>
<p><strong>Current Mental Health Treatment:</strong> ☐ Yes ☐ No</p>
<p><strong>History of Trauma:</strong> ☐ Physical ☐ Sexual ☐ Emotional ☐ Neglect ☐ None reported</p>

<h3>IV. SUICIDE/HOMICIDE RISK ASSESSMENT</h3>
<p><strong>Suicidal Ideation:</strong> ☐ Current ☐ Past ☐ Denied</p>
<p><strong>Suicide Attempts:</strong> ☐ Yes (Date: ______ Method: ______) ☐ No</p>
<p><strong>Homicidal Ideation:</strong> ☐ Current ☐ Past ☐ Denied</p>
<p><strong>Self-harm behaviors:</strong> ☐ Current ☐ Past ☐ Denied</p>
<p><strong>Current Risk Level:</strong> ☐ Low ☐ Moderate ☐ High</p>

<h3>V. SOCIAL HISTORY</h3>
<p><strong>Marital Status:</strong> ☐ Single ☐ Married ☐ Divorced ☐ Separated ☐ Widowed</p>
<p><strong>Living Situation:</strong> _______________________________________</p>
<p><strong>Support System:</strong> _______________________________________</p>
<p><strong>Legal Issues:</strong> ☐ Pending charges ☐ Probation ☐ Parole ☐ None</p>
<p><strong>Education Level:</strong> _______________________________________</p>
<p><strong>Employment Status:</strong> _______________________________________</p>

<h3>VI. CLINICAL IMPRESSIONS</h3>
<p><strong>Mental Status Exam Findings:</strong></p>
<p>Appearance: _______ Behavior: _______ Speech: _______</p>
<p>Mood: _______ Affect: _______ Thought Process: _______</p>
<p>Thought Content: _______ Perception: _______ Cognition: _______</p>
<p>Insight: _______ Judgment: _______</p>

<h3>VII. DIAGNOSIS</h3>
<p><strong>Primary Diagnosis:</strong> _______________________________________</p>
<p><strong>Secondary Diagnoses:</strong> _______________________________________</p>

<h3>VIII. RECOMMENDATIONS</h3>
<p><strong>Level of Care:</strong> ☐ Detox ☐ Residential ☐ PHP ☐ IOP ☐ Outpatient</p>
<p><strong>Treatment Recommendations:</strong> _______________________________________</p>
<p>_______________________________________</p>

<hr>
<p><strong>Clinician Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Credentials:</strong> _______________________________________</p>`,

  riskAssessment: `<h1>Risk Assessment</h1>
<h2>Clinical Safety Evaluation</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>
<p><strong>Assessment Date:</strong> ____/____/________ <strong>Time:</strong> ________ <strong>Assessor:</strong> _______________________________________</p>

<h3>SUICIDE RISK ASSESSMENT</h3>
<p><strong>Current suicidal ideation:</strong> ☐ Yes ☐ No</p>
<p>If yes: ☐ Passive (wishes to be dead) ☐ Active (thoughts of killing self)</p>
<p><strong>Suicidal plan:</strong> ☐ Yes ☐ No</p>
<p>If yes, describe: _______________________________________</p>
<p><strong>Access to means:</strong> ☐ Yes ☐ No ☐ Removed</p>
<p><strong>Intent to act:</strong> ☐ Yes ☐ No ☐ Ambivalent</p>
<p><strong>Previous suicide attempts:</strong> ☐ Yes (Number: ____ Most recent: ____) ☐ No</p>

<h3>HOMICIDE RISK ASSESSMENT</h3>
<p><strong>Current homicidal ideation:</strong> ☐ Yes ☐ No</p>
<p><strong>Identified target:</strong> ☐ Yes ☐ No</p>
<p><strong>History of violence:</strong> ☐ Yes ☐ No</p>

<h3>RISK FACTORS</h3>
<p>☐ Recent significant loss ☐ Hopelessness ☐ Impulsivity</p>
<p>☐ Substance intoxication/withdrawal ☐ Social isolation ☐ Chronic pain</p>
<p>☐ Access to lethal means ☐ Previous attempts ☐ Family history of suicide</p>
<p>☐ Recent discharge from psychiatric facility ☐ Command hallucinations</p>

<h3>PROTECTIVE FACTORS</h3>
<p>☐ Engaged in treatment ☐ Future orientation ☐ Strong support system</p>
<p>☐ Reasons for living ☐ Religious/spiritual beliefs ☐ Responsibility for children</p>
<p>☐ Fear of death/suicide ☐ Problem-solving skills</p>

<h3>OVERALL RISK LEVEL</h3>
<p>☐ Low ☐ Moderate ☐ High ☐ Imminent</p>

<h3>INTERVENTIONS</h3>
<p>☐ Safety plan completed ☐ 1:1 observation ☐ Q15 minute checks</p>
<p>☐ Belongings search ☐ Room restriction ☐ Means restriction</p>
<p>☐ MD notified ☐ Family notified ☐ Crisis team consulted</p>
<p><strong>Additional interventions:</strong> _______________________________________</p>

<hr>
<p><strong>Assessor Signature:</strong> _______________________________________ <strong>Date/Time:</strong> ________</p>`,

  treatmentPlan: `<h1>Individualized Treatment Plan</h1>
<h2>Recovery Treatment Plan</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>
<p><strong>Admission Date:</strong> ____/____/________ <strong>Plan Date:</strong> ____/____/________</p>
<p><strong>Primary Clinician:</strong> _______________________________________</p>

<h3>DIAGNOSES</h3>
<p><strong>Primary:</strong> _______________________________________</p>
<p><strong>Secondary:</strong> _______________________________________</p>

<h3>PROBLEM #1</h3>
<p><strong>Problem Statement:</strong> _______________________________________</p>
<p><strong>Long-term Goal:</strong> _______________________________________</p>
<p><strong>Target Date:</strong> ____/____/________</p>

<p><strong>Short-term Objective 1:</strong></p>
<p>_______________________________________</p>
<p><strong>Target Date:</strong> ________ <strong>Status:</strong> ☐ Not Started ☐ In Progress ☐ Met</p>

<p><strong>Short-term Objective 2:</strong></p>
<p>_______________________________________</p>
<p><strong>Target Date:</strong> ________ <strong>Status:</strong> ☐ Not Started ☐ In Progress ☐ Met</p>

<p><strong>Interventions:</strong></p>
<ol>
<li>_______________________________________</li>
<li>_______________________________________</li>
<li>_______________________________________</li>
</ol>

<h3>PROBLEM #2</h3>
<p><strong>Problem Statement:</strong> _______________________________________</p>
<p><strong>Long-term Goal:</strong> _______________________________________</p>
<p><strong>Target Date:</strong> ____/____/________</p>

<p><strong>Short-term Objective 1:</strong></p>
<p>_______________________________________</p>
<p><strong>Target Date:</strong> ________ <strong>Status:</strong> ☐ Not Started ☐ In Progress ☐ Met</p>

<p><strong>Interventions:</strong></p>
<ol>
<li>_______________________________________</li>
<li>_______________________________________</li>
</ol>

<h3>TREATMENT SERVICES</h3>
<p>☐ Individual Therapy (____x/week) ☐ Group Therapy (____x/week)</p>
<p>☐ Family Therapy ☐ Medication Management ☐ Case Management</p>
<p>☐ Psychiatric Evaluation ☐ Medical Services ☐ Other: ________</p>

<h3>ESTIMATED LENGTH OF STAY</h3>
<p>_______ days/weeks</p>

<h3>DISCHARGE CRITERIA</h3>
<p>_______________________________________</p>

<hr>
<p><strong>Patient Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Clinician Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Physician Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  progressNote: `<h1>Progress Note</h1>
<h2>Clinical Documentation</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>
<p><strong>Date of Service:</strong> ____/____/________ <strong>Time:</strong> ________ - ________</p>
<p><strong>Service Type:</strong> ☐ Individual ☐ Group ☐ Family ☐ Crisis ☐ Other: ________</p>
<p><strong>Clinician:</strong> _______________________________________</p>

<h3>SUBJECTIVE</h3>
<p><strong>Patient's reported concerns/mood:</strong></p>
<p>_______________________________________</p>
<p><strong>Progress since last session:</strong></p>
<p>_______________________________________</p>
<p><strong>Sleep:</strong> _______ <strong>Appetite:</strong> _______ <strong>Energy:</strong> _______</p>

<h3>OBJECTIVE</h3>
<p><strong>Appearance:</strong> _______________________________________</p>
<p><strong>Behavior:</strong> _______________________________________</p>
<p><strong>Mood/Affect:</strong> _______________________________________</p>
<p><strong>Engagement in treatment:</strong> ☐ Good ☐ Fair ☐ Poor</p>
<p><strong>Group participation:</strong> ☐ Active ☐ Moderate ☐ Minimal ☐ N/A</p>

<h3>ASSESSMENT</h3>
<p><strong>Current functioning:</strong></p>
<p>_______________________________________</p>
<p><strong>Progress toward treatment goals:</strong></p>
<p>_______________________________________</p>
<p><strong>Risk assessment:</strong> ☐ Low ☐ Moderate ☐ High (if high, see risk assessment)</p>

<h3>PLAN</h3>
<p><strong>Interventions used:</strong></p>
<p>_______________________________________</p>
<p><strong>Treatment plan updates:</strong></p>
<p>_______________________________________</p>
<p><strong>Next session:</strong> ____/____/________ <strong>Time:</strong> ________</p>

<hr>
<p><strong>Clinician Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  groupNote: `<h1>Group Therapy Note</h1>
<h2>Group Session Documentation</h2>
<hr>
<p><strong>Date:</strong> ____/____/________ <strong>Time:</strong> ________ - ________</p>
<p><strong>Group Name:</strong> _______________________________________</p>
<p><strong>Facilitator(s):</strong> _______________________________________</p>
<p><strong>Number of Participants:</strong> ________</p>

<h3>TOPIC/CURRICULUM</h3>
<p>_______________________________________</p>

<h3>GROUP OBJECTIVES</h3>
<ol>
<li>_______________________________________</li>
<li>_______________________________________</li>
<li>_______________________________________</li>
</ol>

<h3>SESSION SUMMARY</h3>
<p>_______________________________________</p>

<h3>THERAPEUTIC INTERVENTIONS</h3>
<p>_______________________________________</p>

<h3>GROUP DYNAMICS</h3>
<p>_______________________________________</p>

<h3>INDIVIDUAL PARTICIPANT NOTES</h3>
<table>
<tr><th>Patient Name</th><th>Participation Level</th><th>Observations</th></tr>
<tr><td>_______________</td><td>☐ Active ☐ Moderate ☐ Minimal ☐ Absent</td><td>_______________</td></tr>
<tr><td>_______________</td><td>☐ Active ☐ Moderate ☐ Minimal ☐ Absent</td><td>_______________</td></tr>
<tr><td>_______________</td><td>☐ Active ☐ Moderate ☐ Minimal ☐ Absent</td><td>_______________</td></tr>
<tr><td>_______________</td><td>☐ Active ☐ Moderate ☐ Minimal ☐ Absent</td><td>_______________</td></tr>
</table>

<h3>FOLLOW-UP NEEDED</h3>
<p>_______________________________________</p>

<hr>
<p><strong>Facilitator Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  dischargeSummary: `<h1>Discharge Summary</h1>
<h2>Treatment Episode Summary</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>
<p><strong>Admission Date:</strong> ____/____/________ <strong>Discharge Date:</strong> ____/____/________</p>
<p><strong>Length of Stay:</strong> _______ days</p>
<p><strong>Discharge Type:</strong> ☐ Completed Treatment ☐ AMA ☐ Administrative ☐ Transfer ☐ Other</p>

<h3>ADMISSION DIAGNOSES</h3>
<p><strong>Primary:</strong> _______________________________________</p>
<p><strong>Secondary:</strong> _______________________________________</p>

<h3>DISCHARGE DIAGNOSES</h3>
<p><strong>Primary:</strong> _______________________________________</p>
<p><strong>Secondary:</strong> _______________________________________</p>

<h3>TREATMENT SUMMARY</h3>
<p><strong>Presenting problems:</strong></p>
<p>_______________________________________</p>
<p><strong>Treatment provided:</strong></p>
<p>_______________________________________</p>
<p><strong>Response to treatment:</strong></p>
<p>_______________________________________</p>
<p><strong>Progress toward goals:</strong></p>
<p>_______________________________________</p>

<h3>DISCHARGE MEDICATIONS</h3>
<table>
<tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Instructions</th></tr>
<tr><td>_______________</td><td>________</td><td>________</td><td>_______________</td></tr>
<tr><td>_______________</td><td>________</td><td>________</td><td>_______________</td></tr>
<tr><td>_______________</td><td>________</td><td>________</td><td>_______________</td></tr>
</table>

<h3>DISCHARGE DISPOSITION</h3>
<p><strong>Discharged to:</strong> _______________________________________</p>
<p><strong>Living situation:</strong> _______________________________________</p>
<p><strong>Support system:</strong> _______________________________________</p>

<h3>FOLLOW-UP CARE</h3>
<p><strong>Outpatient provider:</strong> _______________________________________</p>
<p><strong>First appointment:</strong> ____/____/________ <strong>Time:</strong> ________</p>
<p><strong>Prescribing physician:</strong> _______________________________________</p>
<p><strong>Support group meetings:</strong> _______________________________________</p>

<h3>RECOMMENDATIONS</h3>
<p>_______________________________________</p>

<h3>PROGNOSIS</h3>
<p>☐ Good ☐ Fair ☐ Guarded ☐ Poor</p>

<hr>
<p><strong>Attending Physician:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Primary Clinician:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  aftercarePlan: `<h1>Aftercare/Continuing Care Plan</h1>
<h2>Post-Discharge Recovery Plan</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>
<p><strong>Discharge Date:</strong> ____/____/________</p>
<p><strong>Plan Developed By:</strong> _______________________________________</p>

<h3>IMMEDIATE AFTERCARE (First 30 Days)</h3>
<p><strong>Primary Support Person:</strong> _______________________________________ <strong>Phone:</strong> ________</p>
<p><strong>Living Arrangements:</strong> _______________________________________</p>
<p><strong>Transportation Plan:</strong> _______________________________________</p>

<h3>OUTPATIENT TREATMENT</h3>
<p><strong>Program Name:</strong> _______________________________________</p>
<p><strong>Address:</strong> _______________________________________</p>
<p><strong>Phone:</strong> ________ <strong>Contact Person:</strong> _______________________________________</p>
<p><strong>Frequency:</strong> ☐ Daily ☐ 3x/week ☐ 2x/week ☐ Weekly ☐ As needed</p>
<p><strong>First Appointment:</strong> ____/____/________ <strong>Time:</strong> ________</p>

<h3>MEDICATION MANAGEMENT</h3>
<p><strong>Prescribing Physician:</strong> _______________________________________</p>
<p><strong>Phone:</strong> ________ <strong>Pharmacy:</strong> _______________________________________</p>
<p><strong>Next Medication Appointment:</strong> ____/____/________</p>

<h3>SUPPORT GROUP MEETINGS</h3>
<table>
<tr><th>Type</th><th>Day/Time</th><th>Location</th></tr>
<tr><td>☐ AA ☐ NA ☐ Other: ____</td><td>_______________</td><td>_______________</td></tr>
<tr><td>☐ AA ☐ NA ☐ Other: ____</td><td>_______________</td><td>_______________</td></tr>
<tr><td>☐ AA ☐ NA ☐ Other: ____</td><td>_______________</td><td>_______________</td></tr>
</table>
<p><strong>Sponsor Name:</strong> _______________________________________ <strong>Phone:</strong> ________</p>

<h3>RELAPSE PREVENTION</h3>
<p><strong>My triggers are:</strong></p>
<ol>
<li>_______________________________________</li>
<li>_______________________________________</li>
<li>_______________________________________</li>
</ol>

<p><strong>My warning signs are:</strong></p>
<ol>
<li>_______________________________________</li>
<li>_______________________________________</li>
<li>_______________________________________</li>
</ol>

<p><strong>My coping strategies are:</strong></p>
<ol>
<li>_______________________________________</li>
<li>_______________________________________</li>
<li>_______________________________________</li>
</ol>

<h3>EMERGENCY CONTACTS</h3>
<p><strong>Crisis Line:</strong> 988 (Suicide & Crisis Lifeline)</p>
<p><strong>Local Crisis:</strong> _______________________________________</p>
<p><strong>Emergency Contact:</strong> _______________________________________ <strong>Phone:</strong> ________</p>

<h3>PATIENT COMMITMENT</h3>
<p>I commit to following this aftercare plan and will reach out for help if I am struggling.</p>

<p><strong>Patient Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Case Manager:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  amaForm: `<h1>Against Medical Advice (AMA) Discharge</h1>
<h2>Leaving Treatment Against Medical Advice</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>DOB:</strong> ____/____/________</p>
<p><strong>Date:</strong> ____/____/________ <strong>Time:</strong> ________</p>

<h3>STATEMENT OF UNDERSTANDING</h3>
<p>I, _______________________________________, hereby acknowledge that I am choosing to leave treatment at <strong>[Facility Name]</strong> against the advice of my treatment team.</p>

<h3>ACKNOWLEDGMENTS</h3>
<p>I understand and acknowledge the following:</p>
<ol>
<li>My treatment team has recommended that I continue treatment at this facility.</li>
<li>I am leaving treatment before my treatment team believes I am ready.</li>
<li>Leaving treatment prematurely may result in:
<ul>
<li>Increased risk of relapse</li>
<li>Withdrawal symptoms that could be medically dangerous</li>
<li>Worsening of my mental health condition</li>
<li>Increased risk of overdose</li>
<li>Other serious health consequences</li>
</ul>
</li>
<li>The risks of leaving have been explained to me in terms I understand.</li>
<li>I have had the opportunity to ask questions about my treatment and the risks of leaving.</li>
<li>I am choosing to leave of my own free will.</li>
</ol>

<h3>REASON FOR LEAVING</h3>
<p>_______________________________________</p>

<h3>ALTERNATIVE PLAN</h3>
<p><strong>Where will you go?</strong> _______________________________________</p>
<p><strong>Who will you contact?</strong> _______________________________________</p>
<p><strong>Follow-up care planned:</strong> _______________________________________</p>

<h3>RESOURCES PROVIDED</h3>
<p>☐ Crisis hotline numbers ☐ Local treatment resources ☐ Naloxone/Narcan</p>
<p>☐ Medication information ☐ Follow-up appointment info ☐ Aftercare recommendations</p>

<h3>SIGNATURES</h3>
<p>I release <strong>[Facility Name]</strong> and its staff from any liability arising from my decision to leave treatment against medical advice.</p>

<p><strong>Patient Signature:</strong> _______________________________________ <strong>Date/Time:</strong> ________</p>
<p><strong>Witness Signature:</strong> _______________________________________ <strong>Date/Time:</strong> ________</p>
<p><strong>Physician/Clinician:</strong> _______________________________________ <strong>Date/Time:</strong> ________</p>

<p><strong>If patient refuses to sign:</strong></p>
<p><strong>Witness:</strong> _______________________________________ <strong>Date/Time:</strong> ________</p>`,

  incidentReport: `<h1>Incident Report</h1>
<h2>Documentation of Significant Event</h2>
<hr>
<p><strong>Date of Incident:</strong> ____/____/________ <strong>Time:</strong> ________</p>
<p><strong>Date of Report:</strong> ____/____/________ <strong>Report Completed By:</strong> _______________________________________</p>

<h3>PERSONS INVOLVED</h3>
<p><strong>Patient(s):</strong> _______________________________________</p>
<p><strong>Staff:</strong> _______________________________________</p>
<p><strong>Others:</strong> _______________________________________</p>

<h3>INCIDENT TYPE</h3>
<p>☐ Fall ☐ Physical altercation ☐ Self-harm ☐ Elopement/AWOL</p>
<p>☐ Medication error ☐ Property damage ☐ Contraband ☐ Verbal threat</p>
<p>☐ Medical emergency ☐ Behavioral crisis ☐ AMA discharge ☐ Other: ________</p>

<h3>LOCATION OF INCIDENT</h3>
<p>_______________________________________</p>

<h3>DESCRIPTION OF INCIDENT</h3>
<p><strong>What happened? (Include events leading up to incident):</strong></p>
<p>_______________________________________</p>

<h3>INJURIES/DAMAGES</h3>
<p><strong>Injuries sustained:</strong> ☐ None ☐ Minor ☐ Moderate ☐ Severe</p>
<p><strong>Description:</strong> _______________________________________</p>
<p><strong>Property damage:</strong> ☐ None ☐ Yes - Describe: _______________________________________</p>

<h3>IMMEDIATE ACTIONS TAKEN</h3>
<p>☐ First aid administered ☐ 911 called ☐ Physician notified ☐ Family notified</p>
<p>☐ Supervisor notified ☐ Security called ☐ Documentation completed ☐ Photo taken</p>
<p><strong>Additional actions:</strong> _______________________________________</p>

<h3>WITNESSES</h3>
<table>
<tr><th>Name</th><th>Role</th><th>Contact Info</th></tr>
<tr><td>_______________</td><td>_______________</td><td>_______________</td></tr>
<tr><td>_______________</td><td>_______________</td><td>_______________</td></tr>
</table>

<h3>FOLLOW-UP REQUIRED</h3>
<p>☐ Medical evaluation ☐ Mental health assessment ☐ Discharge consideration</p>
<p>☐ Family meeting ☐ Treatment plan update ☐ Staff debriefing</p>
<p>☐ Law enforcement report ☐ State reporting required ☐ Other: ________</p>

<h3>PREVENTIVE MEASURES</h3>
<p><strong>What can be done to prevent similar incidents?</strong></p>
<p>_______________________________________</p>

<hr>
<p><strong>Reporting Staff Signature:</strong> _______________________________________ <strong>Date:</strong> ________</p>
<p><strong>Supervisor Review:</strong> _______________________________________ <strong>Date:</strong> ________</p>`,

  dailyProgressNote: `<h1>Daily Progress Note</h1>
<h2>Shift Documentation</h2>
<hr>
<p><strong>Patient Name:</strong> _______________________________________ <strong>Date:</strong> ____/____/________</p>
<p><strong>Shift:</strong> ☐ Day (7a-3p) ☐ Evening (3p-11p) ☐ Night (11p-7a)</p>
<p><strong>Staff:</strong> _______________________________________</p>

<h3>VITAL SIGNS (if applicable)</h3>
<p><strong>BP:</strong> ____/____ <strong>HR:</strong> ____ <strong>Temp:</strong> ____ <strong>RR:</strong> ____ <strong>O2:</strong> ____%</p>

<h3>MOOD/AFFECT</h3>
<p>☐ Stable ☐ Anxious ☐ Depressed ☐ Irritable ☐ Euphoric ☐ Labile</p>
<p><strong>Patient's self-reported mood (1-10):</strong> ____</p>

<h3>BEHAVIOR</h3>
<p>☐ Cooperative ☐ Engaged ☐ Withdrawn ☐ Agitated ☐ Restless</p>
<p><strong>Sleep last night:</strong> ☐ Good ☐ Fair ☐ Poor <strong>Hours:</strong> ____</p>
<p><strong>Appetite:</strong> ☐ Good ☐ Fair ☐ Poor</p>
<p><strong>Meals eaten:</strong> ☐ Breakfast ☐ Lunch ☐ Dinner ☐ Snacks</p>

<h3>TREATMENT PARTICIPATION</h3>
<p>☐ Individual therapy ☐ Group therapy ☐ Recreational therapy ☐ Family session</p>
<p><strong>Engagement level:</strong> ☐ Active ☐ Moderate ☐ Minimal ☐ Refused</p>
<p><strong>Groups attended:</strong> _______________________________________</p>

<h3>SAFETY</h3>
<p><strong>Suicidal ideation:</strong> ☐ Denied ☐ Passive ☐ Active</p>
<p><strong>Self-harm urges:</strong> ☐ Denied ☐ Present</p>
<p><strong>Room/belongings check completed:</strong> ☐ Yes ☐ No</p>

<h3>CRAVINGS/TRIGGERS</h3>
<p><strong>Cravings reported:</strong> ☐ None ☐ Mild ☐ Moderate ☐ Severe</p>
<p><strong>Triggers identified:</strong> _______________________________________</p>
<p><strong>Coping strategies used:</strong> _______________________________________</p>

<h3>PEER INTERACTIONS</h3>
<p>☐ Positive interactions ☐ Isolating ☐ Conflict with peers ☐ Supportive of others</p>
<p><strong>Notes:</strong> _______________________________________</p>

<h3>SIGNIFICANT EVENTS/OBSERVATIONS</h3>
<p>_______________________________________</p>

<h3>PLAN</h3>
<p>_______________________________________</p>

<hr>
<p><strong>Staff Signature:</strong> _______________________________________ <strong>Time:</strong> ________</p>`,
}

export type DocumentTemplateKey = keyof typeof documentTemplates

// ============================================================================
// TEMPLATE LIST METADATA
// ============================================================================

export interface DocumentTemplate {
  id: string
  name: string
  category: string
  description: string
  templateKey: DocumentTemplateKey
}

export const templateList: DocumentTemplate[] = [
  { id: 'tpl-intake', name: 'Patient Intake Form', category: 'intake', description: 'Comprehensive patient admission form with personal, contact, and referral information', templateKey: 'patientIntake' },
  { id: 'tpl-medical', name: 'Medical History Questionnaire', category: 'medical', description: 'Health assessment including conditions, medications, allergies, and family history', templateKey: 'medicalHistory' },
  { id: 'tpl-consent', name: 'Consent for Treatment', category: 'consent', description: 'Informed consent and authorization for substance abuse treatment services', templateKey: 'consentTreatment' },
  { id: 'tpl-hipaa', name: 'HIPAA Authorization', category: 'consent', description: 'Authorization for use and disclosure of protected health information', templateKey: 'hipaaConsent' },
  { id: 'tpl-biopsychosocial', name: 'Biopsychosocial Assessment', category: 'intake', description: 'Comprehensive evaluation of biological, psychological, and social factors', templateKey: 'biopsychosocial' },
  { id: 'tpl-risk', name: 'Risk Assessment', category: 'medical', description: 'Suicide, self-harm, and violence risk screening and evaluation', templateKey: 'riskAssessment' },
  { id: 'tpl-treatment', name: 'Treatment Plan', category: 'progress', description: 'Individualized treatment plan with goals, objectives, and interventions', templateKey: 'treatmentPlan' },
  { id: 'tpl-progress', name: 'Progress Note', category: 'progress', description: 'Clinical progress note documenting session content and patient status', templateKey: 'progressNote' },
  { id: 'tpl-group', name: 'Group Therapy Note', category: 'progress', description: 'Group session documentation including topics, participation, and observations', templateKey: 'groupNote' },
  { id: 'tpl-daily', name: 'Daily Progress Note', category: 'progress', description: 'Daily clinical observation note with subjective, objective, assessment, and plan', templateKey: 'dailyProgressNote' },
  { id: 'tpl-discharge', name: 'Discharge Summary', category: 'discharge', description: 'Comprehensive discharge documentation with treatment summary and recommendations', templateKey: 'dischargeSummary' },
  { id: 'tpl-aftercare', name: 'Aftercare Plan', category: 'discharge', description: 'Continuing care plan with support resources, meetings, and follow-up schedule', templateKey: 'aftercarePlan' },
  { id: 'tpl-ama', name: 'AMA Discharge Form', category: 'discharge', description: 'Against medical advice discharge documentation and risk acknowledgment', templateKey: 'amaForm' },
  { id: 'tpl-incident', name: 'Incident Report', category: 'other', description: 'Facility incident documentation including details, witnesses, and follow-up actions', templateKey: 'incidentReport' },
]

export default documentTemplates
