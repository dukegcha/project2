const nodemailer = require('nodemailer');
const db = require('../database'); // Import the database connection

let transporter;

// This function sets up the email transporter
async function setupEmail() {
  // Generate a test account from Ethereal
  let testAccount = await nodemailer.createTestAccount();

  console.log('Ethereal test account created:');
  console.log(`User: ${testAccount.user}`);
  console.log(`Password: ${testAccount.pass}`);

  // Create a transporter object using the Ethereal account
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// This function sends the reservation confirmation email
function sendConfirmationEmail(reservationDetails) {
  if (!transporter) {
    return console.error('Email transporter is not set up.');
  }

  // Fetch the email template from the database
  db.get('SELECT subject, body FROM EmailTemplates WHERE name = ?', ['reservation_confirmation'], (err, template) => {
    if (err) {
      return console.error('Error fetching email template:', err.message);
    }
    if (!template) {
      return console.error('Reservation confirmation template not found.');
    }

    // Replace placeholders in the template
    const reservationDate = new Date(reservationDetails.reservation_time);
    const formattedDate = reservationDate.toLocaleDateString();
    const formattedTime = reservationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let mailSubject = template.subject;
    let mailBody = template.body
      .replace('{name}', reservationDetails.name)
      .replace('{party_size}', reservationDetails.party_size)
      .replace('{date}', formattedDate)
      .replace('{time}', formattedTime);

    const mailOptions = {
      from: `"Restaurant" <${transporter.options.auth.user}>`,
      to: reservationDetails.email,
      subject: mailSubject,
      text: mailBody,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      // Only log the preview URL for Ethereal emails
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Confirmation email sent. Preview it at: ' + previewUrl);
      } else {
        console.log('Confirmation email sent successfully to ' + reservationDetails.email);
      }
    });
  });
}

module.exports = { setupEmail, sendConfirmationEmail };
