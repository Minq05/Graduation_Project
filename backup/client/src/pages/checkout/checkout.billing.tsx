import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CART_KEYS } from '@/services/cart-service/cart.keys'
import { deleteCartItemAPI, deleteItemFromCartAPI } from '@/services/cart-service/cart.apis'
import { useAppSelector } from '@/redux/hooks'
import { formatCurrencyVND } from '@/utils/utils'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchAllAddressByUserAPI } from '@/services/user-service/user.apis'
import { toast } from 'react-toastify'
import { createOrderAPI } from '@/services/order-service/order.apis'
import { createVNPayPaymentAPI } from '@/services/vnpay-service/vnpay.apis'
import PaymentLoading from '@/components/payment/payment-loading'
import { useNavigate, useLocation } from 'react-router'
import { USER_KEYS } from '@/services/user-service/user.keys'
import DiscountInput from '@/components/DiscountInput'


const formSchema = z.object({
  receiverName: z.string().min(2, {
    message: 'Tên người nhận không được để trống.'
  }),
  receiverPhone: z.string().min(10, {
    message: 'Số điện thoại không hợp lệ.'
  }),
  province: z.string().min(2, {
    message: 'Thông tin không được để trống.'
  }),
  district: z.string().min(2, {
    message: 'Thông tin không được để trống.'
  }),
  ward: z.string().min(2, {
    message: 'Thông tin không được để trống.'
  }),
  address: z.string().min(2, {
    message: 'Thông tin không được để trống.'
  })
})

