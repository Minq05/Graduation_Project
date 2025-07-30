import { useEffect, useState } from 'react'
import { Modal, Table, Button, Space, Popconfirm, message, Form, InputNumber, Select, Spin, Radio, Alert } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'

import { 
  getFlashSaleItems, 
  createFlashSaleItem, 
  deleteFlashSaleItem, 
  updateFlashSaleItem 
} from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_ITEM_QUERY_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { IFlashSaleItem } from '@/types/flash-sale'
import { fetchAllProducts } from '@/services/product-service/product.apis'
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key'

interface FlashSaleItemsModalProps {
  open: boolean
  onCancel: () => void
  flashSaleId: string
}

const FlashSaleItemsModal = ({ open, onCancel, flashSaleId }: FlashSaleItemsModalProps) => {
  const [form] = Form.useForm()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [_, setSelectedVariant] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<IFlashSaleItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [applyType] = useState<'variant'>('variant')
  
  const queryClient = useQueryClient()

  const { data: itemsData, isLoading } = useQuery({
    queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId, current: currentPage, pageSize }],
    queryFn: () => getFlashSaleItems({ 
      flashSaleId, 
      current: currentPage, 
      pageSize 
    }),
    select: (response) => response.data,
    enabled: open && !!flashSaleId
  })

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL, { current: 1, pageSize: 100 }],
    queryFn: async () => {
      const params = `?current=1&pageSize=100`
      const res = await fetchAllProducts(params)
      return res.data
    },
    enabled: isAddModalOpen
  })

  const createMutation = useMutation({
    mutationFn: createFlashSaleItem,
    onSuccess: (response) => {
      console.log('Create response:', response)
      message.success('Thêm sản phẩm vào flash sale thành công')
      queryClient.invalidateQueries({ 
        queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId }] 
      })
      handleCloseAddModal()
    },
    onError: (error) => {
      console.error('Create error:', error)
      message.error('Có lỗi xảy ra khi thêm sản phẩm vào flash sale')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IFlashSaleItem> }) => 
      updateFlashSaleItem(id, data),
    onSuccess: () => {
      message.success('Cập nhật sản phẩm flash sale thành công')
      queryClient.invalidateQueries({ 
        queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId }] 
      })
      handleCloseAddModal()
    },
    onError: (error) => {
      console.error('Update error:', error)
      message.error('Có lỗi xảy ra khi cập nhật sản phẩm flash sale')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFlashSaleItem,
    onSuccess: () => {
      message.success('Xóa sản phẩm khỏi flash sale thành công')
      queryClient.invalidateQueries({ 
        queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId }] 
      })
    },
    onError: (error) => {
      console.error('Delete error:', error)
      message.error('Có lỗi xảy ra khi xóa sản phẩm khỏi flash sale')
    }
  })

  useEffect(() => {
    if (isAddModalOpen) {
      if (editingItem) {
        const productId = typeof editingItem.productId === 'object' 
          ? editingItem.productId._id 
          : editingItem.productId
        
        const variantId = typeof editingItem.variantId === 'object' && editingItem.variantId
          ? editingItem.variantId._id
          : editingItem.variantId

        setSelectedProducts([productId])
        setSelectedVariant(variantId || null)
        
        form.setFieldsValue({
          productId: productId,
          variantId: variantId || undefined,
          discountPercent: editingItem.discountPercent
        })
      } else {
        form.resetFields()
        setSelectedProducts([])
        setSelectedVariant(null)
        form.setFieldValue('productIds', [])
      }
    }
  }, [isAddModalOpen, editingItem, form])

  const handleOpenAddModal = (item?: IFlashSaleItem) => {
    setEditingItem(item || null)
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setEditingItem(null)
    form.resetFields()
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleProductChange = (value: string) => {
    setSelectedProducts([value])
    setSelectedVariant(null)
    form.setFieldValue('variantId', undefined)
  }
  


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingItem) {
        updateMutation.mutate({ 
          id: editingItem._id, 
          data: { discountPercent: values.discountPercent } 
        })
      } else {
        // Kiểm tra trùng lặp variant
        if (values.variantId && checkVariantFlashSaleExists(values.variantId)) {
          message.error('Biến thể này đã có trong Flash Sale. Vui lòng chọn biến thể khác.')
          return
        }
        
        const data = {
          flashSaleId,
          productId: values.productId,
          variantId: values.variantId,
          discountPercent: values.discountPercent
        }
        
        createMutation.mutate(data)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const columns: ColumnsType<IFlashSaleItem> = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
      render: (product) => {
        if (typeof product === 'object' && product) {
          return product.name
        }
        return 'N/A'
      }
    },
    {
      title: 'Biến thể',
      dataIndex: 'variantId',
      key: 'variantId',
      render: (variant) => {
        if (!variant) {
          return 'Tất cả biến thể'
        }
        if (typeof variant === 'object') {
          return variant.sku
        }
        return 'N/A'
      }
    },
    {
      title: 'Giá gốc',
      key: 'originalPrice',
      render: (_, record) => {
        if (typeof record.variantId === 'object' && record.variantId && typeof record.variantId.price === 'number') {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.variantId.price);
        }
        return 'N/A';
      }
    },
    {
      title: 'Giảm giá (%)',
      dataIndex: 'discountPercent',
      key: 'discountPercent'
    },
    {
      title: 'Giá sau giảm',
      key: 'finalPrice',
      render: (_, record) => {
        if (typeof record.variantId === 'object' && record.variantId && typeof record.variantId.price === 'number' && typeof record.discountPercent === 'number') {
          const originalPrice = record.variantId.price;
          const discountAmount = originalPrice * (record.discountPercent / 100);
          const finalPrice = originalPrice - discountAmount;
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice);
        }
        return 'N/A';
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleOpenAddModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi flash sale?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const getVariantsForProduct = () => {
    if (selectedProducts.length !== 1 || !productsData?.results) return []
    
    const product = productsData.results.find((p: any) => p._id === selectedProducts[0])
    if (!product || !product.variants) {
      console.log('No variants found for product:', product)
      return []
    }
    
    return product.variants
  }
  
  const checkProductFlashSaleExists = (productId?: string) => {
    const targetProductId = productId || (selectedProducts.length === 1 ? selectedProducts[0] : null)
    if (!targetProductId || !itemsData?.results) return false
    
    return itemsData.results.some((item: IFlashSaleItem) => {
      const itemProductId = typeof item.productId === 'object' ? item.productId._id : item.productId
      return itemProductId === targetProductId && !item.variantId
    })
  }
  
  const checkVariantFlashSaleExists = (variantId: string) => {
    if (!itemsData?.results) return false
    
    return itemsData.results.some((item: IFlashSaleItem) => {
      const itemVariantId = typeof item.variantId === 'object' && item.variantId ? item.variantId._id : item.variantId
      return itemVariantId === variantId
    })
  }
  
  const checkAnyVariantHasFlashSale = (productId?: string) => {
    const targetProductId = productId || (selectedProducts.length === 1 ? selectedProducts[0] : null)
    if (!targetProductId || !itemsData?.results) return false
    
    return itemsData.results.some((item: IFlashSaleItem) => {
      const itemProductId = typeof item.productId === 'object' ? item.productId._id : item.productId
      return itemProductId === targetProductId && item.variantId
    })
  }
  
  const getProductName = (productId: string) => {
    if (!productsData?.results) return 'N/A'
    const product = productsData.results.find((p: any) => p._id === productId)
    return product?.name || 'N/A'
  }

  return (
    <>
      <Modal
        title="Quản lý sản phẩm Flash Sale"
        open={open}
        onCancel={onCancel}
        width={1000}
        footer={[
          <Button key="back" onClick={onCancel}>
            Đóng
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAddModal()}
          >
            Thêm sản phẩm
          </Button>
        ]}
      >
        <Table
          columns={columns}
          dataSource={itemsData?.results}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: itemsData?.meta.total || 0,
            onChange: (page, pageSize) => {
              setCurrentPage(page)
              setPageSize(pageSize)
            }
          }}
        />
      </Modal>

      <Modal
        title={editingItem ? "Cập nhật sản phẩm Flash Sale" : "Thêm sản phẩm vào Flash Sale"}
        open={isAddModalOpen}
        onCancel={handleCloseAddModal}
        footer={[
          <Button key="back" onClick={handleCloseAddModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            {editingItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        ]}
      >
        {isLoadingProducts ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Đang tải..." />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            name="flash_sale_item_form"
          >



            

            
            <Form.Item
              name="productId"
              label="Sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            >
              <Select
                placeholder="Chọn sản phẩm"
                onChange={handleProductChange}
                disabled={!!editingItem}
              >
                {productsData?.results?.map((product: any) => (
                  <Select.Option key={product._id} value={product._id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="variantId"
              label="Biến thể"
              rules={[{ required: true, message: 'Vui lòng chọn biến thể' }]}
            >
              <Select
                placeholder="Chọn biến thể"
                disabled={selectedProducts.length !== 1 || !!editingItem}
              >
                {getVariantsForProduct().map((variant: any) => (
                  <Select.Option key={variant._id} value={variant._id}>
                    {variant.sku} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="discountPercent"
              label="Phần trăm giảm giá (%)"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
                { type: 'number', min: 0, max: 100, message: 'Giảm giá phải từ 0% đến 100%' }
              ]}
              help="Nhập phần trăm giảm giá từ 0% đến 100%"
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="Nhập phần trăm giảm giá"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  )
}

export default FlashSaleItemsModal
