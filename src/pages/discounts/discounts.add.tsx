import instance from "@/config/axios.customize";
import { IDiscounts } from "@/types/discounts";
import dayjs from "dayjs";
import {
  Col,
  DatePicker,
  Input,
  message,
  Row,
  Select,
  Form,
  Button,
  Card,
  Typography,
  Divider,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";


const { Title } = Typography;
const DiscountsAdd = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();

const handleFinish = async (values: IDiscounts) => {
  try {
    const now = dayjs();
    const { startDate, endDate } = values;
    let status = "Sắp diễn ra";
    if (startDate && endDate) {
      if (now.isBefore(startDate)) {
        status = "Sắp diễn ra";
      } else if (now.isAfter(endDate)) {
        status = "Đã kết thúc";
      } else {
        status = "Đang diễn ra";
      }
    }

    const payload = {
      ...values,
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      status,
    };

    await instance.post("/api/v1/discounts/", payload);
    message.success("Thêm mã giảm giá thành công");
    nav("/discounts");
  } catch (err:any) {
     console.error(err);
    const errMessage = err.response?.data?.message || "Lỗi khi thêm mã giảm giá";
    message.error(errMessage);
  }
};
const fetchProducts = async () => {
  const res = await instance.get("/api/v1/products/");
  console.log("Products fetched:", res.data.results); 
  return res.data.results || []; 
};

const fetchCategories = async () => {
  const res = await instance.get("/api/v1/categories");
  console.log(res);
     return res.data.results || [];

};
const fetchVariants = async () => {
    const res = await instance.get("/api/v1/variants");
     return res.data.results || [];

}

const { data: products = [], isLoading: loadingProducts } = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts
});
const { data: categories = [], isLoading: loadingCategories } = useQuery({
  queryKey: ["categories"],
  queryFn: fetchCategories
});
const { data: variants = [], isLoading: loadingVariants } = useQuery({
  queryKey: ["variants"],
  queryFn: fetchVariants
});
const productOptions = products?.map((p: any) => ({
  label: p.name,
  value: p._id
})) || [];

const categoryOptions = categories?.map((c: any) => ({
  label: c.name,
  value: c._id
})) || [];

const variantOptions = variants?.map((v: any) => ({
  label: `${v.sku} - ${v.productId?.name || "Không rõ sản phẩm"}`,
  value: v._id
})) || [];

  return (
    <div className="p-4">
      <Card >
        <Title level={4}>Tạo mã giảm giá</Title>

        <Form layout="vertical" onFinish={handleFinish} form={form}>
          <Row gutter={24}>
            {/* Cột trái */}
            <Col span={12}>
              <Form.Item
                label="Mã giảm giá"
                name="code"
                rules={[
                  { required: true, message: "Vui lòng không bỏ trống" },
                  { min: 5, message: "Tối thiểu 5 ký tự" },
                ]}
              >
                <Input placeholder="Mã code" />
              </Form.Item>

              <Form.Item
                label="Kiểu giảm giá"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn kiểu giảm giá" }]}
              >
                <Select placeholder="Chọn kiểu giảm giá">
                  <Select.Option value="%">%</Select.Option>
                  <Select.Option value="Vnd">Vnđ</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Giá trị giảm"
                name="value"
                rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}
              >
                <Input className="w-full" min={0} placeholder="Giá trị giảm" />
              </Form.Item>

              <Form.Item label="Giảm tối đa" name="max_discount_amount">
                <Input className="w-full" min={0} placeholder="Giảm tối đa" />
              </Form.Item>

              <Form.Item label="Giá trị đơn hàng tối thiểu" name="min_order_value">
                <Input className="w-full" min={0} placeholder="Giá trị tối thiểu" />
              </Form.Item>

              <Form.Item label="Giới hạn toàn hệ thống" name="usage_limit">
                <Input className="w-full" min={100} placeholder="Giới hạn sử dụng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Sản phẩm áp dụng" name="applies_product">
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Tên sản phẩm"
                options={productOptions}
                loading={loadingProducts}
              />
            </Form.Item>
              <Form.Item label="Danh mục áp dụng" name="applies_category">
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Tên danh mục"
              options={categoryOptions}
              loading={loadingCategories}
            />
          </Form.Item>
          <Form.Item label="Biến thể áp dụng" name="applies_variant">
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Tên biến thể"
              options={variantOptions}
              loading={loadingVariants}
            />
          </Form.Item>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>
              <Form.Item label="Giới hạn mỗi người dùng" name="usage_per_user">
                <Input className="w-full" min={1} placeholder="Mỗi người dùng" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { required: true, message: "Vui lòng không bỏ trống" },
                  { min: 5, message: "Tối thiểu 5 ký tự" },
                ]}
              >
                <TextArea rows={4} placeholder="Mô tả chi tiết..." />
              </Form.Item>
            </Col>
          </Row>
          <Divider />         
          <Row justify="center">
            <Col>
              <Form.Item>
                <div className="flex gap-4">
                  <Button htmlType="submit" type="primary">
                    Thêm
                  </Button>
                  <Button onClick={() => nav("/discounts")}>Hủy</Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default DiscountsAdd;
