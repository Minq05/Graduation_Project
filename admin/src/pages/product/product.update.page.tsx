import { message } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchProductById, updateProductAPI } from "@/services/product-service/product.apis";
import { PRODUCT_QUERY_KEYS } from "@/services/product-service/product.key";
import { useNavigate, useParams } from "react-router";
import { clearSelectedMedia } from "@/redux/slices/media.slice";
import { useAppDispatch } from "@/redux/hooks";
import ProductFormUpdate from "./product.form-update";

const ProductUpdatePage = () => {
  const { id: productId } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await updateProductAPI(productId as string, data);
      if (res && res.data) {
        return res.data;
      } else {
        throw new Error("Failed to update product");
      }
    },
    onSuccess: () => {
      message.success("Product updated successfully!");
      dispatch(clearSelectedMedia());
      navigate(`/products`);
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      message.error("Failed to update product.");
    }
  })

  const fetchInfoProduct = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_INFO, productId],
    queryFn: async () => {
      const res = await fetchProductById(productId as string)
      if (res && res.data) {
        return res.data;
      } else {
        message.error('Failed to fetch product details!');
        throw new Error('Failed to fetch product details');
      }
    }
  })

  const onSubmit = (data: any) => {
    updateProductMutation.mutate(data);
  }
  return (
    <div>
      <div>
        <ProductFormUpdate onSubmit={onSubmit} productData={fetchInfoProduct.data} />
      </div>
    </div>
  )
}

export default ProductUpdatePage;
