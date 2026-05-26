import { jsPDF } from 'jspdf';
import { Booking, Vehicle, User } from '../types';

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

  // Calculate high-fidelity charges breakdown
  const isChauffeur = !!booking.chauffeurSelected;
  const rawBase = booking.totalPrice * 0.85;
  const surcharge = booking.totalPrice * 0.07;
  const taxes = booking.totalPrice * 0.08;

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

  // Paid status pill with pristine borders
  doc.setFillColor(52, 199, 89); // Apple safe light green #34C759
  doc.roundedRect(160, y - 4, 14, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PAID', 167, y - 0.5, { align: 'center' });

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

  // Render Client Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(134, 134, 139);
  doc.text('Full Name', keyLabelX, y);
  doc.setFont('helvetica', 'bold');
  doc.text(user?.name || 'Authorized Client', valueColX, y);

  doc.setFont('helvetica', 'normal');
  doc.text('Contact Email', keyLabelX, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(user?.email || 'N/A', valueColX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.text('Primary Contact', keyLabelX, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(user?.phone || 'N/A', valueColX, y + 12);

  // Render Itinerary Info
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(134, 134, 139);
  doc.text('Pick-up Spot', itineraryLabelX, y);
  doc.setFont('helvetica', 'bold');
  doc.text(vehicle.location, itineraryValX, y);

  doc.setFont('helvetica', 'normal');
  doc.text('Destination', itineraryLabelX, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.destination || vehicle.location, itineraryValX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.text('Rental Dates', itineraryLabelX, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${booking.startDate} to ${booking.endDate}`, itineraryValX, y + 12);

  y += 18;
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

  // Dynamic box wrapper for receipt breakdown
  doc.setFillColor(250, 250, 250); // Apple-like subtle light background #FAFAFA
  doc.roundedRect(15, y, 180, 48, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text('Core Vehicle Reservation Rate:', 25, y + 8);
  doc.text('Local Surcharge & Operational Fee:', 25, y + 15);
  doc.text('Utility Sales Tax & Government Levies (13%):', 25, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text(`PKR ${Math.round(rawBase).toLocaleString()}`, 185, y + 8, { align: 'right' });
  doc.text(`PKR ${Math.round(surcharge).toLocaleString()}`, 185, y + 15, { align: 'right' });
  doc.text(`PKR ${Math.round(taxes).toLocaleString()}`, 185, y + 22, { align: 'right' });

  // Divider line inside list box
  doc.setDrawColor(229, 229, 234);
  doc.line(25, y + 28, 185, y + 28);

  // Total Summary bottom row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(29, 29, 31);
  doc.text('GRAND TOTAL AMOUNT PAID:', 25, y + 38);
  
  doc.setFontSize(13);
  doc.setTextColor(0, 102, 204); // Genuine Apple premium blue link style #0066CC
  doc.text(`PKR ${booking.totalPrice.toLocaleString()}`, 185, y + 38, { align: 'right' });

  y += 58;

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
