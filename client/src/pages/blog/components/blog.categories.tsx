import React from 'react'
import './css/scrollbar.css'
import { useQuery } from '@tanstack/react-query'
import { BLOG_KEYS } from '@/services/blog-service/blog.keys'
import { fetchListCateBlog } from '@/services/blog-service/blog.apis'

interface BlogCategory {
  _id: string
  name: string
  // Thêm các trường khác nếu cần
}

interface BlogCategoriesProps {
  onSelectCategory: (categoryId: string | null) => void
  selectedCategory?: string | null
}

// Định nghĩa kiểu dữ liệu trả về từ API
interface BlogCategoryResponse {
  data?: {
    results: BlogCategory[]
  }
}

export const BlogCategories: React.FC<BlogCategoriesProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  // Sửa lại generic cho useQuery
  const { data: cateData, isLoading } = useQuery<BlogCategoryResponse>({
    queryKey: [BLOG_KEYS.FETCH_LIST_CATE_BLOG],
    queryFn: fetchListCateBlog,
  })

  const categories = cateData?.data?.results || []

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Danh mục</h3>
        <div className="animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Danh mục</h3>
      <div className="max-h-[210px] overflow-y-auto pr-1">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full cursor-pointer text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors ${
                selectedCategory === null ? 'bg-purple-50 text-purple-600 font-medium' : ''
              }`}
            >
              Tất cả bài viết
            </button>
          </li>
          {categories.map((category) => (
            <li key={category._id}>
              <button
                onClick={() => onSelectCategory(category._id)}
                className={`w-full cursor-pointer text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors ${
                  selectedCategory === category._id ? 'bg-purple-50 text-purple-600 font-medium' : ''
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