const CheckoutForm = () => {
  const [shippingAddress, setShippingAddress] = useState('same')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [addressFormData, setAddressFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    province: '',
    district: '',
    ward: '',
    address: ''
  })
  const [selectedCartItems, setSelectedCartItems] = useState<any[]>([])
  const cartId = useAppSelector((state) => state.cart.IdCartUser)
  const userId = useAppSelector((state) => state.auth.user?._id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  // Lấy sản phẩm đã chọn từ trang cart
  useEffect(() => {
    if (location.state?.selectedCartItems) {
      setSelectedCartItems(location.state.selectedCartItems)
    }
    if (location.state?.appliedDiscount) {
      setAppliedDiscount(location.state.appliedDiscount)
    }
  }, [location.state])

  const { data: listAddresses } = useQuery({
    queryKey: [USER_KEYS.FETCH_ALL_ADDRESS_BY_USER, userId],
    queryFn: async () => {
      if (!userId) return []
      const res = await fetchAllAddressByUserAPI(userId)
      if (res && res.data) {
        res.data.forEach((address) => {
          if (address.isPrimary) {
            setSelectedAddress(address)
          }
        })
        return res.data
      } else {
        return []
      }
    },
    enabled: !!cartId
  })

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await deleteCartItemAPI(cartId as string)
      return res.data || res
    },
    onSuccess: () => {
      console.log('Cart cleared successfully')
    },
    onError: (error) => {
      console.error('Error clearing cart:', error)
      toast.error('Không thể làm sạch giỏ hàng!')
    }
  })

  const removeOrderedItems = async () => {
    if (!cartId || !selectedCartItems.length) return
    await Promise.all(
      selectedCartItems.map(item =>
        deleteItemFromCartAPI(cartId, item._id)
      )
    )
    queryClient.invalidateQueries({ queryKey: [CART_KEYS.FETCH_LIST_CART] })
  }

  const createOrderMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (data: any) => {
      const res = await createOrderAPI(data)
      return res.data || res
    },
    onSuccess: async (response) => {
      const orderData = response.data || response
      await removeOrderedItems()
      queryClient.invalidateQueries({ queryKey: [CART_KEYS.FETCH_LIST_CART] })

      const subtotal = selectedCartItems?.reduce((acc, item) => acc + (item.variantId?.price * item.quantity), 0) || 0
      const shippingPrice = getShippingFee()
      const discountAmount = appliedDiscount?.discountAmount || 0
      const calculatedTotalPrice = subtotal + shippingPrice - discountAmount

      if (paymentMethod === 'vnpay') {
        handleVNPayPayment(orderData._id, calculatedTotalPrice)
      } else {
        toast.success('Đặt hàng thành công!')
        navigate('/', { replace: true })
      }
    },
    onError: (error) => {
      console.error('Error creating order:', error)
      toast.error('Đặt hàng thất bại!')
    }
  })

  const vnpayPaymentMutation = useMutation({
    mutationFn: createVNPayPaymentAPI,
    onSuccess: (response) => {
      const paymentUrl = response?.paymentUrl || response?.data?.paymentUrl
      if (paymentUrl) {
        try {
          localStorage.setItem('lastOrderId', response?.data?.orderId || '')
          localStorage.setItem('lastOrderTime', new Date().toISOString())
        } catch (e) {
          console.error('Error saving order info to localStorage:', e)
        }
        window.location.href = paymentUrl
      } else {
        toast.error('Không nhận được URL thanh toán từ VNPay!')
      }
    },
    onError: (error) => {
      console.error('VNPay payment error:', error)
      toast.error('Không thể tạo liên kết thanh toán VNPay!')
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      province: '',
      district: '',
      ward: '',
      address: ''
    }
  })


  const handleSubmitAddress = (values: z.infer<typeof formSchema>) => {
    setAddressFormData({
      receiverName: values.receiverName,
      receiverPhone: values.receiverPhone,
      province: values.province,
      district: values.district,
      ward: values.ward,
      address: values.address
    })
    toast.success('Địa chỉ đã được lưu thành công!')
  }

  const handleVNPayPayment = (orderId: string, amount: number) => {
    vnpayPaymentMutation.mutate({
      amount: amount,
      orderId: orderId,
      orderInfo: `Thanh toán đơn hàng ${orderId}`
    })
  }

  const handleCreateOrder = () => {
    if (shippingAddress === 'different') {
      const formValues = form.getValues()
      const { receiverName, receiverPhone, province, district, ward, address } = formValues
      if (!receiverName || !receiverPhone || !province || !district || !ward || !address) {
        toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng')
        return
      }
      setAddressFormData(formValues)
    } else if (shippingAddress === 'same' && !selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }

    if (!selectedCartItems || selectedCartItems.length === 0) {
      toast.error('Không có sản phẩm nào để đặt hàng!')
      return
    }

    const currentAddressData = shippingAddress === 'different' ? form.getValues() : null

    const subtotal = selectedCartItems?.reduce((acc, item) => acc + (item.variantId?.price * item.quantity), 0) || 0
    const shippingPrice = getShippingFee()
    const discountAmount = appliedDiscount?.discountAmount || 0
    const totalPrice = subtotal + shippingPrice - discountAmount

    // Lấy ghi chú hiện tại (nếu có)
    const currentNote = form.getValues()?.note || '';
    
    // Tạo ghi chú mới với tiền tố GHN nếu cần
    // Đảm bảo note không bao giờ rỗng
    const noteWithPrefix = needsShippingOrder() 
      ? `[GHN] ${currentNote || 'Đơn hàng Giao Hàng Nhanh'}` 
      : (currentNote || 'Đơn hàng mới');
    
    const dataSubmit = {
      userId: userId,
      addressId: shippingAddress === 'same' ? selectedAddress?._id || null : null,
      addressFree: shippingAddress === 'different' ? currentAddressData : null,
      totalPrice: totalPrice,
      shippingPrice: shippingPrice,
      discountId: appliedDiscount?.discount?._id || undefined,
      status: 'pending',
      shippingMethod: getApiShippingMethod(),
      note: noteWithPrefix,
      paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'pending',
      paymentMethod: paymentMethod,
      items: selectedCartItems?.map(item => ({
        productId: item.productId?._id,
        variantId: item.variantId?._id,
        quantity: item.quantity,
        price: item.variantId?.price
      }))
    }

    createOrderMutation.mutate(dataSubmit)
  }

  // Tính toán tổng tiền
  const subtotal = selectedCartItems?.reduce((acc, item) => acc + (item.variantId?.price * item.quantity), 0) || 0
  const getShippingFee = () => {
    if (selectedCartItems?.length === 0) return 0;
    
    switch (shippingMethod) {
      case 'standard': return 30000;
      case 'express-ghn': return 45000;
      case 'express': return 60000;
      default: return 30000;
    }
  }
  
  // Kiểm tra xem phương thức vận chuyển có cần tạo vận đơn không
  const needsShippingOrder = () => {
    return shippingMethod === 'express-ghn';
  }
  
  // Chuyển đổi giá trị phương thức vận chuyển để gửi đến API
  const getApiShippingMethod = () => {
    return shippingMethod === 'express-ghn' ? 'express' : shippingMethod;
  }
  
  const shippingFee = getShippingFee()
  const discountAmount = appliedDiscount?.discountAmount || 0
  const total = subtotal + shippingFee - discountAmount

  return (
    <>
      {(createOrderMutation.isPending || vnpayPaymentMutation.isPending) && (
        <PaymentLoading message={vnpayPaymentMutation.isPending ? 'Đang chuyển hướng đến VNPay...' : 'Đang tạo đơn hàng...'} />
      )}
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

            {/* Order Summary */}
            <div className='bg-white p-6 rounded-lg shadow-sm h-fit lg:sticky lg:top-[80px]'>
              <h2 className='text-lg font-medium text-gray-900 mb-6 scroll-mt-24'> Đơn Hàng</h2>
              <div className='space-y-4'>
                {selectedCartItems && selectedCartItems.map((item) => (
                  <div key={item._id} className='flex items-center space-x-4'>
                    <div className='w-16 h-16 bg-gray-100 rounded-md overflow-hidden'>
                      <img
                        src={item.productId?.image[0]}
                        alt={item.productId?.name}
                        className='w-full h-full object-cover'
                        loading='lazy'
                        crossOrigin='anonymous'
                      />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-sm font-medium text-gray-900'>
                        {item.productId?.name} x {item.quantity}
                      </h3>
                      <p className='text-sm text-gray-500'>Dung tích: {item.value} ml | Mã: {item.variantId?.sku}</p>
                    </div>
                    <div className='text-sm font-medium text-gray-900'>{formatCurrencyVND(item.variantId?.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <Separator className='my-6' />
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>
                    Tạm tính ({selectedCartItems?.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm)
                  </span>
                  <span className='font-medium'>{formatCurrencyVND(subtotal)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Phí vận chuyển</span>
                  <span className='font-medium'>{formatCurrencyVND(shippingFee)}</span>
                </div>
                {appliedDiscount && (
                  <div className='flex justify-between text-sm text-green-600'>
                    <span>Giảm giá ({appliedDiscount.discount.code})</span>
                    <span className='font-medium'>-{formatCurrencyVND(discountAmount)}</span>
                  </div>
                )}
                <Separator className='my-4' />
                <div className='flex justify-between text-lg font-semibold'>
                  <span>Tổng cộng</span>
                  <span>{formatCurrencyVND(total)}</span>
                </div>
              </div>
              <Separator className='my-6' />
              {/* Discount Input */}
              <DiscountInput
                orderValue={subtotal + shippingFee}
                cartItems={selectedCartItems || []}
                onDiscountApplied={setAppliedDiscount}
                appliedDiscount={appliedDiscount}
              />
            </div>

            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <div className="relative mb-6">
                <div className="absolute left-0 top-3 h-12 border-l-4 border-purple-500" />
                <div className="pl-6">
                  <h1 className='text-2xl font-bold text-purple-700 uppercase tracking-wide'>Thanh Toán</h1>
                  <h2 className='text-xl font-semibold text-gray-800 mt-1'>Thông Tin Thanh Toán</h2>
                </div>
              </div>

              <div className='mt-8 space-y-4'>
                {/* Shipping Address Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg font-semibold text-gray-900'>Địa chỉ giao hàng</CardTitle>
                    <p className='text-sm text-gray-600'>Chọn địa chỉ phù hợp với thẻ hoặc phương thức thanh toán của bạn.</p>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingAddress} onValueChange={setShippingAddress} className='space-y-4'>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='same' id='same' />
                        <Label htmlFor='same' className='font-medium cursor-pointer'>
                          Sử dụng địa chỉ của tôi
                        </Label>
                      </div>
                      {
                        shippingAddress === 'same' && (
                          <Select
                            defaultValue={listAddresses?.find(addr => addr.isPrimary)?._id}
                            onValueChange={(value) => {
                              const address = listAddresses?.find(addr => addr._id === value) || null
                              setSelectedAddress(address)
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn địa chỉ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Địa chỉ</SelectLabel>
                                {
                                  listAddresses && listAddresses?.map((address) => (
                                    <SelectItem key={address._id} value={address._id}>
                                      {`${address.province}, ${address.district}, ${address.ward}, ${address.address}`}
                                    </SelectItem>
                                  ))
                                }
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )
                      }

                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='different' id='different' />
                        <Label htmlFor='different' className='font-medium cursor-pointer'>
                          Sử dụng địa chỉ khác
                        </Label>
                      </div>
                      {
                        shippingAddress === 'different' && (
                          <Form {...form}>
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="receiverName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tên người nhận</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Nhập tên người nhận" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="receiverPhone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Số điện thoại người nhận</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Nhập số điện thoại" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name="province"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Tỉnh/Thành phố</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                          <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                                          <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                                          <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                                          <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="district"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Quận/Huyện</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn quận/huyện" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Ba Đình">Ba Đình</SelectItem>
                                          <SelectItem value="Hoàn Kiếm">Hoàn Kiếm</SelectItem>
                                          <SelectItem value="Tây Hồ">Tây Hồ</SelectItem>
                                          <SelectItem value="Long Biên">Long Biên</SelectItem>
                                          <SelectItem value="Cầu Giấy">Cầu Giấy</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="ward"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phường/Xã</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn phường/xã" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Phúc Xá">Phúc Xá</SelectItem>
                                          <SelectItem value="Trúc Bạch">Trúc Bạch</SelectItem>
                                          <SelectItem value="Vĩnh Phúc">Vĩnh Phúc</SelectItem>
                                          <SelectItem value="Cống Vị">Cống Vị</SelectItem>
                                          <SelectItem value="Liễu Giai">Liễu Giai</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Địa chỉ cụ thể</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nhập địa chỉ cụ thể" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                className='cursor-pointer'
                                onClick={() => {
                                  form.trigger().then(isValid => {
                                    if (isValid) {
                                      const values = form.getValues()
                                      setAddressFormData(values)
                                      toast.success('Địa chỉ đã được lưu thành công!')
                                    }
                                  })
                                }}
                              >
                                Lưu
                              </Button>
                            </div>
                          </Form>
                        )
                      }
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Shipping Method Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg font-semibold text-gray-900'>Phương thức vận chuyển</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <Label htmlFor="shippingMethod">Chọn phương thức vận chuyển</Label>
                      <Select value={shippingMethod} onValueChange={setShippingMethod}>
                        <SelectTrigger id="shippingMethod" className="mt-1 w-full">
                          <SelectValue placeholder="Chọn phương thức vận chuyển" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Giao hàng tiêu chuẩn (2-3 ngày) - 30.000đ</SelectItem>
                          <SelectItem value="express-ghn">Giao hàng nhanh - GHN (1-2 ngày) - 45.000đ</SelectItem>
                          <SelectItem value="express">Giao hàng hỏa tốc (24h) - 60.000đ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
                      <div>
                        <p className='font-medium'>Phí giao hàng</p>
                        <p className='text-sm text-gray-600'>Có thể phát sinh thêm phí</p>
                      </div>
                      <p className='font-semibold'>{formatCurrencyVND(shippingFee)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg font-semibold text-gray-900'>Phương thức thanh toán</CardTitle>
                    <p className='text-sm text-gray-600'>Tất cả giao dịch đều được bảo mật và mã hóa.</p>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div>
                      <Label htmlFor="paymentMethod">Chọn phương thức thanh toán</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="paymentMethod" className="mt-1 w-full">
                          <SelectValue placeholder="Chọn phương thức thanh toán" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="momo">Thanh toán MoMo</SelectItem>
                          <SelectItem value="vnpay">Thanh toán VNPay</SelectItem>
                          <SelectItem value="cash">Thanh toán khi nhận hàng</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {paymentMethod === 'momo' && (
                        <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                          <p className='text-sm text-gray-600'>Quét mã QR hoặc đăng nhập MoMo để thanh toán.</p>
                        </div>
                      )}
                      
                      {paymentMethod === 'vnpay' && (
                        <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                          <p className='text-sm text-gray-600'>Bạn sẽ được chuyển đến cổng thanh toán VNPay.</p>
                        </div>
                      )}
                      
                      {paymentMethod === 'cash' && (
                        <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                          <p className='text-sm text-gray-600'>Thanh toán bằng tiền mặt khi nhận hàng.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  className='w-full mt-4 cursor-pointer'
                  onClick={handleCreateOrder}
                  disabled={createOrderMutation.isPending || vnpayPaymentMutation.isPending}
                >
                  {createOrderMutation.isPending || vnpayPaymentMutation.isPending ? 'Đang xử lý...' : `Đặt hàng - ${formatCurrencyVND(total)}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default CheckoutForm
