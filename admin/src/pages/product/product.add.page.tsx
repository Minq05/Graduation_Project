import { message } from "antd";
import ProductForm from "./product.form";
import { useMutation } from "@tanstack/react-query";
import { createProductAPI } from "@/services/product-service/product.apis";
import { useAppDispatch } from "@/redux/hooks";
import { clearSelectedMedia } from "@/redux/slices/media.slice";

const ProductAddPage = () => {
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
      dispatch(clearSelectedMedia());
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      message.error("Tạo sản phẩm thất bại.");
    }
  })

  const onSubmit = (data: any) => {
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
