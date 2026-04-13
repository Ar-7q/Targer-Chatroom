require('dotenv').config()
const crypto = require('crypto');
const hashService = require('./hash-service');

const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const twilio = require('twilio')(smsSid, smsAuthToken, {
    lazyLoading: true,
});

// const { Resend } = require('resend')
// const resend = new Resend(process.env.RESEND_API_KEY);

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class OtpService {
    async generateOtp() {
        const otp = crypto.randomInt(1000, 9999);
        return otp;
    }

    async sendBySms(phone, otp) {
        return await twilio.messages.create({
            to: phone,
            from: process.env.SMS_FROM_NUMBER,
            body: `Your codershouse OTP is ${otp}`,
        });
    }

    // NEW
    // async sendByEmail(email, otp) {
    //     console.log(`📧 OTP for ${email}: ${otp}`);
    //     return true;
    // }


    // RESEND EMAIL OTP VERIFICATION
    // async sendByEmail(email, otp) {
    //     return await resend.emails.send({
    //         from: process.env.EMAIL_FROM,
    //         to: email,
    //         subject: 'Your OTP Code',
    //         html: `
    //         <div style="font-family:sans-serif">
    //             <h2>Your OTP is: ${otp}</h2>
    //             <p>This OTP expires in 2 minutes.</p>
    //         </div>
    //     `,
    //     });
    // }

    //SENDGRID EMAIL OTP VERIFICATION
    async sendByEmail(email, otp) {
        try {
            const msg = {
                to: email,
                from: process.env.EMAIL_FROM,
                subject: 'Your OTP Verification Code',
                html: `
                <div style="font-family:sans-serif">
                    <h2>Your OTP is: ${otp}</h2>
                    <p>This OTP expires in 2 minutes.</p>
                </div>
            `,
            };

            await sgMail.send(msg);
            return true;
        } catch (error) {
            console.log('SendGrid Error:', error);
            throw error;
        }
    }

    verifyOtp(hashedOtp, data) {
        let computedHash = hashService.hashOtp(data);
        return computedHash === hashedOtp;
    }
}

module.exports = new OtpService();