import React from 'react';
import { Button, Form, Input, message, Select, Typography } from 'antd';
import { useNavigate } from 'react-router';
interface IBrand{
  name: string;
  isPublic: boolean;
}
const BrandForm = () => {
  const {Title} = Typography;
  const nav = useNavigate();
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  }
  const onFinish = (values:IBrand) => {
    console.log(values);
    message.success('Thêm thương hiệu thành công');
    nav('/brand')
  }
  return(
    <>
      <Title level={3}>Thêm thương hiệu</Title>
      <Form
        form={form}
        {...layout}
        name="nest-messages"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name={['name']} label="Tên" rules={[
          { required: true,message: 'Vui lòng không bỏ trống' },
          {min:5,message: 'Tối thiểu 5 ký tự'}
        ]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="isPublic"
          label="Hiển thị"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Select.Option value={true}>Hiển thị</Select.Option>
            <Select.Option value={false}>Ẩn</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">Thêm</Button>
        </Form.Item>
      </Form>
    </>
  )}
export default BrandForm