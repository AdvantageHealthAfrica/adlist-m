import { btoa } from "buffer";
const axios = require('axios');
import { transporter } from "./nodemailer.transporter";

export class NodeMailerSendEMail{

  async sendPasswordResetToken(email: string, token: number) {
    let message = {
      from: "zoom@ahaafrica.info",
      to: `${email}`,
      subject: "Agent Password Reset on TheAdvantage",
      text: `Dear User, \nA password reset request has been received for the account associated with the email address: ${email}. \nIf you did not request this, please ignore this message. \nOtherwise, you can reset your password by with the token:${token} \nThank you, \nAHA!`
    }

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.error(err);
      }else {
          console.log('Message sent: ' + info.response)
      }
      // transporter.close()
    })
  }
}