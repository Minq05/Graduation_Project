import React, { useState } from 'react';
import { Button, Form, Input, Select, Typography, message } from 'antd';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/config/axios.customize';
import ObjectId from 'bson-objectid';

const { Title } = Typography;
const { Option } = Select;

interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  capacity: number;
  image: string;
  brandId: string;
  categoryId: string;
  discountId?: string;
  description: string;
}

interface IVariant {
  _id: string;
  name: string;
}

interface OrderItemValues {
  productId: string;
  variantId: string;
  quantity: number;
}

const FAKE_VARIANTS: Record<string, IVariant[]> = {
  '683fd8ad555030d72f1ac081': [
    { _id: '64a7f0bcf1d4a5c123456789', name: '100ml' },
    { _id: '64a7f0bcf1d4a5c123456790', name: '200ml' }
  ],
};

const OrderItemAddPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Lấy danh sách products
  const { data: productsData, isLoading: isProductsLoading } = useQuery<IProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/products');
      return res.data.data?.results || res.data.results || [];
    }
  });

  // Lấy variant theo productId (fake data)
  const { data: variantsData, isLoading: isVariantsLoading } = useQuery<IVariant[]>({
    queryKey: ['variants', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return [];
      return FAKE_VARIANTS[selectedProductId] || [];
    },
    enabled: !!selectedProductId,
  });

  // Mutation thêm order item
  const addOrderItemMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await axios.post('/api/v1/orderitems', values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderitems'] });
      message.success('Thêm Order Item thành công!');
      navigate('/orderitems');
    },
    onError: () => {
      message.error('Thêm Order Item thất bại!');
    }
  });

  // Khi submit form
  const onFinish = (values: OrderItemValues) => {
    // Tạo orderId ngẫu nhiên 24 ký tự hex
    const orderId = ObjectId().toHexString();

    // Lấy giá của sản phẩm hoặc mặc định 0 (bạn có thể fetch giá từ product nếu cần)
    const product = productsData?.find(p => p._id === values.productId);
    const price = product ? product.price : 0;

    const dataToSubmit = {
      orderId,
      productId: values.productId,
      variantId: values.variantId,
      quantity: values.quantity,
      price,
    };

    addOrderItemMutation.mutate(dataToSubmit);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Thêm Order Item</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ quantity: 1 }}
      >
        <Form.Item
          name="productId"
          label="Chọn sản phẩm"
          rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
        >
          <Select
            placeholder="Chọn sản phẩm"
            loading={isProductsLoading}
            onChange={(value) => {
              setSelectedProductId(value);
              form.setFieldsValue({ variantId: undefined });
            }}
            allowClear
          >
            {productsData?.map((product) => (
              <Option key={product._id} value={product._id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="variantId"
          label="Chọn biến thể"
          rules={[{ required: true, message: 'Vui lòng chọn biến thể' }]}
        >
          <Select
            placeholder="Chọn biến thể"
            loading={isVariantsLoading}
            disabled={!selectedProductId}
            allowClear
          >
            {variantsData?.map((variant) => (
              <Option key={variant._id} value={variant._id}>
                {variant.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            {
              type: 'number',
              min: 1,
              message: 'Số lượng phải lớn hơn hoặc bằng 1',
              transform: (value) => Number(value),
            },
          ]}
        >
          <Input type="number" placeholder="Nhập số lượng" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={addOrderItemMutation.isPending}
          >
            Thêm Order Item
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OrderItemAddPage;
