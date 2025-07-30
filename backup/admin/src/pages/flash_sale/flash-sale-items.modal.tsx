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
  const [applyType, setApplyType] = useState<'product' | 'variant'>('product')
  
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
        
        setApplyType(variantId ? 'variant' : 'product')
        
        form.setFieldsValue({
          productId: productId,
          variantId: variantId || undefined,
          discountPercent: editingItem.discountPercent,
          applyType: variantId ? 'variant' : 'product'
        })
      } else {
        form.resetFields()
        setSelectedProducts([])
        setSelectedVariant(null)
        setApplyType('product')
        form.setFieldValue('applyType', 'product')
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

  const handleProductChange = (values: string[] | string) => {
    // Xử lý cả single select và multi-select
    const productArray = Array.isArray(values) ? values : [values]
    setSelectedProducts(productArray)
    setSelectedVariant(null)
    form.setFieldValue('variantId', undefined)
    
    // Kiểm tra từng sản phẩm được chọn
    productArray.forEach(productId => {
      if (applyType === 'product' && checkProductFlashSaleExists(productId)) {
        message.warning(`Sản phẩm ${getProductName(productId)} đã có Flash Sale cho tất cả biến thể.`)
      }
      
      if (applyType === 'product' && checkAnyVariantHasFlashSale(productId)) {
        message.warning(`Một số biến thể của sản phẩm ${getProductName(productId)} đã có Flash Sale.`)
      }
    })
  }
  
  const handleApplyTypeChange = (e: any) => {
    const value = e.target.value;
    setApplyType(value);
    
    // Nếu chuyển từ variant sang product, xóa variantId
    if (value === 'product') {
      setSelectedVariant(null);
      form.setFieldValue('variantId', undefined);
      
      selectedProducts.forEach(productId => {
        if (checkProductFlashSaleExists(productId)) {
          message.warning(`Sản phẩm ${getProductName(productId)} đã có Flash Sale cho tất cả biến thể.`)
        }
        
        if (checkAnyVariantHasFlashSale(productId)) {
          message.warning(`Một số biến thể của sản phẩm ${getProductName(productId)} đã có Flash Sale.`)
          setApplyType('variant');
          form.setFieldValue('applyType', 'variant');
        }
      })
    } else if (value === 'variant') {
      // Nếu chuyển sang variant, chỉ giữ lại 1 sản phẩm
      if (selectedProducts.length > 1) {
        const firstProduct = selectedProducts[0]
        setSelectedProducts([firstProduct])
        form.setFieldValue('productIds', [firstProduct])
        message.info('Chế độ biến thể cụ thể chỉ cho phép chọn 1 sản phẩm')
      }
    }
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
        // Kiểm tra trùng lặp trước khi tạo
        const productIds = Array.isArray(values.productIds) ? values.productIds : [values.productIds]
        for (const productId of productIds) {
          if (values.applyType === 'product') {
            if (checkProductFlashSaleExists(productId)) {
              message.error(`Sản phẩm ${getProductName(productId)} đã có Flash Sale cho tất cả biến thể.`)
              return
            }
            
            if (checkAnyVariantHasFlashSale(productId)) {
              message.error(`Một số biến thể của sản phẩm ${getProductName(productId)} đã có Flash Sale.`)
              return
            }
          }
          
          if (values.applyType === 'variant' && values.variantId && checkVariantFlashSaleExists(values.variantId)) {
            message.error('Biến thể này đã có trong Flash Sale. Vui lòng chọn biến thể khác.')
            return
          }
        }
        
        // Tạo flash sale items cho từng sản phẩm
        let successCount = 0
        for (const productId of productIds) {
          try {
            const data = {
              flashSaleId,
              productId,
              ...(values.applyType === 'variant' && values.variantId ? { variantId: values.variantId } : {}),
              discountPercent: values.discountPercent
            }
            
            await createFlashSaleItem(data)
            successCount++
          } catch (error) {
            console.error(`Lỗi khi tạo flash sale cho sản phẩm ${getProductName(productId)}:`, error)
            message.error(`Không thể thêm sản phẩm ${getProductName(productId)} vào flash sale`)
          }
        }
        
        if (successCount > 0) {
          message.success(`Đã thêm ${successCount}/${productIds.length} sản phẩm vào flash sale thành công`)
          queryClient.invalidateQueries({ 
            queryKey: [FLASH_SALE_ITEM_QUERY_KEYS.FETCH_BY_FLASH_SALE, { flashSaleId }] 
          })
          handleCloseAddModal()
        }
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
        if (typeof product === 'object') {
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
        if (typeof record.variantId === 'object' && record.variantId) {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.variantId.price)
        } else if (typeof record.productId === 'object') {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.productId.price)
        }
        return 'N/A'
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
        let originalPrice = 0;
        
        if (typeof record.variantId === 'object' && record.variantId) {
          originalPrice = record.variantId.price;
        } else if (typeof record.productId === 'object') {
          originalPrice = record.productId.price;
        } else {
          return 'N/A';
        }
        
        const discountAmount = originalPrice * (record.discountPercent / 100);
        const finalPrice = originalPrice - discountAmount;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice);
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
            <Alert
              message="Hướng dẫn thêm sản phẩm vào Flash Sale"
              description={
                <ul className="list-disc pl-5">
                  <li>Có thể chọn nhiều sản phẩm cùng lúc để thêm vào Flash Sale</li>
                  <li>Chọn "Toàn bộ sản phẩm" để áp dụng Flash Sale cho tất cả biến thể của sản phẩm</li>
                  <li>Chọn "Biến thể cụ thể" để áp dụng Flash Sale cho một biến thể nhất định (chỉ chọn được 1 sản phẩm)</li>
                  <li>Không thể áp dụng Flash Sale cho toàn bộ sản phẩm nếu đã có biến thể có Flash Sale</li>
                  <li>Không thể áp dụng Flash Sale cho biến thể đã có trong Flash Sale khác</li>
                </ul>
              }
              type="info"
              showIcon
              className="mb-4"
            />

            <Form.Item
              name="applyType"
              label="Áp dụng cho"
              rules={[{ required: true, message: 'Vui lòng chọn loại áp dụng' }]}
              initialValue="product"
              help="Chọn áp dụng Flash Sale cho toàn bộ sản phẩm hoặc chỉ cho một biến thể cụ thể"
            >
              <Radio.Group onChange={handleApplyTypeChange} disabled={!!editingItem}>
                <Radio value="product">Toàn bộ sản phẩm</Radio>
                <Radio value="variant">Biến thể cụ thể</Radio>
              </Radio.Group>
            </Form.Item>
            
            {selectedProducts.length > 0 && applyType === 'product' && (
              selectedProducts.some(productId => checkProductFlashSaleExists(productId)) && (
                <Alert
                  message="Cảnh báo: Một số sản phẩm đã có Flash Sale"
                  description="Một số sản phẩm đã chọn đã có Flash Sale cho tất cả biến thể. Vui lòng bỏ chọn những sản phẩm này hoặc chọn biến thể cụ thể."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )
            )}
            
            {selectedProducts.length > 0 && applyType === 'product' && (
              selectedProducts.some(productId => checkAnyVariantHasFlashSale(productId)) && (
                <Alert
                  message="Cảnh báo: Một số biến thể đã có Flash Sale"
                  description="Một số biến thể của các sản phẩm đã chọn đã có Flash Sale. Không thể áp dụng Flash Sale cho toàn bộ sản phẩm. Vui lòng chọn 'Biến thể cụ thể'."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )
            )}
            
            <Form.Item
              name={editingItem ? "productId" : "productIds"}
              label="Sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một sản phẩm' }]}
              help={editingItem ? undefined : (applyType === 'variant' ? "Chỉ có thể chọn 1 sản phẩm khi chọn biến thể cụ thể" : "Có thể chọn nhiều sản phẩm cùng lúc")}
            >
              <Select
                mode={editingItem ? undefined : (applyType === 'variant' ? undefined : "multiple")}
                placeholder={editingItem ? "Chọn sản phẩm" : (applyType === 'variant' ? "Chọn sản phẩm" : "Chọn một hoặc nhiều sản phẩm")}
                onChange={handleProductChange}
                disabled={!!editingItem}
                maxTagCount="responsive"
              >
                {productsData?.results?.map((product: any) => (
                  <Select.Option key={product._id} value={product._id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {applyType === 'variant' && (
              <Form.Item
                name="variantId"
                label="Biến thể"
                rules={[{ required: applyType === 'variant', message: 'Vui lòng chọn biến thể' }]}
                help="Chọn biến thể cụ thể để áp dụng Flash Sale"
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
            )}

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
