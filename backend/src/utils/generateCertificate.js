const PDFDocument = require('pdfkit');

/**
 * Generates a certificate PDF and returns it as a Buffer.
 */
const generateCertificatePDF = ({ studentName, internshipTitle, startDate, endDate, certificateNumber, grade }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .strokeColor('#1e40af')
        .stroke();

      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(1)
        .strokeColor('#3b82f6')
        .stroke();

      // Header
      doc
        .fontSize(14)
        .fillColor('#6b7280')
        .text('INTERNIX', 0, 60, { align: 'center' });

      doc
        .fontSize(36)
        .fillColor('#1e40af')
        .text('Certificate of Completion', 0, 90, { align: 'center' });

      doc
        .moveTo(200, 140)
        .lineTo(doc.page.width - 200, 140)
        .strokeColor('#3b82f6')
        .lineWidth(2)
        .stroke();

      // Body
      doc
        .fontSize(14)
        .fillColor('#374151')
        .text('This is to certify that', 0, 170, { align: 'center' });

      doc
        .fontSize(28)
        .fillColor('#111827')
        .text(studentName, 0, 200, { align: 'center' });

      doc
        .fontSize(14)
        .fillColor('#374151')
        .text('has successfully completed the internship program', 0, 245, { align: 'center' });

      doc
        .fontSize(20)
        .fillColor('#1e40af')
        .text(`"${internshipTitle}"`, 0, 275, { align: 'center' });

      const formattedStart = new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const formattedEnd = new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      doc
        .fontSize(12)
        .fillColor('#6b7280')
        .text(`Duration: ${formattedStart} — ${formattedEnd}`, 0, 315, { align: 'center' });

      if (grade) {
        doc
          .fontSize(14)
          .fillColor('#374151')
          .text(`Grade: ${grade}`, 0, 345, { align: 'center' });
      }

      // Footer
      doc
        .fontSize(10)
        .fillColor('#9ca3af')
        .text(`Certificate No: ${certificateNumber}`, 60, doc.page.height - 80);

      doc
        .fontSize(10)
        .fillColor('#9ca3af')
        .text(`Issued on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, doc.page.height - 80, {
          align: 'right',
          width: doc.page.width - 60,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateCertificatePDF;
