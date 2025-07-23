import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import NotFoundPage from '@/pages/not-found.page'
import LayoutPage from '@/pages/layout.page'
import HomePage from '@/pages/home/home.page'
import ProductPage from '@/pages/product/product.page'
import SigninPage from '@/pages/auth/signin.page'
import SignupPage from '@/pages/auth/signup.page'
import { useAppSelector } from '@/redux/hooks'
import VerificationPage from '@/pages/auth/verification.page'
import AccountPage from '@/pages/account/account-info/account.page'
import LayoutAccountPage from '@/pages/account/layout.account.page'
import AddressForm from '@/pages/account/account-info/address.form'
import BlogPage from '@/pages/blog/blog.page'
import CartPage from '@/pages/cart/cart.page'
import WishlistPage from '@/pages/wishlist/wishlist.page'
import BlogDetailPage from '@/pages/blog/blog.detail.page'
import CheckoutBilling from '@/pages/checkout/checkout.billing'
import ForgotPasswordPage from '@/pages/auth/forgotpassword.page'
import ResetPasswordPage from '@/pages/auth/resetpassword.page'
import VerifyCodePage from '@/pages/auth/verifycode.page'
import AboutPage from '@/pages/introduce/introduce.page'
import VNPayReturnPage from '@/pages/payment/vnpay-return.page'
import { ContactForm } from '@/pages/contact/contact.pages'
import ProductDetail from '@/pages/productDetail/product.detail'
import MyOrders from '@/pages/order/order.pages'
import OrderDetails from '@/pages/order/order.detail.pages'

const Routers = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isSignin)

  return (
    <Routes>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? true : false} redirectTo='/signin' />}>
        <Route path='/' element={<LayoutPage />}>
          <Route index element={<HomePage />} />
          <Route path='shops' element={<ProductPage />} />
          <Route path='blogs' element={<BlogPage />} />
          <Route path='productDetail/:id' element={<ProductDetail />} />
          <Route path='checkout' element={<CheckoutBilling />} />
          <Route path='contact' element={<ContactForm />} />
          <Route path='blogs/:blogId' element={<BlogDetailPage />} />
          <Route path='account/:id' element={<LayoutAccountPage />}>
            <Route path='wishlist' element={<WishlistPage />} />
            <Route index element={<AccountPage />} />
            <Route path='add-address' element={<AddressForm />} />
            <Route path='order' element={<MyOrders />} />
            <Route path='order/detail/:orderId' element={<OrderDetails />} />


          </Route>
          <Route path='cart' element={<CartPage />} />
          <Route path='about' element={<AboutPage />} />
        </Route>
      </Route>
      <Route path='payment/vnpay-return' element={<VNPayReturnPage />} />
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? false : true} redirectTo='/' />}>
        <Route path='/signin' element={<SigninPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/verify-code' element={<VerificationPage />} />
        <Route path='/verifycode' element={<VerifyCodePage />} />
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default Routers