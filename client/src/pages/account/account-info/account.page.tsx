import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useParams } from 'react-router'
import AccountAddress from './address.card'
import { useQuery } from '@tanstack/react-query'
import { fetchUserAPI } from '@/services/user-service/user.apis'
import { toast } from 'react-toastify'
import * as Dialog from '@radix-ui/react-dialog'
import UpdateAccount from './update.account'
import AddressForm from './address.form'
import { useState } from 'react'
import ChangePasswordForm from './change-password.form'

const AccountPage = () => {
  const { id } = useParams<{ id: string }>()
  const [open, setOpen] = useState(false)
  const [openAddAddress, setOpenAddAddress] = useState(false)
  const [openChangePassword, setOpenChangePassword] = useState(false)

  const { data: userInfo, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetchUserAPI(id as string)
      if (res.data) {
        return res.data
      } else {
        toast.error('Đã có lỗi xảy ra!')
      }
    }
  })

  return (
    <>
      <h2 className="mt-4 lg:mt-5 font-bold text-[#3c4242] text-lg md:text-[22px] tracking-[0.44px] leading-[33.5px]">
        Thông tin liên hệ
      </h2>

      <div className="space-y-4 lg:space-y-6">
        <section className="w-full py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-base lg:text-lg text-[#807d7e]">
                Họ và tên
              </label>
              <span className="font-semibold text-base lg:text-lg text-[#3c4242]">
                {userInfo && userInfo.fullName}
              </span>
            </div>
            <Button
              variant="link"
              className="font-semibold text-sm text-[#3c4242] p-0 h-auto self-start sm:self-auto"
              onClick={() => setOpen(true)}
            >
              Sửa
            </Button>
          </div>
        </section>

        <Separator className="my-2" />

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn" />
            <Dialog.Content className="fixed top-[50%] left-[50%] max-w-xl w-[90vw] max-h-[85vh] overflow-auto rounded-md bg-white p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 focus:outline-none data-[state=open]:animate-slideIn">
              {userInfo && (
                <UpdateAccount
                  defaultValues={userInfo}
                  onClose={() => setOpen(false)}
                  onUpdated={() => {
                    setOpen(false)
                    refetch()
                  }}
                />
              )}
              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <section className="w-full py-3 lg:py-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-[#3c4242] text-base md:text-lg tracking-tight leading-6">
              Đổi mật khẩu
            </h2>

            <Button variant="link" className="text-[#3c4242] font-semibold text-sm p-0 h-auto" onClick={() => setOpenChangePassword(true)}>
              Đổi
            </Button>
          </div>
        </section>

        <Separator className="my-2" />

        <section className="w-full py-3 lg:py-4">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0">
                <div className="flex flex-col gap-2">
                  <span className="text-[#807d7e] font-semibold text-base lg:text-lg">
                    Số điện thoại
                  </span>
                  <span className="text-[#3c4242] font-semibold text-base lg:text-lg">
                    {userInfo && userInfo.phone}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-2" />

        <div className="w-full py-3 lg:py-4">
          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-[#807d7e] text-base lg:text-lg">
              Email
            </span>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#3c4242] text-base lg:text-lg break-all">
                {userInfo && userInfo.email}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <h2 className="font-bold text-[#3c4242] text-lg md:text-[22px] tracking-[0.44px] leading-[33.5px]">
            Địa chỉ
          </h2>
        </div>

        <div className="w-full">
          <AccountAddress />
        </div>

      </div>

      <Dialog.Root open={openAddAddress} onOpenChange={setOpenAddAddress}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-w-xl w-[90vw] max-h-[85vh] overflow-auto rounded-md bg-white p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 focus:outline-none data-[state=open]:animate-slideIn">
            <AddressForm
              onSuccess={() => {
                setOpenAddAddress(false)
                refetch()
              }}
              onCancel={() => setOpenAddAddress(false)}
            />
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={openChangePassword} onOpenChange={setOpenChangePassword}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-w-xl w-[90vw] max-h-[85vh] overflow-auto rounded-md bg-white p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 focus:outline-none data-[state=open]:animate-slideIn">
            <ChangePasswordForm
              onSuccess={() => setOpenChangePassword(false)}
              onCancel={() => setOpenChangePassword(false)}
            />
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

export default AccountPage
