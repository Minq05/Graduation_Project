import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  phone: z.string().min(9, 'Số điện thoại quá ngắn').max(12, 'Số điện thoại quá dài'),
  message: z.string().min(1, 'Vui lòng nhập tin nhắn')
})

export type ContactFormProps = z.infer<typeof contactSchema>