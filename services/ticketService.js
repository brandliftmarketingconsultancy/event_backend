// const PDFDocument = require('pdfkit');
// const QRCode = require('qrcode');

// /**
//  * Generates a single ticket PDF as a Buffer.
//  *
//  * @param {Object} opts
//  * @param {string} opts.ticketId
//  * @param {number} opts.ticketNumber     - 1-based index within the order
//  * @param {number} opts.totalInOrder     - total tickets in the order
//  * @param {string} opts.name             - attendee name
//  * @param {string} opts.email
//  * @param {string} opts.ticketType       - 'General' | 'VIP'
//  * @param {string} opts.orderId
//  * @returns {Promise<Buffer>}
//  */
// const generateTicketPDF = async ({
//   ticketId,
//   ticketNumber,
//   totalInOrder,
//   name,
//   email,
//   ticketType,
//   orderId,
// }) => {
//   // Generate QR code as a PNG data URL
//   const qrDataUrl = await QRCode.toDataURL(ticketId, {
//     width: 250,
//     margin: 2,
//     color: { dark: '#000000', light: '#ffffff' },
//   });

//   // Strip the data:image/png;base64, prefix to get raw base64
//   const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
//   const qrBuffer = Buffer.from(qrBase64, 'base64');

//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({
//       size: 'A5',           // 148 × 210 mm
//       margin: 30,
//       info: {
//         Title: `Ticket ${ticketNumber} of ${totalInOrder} — ${process.env.EVENT_NAME}`,
//         Author: process.env.EVENT_NAME,
//       },
//     });

//     const chunks = [];
//     doc.on('data', (chunk) => chunks.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(chunks)));
//     doc.on('error', reject);

//     const W = doc.page.width;   // ~420 pt for A5
//     const accent = ticketType === 'VIP' ? '#7C3AED' : '#2563EB';

//     // ── Header bar ───────────────────────────────────────────────
//     doc.rect(0, 0, W, 55).fill(accent);

//     doc.fillColor('#ffffff')
//       .font('Helvetica-Bold')
//       .fontSize(18)
//       .text(process.env.EVENT_NAME || 'Event Ticket', 30, 12, { width: W - 60 });

//     doc.fontSize(9)
//       .font('Helvetica')
//       .text(`Ticket ${ticketNumber} of ${totalInOrder}   •   ${ticketType.toUpperCase()}`, 30, 36, { width: W - 60 });

//     // ── Event details ────────────────────────────────────────────
//     doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text('Event Details', 30, 70);

//     doc.fillColor('#374151').font('Helvetica').fontSize(10);
//     const details = [
//       ['Date', process.env.EVENT_DATE || 'TBD'],
//       ['Venue', process.env.EVENT_VENUE || 'TBD'],
//       ['Attendee', name],
//       ['Email', email],
//       ['Order ID', orderId],
//     ];
//     let y = 88;
//     for (const [label, value] of details) {
//       doc.font('Helvetica-Bold').text(`${label}:  `, 30, y, { continued: true });
//       doc.font('Helvetica').text(value);
//       y += 16;
//     }

//     // ── Divider ──────────────────────────────────────────────────
//     doc.moveTo(30, y + 6).lineTo(W - 30, y + 6).strokeColor('#E5E7EB').lineWidth(1).stroke();
//     y += 18;

//     // ── QR Code ──────────────────────────────────────────────────
//     const qrSize = 160;
//     const qrX = (W - qrSize) / 2;
//     doc.image(qrBuffer, qrX, y, { width: qrSize, height: qrSize });
//     y += qrSize + 8;

//     // ── Ticket ID ────────────────────────────────────────────────
//     doc.fillColor('#6B7280').font('Courier').fontSize(8)
//       .text(ticketId, 30, y, { align: 'center', width: W - 60 });
//     y += 18;

//     // ── Footer ───────────────────────────────────────────────────
//     doc.rect(0, doc.page.height - 38, W, 38).fill('#F9FAFB');
//     doc.fillColor('#6B7280').font('Helvetica').fontSize(8)
//       .text(
//         'Show this QR at the entrance • Valid for 1 person only • Non-transferable',
//         30,
//         doc.page.height - 26,
//         { align: 'center', width: W - 60 }
//       );

//     doc.end();
//   });
// };

// module.exports = { generateTicketPDF };




const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generates a single ticket PDF as a Buffer.
 *
 * @param {Object} opts
 * @param {string} opts.ticketId
 * @param {number} opts.ticketNumber     - 1-based index within the order
 * @param {number} opts.totalInOrder     - total tickets in the order
 * @param {string} opts.name             - attendee name
 * @param {string} opts.email
 * @param {string} opts.ticketType       - 'General' | 'VIP'
 * @param {string} opts.orderId
 * @returns {Promise<Buffer>}
 */
