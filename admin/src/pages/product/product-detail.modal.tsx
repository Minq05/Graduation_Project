import { Modal, Descriptions, Image, Tag, Divider, Table, Card } from 'antd'
import { formatCurrencyVND } from '@/utils/utils'

interface ProductDetailModalProps {
  visible: boolean
  onClose: () => void
  product: IProduct | null
}

const ProductDetailModal = ({ visible, onClose, product }: ProductDetailModalProps) => {
  if (!product) return null

  const variantColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrencyVND(price)
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: 'Thuộc tính',
      dataIndex: 'variant_attributes',
      key: 'variant_attributes',
      render: (attributes: any[]) => (
        <div>
          {attributes?.map((attr, index) => (
            <Tag key={index} color="blue">
              {attr.attributeId?.name}: {attr.value}
            </Tag>
          ))}
        </div>
      )
    }
  ]

  return (
    <Modal
      title="Chi tiết sản phẩm"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Tên sản phẩm" span={2}>
              {product.name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug">
              {product.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">
              {product.brandId?.name || 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              {product.categoryId?.name || 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={product.deleted ? 'red' : 'green'}>
                {product.deleted ? 'Đã xóa' : 'Hoạt động'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(product.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(product.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Hình ảnh */}
        <Card title="Hình ảnh sản phẩm" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {product.image && Array.isArray(product.image) ? (
              product.image.map((img, index) => (
                <Image
                  key={index}
                  width={100}
                  height={100}
                  src={img}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                  crossOrigin="anonymous"
                />
              ))
            ) : (
              <Image
                width={100}
                height={100}
                src={product.image as string}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </Card>

        {/* Mô tả */}
        <Card title="Mô tả sản phẩm" style={{ marginBottom: 16 }}>
          <div 
            dangerouslySetInnerHTML={{ __html: product.description || 'Không có mô tả' }}
            style={{ maxHeight: 200, overflowY: 'auto' }}
          />
        </Card>

        {/* Biến thể sản phẩm */}
        <Card title="Biến thể sản phẩm">
          <Table
            columns={variantColumns}
            dataSource={product.variants || []}
            rowKey="_id"
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    </Modal>
  )
}

export default ProductDetailModal