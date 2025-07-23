import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createBlogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const createBlogSchema = Joi.object({
    title: Joi.string().required().min(3).max(255).trim().messages({
      'string.empty': 'Tiêu đề không được để trống',
      'any.required': 'Tiêu đề là trường bắt buộc'
    }),
    slug: Joi.string().required().trim().messages({
      'string.empty': 'Slug không được để trống',
      'any.required': 'Slug là trường bắt buộc'
    }),
    image: Joi.string().required().trim().messages({
      'string.empty': 'Ảnh không được để trống',
      'any.required': 'Ảnh là trường bắt buộc'
    }),
    content: Joi.string().required().trim().messages({
      'string.empty': 'Nội dung không được để trống',
      'any.required': 'Nội dung là trường bắt buộc'
    }),
    isPublic: Joi.boolean().optional().default(false).messages({
      'boolean.base': 'isPublic phải là boolean',
      'any.default': 'isPublic sẽ mặc định là false nếu không được cung cấp'
    }),
    categoryBlogId: Joi.string().trim().length(24).hex().required().label('categoryBlogId').messages({
      'string.base': 'categoryBlogId phải là chuỗi',
      'string.length': 'categoryBlogId phải có độ dài 24 ký tự',
      'string.hex': 'categoryBlogId phải là chuỗi hex hợp lệ',
      'any.required': 'categoryBlogId là trường bắt buộc'
    })
  })
  try {
    await createBlogSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const fetchAllBlogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllBlogSchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await fetchAllBlogSchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const fetchInfoBlogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchInfoBlogSchema = Joi.object({
    blogId: Joi.string().trim().length(24).hex().required().label('blogId').messages({
      'string.base': 'blogId phải là chuỗi',
      'string.length': 'blogId phải có độ dài 24 ký tự',
      'string.hex': 'blogId phải là chuỗi hex hợp lệ',
      'any.required': 'blogId là trường bắt buộc'
    })
  })
  try {
    await fetchInfoBlogSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const updateBlogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const updateBlogSchema = Joi.object({
    title: Joi.string().optional().min(3).max(255).trim(),
    slug: Joi.string().optional().trim(),
    content: Joi.string().optional().trim(),
    image: Joi.string().required().trim().messages({
      'string.empty': 'Ảnh không được để trống',
      'any.required': 'Ảnh là trường bắt buộc'
    }),
    categoryBlogId: Joi.string().trim().length(24).hex().optional().label('categoryBlogId').messages({
      'string.base': 'categoryBlogId phải là chuỗi',
      'string.length': 'categoryBlogId phải có độ dài 24 ký tự',
      'string.hex': 'categoryBlogId phải là chuỗi hex hợp lệ'
    }),
    isPublic: Joi.boolean().optional().default(false).messages({
      'boolean.base': 'isPublic phải là boolean',
      'any.default': 'isPublic sẽ mặc định là false nếu không được cung cấp'
    })
  })
  try {
    await updateBlogSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const updateBlogStatusValidation = async (req: Request, res: Response, next: NextFunction) => {
  const paramsSchema = Joi.object({
    blogId: Joi.string().trim().length(24).hex().required().label('blogId').messages({
      'string.base': 'blogId phải là chuỗi',
      'string.length': 'blogId phải có độ dài 24 ký tự',
      'string.hex': 'blogId phải là chuỗi hex hợp lệ',
      'any.required': 'blogId là trường bắt buộc'
    })
  })

  const bodySchema = Joi.object({
    isPublic: Joi.boolean().required().messages({
      'any.required': 'isPublic là trường bắt buộc',
      'boolean.base': 'isPublic phải là boolean'
    })
  }).unknown(true)

  try {
    await paramsSchema.validateAsync(req.params, { abortEarly: false })
    await bodySchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const deleteBlogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const deleteBlogSchema = Joi.object({
    blogId: Joi.string().trim().length(24).hex().required().label('blogId').messages({
      'string.base': 'blogId phải là chuỗi',
      'string.length': 'blogId phải có độ dài 24 ký tự',
      'string.hex': 'blogId phải là chuỗi hex hợp lệ',
      'any.required': 'blogId là trường bắt buộc'
    })
  })
  try {
    await deleteBlogSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const fetchBlogByCategoryValidation = async (req: Request, res: Response, next: NextFunction) => {
  const paramsSchema = Joi.object({
    categoryId: Joi.string().trim().length(24).hex().required().label('categoryId').messages({
      'string.base': 'categoryId phải là chuỗi',
      'string.length': 'categoryId phải có độ dài 24 ký tự',
      'string.hex': 'categoryId phải là chuỗi hex hợp lệ',
      'any.required': 'categoryId là trường bắt buộc'
    })
  })

  const querySchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })

  try {
    await paramsSchema.validateAsync(req.params, { abortEarly: false })
    await querySchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}



export const blogValidation = {
  createBlogValidation,
  fetchAllBlogValidation,
  fetchInfoBlogValidation,
  updateBlogValidation,
  updateBlogStatusValidation,
  deleteBlogValidation,
  fetchBlogByCategoryValidation
}