const generateTicketPDF = async ({
  ticketId,
  ticketNumber,
  totalInOrder,
  name,
  email,
  ticketType,
  orderId,
}) => {
  // Generate QR code as a PNG data URL
  const qrDataUrl = await QRCode.toDataURL(ticketId, {
    width: 300,
    margin: 1,
    color: { dark: '#111827', light: '#ffffff' },
  });

  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A5',
      margin: 0,
      info: {
        Title: `Ticket ${ticketNumber} of ${totalInOrder} — ${process.env.EVENT_NAME}`,
        Author: process.env.EVENT_NAME,
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width;
    const H = doc.page.height;
    const isVIP = ticketType === 'VIP';

    // Two-tone palette per ticket type
    const accent = isVIP ? '#7C3AED' : '#2563EB';
    const accentDark = isVIP ? '#5B21B6' : '#1D4ED8';
    const accentSoft = isVIP ? '#F5F3FF' : '#EFF6FF';

    const M = 24; // outer margin
    const stubSplitY = H - 150; // where the tear-off stub begins

    // ── Full background ─────────────────────────────────────────
    doc.rect(0, 0, W, H).fill('#FFFFFF');

    // ── Header band ──────────────────────────────────────────────
    const headerH = 92;
    doc.rect(0, 0, W, headerH).fill(accent);
    doc.rect(0, headerH - 6, W, 6).fill(accentDark);

    doc.fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(19)
      .text(process.env.EVENT_NAME || 'Event Ticket', M, 20, { width: W - M * 2 });

    doc.font('Helvetica')
      .fontSize(9.5)
      .fillColor('#E5E7EB')
      .text(`${process.env.EVENT_DATE || 'TBD'}   •   ${process.env.EVENT_VENUE || 'TBD'}`, M, 48, {
        width: W - M * 2,
      });

    // Ticket-type badge, top-right, pill shape
    const badgeText = isVIP ? 'VIP ACCESS' : 'GENERAL';
    doc.font('Helvetica-Bold').fontSize(9);
    const badgeW = doc.widthOfString(badgeText) + 24;
    const badgeX = W - M - badgeW;
    const badgeY = 66;
    doc.roundedRect(badgeX, badgeY, badgeW, 18, 9).fill('#FFFFFF');
    doc.fillColor(accentDark).text(badgeText, badgeX, badgeY + 5, { width: badgeW, align: 'center' });

    // ── Body: attendee + order details ──────────────────────────
    let y = headerH + 22;

    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10)
      .text('ATTENDEE', M, y);
    y += 14;
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(16)
      .text(name, M, y, { width: W - M * 2 });
    y += 22;
    doc.fillColor('#6B7280').font('Helvetica').fontSize(9.5)
      .text(email, M, y, { width: W - M * 2 });
    y += 24;

    // Details row (Order ID / Ticket number) as two columns
    const colW = (W - M * 2 - 16) / 2;
    doc.fillColor('#9CA3AF').font('Helvetica-Bold').fontSize(8).text('ORDER ID', M, y);
    doc.fillColor('#9CA3AF').font('Helvetica-Bold').fontSize(8).text('TICKET', M + colW + 16, y);
    y += 12;
    doc.fillColor('#374151').font('Courier').fontSize(9.5).text(orderId, M, y, { width: colW });
    doc.fillColor('#374151').font('Helvetica').fontSize(9.5)
      .text(`${ticketNumber} of ${totalInOrder}`, M + colW + 16, y, { width: colW });
    y += 26;

    // ── Perforation / tear line ─────────────────────────────────
    const dotY = stubSplitY;
    doc.save();
    doc.dash(3, { space: 4 });
    doc.moveTo(M, dotY).lineTo(W - M, dotY).strokeColor('#D1D5DB').lineWidth(1.2).stroke();
    doc.undash();
    doc.restore();

    // Small notch circles at each end (ticket-stub look)
    doc.circle(0, dotY, 10).fill('#FFFFFF');
    doc.circle(W, dotY, 10).fill('#FFFFFF');
    doc.circle(0, dotY, 10).lineWidth(1).strokeColor('#D1D5DB').stroke();
    doc.circle(W, dotY, 10).lineWidth(1).strokeColor('#D1D5DB').stroke();

    // ── Stub section: QR + scan instructions ────────────────────
    doc.rect(0, dotY, W, H - dotY).fill(accentSoft);

    const qrSize = 108;
    const qrX = M;
    const qrY = dotY + 21;
    doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 8).fill('#FFFFFF');
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    const textX = qrX + qrSize + 24;
    const textW = W - textX - M;
    doc.fillColor(accentDark).font('Helvetica-Bold').fontSize(11)
      .text('Scan at entrance', textX, qrY + 4, { width: textW });
    doc.fillColor('#374151').font('Helvetica').fontSize(8.5)
      .text('Present this QR code at check-in. Valid for one person only and non-transferable.', textX, qrY + 22, {
        width: textW,
      });
    doc.fillColor('#6B7280').font('Courier').fontSize(7.5)
      .text(ticketId, textX, qrY + 62, { width: textW });

    doc.end();
  });
};

module.exports = { generateTicketPDF };