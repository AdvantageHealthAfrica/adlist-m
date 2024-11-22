const nodemailer = require("nodemailer");

export var transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_SECRET_KEY
  },
})