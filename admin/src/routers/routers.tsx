import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import NotFoundPage from '@/pages/not-found.page'
import DashboardPage from '@/pages/dashboard/dashboard.page'
import LayoutPage from '@/pages/layout.page'
import UserPage from '@/pages/user/user.page'
import ProductPage from '@/pages/product/product.page'
import Brand from '@/pages/brand/brand.page'
import BlogCategoryPage from '@/pages/blog/category/blogCategory.page'
import CategoryList from '@/pages/category/category.page'
import CategoryAdd from '@/pages/category/form.category.add'
import CategoryEdit from '@/pages/category/form.category.edit'
import BlogPage from '@/pages/blog/blog.page'
import FormBlogAdd from '@/pages/blog/form.blog.add'
import FormBlogEdit from '@/pages/blog/form.blog.edit'
import RolePage from '@/pages/role/role.page'
import PermissionsPage from '@/pages/permission/permissions.page'
import AdminContactPage from '@/pages/contact/contact.page'
import Discounts from '@/pages/discounts/discounts.pages'
import DiscountsAdd from '@/pages/discounts/discounts.add'
import DiscountsUpdate from '@/pages/discounts/discounts.update'
import FormProductAdd from '@/pages/product/product.form'
import FormProductEdit from '@/pages/product/form.product.edit'
import ProductVariantsPage from '@/pages/productVariant/productVariant.page'
import AttributePage from '@/pages/attribute/attribute.page'
import VariantAttributePage from '@/pages/variantsat/variantAttribute.page'
import MediaPage from '@/pages/media/media.page'
import SigninPage from '@/pages/auth/signin.page'
import { useAppSelector } from '@/redux/hooks'
import NotificationList from '@/pages/notification/notification.page'
import NotificationAdd from '@/pages/notification/form.notification.add'
import ContactAddPage from '@/pages/contact/contact.form.add'
import OrderPage from '@/pages/orders/orders_items.page'
import OrderItemAddPage from '@/pages/orders/orders_items.page.add'
import ProductAddPage from '@/pages/product/product.add.page'
import ProductUpdatePage from '@/pages/product/product.update.page'
import FlashSalePage from '@/pages/flash_sale/flash-sale.page'
import ShippingPage from '@/pages/shipping/shipping.page'
import ReviewsPage from '@/pages/reviews/reviews.page'


const Routers = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isSignin)

  return (
    <Routes>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? true : false} redirectTo='/signin' />}>
        <Route path='/' element={<LayoutPage />}>
          <Route index element={<DashboardPage />} />
          <Route path='/users' element={<UserPage />} />
          <Route path='/products' element={<ProductPage />} />
          <Route path='/variants' element={<ProductVariantsPage />} />
          <Route path='/attributes' element={<AttributePage />} />
          <Route path='/variantsat' element={<VariantAttributePage />} />
          <Route path='/products/add' element={<ProductAddPage />} />
          <Route path='/products/edit/:id' element={<ProductUpdatePage />} />
          <Route path='/cateblog' element={<BlogCategoryPage />} />
          <Route path='/blogCategory' element={<BlogCategoryPage />} />
          <Route path="/categories" element={<CategoryList />} />
          {/* <Route path="/categories/add" element={<CategoryAdd/>} />
          <Route path="/categories/edit/:id" element={<CategoryEdit />} /> */}
          <Route path='/notification' element={<NotificationList/>}/>
          {/* <Route path='/notification/add' element={<NotificationAdd />}/> */}

          <Route path="/categories/add" element={<CategoryAdd/>} />
          <Route path="/categories/edit/:id" element={<CategoryEdit />} />
          <Route path='/blogs' element={<BlogPage />} />
          <Route path='/blogs/add' element={<FormBlogAdd />} />
          <Route path='/blogs/edit/:id' element={<FormBlogEdit />} />
          <Route path='/brand' element={<Brand />} />
          <Route path='/discounts' element={<Discounts />} />
          <Route path='/discounts/add' element={<DiscountsAdd />} />
          <Route path='/discounts/update/:id' element={<DiscountsUpdate />} />
          <Route path='/roles' element={<RolePage />} />
          <Route path='/permissions' element={<PermissionsPage />} />
          <Route path='/contact' element={<AdminContactPage />} />
          <Route path='/contact/add' element={<ContactAddPage />} />
          <Route path='/reviews' element={<ReviewsPage />} />

          <Route path='/orderitems' element={<OrderPage />} />
          <Route path='/orderitems/add' element={<OrderItemAddPage />} />


          <Route path='/media' element={<MediaPage />} />
          <Route path='/flash-sales' element={<FlashSalePage />} />
          <Route path='/shipping' element={<ShippingPage />} />
        </Route>
      </Route>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? false : true} redirectTo='/' />}>
        <Route path='/signin' element={<SigninPage />} />
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default Routers
