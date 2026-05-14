const cron = require('node-cron');
const Member = require('../models/Member');
const twilio = require('twilio');

class ReminderService {
    constructor() {
        this.client = process.env.TWILIO_ACCOUNT_SID ? 
            twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
    }
    
    start() {
        // Run every day at 9 AM
        cron.schedule('0 9 * * *', () => {
            this.sendExpiryReminders();
        });
        
        // Run every day at 10 AM
        cron.schedule('0 10 * * *', () => {
            this.sendPaymentReminders();
        });
        
        console.log('Reminder service started');
    }
    
    async sendExpiryReminders() {
        try {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            
            const expiringIn3Days = await Member.find({
                expiryDate: { $gte: new Date(), $lte: threeDaysFromNow },
                isActive: true
            }).populate('planId');
            
            const expiringIn7Days = await Member.find({
                expiryDate: { $gte: threeDaysFromNow, $lte: sevenDaysFromNow },
                isActive: true
            }).populate('planId');
            
            for (const member of expiringIn3Days) {
                await this.sendWhatsAppReminder(member, 3);
                await this.sendSMSReminder(member, 3);
            }
            
            for (const member of expiringIn7Days) {
                await this.sendSMSReminder(member, 7);
            }
            
            console.log(`Sent reminders to ${expiringIn3Days.length + expiringIn7Days.length} members`);
        } catch (error) {
            console.error('Error sending expiry reminders:', error);
        }
    }
    
    async sendPaymentReminders() {
        try {
            const fiveDaysFromNow = new Date();
            fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
            
            const expiredMembers = await Member.find({
                expiryDate: { $lt: fiveDaysFromNow },
                isActive: true
            });
            
            for (const member of expiredMembers) {
                const daysOverdue = Math.ceil((new Date() - member.expiryDate) / (1000 * 60 * 60 * 24));
                if (daysOverdue <= 5) {
                    await this.sendPaymentReminder(member, daysOverdue);
                }
            }
        } catch (error) {
            console.error('Error sending payment reminders:', error);
        }
    }
    
    async sendWhatsAppReminder(member, daysLeft) {
        if (!this.client) return;
        
        try {
            const message = `Gym Membership Reminder\n\nHello ${member.name},\n\nYour membership will expire in ${daysLeft} days.\n\nPlan: ${member.planId?.name}\nExpiry Date: ${member.expiryDate.toLocaleDateString()}\n\nPlease renew your membership to continue enjoying our services.\n\nThank you!`;
            
            await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: `whatsapp:${member.phone}`
            });
            
            console.log(`WhatsApp reminder sent to ${member.phone}`);
        } catch (error) {
            console.error('WhatsApp send failed:', error);
        }
    }
    
    async sendSMSReminder(member, daysLeft) {
        if (!this.client) return;
        
        try {
            const message = `Gym Alert: ${member.name}, your membership expires in ${daysLeft} days. Renew now to avoid interruption.`;
            
            await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: member.phone
            });
            
            console.log(`SMS reminder sent to ${member.phone}`);
        } catch (error) {
            console.error('SMS send failed:', error);
        }
    }
    
    async sendPaymentReminder(member, daysOverdue) {
        if (!this.client) return;
        
        try {
            const message = `Payment Reminder\n\nYour gym membership payment is ${daysOverdue} days overdue.\n\nPlease make the payment at your earliest convenience to reactivate your membership.\n\nContact: ${process.env.GYM_PHONE}`;
            
            await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: `whatsapp:${member.phone}`
            });
        } catch (error) {
            console.error('Payment reminder failed:', error);
        }
    }
}

module.exports = new ReminderService();
