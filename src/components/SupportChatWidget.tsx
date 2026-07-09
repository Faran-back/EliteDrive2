import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Bot, 
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const CUSTOMER_PILLS = [
  { label: '🚨 Emergency Protocol', command: '/emergency' },
  { label: '🚗 Accident Guide', command: '/accident' },
  { label: '🔧 Breakdown Help', command: '/breakdown' },
  { label: '🔒 Vehicle Theft', command: '/theft' },
  { label: '👮 Police Stop', command: '/police' },
  { label: '🛡️ Insurance', command: '/insurance' },
  { label: '🩹 First Aid', command: '/first-aid' },
  { label: '💰 Refund Status', command: '/refund' },
  { label: '❌ Cancellation', command: '/cancel' },
  { label: '🔑 Lost Keys', command: '/stolen-key' },
  { label: '⛽ Fuel Policy', command: '/fuel' },
  { label: '⏰ Late Surcharges', command: '/delay' },
  { label: '📞 Help Helplines', command: '/contact' },
  { label: '💳 Pay Channels', command: '/payment' },
  { label: '⭐ Chauffeur Services', command: '/vip' },
  { label: '🔑 Out-of-City Rule', command: '/guarantor' },
  { label: '🚫 Blacklist Policy', command: '/blacklist' },
  { label: '🪪 KYC Document Guide', command: '/license' },
  { label: '🪪 Required Documents', command: '/required-docs' },
  { label: '🔄 Booking Extension', command: '/extend-booking' },
  { label: '🚗 Vehicle Return Process', command: '/return-process' },
  { label: '💰 Security Deposit info', command: '/security-deposit' },
  { label: '🔧 Damage Reporting', command: '/damage-reporting' },
  { label: '🔑 Pickup Instructions', command: '/pickup-instructions' }
];

const STAFF_PILLS = [
  { label: '🪪 KYC Approval', command: '/approve-kyc' },
  { label: '🚫 KYC Rejection', command: '/reject-kyc' },
  { label: '⚖️ Dispute Review', command: '/dispute-review' },
  { label: '💥 Incident Payouts', command: '/incident-payout' },
  { label: '🚫 Blacklist User', command: '/blacklist-user' },
  { label: '✅ Reinstating Accounts', command: '/unban-user' },
  { label: '💸 Processing Refunds', command: '/issue-refund' },
  { label: '⛽ Fuel Surcharges', command: '/fuel-shortage' },
  { label: '👮 E-Challan Ops', command: '/challan-processing' },
  { label: '⏰ Late Fees', command: '/late-surcharge' },
  { label: '💬 Discussion Notes', command: '/incident-remarks' },
  { label: '🔄 Forced Cancel/Upgrade', command: '/booking-override' },
  { label: '📡 GPS & Lock Control', command: '/gps-tracking' },
  { label: '🛡️ Commercial Claims', command: '/insurance-claim' },
  { label: '🔑 Out-of-City Verify', command: '/guarantor-check' },
  { label: '⭐ Assign Chauffeurs', command: '/vip-chauffeur' },
  { label: '👥 Role Permissions', command: '/staff-roles' },
  { label: '💾 Sync & Diagnostics', command: '/system-backup' }
];

