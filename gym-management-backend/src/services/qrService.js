const QRCode = require('qrcode');

class QRService {
    // Generate QR code as data URL
    async generateQR(data) {
        try {
            const qrDataURL = await QRCode.toDataURL(JSON.stringify(data));
            return qrDataURL;
        } catch (error) {
            throw new Error('QR code generation failed: ' + error.message);
        }
    }
    
    // Generate QR code as buffer
    async generateQRBuffer(data) {
        try {
            const buffer = await QRCode.toBuffer(JSON.stringify(data));
            return buffer;
        } catch (error) {
            throw new Error('QR buffer generation failed: ' + error.message);
        }
    }
    
    // Parse QR data
    parseQR(qrData) {
        try {
            return JSON.parse(qrData);
        } catch (error) {
            throw new Error('Invalid QR data');
        }
    }
}

module.exports = new QRService();
