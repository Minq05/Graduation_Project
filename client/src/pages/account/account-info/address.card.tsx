import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppSelector } from '@/redux/hooks'
import { fetchAllAddressByUserAPI, deleteAddressAPI } from '@/services/user-service/user.apis'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useState } from 'react'
import AddressForm from './address.form'

const AddressCard = () => {
  const userInfo = useAppSelector((state) => state.auth.user)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null)

  const { data: listAddress = [], isLoading } = useQuery<IAddress[]>({
    queryKey: ['FETCH_ALL_ADDRESS_BY_USER', userInfo?._id],
    queryFn: async () => {
      const res = await fetchAllAddressByUserAPI(userInfo?._id as string)
      const results = res.data
      if (Array.isArray(results)) {
        return results
      } else {
        toast.error('Dữ liệu địa chỉ không hợp lệ!')
        return []
      }
    },
    enabled: !!userInfo?._id
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) =>
      deleteAddressAPI(userInfo?._id as string, addressId),
    onSuccess: () => {
      toast.success('Xóa địa chỉ thành công!')
      queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADDRESS_BY_USER', userInfo?._id] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa địa chỉ!')
    }
  })

  const handleEdit = (address: IAddress) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDelete = (addressId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      deleteAddressMutation.mutate(addressId)
    }
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingAddress(null)
    queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADDRESS_BY_USER', userInfo?._id] })
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải danh sách địa chỉ...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Danh sách địa chỉ</h2>
        <Button
          onClick={handleAddNew}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          + Thêm địa chỉ mới
        </Button>
      </div>

      {showForm && (
        <AddressForm
          editingAddress={editingAddress}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <section className="w-full grid grid-cols-1 gap-4 lg:gap-6">
        {listAddress.length === 0 ? (
          <Card className="bg-gray-50 border-dashed border-2 border-gray-200 rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <p className="text-lg mb-2">Chưa có địa chỉ nào</p>
                <p className="text-sm">Hãy thêm địa chỉ đầu tiên của bạn!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          listAddress.map((address) => (
            <Card key={address._id} className="bg-[#f6f6f6] border-none rounded-xl relative">
              <CardContent className="p-4">
                <div className="space-y-3 lg:space-y-5">
                  {address.isPrimary && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Địa chỉ chính
                      </span>
                    </div>
                  )}
                  <div className="pr-20">
                    <p className="font-semibold text-[#3c4242] text-lg">{address.address}</p>
                    <p className="text-[#666] text-sm mt-1">
                      {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(address)}
                      className="px-3 py-1 h-auto font-semibold text-[#3c4242] text-sm lg:text-base hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleDelete(address._id)}
                      disabled={deleteAddressMutation.isPending}
                      className="px-3 py-1 h-auto font-semibold text-red-600 text-sm lg:text-base hover:text-red-700"
                    >
                      {deleteAddressMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  )
}

export default AddressCard