const EMERGENCY_COMMANDS = [
  {
    keywords: ['emergency', 'help', 'halat kharab', 'madad', 'imdad'],
    command: '/emergency',
    title: '🚨 Emergency Response Protocol',
    content: `**EliteDrive Emergency Response Protocol**:\n\n1. **Ensure Safety**: Park the vehicle safely, turn on hazard lights, and make sure everyone is safe.\n2. **Contact Hotline**: Call our 24/7 Priority Emergency Hotline immediately at **0300-ELITE-HELP (0300-35483-4357)**.\n3. **Do Not Make Deals**: Do not admit liability or sign any hand-written agreements/deals with third parties on the spot.\n4. **Stay at the Scene**: Wait for the highway/traffic police or an EliteDrive rescue representative if instructed.`
  },
  {
    keywords: ['accident', 'crash', 'collision', 'damage', 'thok', 'accidant', 'haadsa'],
    command: '/accident',
    title: '🚗 Accident & Damage Procedure',
    content: `**Accident & Damage Protocol**:\n\n- **Document Proof**: Take high-quality photos and videos of the damage, license plates of other vehicles involved, and the surrounding environment.\n- **File FIR**: For major accidents, contact local police to register an official First Information Report (FIR).\n- **Report Immediately**: Submit details and photos via the 'Report Incident' tab on your dashboard **within 6 hours**.\n- **Contact support**: Call EliteDrive Compliance Team at **0300-123-4567** within 6 hours. Late reports trigger administrative flags and cancel insurance coverage eligibility.`
  },
  {
    keywords: ['breakdown', 'tow', 'engine issue', 'mechanic', 'kharab', 'gari kharab', 'heatup', 'heat up'],
    command: '/breakdown',
    title: '🔧 Vehicle Breakdown Guide',
    content: `**Breakdown & Mechanical Assistance**:\n\n- **Safe Parking**: Pull over to a safe area, switch on hazard lights, and use the warning triangle from the boot.\n- **Do Not Self-Repair**: Do not open the engine or attempt to repair mechanical/electrical issues yourself.\n- **Call Recovery**: Contact our 24/7 Roadside Assistance & Recovery service at **0300-987-6543**.\n- **Backup Vehicle**: If the breakdown is severe, EliteDrive will dispatch a recovery vehicle and a replacement car to your location.`
  },
  {
    keywords: ['theft', 'stolen', 'chori', 'steal', 'ghayb'],
    command: '/theft',
    title: '🔒 Vehicle Theft Protocol',
    content: `**Vehicle Theft & Loss Protocol**:\n\n1. **File FIR immediately**: Go to the nearest police station to report the vehicle theft. Request an official copy of the FIR.\n2. **Emergency Notification**: Inform EliteDrive Security Hub immediately at **0300-555-SAFE (0300-555-7233)**.\n3. **Provide Details**: Report the theft through the 'Report Incident' form, attaching the FIR copy and number.\n4. **Tracking Activation**: Our command center will remotely locate, lock, and disable the vehicle starter.`
  },
  {
    keywords: ['police', 'challan', 'traffic ticket', 'warden', 'e-challan', 'wardan'],
    command: '/police',
    title: '👮 Police & Traffic Challan Procedures',
    content: `**Police Stops & Challans**:\n\n- **Documents to Show**: Show your valid driving license, CNIC, and the digital Booking Receipt (accessible under 'Active Trips' on your dashboard).\n- **Challan Handover**: If a physical paper challan is issued, hand it over to our representative at vehicle return.\n- **E-Challan Dispute**: For electronic traffic tickets, you can check details and submit a formal objection within **7 days** under the 'Support Center > Client Disputes' tab.`
  },
  {
    keywords: ['insurance', 'claim', 'coverage', 'claim policy'],
    command: '/insurance',
    title: '🛡️ EliteDrive Insurance Coverage',
    content: `**Insurance & Damage Coverage Policy**:\n\n- **Basic Cover**: Included by default. Covers up to 50% of repair costs, subject to timely incident reporting (within 6 hours).\n- **Premium Cover**: Optional. Covers up to 100% of damage repairs with a fixed deductible of PKR 5,000.\n- **Void Conditions**: Insurance is completely void if the driver is unregistered, does not hold a valid driving license, is under the influence, or fails to file the incident report within the **6-hour policy window**.`
  },
  {
    keywords: ['first aid', 'medical', 'hospital', 'rescue', 'doctor', 'ambulance', 'medical help', 'injury'],
    command: '/first-aid',
    title: '🩹 Medical Emergencies & First Aid',
    content: `**Medical & Injury Emergency**:\n\n- **Primary Rescue**: Call national emergency services immediately at Rescue **1122** or Edhi/Aman Ambulance **115** / **1021**.\n- **First Aid Kit**: A certified first aid kit is stored in the glove compartment or the trunk of every EliteDrive vehicle.\n- **Emergency Contact**: Contact our helpline as soon as you are in a safe and stable condition.`
  },
  {
    keywords: ['refund', 'deposit', 'security deposit', 'paisa wapis', 'refund status', 'refunds'],
    command: '/refund',
    title: '💰 Security Deposit & Refunds',
    content: `**Refund of Security Deposit**:\n\n- **Amount**: The standard security deposit is PKR 10,000.\n- **Timeline**: Automatically processed and refunded within **48 hours** of successful vehicle handover and inspection.\n- **Deductions**: Deductions may be made for unpaid fuel shortages, pending e-challans, late return surcharges, or physical damages.`
  },
  {
    keywords: ['cancel', 'cancellation', 'booking cancel', 'refund trip'],
    command: '/cancel',
    title: '❌ Booking Cancellation Policy',
    content: `**Cancellation & Penalty Rules**:\n\n- **Free Cancellation**: You can cancel any booking free of charge up to **24 hours** before the scheduled start time.\n- **Late Cancellation**: Cancellations within 24 hours of start time incur a penalty equal to 1 day's rental fee.\n- **No Show**: If you do not pick up the vehicle within 3 hours of start time, the booking is automatically cancelled as a 'no-show' with no refund.`
  },
  {
    keywords: ['guarantor', 'out of city', 'out-of-city', 'shehar se bahar', 'other city', 'bahr jana'],
    command: '/guarantor',
    title: '🔑 Out-of-City Guarantor Requirement',
    content: `**Out-of-City Travel Policy**:\n\n- **Requirement**: If you travel outside your pickup city boundaries, you must submit the Name, CNIC, and Phone Number of a verified Guarantor.\n- **Handover Constraint**: Handover will be denied and booking flagged if guarantor details are missing or unverified.\n- **Policy Enforcement**: This measure ensures safety and compliance for vehicles travelling across inter-city routes.`
  },
  {
    keywords: ['blacklist', 'blocked', 'suspend', 'account lock', 'unblock'],
    command: '/blacklist',
    title: '🚫 Account Blacklisting Policy',
    content: `**Account Blacklisting & Security Flags**:\n\n- **Causes**: Accounts are permanently blacklisted for:\n  1. Multiple damages within a short period.\n  2. Attempted fraud or document forgery during KYC.\n  3. Outstanding balances or unpaid traffic fines.\n  4. Out-of-city travel without guarantor credentials.\n- **Reinstatement**: Requires manual security audit and resolution of outstanding compliances with the EliteDrive Operations Hub.`
  },
  {
    keywords: ['license', 'kyc', 'verify', 'cnic', 'shnakhti card', 'shinaxti card', 'verification'],
    command: '/license',
    title: '🪪 CNIC & License Verification (KYC)',
    content: `**KYC & Document Verification**:\n\n- **Documents Required**: Clear photographs of your original CNIC front/back, and a valid, non-expired driving license.\n- **Processing Time**: Verification takes up to **2 hours** after documents are submitted.\n- **Status**: You can track verification status in your profile settings dashboard.`
  },
  {
    keywords: ['fuel', 'petrol', 'refuel', 'gasoline', 'cng', 'diesel'],
    command: '/fuel',
    title: '⛽ EliteDrive Fuel Policy',
    content: `**Handover & Return Fuel Rules**:\n\n- **Fair Return**: Return the vehicle with the exact same fuel level as received.\n- **Shortage Charge**: If returned with less fuel, charges are calculated at current PSO pump prices plus a PKR 500 service surcharge.\n- **Excess Fuel**: Extra fuel returned cannot be refunded or adjusted against rental fees.`
  },
  {
    keywords: ['delay', 'late', 'late return', 'deri', 'deir', 'overdue'],
    command: '/delay',
    title: '⏰ Late Handover & Surcharges',
    content: `**Late Return Surcharge Rules**:\n\n- **Grace Period**: We offer a **30-minute grace period** for return delays.\n- **Delay Fee**: Returns past 30 minutes are charged at **1.5x the standard hourly rate**.\n- **Security Warning**: Delays exceeding 3 hours without contacting support trigger automatic security alerts, tracking scans, and a potential recovery process.`
  },
  {
    keywords: ['contact', 'phone', 'number', 'call', 'email', 'support email', 'whatsapp', 'helpline'],
    command: '/contact',
    title: '📞 Official Contact Helplines',
    content: `**EliteDrive Contact & Channels**:\n\n- **Emergency Hotline**: 0300-ELITE-HELP\n- **Phone Support**: 021-111-ELITE (021-111-35483)\n- **WhatsApp Support**: +92 300 000 0000\n- **Corporate Email**: support@elitedrive.pk\n- **Compliance Hub**: compliance@elitedrive.pk`
  },
  {
    keywords: ['key', 'lost key', 'stolen key', 'keys', 'chabi', 'chabi gum'],
    command: '/stolen-key',
    title: '🔑 Lost / Stolen Keys Protocol',
    content: `**Lost or Damaged Vehicle Keys**:\n\n- **Secure Vehicle**: If key is lost, stay near the vehicle and ensure it is safely locked (if possible) to prevent unauthorized theft.\n- **Contact support**: Notify support immediately to request a duplicate key dispatch.\n- **Cost Recovery**: The cost of replacement keys, remote programming, or locks (ranging from PKR 5,000 to PKR 15,000) is charged directly to the renter.`
  },
  {
    keywords: ['payment', 'easypaisa', 'jazzcash', 'card payment', 'nayapay', 'pay'],
    command: '/payment',
    title: '💳 Approved Payment Channels',
    content: `**EliteDrive Payment Options**:\n\n- **Mobile Wallets**: Easypaisa, JazzCash, Nayapay.\n- **Card Payment**: Direct checkout via Visa, Mastercard, or UnionPay credit/debit cards.\n- **Bank Transfer**: Online bank transfer to our corporate account (requires uploading a transfer receipt snapshot for validation).`
  },
  {
    keywords: ['vip', 'driver', 'chauffeur', 'premium service'],
    command: '/vip',
    title: '⭐ VIP Chauffeur-Driven Services',
    content: `**VIP Chauffeur & Driver Options**:\n\n- **Availability**: Professional drivers are available for premium vehicles (Civic, Corolla, Fortuner).\n- **Daily Surcharge**: A professional EliteDrive chauffeur is provided at an additional rate of PKR 3,000 per day.\n- **Inclusions**: Driver meals and lodging are managed entirely by EliteDrive.`
  },
  {
    keywords: ['approve kyc', 'verify kyc', 'approve user', 'document approve', 'kyc ok', 'kyc confirmation', 'pass kyc', 'kyc pas'],
    command: '/approve-kyc',
    title: '🪪 KYC Approval Procedure',
    content: `**Procedure to Approve KYC Documents**:\n\n1. **Inspect Photos**: Go to **User Management** and click on the user pending KYC. Confirm CNIC and Driver License photos are clear, high-resolution, and unedited.\n2. **Verify Details**: Ensure names and document numbers match exactly with profile data.\n3. **Set Status**: Click **Verify Account** button. This instantly unlocks booking privileges for the customer and logs verification timestamp.`
  },
  {
    keywords: ['reject kyc', 'fail kyc', 'decline user', 'reject document', 'kyc reject', 'kyc cancel'],
    command: '/reject-kyc',
    title: '🚫 KYC Rejection & Correction Guidelines',
    content: `**Rejection Guidelines for KYC**:\n\n1. **Identify Cause**: Ensure clear reason (e.g. 'unreadable photo', 'expired license', 'forged watermarks').\n2. **Decline Action**: In **User Management**, click **Reject Verification**.\n3. **Provide Notes**: Input specific notes explaining what correction is needed (e.g., 'Please re-upload a clear selfie with your CNIC'). The user will receive these correction notes instantly in their account.`
  },
  {
    keywords: ['dispute review', 'disputes', 'resolve dispute', 'dispute guide', 'client dispute', 'review dispute'],
    command: '/dispute-review',
    title: '⚖️ Dispute Resolution Guide',
    content: `**How to Resolve Customer Disputes**:\n\n1. **Review Claims**: Go to **Support Center > Client Disputes**.\n2. **Examine Booking Details**: Check rental dates, damages, e-challans, and fuel logs associated with the disputed booking.\n3. **Consult Customer Statement**: Read customer comments and review any uploaded evidence.\n4. **Set Status**: Click **Approve Dispute** (which triggers refunds/adjustments) or **Reject Dispute** (if policy was followed). Enter resolution summary notes for transparency.`
  },
  {
    keywords: ['incident payout', 'insurance claim', 'damage cost', 'payout guide', 'repair payout', 'payout claim'],
    command: '/incident-payout',
    title: '💥 Incident Payouts & Claims Process',
    content: `**Processing Incident Damage Claims & Insurance Payouts**:\n\n1. **Check Reports**: Review the case file in **Incident Logs** under **Support Center**.\n2. **Verify Timeframe**: Confirm if the incident was reported **within the 6-hour policy window**.\n3. **Examine FIR & Photos**: Ensure valid FIR copy and high-res photos are uploaded.\n4. **Initiate Claim**: Select status **Approved** or **Under Investigation**, and click 'Apply Charge/Waive' to allocate costs to the insurance gateway or customer deductible (PKR 5,000 for premium coverage, 50% for basic).`
  },
  {
    keywords: ['blacklist', 'block user', 'suspend user', 'ban user', 'block renter', 'blacklist renter'],
    command: '/blacklist-user',
    title: '🚫 Blacklisting High-Risk Users',
    content: `**Renter Suspension and Blacklisting Protocol**:\n\n- **When to Blacklist**: Perform immediate blacklisting for fraud, unapproved out-of-city travel, repeat vehicle damage, or refusal to settle e-challans/rents.\n- **Action**: In **User Management**, locate user and toggle the **Blacklisted** checkbox status.\n- **Consequence**: This instantly disables active booking sessions, locks their wallet balance, and prevents placing any future booking requests across the platform.`
  },
  {
    keywords: ['unban', 'unblacklist', 'unlock user', 'unblock user', 'restore user'],
    command: '/unban-user',
    title: '✅ Reinstating Suspended Accounts',
    content: `**Account Reinstatement Procedure**:\n\n1. **Review Compliance**: Ensure all pending payments, fines, and damage liabilities are settled by the renter.\n2. **Conduct Audit**: Verify that guarantor records are updated if traveling out of city was the root cause.\n3. **Remove Suspension**: Toggle off the **Blacklisted** status in **User Management** dashboard. Log the operational reason in administrative notes.`
  },
  {
    keywords: ['issue refund', 'refund deposit', 'manual refund', 'refund process', 'refund security'],
    command: '/issue-refund',
    title: '💸 Processing Security Deposit Refunds',
    content: `**Manually Refunding Security Deposits**:\n\n- **Automatic Trigger**: Standard security deposits (PKR 10,000) are auto-refunded within **48 hours** post-handover if no violations exist.\n- **Manual Release**: If flagged, review the booking log. If e-challans and fuel shortages are settled, click **Refund Deposit** on the booking details page.\n- **Wallet Credit**: The amount is credited back to their primary mobile wallet/bank channel.`
  },
  {
    keywords: ['fuel shortage', 'fuel charge', 'calculate fuel', 'petrol charge', 'shortage charge'],
    command: '/fuel-shortage',
    title: '⛽ Calculating Fuel Shortage Surcharges',
    content: `**Standard Fuel Shortage Billing Policy**:\n\n- **Verification**: Cross-examine handover and return fuel level percentages recorded in the vehicle inspection card.\n- **Calculation**: Charge shortage at current PSO retail fuel price per liter.\n- **Surcharge**: Apply a flat **PKR 500 service fee** on top of the fuel difference.\n- **Add to Billing**: Apply the surcharge to the Booking Summary to deduct from the client's security deposit.`
  },
  {
    keywords: ['challan process', 'e-challan process', 'traffic fine', 'upload challan', 'police fine'],
    command: '/challan-processing',
    title: '👮 Uploading & Processing E-Challans',
    content: `**Traffic Violations & E-Challan Operations**:\n\n1. **Add Challan**: Go to **Support Center > E-Challans** and click **Create E-Challan**.\n2. **Input Fields**: Provide E-Challan Number, Date, Fine Amount, and select the corresponding Vehicle ID.\n3. **Auto-Allocation**: Our database automatically matches the violation timestamp to the active booking, assigning the liability to the correct driver's account.\n4. **Status Checks**: Monitor payment status (Pending / Paid). Users are notified immediately.`
  },
  {
    keywords: ['late charge', 'late return fee', 'waive fee', 'delay surcharge', 'waive surcharge'],
    command: '/late-surcharge',
    title: '⏰ Managing Late Return Surcharges',
    content: `**Late Return Surcharge Administration**:\n\n- **Policy**: Delays beyond 30 minutes are charged at **1.5x the hourly rate**.\n- **Discretionary Waive**: Managers may waive the late surcharge in cases of proven roadside breakdowns or medical emergencies.\n- **Execution**: Open the Booking Summary, select **Adjust Fees**, input the negative waiver amount with justification, and click save.`
  },
  {
    keywords: ['incident remarks', 'add remark', 'add comment', 'cross discussion', 'staff discussion'],
    command: '/incident-remarks',
    title: '💬 Posting Internal & Discussion Comments',
    content: `**Using the Remarks & Cross-Discussion Feature**:\n\n- **Internal Discussion**: In **Report Incident > Incident details** (or Support Center), use the brand-new interactive **Remarks & Cross-Discussion** form at the bottom of any incident card.\n- **Coordinating**: Both staff and renters can post real-time text comments here to coordinate, explain damage reasons, and submit updates.\n- **Filing**: Staff remarks appear with blue backgrounds and a distinct 'admin'/'manager' role label for easy identification.`
  },
  {
    keywords: ['booking override', 'override', 'cancel booking', 'admin cancel', 'change vehicle'],
    command: '/booking-override',
    title: '🔄 Forced Booking Override Actions',
    content: `**Administrative Booking Override Controls**:\n\n- **Force Cancellation**: Under **Bookings**, click **Cancel Booking** to override user-side locks. If cancelled due to fleet unavailability, ensure free cancellations are granted.\n- **Upgrade Vehicle**: You can re-assign a premium vehicle to an existing booking at no extra cost if their booked standard vehicle is offline due to repairs.`
  },
  {
    keywords: ['gps tracking', 'track vehicle', 'lock vehicle', 'disable engine', 'remote lock'],
    command: '/gps-tracking',
    title: '📡 GPS Tracking & Remote Starter Locks',
    content: `**Remote Telematics & GPS Procedures**:\n\n- **Tracking Scans**: Locate vehicles in real-time under **Active Trips** via the map telemetry nodes.\n- **Starter Immobilization**: In severe emergencies (theft, high-speed flight, missing over 3 hours past return deadline without contact), admins can click **Disable Starter** from the vehicle details drawer.\n- **Protocol**: Verify team consensus and document justification before remote locking.`
  },
  {
    keywords: ['insurance claim', 'commercial claim', 'compile proof', 'claim documents'],
    command: '/insurance-claim',
    title: '🛡️ Compiling Commercial Insurance Claims',
    content: `**Commercial Fleet Claims Protocol**:\n\n- **Required Bundle**: Compile high-resolution damage photos, the renter's driver license scan, copy of booking receipt, and the official police FIR.\n- **Submission**: Forward the bundle to EliteDrive Claims Department at **claims@elitedrive.pk** within **48 hours**.\n- **Deductibles**: The renter's security deposit covers the base deductible, while the insurer handles the remaining fleet repairs.`
  },
  {
    keywords: ['guarantor check', 'verify guarantor', 'guarantor detail', 'out of city verify'],
    command: '/guarantor-check',
    title: '🔑 Out-of-City Guarantor Verification',
    content: `**Guarantor Compliance Checks**:\n\n1. **Review Booking**: Check if booking is flagged with *'Out-of-City Route'* status.\n2. **Validate Info**: Call the listed guarantor's phone number to verify identity and relation to the renter.\n3. **Set Status**: Click **Approve Out-of-City** in booking operations. If unverified or missing, mark as **Verification Failed** to hold vehicle keys until compliance is met.`
  },
  {
    keywords: ['chauffeur SOP', 'assign driver', 'driver duty', 'vip chauffeur assignment'],
    command: '/vip-chauffeur',
    title: '⭐ VIP Chauffeur Driver Assignments',
    content: `**Chauffeur Assignment Operational Protocol**:\n\n- **Allocation**: Check if booking includes the *'VIP Chauffeur Service'* daily surcharge (PKR 3,000/day).\n- **Driver Match**: Dispatch an active, certified EliteDrive driver from our driver registry.\n- **Pre-trip Brief**: Ensure the driver is briefed on pickup location, itinerary, and vehicle details.\n- **Status Update**: Set the driver status to *'Assigned'* inside the booking dispatch drawer.`
  },
  {
    keywords: ['staff roles', 'admin vs manager', 'permissions', 'admin role', 'manager role'],
    command: '/staff-roles',
    title: '👥 Staff Role Permissions Matrix',
    content: `**EliteDrive Dashboard Role Matrix**:\n\n- **Manager**: Can edit vehicle lists, approve KYC, update incident statuses, process e-challans, and handle client disputes.\n- **Admin**: Full read/write access across all system parameters, user roles management, telematics engine starter controls, and final financial override capabilities.`
  },
  {
    keywords: ['system backup', 'sync database', 'telemetry backup', 'system sync'],
    command: '/system-backup',
    title: '💾 Telemetry Sync & System Diagnostics',
    content: `**Operational Database Synchronization & Diagnostics**:\n\n- **Auto-Sync**: Vehicle locations, active booking timers, and payment channels are synchronized with live servers every **60 seconds**.\n- **Manual Backup**: Trigger manual backup snapshots from the Operations Control panel during system updates.\n- **Diagnostics**: If tracking is delayed, verify client websocket status in console and check internet connectivity.`
  },
  {
    keywords: ['documents', 'required documents', 'requirements', 'docs to show', 'driver license', 'cnic required', 'documents list', 'document list', 'required docs'],
    command: '/required-docs',
    title: '🪪 Required Rental Documents',
    content: `**Required Documents for Picking Up an EliteDrive Vehicle**:\n\nTo drive an EliteDrive vehicle, you must submit and verify the following original documents:\n\n1. **Valid Driving License**: Must be active, non-expired, and authorize the category of vehicle booked.\n2. **Original CNIC (National Identity Card)**: Must match the renter's profile name.\n3. **Active Phone Number**: For SMS, booking notifications, and live tracking verification.\n4. **Verified Guarantor (Out-of-City Only)**: Required if traveling outside the default city limits.`
  },
  {
    keywords: ['extension', 'extend booking', 'booking extension', 'time increase', 'more days', 'more hours', 'extend trip'],
    command: '/extend-booking',
    title: '📅 Booking Extension Process',
    content: `**Guidelines for Extending Your EliteDrive Booking**:\n\nNeed more time with your EliteDrive vehicle? Follow these guidelines to extend your booking:\n\n- **Request Period**: You must submit an extension request **at least 3 hours before your scheduled return time** through the dashboard.\n- **Unbooked Vehicles**: Extensions are only approved if the vehicle hasn't been booked by another customer immediately after your slot.\n- **Extension Fee**: Standard hourly/daily rental rates apply to the extended duration.\n- **Late Extensions**: Requesting an extension after your return window has passed triggers late return penalties (1.5x standard rates).`
  },
  {
    keywords: ['return vehicle', 'return process', 'how to return', 'returning car', 'gari wapis', 'handover process', 'return instructions'],
    command: '/return-process',
    title: '🏁 Vehicle Return Process',
    content: `**Standard Vehicle Return Process**:\n\nTo complete your vehicle return smoothly and get your security deposit refunded without deductions:\n\n1. **Cleanliness**: Ensure the vehicle's interior and exterior are returned in a clean and acceptable condition.\n2. **Fuel Level**: Return the vehicle with the **exact same fuel level** as noted during pickup. Refueling surcharges (PKR 500 service fee + fuel cost) apply for shortages.\n3. **Inspection**: Our representative will conduct a physical inspection of the body, interior, and engine to log any damages.\n4. **Handover Signature**: Digitally sign the return handover receipt on the representative's device to officially end your active trip.`
  },
  {
    keywords: ['security deposit', 'deposit amount', 'deposit cash', 'paisa deposit', 'why deposit', 'refund deposit', 'deposit details'],
    command: '/security-deposit',
    title: '💰 Security Deposit Details',
    content: `**EliteDrive Security Deposit Policy**:\n\nEliteDrive Security Deposit policy safeguards our premium fleet:\n\n- **Deposit Amount**: Calculated dynamically as **2x the vehicle's daily rent** or a minimum of **PKR 10,000** (whichever is higher). This guarantees coverage proportional to the vehicle value.\n- **Payment Channels**: Pay instantly using approved payment methods (Easypaisa, JazzCash, Nayapay, or credit/debit card).\n- **Automatic Refund**: Automatically processed and returned to your original payment channel **within 48 hours** after successful, damage-free vehicle handover.\n- **Deductions**: Pending traffic challans (e-challans), fuel shortages, or late return surcharges are adjusted from this deposit.`
  },
  {
    keywords: ['damage reporting', 'damage report', 'report damage', 'scratches', 'dent', 'accident report', 'incident reporting', 'vehicle damage reporting'],
    command: '/damage-reporting',
    title: '🔧 Vehicle Damage & Incident Reporting',
    content: `**Protocol for Reporting Vehicle Damage & Incidents**:\n\nIf the vehicle sustains any physical or mechanical damage during your trip, follow this protocol immediately:\n\n1. **Report Window**: You **must report all incidents within 6 hours** via the dashboard under the "Report Incident" tab.\n2. **Required Proof**: Upload high-quality photos/videos of the vehicle damage, surrounding area, and third-party details.\n3. **Police FIR**: Major collisions or hit-and-runs require a formal police FIR copy for insurance verification.\n4. **Insurance Notice**: Late reports (past 6 hours) or driving without a verified license automatically void insurance coverages, leaving the renter fully liable for 100% of the repair costs.`
  },
  {
    keywords: ['pickup', 'pickup instructions', 'car pickup', 'gari pickup', 'how to collect', 'pickup guidelines', 'collecting car'],
    command: '/pickup-instructions',
    title: '🔑 Vehicle Pickup Guidelines',
    content: `**Guidelines for Picking Up Your EliteDrive Vehicle**:\n\nWhen arriving to pick up your EliteDrive vehicle, keep these crucial guidelines in mind:\n\n1. **Arrive On Time**: Standard pick-up windows are active for 3 hours from booking start. No-shows are cancelled automatically.\n2. **Document Check**: Bring your original, non-expired CNIC and physical Driving License for manual inspection.\n3. **Inspect the Vehicle**: Walk around the car with our representative. Ensure all pre-existing dents, scratches, and fuel levels are documented in the digital checklist.\n4. **Confirm Features**: Check that the spare tire, tools, and medical first-aid kit are present in the trunk/glove compartment before starting your trip.`
  }
];

