import express from 'express'
import { userRoute } from './user.routes'
import { authRoute } from './auth.routes'
import { brandRoute } from './brand.routes'
import { discountsRoute } from './discounts.routes'
import { cateblogRoute } from './blogcategory.routes'
import { blogRoute } from './blog.routes'
import { categoryRoute } from './category.routes'
import { fileRoute } from './file.route'
import { notificationRoute } from './notification.routes'
import { productRoute } from './product.routes'
import { productVariantRoute } from './product-variant.routes'
import { contactRoute } from './contact.routes'
import { attributeRoute } from './attribute.routes'
import { variantAttributesRoute } from './variantAttribute.routes'
import { CartItemRoute } from './cartitem.routes'
import { CartRoute } from './cart.routes'
import { orderRoute } from './order.route'
import { flashSaleRoute } from './flash_sale.routes'
import { flashSaleItemRoute } from './flash_sale_item.routes'
import { cronJobRoute } from './cron_job.routes'
import { wishlistRoute } from './wishlist.routes'
import { vnpayRoute } from './vnpay.routes'
import ghnRoutes from './ghn.routes'
import { shippingRoute } from './shipping.routes'

const Router = express.Router()

Router.use('/users', userRoute)
Router.use('/blogs', blogRoute)
Router.use('/auth', authRoute)
Router.use('/brand', brandRoute)
Router.use('/discounts', discountsRoute)
Router.use('/cateblog', cateblogRoute)
Router.use('/products', productRoute)
Router.use('/variants', productVariantRoute)
Router.use('/attributes', attributeRoute)
Router.use('/variantsat', variantAttributesRoute)
Router.use('/categories', categoryRoute)
Router.use('/files', fileRoute)
Router.use('/notifications', notificationRoute)
Router.use('/contacts', contactRoute)
Router.use('/orders', orderRoute)
Router.use('/cartitems', CartItemRoute)
Router.use('/carts', CartRoute)
Router.use('/flashsales', flashSaleRoute)
Router.use('/flashsales-item', flashSaleItemRoute)
Router.use('/cron-jobs', cronJobRoute)
Router.use('/wishlist', wishlistRoute)
Router.use('/wishlists', wishlistRoute)
Router.use('/vnpay', vnpayRoute)
Router.use('/ghn', ghnRoutes)
Router.use('/shipping', shippingRoute)

export const APIs_v1 = Router
