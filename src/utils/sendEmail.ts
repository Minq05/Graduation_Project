import nodemailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import configEnv from '~/config/env'

const transporter = nodemailer.createTransport({
  host: configEnv.email.host,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: configEnv.email.auth.user,
    pass: configEnv.email.auth.pass
  }
})

export const sendEmail = async (to: string, subject: string, templateName: string, data: object) => {
  const templatePath = path.join(__dirname, '../views', `${templateName}.ejs`)

  // Render EJS template thành HTML
  const html = await ejs.renderFile(templatePath, data)

  // Gửi email
  const mailOptions = {
    from: configEnv.email.auth.user,
    to,
    subject,
    html
  }

  await transporter.sendMail(mailOptions)
  console.log(`Email sent to ${to}`)
}