const SupportChatWidget: React.FC = () => {
  const { user, isChatOpen: isOpen, setIsChatOpen: setIsOpen } = useStore();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const isSupportPage = location.search.includes('view=support-center');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length <= 1) {
      const isStaff = user?.role === 'admin' || user?.role === 'manager';
      const welcomeText = isStaff 
        ? `Hi ${user?.name || 'there'} (Staff Account)! I'm your Operations Assistant. Ask about KYC verification, incident handling, blacklists, or use the quick guidance pills below.`
        : `Hi ${user?.name || 'there'}! I'm your EliteDrive AI assistant. How can I help you today?`;

      setMessages([
        {
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('elitedrive_token');
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: messages.slice(-5), // Send last few messages for rolling history context
          inputMessage: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error('Support API returned error status');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Look up locally in case of failure
      const cleanInput = userMessage.content.trim().toLowerCase();
      const matchedLocal = EMERGENCY_COMMANDS.find(cmd => {
        if (cleanInput === cmd.command || cleanInput === cmd.command.substring(1)) {
          return true;
        }
        return cmd.keywords.some(kw => {
          if (cleanInput === kw) return true;
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(cleanInput);
        });
      });

      if (matchedLocal) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `### ${matchedLocal.title}\n\n${matchedLocal.content}\n\n*Emergency mode active (Loaded from local device storage).*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble connecting to the support server. Please try again later.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendPill = async (command: string) => {
    if (isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: command,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('elitedrive_token');
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: messages.slice(-5),
          inputMessage: command
        })
      });

      if (!response.ok) {
        throw new Error('Support API returned error status');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const cleanInput = command.trim().toLowerCase();
      const matchedLocal = EMERGENCY_COMMANDS.find(cmd => {
        if (cleanInput === cmd.command || cleanInput === cmd.command.substring(1)) {
          return true;
        }
        return cmd.keywords.some(kw => {
          if (cleanInput === kw) return true;
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(cleanInput);
        });
      });

      if (matchedLocal) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `### ${matchedLocal.title}\n\n${matchedLocal.content}\n\n*Emergency mode active (Loaded from local device storage).*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble connecting to the support server. Please try again later.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (isSupportPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`w-[350px] bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4 transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">EliteDrive Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`size-8 rounded-lg flex items-center justify-center text-white shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-3 shadow-sm border border-slate-100 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none border-blue-500' 
                          : 'bg-white text-slate-700 rounded-2xl rounded-tl-none'
                      }`}>
                        <div className={`text-xs font-medium leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <p className={`text-[9px] font-bold mt-1.5 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-400">Assistant is typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 bg-white">
                  {/* Quick Emergency Commands Row */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-50 shrink-0 select-none no-scrollbar">
                    {(() => {
                      const isStaff = user?.role === 'admin' || user?.role === 'manager';
                      const pillsToUse = isStaff ? STAFF_PILLS : CUSTOMER_PILLS;
                      const hubTitle = isStaff ? '💼 Operations Hub' : '🚨 Safety Hub';
                      const hubColorClass = isStaff ? 'text-indigo-600 bg-indigo-50' : 'text-rose-600 bg-rose-50';

                      return (
                        <>
                          <span className={`text-[9px] font-black ${hubColorClass} px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 shrink-0 animate-pulse`}>
                            {hubTitle}
                          </span>
                          {pillsToUse.map((pill) => (
                            <button
                              key={pill.command}
                              type="button"
                              onClick={() => handleSendPill(pill.command)}
                              disabled={isTyping}
                              className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-all px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200/40 cursor-pointer"
                            >
                              {pill.label}
                            </button>
                          ))}
                        </>
                      );
                    })()}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="relative"
                  >
                    <input 
                      type="text" 
                      placeholder="Ask me anything..." 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={isTyping}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 size-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:bg-slate-300"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`size-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
};

export default SupportChatWidget;
