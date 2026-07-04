import { jsPDF } from 'jspdf';
import { Booking, Vehicle, User } from '../types';
import { getVehicleFareConfig } from './pricing';

function drawSleekQRCode(doc: jsPDF, x: number, y: number, size: number, text: string) {
  // Draw outer subtle boundary border
  doc.setDrawColor(229, 229, 234); // Apple-like subtle light gray border
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x - 2, y - 2, size + 4, size + 4, 2, 2, 'FD');

  doc.setFillColor(29, 29, 31); // Dark charcoal #1D1D1F

  // Finder Pattern 1 (Top Left)
  doc.rect(x, y, 6, 6, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(x + 1, y + 1, 4, 4, 'F');
  doc.setFillColor(29, 29, 31);
  doc.rect(x + 2, y + 2, 2, 2, 'F');

  // Finder Pattern 2 (Top Right)
  doc.rect(x + size - 6, y, 6, 6, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(x + size - 5, y + 1, 4, 4, 'F');
  doc.setFillColor(29, 29, 31);
  doc.rect(x + size - 4, y + 2, 2, 2, 'F');

  // Finder Pattern 3 (Bottom Left)
  doc.rect(x, y + size - 6, 6, 6, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(x + 1, y + size - 5, 4, 4, 'F');
  doc.setFillColor(29, 29, 31);
  doc.rect(x + 2, y + size - 4, 2, 2, 'F');

  // Alignment pattern
  doc.rect(x + size - 4, y + size - 4, 2, 2, 'F');
  
  // Deteministic pseudo-random QR code pixel grid based on the text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gridCount = 12;
  const cellSize = size / gridCount;

  for (let r = 0; r < gridCount; r++) {
    for (let c = 0; c < gridCount; c++) {
      // Don't draw in finder patterns
      if (r < 4 && c < 4) continue;
      if (r < 4 && c >= gridCount - 4) continue;
      if (r >= gridCount - 4 && c < 4) continue;
      
      const pseudoVal = Math.abs(Math.sin(hash + (r * 7.3) + (c * 19.7)));
      if (pseudoVal > 0.45) {
        doc.rect(x + c * cellSize, y + r * cellSize, cellSize + 0.05, cellSize + 0.05, 'F');
      }
    }
  }
}

export function downloadReceiptPDF(booking: Booking, vehicle: Vehicle, user: User | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Calculate high-fidelity charges breakdown using stored variables if available, and falling back gracefully
  const isChauffeur = !!booking.chauffeurSelected;
  const rentalType = booking.rentalType || 'daily';
  
  // Calculate calendar days
  const startObj = new Date(booking.startDate);
  startObj.setHours(0, 0, 0, 0);
  const endObj = new Date(booking.endDate);
  endObj.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const calendarDays = booking.calendarDays || Math.max(1, diffDays);

  const rentalDuration = booking.rentalDuration || (
    rentalType === 'hourly' 
      ? 4 
      : rentalType === 'weekly' 
        ? Math.max(1, Math.round(calendarDays / 7)) 
        : calendarDays
  );

  const unitLabel = rentalType === 'hourly'
    ? (rentalDuration === 1 ? 'Hour' : 'Hours')
    : rentalType === 'weekly'
      ? (rentalDuration === 1 ? 'Week' : 'Weeks')
      : (rentalDuration === 1 ? 'Day' : 'Days');

  const config = getVehicleFareConfig(vehicle);

  // Re-calculate or fetch values
  const basePrice = booking.basePrice !== undefined 
    ? booking.basePrice 
    : (rentalType === 'hourly' 
        ? config.hourlyBasePrice 
        : (rentalType === 'weekly' 
            ? config.weeklyPackagePrice * rentalDuration 
            : config.pricePerDay * rentalDuration));

  const insurancePrice = booking.insurancePrice !== undefined 
    ? booking.insurancePrice 
    : 0;

  const chauffeurPrice = booking.chauffeurPrice !== undefined 
    ? booking.chauffeurPrice 
    : (booking.chauffeurSelected ? (rentalType === 'hourly' ? 2500 : 2500 * calendarDays) : 0);

  const discountPrice = booking.discountPrice !== undefined 
    ? booking.discountPrice 
    : 0;

  const formattedDate = new Date(booking.bookingDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ==========================================
  // BRAND IDENTITY HEADER (Minimalist Premium Apple Style)
  // ==========================================

  // Left-Header: Brand typography
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(29, 29, 31); // Charcoal #1D1D1F
  doc.text('ELITE DRIVE', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139); // Neutral Gray #86868B
  doc.text('PREMIUM LUXURY COMMUTING SERVICES', 15, 23);
  doc.text('LAHORE • KARACHI • ISLAMABAD', 15, 27);

  // Middle-Right: QR Code & Booking Identification
  const qrX = 165;
  const qrY = 10;
  const qrSize = 28;
  const bookingRef = `ELITE-${booking.id.substring(0, 8).toUpperCase()}`;
  drawSleekQRCode(doc, qrX, qrY, qrSize, bookingRef);

  // Under Logo Info
  let y = 38;

  // Thin clean separation line
  doc.setDrawColor(229, 229, 234); // #E5E5EA
  doc.setLineWidth(0.35);
  doc.line(15, y, 195, y);

  y += 8;

  // ==========================================
  // INVOICE METADATA ROW
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 29, 31);
  doc.text('RECEIPT NO:', 15, y);
  doc.text('DATE ISSUED:', 65, y);
  doc.text('BOOKING ID:', 115, y);
  doc.text('STATUS:', 160, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(67, 67, 72); // Charcoal Gray
  doc.text(bookingRef, 15, y);
  doc.text(formattedDate, 65, y);
  doc.text(booking.id.toUpperCase(), 115, y);

  // Dynamic Payment Status Pill with Pristine Borders and Adaptive Width
  let statusText = 'PAID';
  let pillColor = [52, 199, 89]; // default Green (#34C759)
  
  if (booking.paymentStatus === 'pending') {
    if (booking.paymentMethod === 'bank_transfer' || booking.paymentMethod === 'transfer') {
      if (booking.bankReceiptApproved === 'rejected') {
        statusText = 'REJECTED';
        pillColor = [255, 59, 48]; // Red (#FF3B30)
      } else if (booking.bankReceiptApproved === 'pending') {
        statusText = 'VERIFYING';
        pillColor = [255, 149, 0]; // Amber (#FF9500)
      } else {
        statusText = 'PENDING';
        pillColor = [255, 149, 0]; // Amber
      }
    } else {
      statusText = 'PENDING';
      pillColor = [255, 149, 0]; // Amber
    }
  }

  const pillWidth = statusText.length > 7 ? 22 : statusText.length > 5 ? 18 : 14;
  const pillX = 175 - pillWidth; // align right neatly

  doc.setFillColor(pillColor[0], pillColor[1], pillColor[2]);
  doc.roundedRect(pillX, y - 4, pillWidth, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, pillX + (pillWidth / 2), y - 0.5, { align: 'center' });

  y += 9;
  doc.setDrawColor(242, 242, 247); // Extra subtle #F2F2F7 line
  doc.line(15, y, 195, y);

  y += 9;

  // ==========================================
  // CLIENT & JOURNEY COLUMNS (GENEROUS GRID SPACING)
  // ==========================================
  
  // Left side Column: Client Profile
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text('CLIENT PROFILE', 15, y);

  doc.setDrawColor(229, 229, 234);
  doc.setLineWidth(0.25);
  doc.line(15, y + 2, 100, y + 2);

  // Right side Column: Travel Itinerary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text('TRAVEL ITINERARY', 110, y);
  doc.line(110, y + 2, 195, y + 2);

  const keyLabelX = 15;
  const valueColX = 52; // Generous 37mm column separation width! ZERO Overlapping!
  
  const itineraryLabelX = 110;
  const itineraryValX = 145; // Generous 35mm column separation width!

  y += 8;

  // Render Client Info & Payment Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('Full Name', keyLabelX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(user?.name || 'Authorized Client', valueColX, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Contact Email', keyLabelX, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(user?.email || 'N/A', valueColX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Primary Contact', keyLabelX, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(user?.phone || 'N/A', valueColX, y + 12);

  // Dynamic Payment Method
  const payMethodStr = booking.paymentMethod === 'bank_transfer' || booking.paymentMethod === 'transfer'
    ? 'Bank Transfer'
    : 'Credit/Debit Card';
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Payment Method', keyLabelX, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(payMethodStr, valueColX, y + 18);

  // Dynamic Transaction Reference
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Transaction Ref', keyLabelX, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  const txRef = booking.transactionRef || (booking.paymentMethod === 'card' || booking.paymentMethod === 'credit_card' ? 'ESCROW-CARD-AUTHPAY' : 'DIRECT-PREMIUM-ESCROW');
  doc.text(txRef.toUpperCase(), valueColX, y + 24);

  // Render Itinerary Info
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Pick-up Spot', itineraryLabelX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(booking.pickupLocation || vehicle.location, itineraryValX, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Destination', itineraryLabelX, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(booking.dropoffLocation || booking.destination || vehicle.location, itineraryValX, y + 6);

  const pdfDateFormatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const startFormatted = new Date(booking.startDate).toLocaleString('en-US', pdfDateFormatOptions);
  const endFormatted = new Date(booking.endDate).toLocaleString('en-US', pdfDateFormatOptions);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Rental Dates', itineraryLabelX, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(`${startFormatted} to ${endFormatted}`, itineraryValX, y + 12);

  const typeStr = rentalType.charAt(0).toUpperCase() + rentalType.slice(1);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Duration Selected', itineraryLabelX, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(`${rentalDuration} ${unitLabel} (${typeStr})`, itineraryValX, y + 18);

  // Extra gap to accommodate new rows
  y += 30;
  doc.setDrawColor(229, 229, 234);
  doc.line(15, y, 195, y);

  y += 8;

  // ==========================================
  // VEHICLE DETAILS SECTION
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text('VEHICLE SYSTEM INFORMATION', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('Model Name', 15, y);
  doc.text('Transmission', 65, y);
  doc.text('Fuel Configuration', 115, y);
  doc.text('Passenger Seats', 160, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(29, 29, 31);
  doc.text(vehicle.name, 15, y);
  doc.text(vehicle.transmission, 65, y);
  doc.text(vehicle.fuel, 115, y);
  doc.text(`${vehicle.seats} Positions`, 160, y);

  y += 8;
  doc.line(15, y, 195, y);

  y += 8;

  // ==========================================
  // CHAUFFEUR COMPILER SECTION (Render optionally)
  // ==========================================
  if (isChauffeur) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(29, 29, 31);
    doc.text('ELITE DRIVER PROTOCOL DETAILS', 15, y);
    doc.line(15, y + 2, 195, y + 2);

    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(134, 134, 139);
    doc.text('Assigned Host', 15, y);
    doc.text('Direct Phone Number', 65, y);
    doc.text('Licensing & Authority', 115, y);
    doc.text('Service Tier', 160, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(29, 29, 31);
    doc.text(booking.driverName || 'Muhammad Ali', 15, y);
    doc.text(booking.driverPhone || '+92 (300) 876-5432', 65, y);
    doc.text('Government Verified Class-D', 115, y);
    doc.text('Elite VIP Carriage', 160, y);

    y += 8;
    doc.line(15, y, 195, y);
    y += 8;
  }

  // ==========================================
  // CHARGES BREAKDOWN TABLE CARD (Premium Minimalist Theme)
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text('CHARGES BREAKDOWN', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;

  const rows: { label: string; value: string; isNegative?: boolean; isIncluded?: boolean }[] = [];

  rows.push({
    label: `Base Rent (${rentalType.charAt(0).toUpperCase() + rentalType.slice(1)} - ${rentalDuration} ${unitLabel}):`,
    value: `PKR ${basePrice.toLocaleString()}`
  });

  if (insurancePrice > 0) {
    const insTypeStr = booking.insuranceType === 'premium' ? 'Zero-Deductible' : 'Basic LCW';
    rows.push({
      label: `Insurance Coverage (${insTypeStr}):`,
      value: `PKR ${insurancePrice.toLocaleString()}`
    });
  }

  if (chauffeurPrice > 0) {
    rows.push({
      label: `Chauffeur Protocol Service (${calendarDays} Days):`,
      value: `PKR ${chauffeurPrice.toLocaleString()}`
    });
  }

  const isAirportPickup = (booking.destination || '').toLowerCase().includes('airport') || 
                           (vehicle.location || '').toLowerCase().includes('airport') ||
                           (booking.pickupLocation || '').toLowerCase().includes('airport') ||
                           (booking.dropoffLocation || '').toLowerCase().includes('airport');
  if (isAirportPickup) {
    rows.push({
      label: 'Airport Pick-up Surcharge:',
      value: 'Included',
      isIncluded: true
    });
  }

  // Add Refundable Security Deposit
  const securityDepositAmount = booking.securityDepositAmount !== undefined
    ? booking.securityDepositAmount
    : 10000;
  if (securityDepositAmount > 0) {
    rows.push({
      label: 'Refundable Security Deposit (Held in Escrow):',
      value: `PKR ${securityDepositAmount.toLocaleString()}`
    });
  }

  if (discountPrice > 0) {
    rows.push({
      label: 'Promo Coupon Code Discount Applied:',
      value: `- PKR ${discountPrice.toLocaleString()}`,
      isNegative: true
    });
  }

  const rowCount = rows.length;
  const lineHeight = 6;
  
  // Calculate dynamic card heights to perfectly contain partial split layouts
  let boxHeight = (rowCount * lineHeight) + 20;
  if (booking.paymentType === 'partial') {
    boxHeight += 12;
  }

  doc.setFillColor(250, 250, 250); // Apple-like subtle light background #FAFAFA
  doc.roundedRect(15, y, 180, boxHeight, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  let currentY = y + 7;
  rows.forEach((row) => {
    doc.setTextColor(100, 116, 139);
    doc.text(row.label, 25, currentY);

    if (row.isNegative) {
      doc.setTextColor(52, 199, 89); // Green text color for discount
    } else if (row.isIncluded) {
      doc.setTextColor(52, 199, 89); // Green text for Included items
    } else {
      doc.setTextColor(29, 29, 31);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(row.value, 185, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    currentY += lineHeight;
  });

  // Divider line inside list box
  doc.setDrawColor(229, 229, 234);
  doc.line(25, currentY + 1, 185, currentY + 1);

  // Total Summary bottom row
  currentY += 9;
  
  if (booking.paymentType === 'partial') {
    // Total Booking Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL BOOKING VALUE:', 25, currentY);
    doc.setFontSize(10);
    doc.setTextColor(29, 29, 31);
    doc.text(`PKR ${booking.totalPrice.toLocaleString()}`, 185, currentY, { align: 'right' });

    currentY += 6;
    // Upfront Amount Paid
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // Green for paid amount
    doc.text('AMOUNT PAID UPFRONT (50% ESCROW):', 25, currentY);
    doc.setFontSize(11);
    const upfront = booking.upfrontAmountPaid || (booking.totalPrice * 0.5);
    doc.text(`PKR ${upfront.toLocaleString()}`, 185, currentY, { align: 'right' });

    currentY += 6;
    // Remaining balance
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(245, 158, 11); // Amber for remaining balance
    doc.text('REMAINING DUE AT HANDOVER:', 25, currentY);
    doc.setFontSize(10);
    const remaining = booking.remainingAmount || (booking.totalPrice * 0.5);
    doc.text(`PKR ${remaining.toLocaleString()}`, 185, currentY, { align: 'right' });
  } else {
    // Standard Grand Total Paid in Full
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(29, 29, 31);
    doc.text('GRAND TOTAL AMOUNT PAID:', 25, currentY);
    
    doc.setFontSize(13);
    doc.setTextColor(0, 102, 204); // Genuine Apple premium blue link style #0066CC
    doc.text(`PKR ${booking.totalPrice.toLocaleString()}`, 185, currentY, { align: 'right' });
  }

  y += boxHeight + 10;

  // ==========================================
  // BRANDS GUARANTEE VERIFICATION BOX
  // ==========================================
  doc.setFillColor(245, 245, 247); // Subtle Apple background gray #F5F5F7
  doc.roundedRect(15, y, 180, 21, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(29, 29, 31);
  doc.text('Elite Drive Verification Standard & Guarantee', 22, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(134, 134, 139);
  doc.text('This digital invoice acts as standard receipt confirming full checkout clearance. At times of handover, keys', 22, y + 11);
  doc.text('are dispersed instantly of verifying your original CNIC and valid professional driver credentials.', 22, y + 15);

  y += 32;

  // ==========================================
  // STANDARD REGULATORY FOOTER
  // ==========================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(153, 153, 153);
  doc.text('ELITE DRIVE INC. SYSTEM CHECKOUT  •  EMAIL: SUPPORT@ELITEDRIVE.COM  •  SUPPORT HOTLINE: +92 (300) 123-4567', 105, y, { align: 'center' });
  doc.text('THANK YOU FOR RENTING WITH THE PREEMINENT ELITE DRIVE EXPERIENCE', 105, y + 4, { align: 'center' });

  // Native dynamic system saver
  doc.save(`elitedrive-receipt-${bookingRef}.pdf`);
}
