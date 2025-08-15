import { message } from "antd";
import ProductForm from "./product.form";
import { useMutation } from "@tanstack/react-query";
import { createProductAPI } from "@/services/product-service/product.apis";
import { useAppDispatch } from "@/redux/hooks";
import { clearSelectedMedia } from "@/redux/slices/media.slice";
import { useNavigate } from "react-router";

const ProductAddPage = () => {
  const nav = useNavigate();
  const dispatch = useAppDispatch()

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await createProductAPI(data);
      if (res && res.data) {
        return res.data;
      } else {
        throw new Error("Tạo sản phẩm thất bại");
      }
    },
    onSuccess: (data) => {
      console.log("Sản phẩm được tạo thành công:", data);
      message.success("Sản phẩm được tạo thành công!");
      nav("/products");
      dispatch(clearSelectedMedia());
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      message.error("Tạo sản phẩm thất bại.");
    }
  })

  const toSlug = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD') // loại bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\-]+/g, '-') // thay ký tự không hợp lệ bằng dấu gạch ngang
      .replace(/-+/g, '-') // loại bỏ gạch ngang thừa
      .replace(/^-|-$/g, ''); // loại bỏ gạch ngang ở đầu/cuối
  };

  const onSubmit = (data: any) => {
    // Tạo slug từ tên sản phẩm nếu chưa có
    if (!data.slug || data.slug.trim() === '') {
      data.slug = toSlug(data.name);
    } else {
      data.slug = toSlug(data.slug);
    }
    createProductMutation.mutate(data);
  }
  return (
    <div>
      <div>
        <ProductForm onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default ProductAddPage;
