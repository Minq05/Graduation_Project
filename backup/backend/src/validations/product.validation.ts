import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const metaDataRefSchema = Joi.object({
  _id: Joi.string()
    .required()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('ID không hợp lệ'),

  email: Joi.string().email().optional().trim()
})

const attributeValueSchema = Joi.object({
  attributeId: Joi.string().required().trim().messages({
    'string.base': 'ID thuộc tính phải là chuỗi',
    'string.empty': 'ID thuộc tính không được để trống',
    'any.required': 'ID thuộc tính là bắt buộc'
  }),
  value: Joi.string().required().trim().messages({
    'string.base': 'Giá trị thuộc tính phải là chuỗi',
    'string.empty': 'Giá trị thuộc tính không được để trống',
    'any.required': 'Giá trị thuộc tính là bắt buộc'
  })
})

const variantsSchema = Joi.object({
  sku: Joi.string().required().trim().messages({
    'string.base': 'SKU phải là chuỗi',
    'string.empty': 'SKU không được để trống',
    'any.required': 'SKU là trường bắt buộc'
  }),
  price: Joi.number().required().min(0).messages({
    'number.base': 'Giá biến thể phải là số',
    'number.min': 'Giá biến thể không được nhỏ hơn 0',
    'any.required': 'Giá biến thể là bắt buộc'
  }),
  stock: Joi.number().required().min(0).messages({
    'number.base': 'Số lượng tồn kho biến thể phải là số',
    'number.min': 'Số lượng tồn kho biến thể không được nhỏ hơn 0',
    'any.required': 'Số lượng tồn kho biến thể là bắt buộc'
  }),
  image: Joi.string().uri().allow('', null).optional().messages({
    'string.uri': 'Ảnh biến thể phải là URL hợp lệ'
  }),
  attributes: Joi.array().items(attributeValueSchema).required().min(1).messages({
    'array.base': 'attributes phải là mảng',
    'array.min': 'Phải có ít nhất một thuộc tính',
    'any.required': 'attributes là bắt buộc'
  })
})

const createProductValidation = async (req: Request, res: Response, next: NextFunction) => {
  const productValidationSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(255).messages({
      'string.base': 'Tên sản phẩm phải là chuỗi',
      'string.empty': 'Tên sản phẩm không được để trống',
      'any.required': 'Tên sản phẩm là trường bắt buộc',
      'string.min': 'Tên sản phẩm tối thiểu 2 ký tự',
      'string.max': 'Tên sản phẩm tối đa 255 ký tự'
    }),
    slug: Joi.string()
      .optional()
      .trim()
      .min(3)
      .max(255)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .messages({
        'string.empty': 'Slug không được để trống',
        'string.pattern.base': 'Slug không hợp lệ (chỉ chữ thường, số và dấu gạch ngang)'
      }),
    price: Joi.number().optional().min(0).messages({
      'number.base': 'Giá sản phẩm phải là số',
      'number.min': 'Giá sản phẩm không được nhỏ hơn 0'
    }),
    description: Joi.string().optional().allow('').trim(),
    categoryId: Joi.string()
      .optional()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'categoryId phải là ObjectId hợp lệ'
      }),
    brandId: Joi.string()
      .optional()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'brandId phải là ObjectId hợp lệ'
      }),
    image: Joi.array().items(Joi.string().uri()).optional().messages({
      'string.uri': 'image phải là URL hợp lệ'
    }),
    stock: Joi.number().optional().min(0).messages({
      'number.base': 'stock phải là số',
      'number.min': 'stock không được nhỏ hơn 0'
    }),
    capacity: Joi.number().optional().min(0).messages({
      'number.base': 'Dung tích sản phẩm phải là số',
      'number.min': 'Dung tích sản phẩm không được nhỏ hơn 0'
    }),
    variants: Joi.array().items(variantsSchema).optional().messages({
      'array.base': 'variants phải là mảng'
    })
  })

  try {
    await productValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllProductValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllProductValidationSchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  }).unknown(true)
  try {
    await fetchAllProductValidationSchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoProductValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchInfoProductValidationSchema = Joi.object({
    productId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('productId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await fetchInfoProductValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateProductValidation = async (req: Request, res: Response, next: NextFunction) => {
  const productValidationSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(255).messages({
      'string.base': 'Tên sản phẩm phải là chuỗi',
      'string.empty': 'Tên sản phẩm không được để trống',
      'any.required': 'Tên sản phẩm là trường bắt buộc',
      'string.min': 'Tên sản phẩm tối thiểu 2 ký tự',
      'string.max': 'Tên sản phẩm tối đa 255 ký tự'
    }),
    slug: Joi.string()
      .optional()
      .trim()
      .min(3)
      .max(255)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .messages({
        'string.empty': 'Slug không được để trống',
        'string.pattern.base': 'Slug không hợp lệ (chỉ chữ thường, số và dấu gạch ngang)'
      }),
    price: Joi.number().optional().min(0).messages({
      'number.base': 'Giá sản phẩm phải là số',
      'number.min': 'Giá sản phẩm không được nhỏ hơn 0'
    }),
    description: Joi.string().optional().allow('').trim(),
    categoryId: Joi.string()
      .optional()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'categoryId phải là ObjectId hợp lệ'
      }),
    brandId: Joi.string()
      .optional()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'brandId phải là ObjectId hợp lệ'
      }),
    image: Joi.array().items(Joi.string().uri()).optional().messages({
      'string.uri': 'image phải là URL hợp lệ'
    }),
    stock: Joi.number().optional().min(0).messages({
      'number.base': 'stock phải là số',
      'number.min': 'stock không được nhỏ hơn 0'
    }),
    capacity: Joi.number().optional().min(0).messages({
      'number.base': 'Dung tích sản phẩm phải là số',
      'number.min': 'Dung tích sản phẩm không được nhỏ hơn 0'
    }),
    variants: Joi.array().items(variantsSchema).optional().messages({
      'array.base': 'variants phải là mảng'
    })
  })

  try {
    await productValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteProductValidation = async (req: Request, res: Response, next: NextFunction) => {
  const deleteProductValidationSchema = Joi.object({
    productId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('productId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await deleteProductValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchProductsByIdsValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    ids: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).required().messages({
  'any.required': 'Tham số ids là bắt buộc',
  'string.pattern.base': 'Mỗi ID trong ids phải là ObjectId hợp lệ'
})
  })

  try {
    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}


export const productValidation = {
  createProductValidation,
  fetchAllProductValidation,
  fetchInfoProductValidation,
  updateProductValidation,
  deleteProductValidation,
  fetchProductsByIdsValidation
}
