/**
 * Created by alex on 8/17/16.
 */
(function(){
    'use strict';
    
    var nodemailer = require('nodemailer');

    var transporter = null;
    var pwdResetSender = null;
    var pwdChangedSender = null;

    module.exports.getPwdResetSender = getPwdResetSender;
    module.exports.getPwdChangedSender = getPwdChangedSender;

    //Todo:  nodemailer maybe have performance issue since it does take a few seconds to send out a mail.
    //Todo: nodemailer is not stable since forgot request or reset service is often failed because "connection closed" error is raised from time to time.

    //refer to https://github.com/nodemailer/nodemailer
    //https://github.com/nodemailer/nodemailer-wellknown#supported-services

    //too heavy or complex for external template:
    //sample: https://github.com/nodemailer/nodemailer/blob/master/examples/template/email-templates.js
    //path sample: https://github.com/nodemailer/nodemailer/blob/master/test/nodemailer-test.js
    //https://github.com/crocodilejs/node-email-templates
    function getTransporter() {
        if(!transporter) {
            transporter = nodemailer.createTransport({
                service: 'Hotmail',
                auth: {
                    user: 'wbin_666@hotmail.com',
                    pass: 'twwb1228'
                }
            });
        }

        return transporter;
    }
    
    function getPwdResetSender(){
        if(!pwdResetSender) {
            pwdResetSender = getTransporter().templateSender({
                subject: 'Password reset for {{username}}!',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://{{host}}/initreset/{{token}}' + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            }, {
                from: 'wbin_666@hotmail.com'
            });
        }

        return pwdResetSender;
    }

    function getPwdChangedSender(){
        if(!pwdChangedSender) {
            pwdChangedSender = getTransporter().templateSender({
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account {{useremail}} has just been changed.\n'
            }, {
                from: 'wbin_666@hotmail.com'
            });
        }

        return pwdChangedSender;
    }

})();
