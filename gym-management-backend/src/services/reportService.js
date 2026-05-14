const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Member = require('../models/Member');
const Payment = require('../models/Payment');

class ReportService {
    // Generate Excel report for members
    async generateMemberExcel(members) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Members');
        
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Plan', key: 'plan', width: 15 },
            { header: 'Joining Date', key: 'joiningDate', width: 15 },
            { header: 'Expiry Date', key: 'expiryDate', width: 15 },
            { header: 'Status', key: 'status', width: 10 }
        ];
        
        members.forEach(member => {
            worksheet.addRow({
                name: member.name,
                phone: member.phone,
                email: member.email,
                plan: member.planId?.name || 'N/A',
                joiningDate: member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : '',
                expiryDate: member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : '',
                status: new Date(member.expiryDate) > new Date() ? 'Active' : 'Expired'
            });
        });
        
        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        
        return workbook;
    }
    
    // Generate payment report Excel
    async generatePaymentExcel(payments) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payments');
        
        worksheet.columns = [
            { header: 'Invoice No', key: 'invoiceNumber', width: 20 },
            { header: 'Member', key: 'member', width: 20 },
            { header: 'Plan', key: 'plan', width: 15 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'Payment Date', key: 'paymentDate', width: 15 },
            { header: 'Status', key: 'status', width: 10 }
        ];
        
        payments.forEach(payment => {
            worksheet.addRow({
                invoiceNumber: payment.invoiceNumber,
                member: payment.memberId?.name || 'N/A',
                plan: payment.planId?.name || 'N/A',
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '',
                status: payment.status
            });
        });
        
        worksheet.getRow(1).font = { bold: true };
        
        return workbook;
    }
}

module.exports = new ReportService();
