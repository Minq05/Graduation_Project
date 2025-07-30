import { useEffect } from 'react'
import { Form, Input, DatePicker, Button, Modal, message, Alert, Divider } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { createFlashSale, updateFlashSale } from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_QUERY_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { IFlashSale } from '@/types/flash-sale'

interface FlashSaleFormProps {
  open: boolean
  onCancel: () => void
  flashSale: IFlashSale | null
}

const FlashSaleForm = ({ open, onCancel, flashSale }: FlashSaleFormProps) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const isEditing = !!flashSale

  useEffect(() => {
    if (open) {
      if (flashSale) {
        form.setFieldsValue({
          name: flashSale.name,
          description: flashSale.description || '',
          dateRange: [
            dayjs(flashSale.startDate),
            dayjs(flashSale.endDate)
          ]
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, flashSale, form])

  const createMutation = useMutation({
    mutationFn: createFlashSale,
    onSuccess: (response) => {
      console.log('Create response:', response)
      message.success('Tạo flash sale thành công')
      queryClient.invalidateQueries({ queryKey: [FLASH_SALE_QUERY_KEYS.FETCH_ALL] })
      onCancel()
    },
    onError: (error) => {
      console.error('Create error:', error)
      message.error('Có lỗi xảy ra khi tạo flash sale')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IFlashSale> }) => 
      updateFlashSale(id, data),
    onSuccess: (response) => {
      console.log('Update response:', response)
      message.success('Cập nhật flash sale thành công')
      queryClient.invalidateQueries({ queryKey: [FLASH_SALE_QUERY_KEYS.FETCH_ALL] })
      onCancel()
    },
    onError: (error) => {
      console.error('Update error:', error)
      message.error('Có lỗi xảy ra khi cập nhật flash sale')
    }
  })

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const [startDate, endDate] = values.dateRange
      
      const data = {
        name: values.name,
        description: values.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }

      console.log('Submitting data:', data)

      if (isEditing && flashSale) {
        updateMutation.mutate({ id: flashSale._id, data })
      } else {
        createMutation.mutate(data)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal
      title={isEditing ? 'Cập nhật Flash Sale' : 'Thêm Flash Sale mới'}
      open={open}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createMutation.isPending || updateMutation.isPending}
          onClick={handleSubmit}
        >
          {isEditing ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      ]}
    >


      <Form
        form={form}
        layout="vertical"
        name="flash_sale_form"
      >
        <Form.Item
          name="name"
          label="Tên Flash Sale"
          rules={[{ required: true, message: 'Vui lòng nhập tên flash sale' }]}
        >
          <Input placeholder="Nhập tên flash sale" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả (không bắt buộc)" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian diễn ra"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian diễn ra' }]}
        >
          <DatePicker.RangePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            placeholder={['Thời gian bắt đầu', 'Thời gian kết thúc']}
          />
        </Form.Item>


      </Form>
    </Modal>
  )
}

export default FlashSaleForm
