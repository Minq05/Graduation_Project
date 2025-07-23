import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createAddressAPI, updateAddressAPI } from '@/services/user-service/user.apis'
import { useAppSelector } from '@/redux/hooks'
import { toast } from 'react-toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  province: z.string().min(1, {
    message: 'Vui lòng nhập tỉnh/thành phố.'
  }),
  district: z.string().min(1, {
    message: 'Vui lòng nhập quận/huyện.'
  }),
  ward: z.string().min(1, {
    message: 'Vui lòng nhập phường/xã.'
  }),
  address: z.string().min(5, {
    message: 'Địa chỉ chi tiết phải có ít nhất 5 ký tự.'
  }),
  isPrimary: z.boolean()
})

type AddressFormData = z.infer<typeof formSchema>

interface AddressFormProps {
  editingAddress?: IAddress | null
  onSuccess?: () => void
  onCancel?: () => void
}

const AddressForm = ({ editingAddress, onSuccess, onCancel }: AddressFormProps) => {
  const userInfo = useAppSelector((state) => state.auth.user)
  const queryClient = useQueryClient()
  const form = useForm<AddressFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      province: editingAddress?.province || '',
      district: editingAddress?.district || '',
      ward: editingAddress?.ward || '',
      address: editingAddress?.address || '',
      isPrimary: editingAddress?.isPrimary || false
    }
  })

  const createAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      createAddressAPI(userInfo?._id as string, data as IAddress),
    onSuccess: () => {
      toast.success('Thêm địa chỉ thành công!')
      queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADDRESS_BY_USER'] })
      form.reset()
      onSuccess?.()
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thêm địa chỉ!')
    }
  })

  const updateAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      updateAddressAPI(userInfo?._id as string, editingAddress?._id as string, data as IAddress),
    onSuccess: () => {
      toast.success('Cập nhật địa chỉ thành công!')
      queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADDRESS_BY_USER'] })
      onSuccess?.()
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật địa chỉ!')
    }
  })

  const onSubmit = (data: AddressFormData) => {
    if (editingAddress) {
      updateAddressMutation.mutate(data)
    } else {
      createAddressMutation.mutate(data)
    }
  }

  const isLoading = createAddressMutation.isPending || updateAddressMutation.isPending

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingAddress ? 'Sửa địa chỉ' : 'Thông tin địa chỉ'}
        </h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Hà Nội" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quận/Huyện <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ba Đình" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phường/Xã <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Phúc Xa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ chi tiết <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Số nhà, tên đường..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Đặt làm địa chỉ chính</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 h-12 font-medium transition-colors"
              >
                {isLoading ? 'Đang xử lý...' : 'Lưu'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-8 py-3 h-12 font-medium"
                >
                  Hủy
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default AddressForm