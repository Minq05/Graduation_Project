import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { BLOG_KEYS } from '@/services/blog-service/blog.keys'
import { fetchListBlog, fetchBlogByCategory } from '../../services/blog-service/blog.apis'
// Import SlideshowBlog và BlogList
import { SlideshowBlog } from './components/blog.slideshow'
import { BlogList } from './components/blog.list'
import { BlogLayout } from './components/blog.layout'
import { BlogSidebar } from './components/blog.sidebar'

// Animation cho danh sách blog
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}
interface Blog {
  _id: string
  title: string
  description: string
  image?: string
  categoryBlogName?: string
  createdAt: string
  isPublic?: boolean
  // Thêm các trường khác nếu cần
}

// Số lượng bài viết trên mỗi trang - điều chỉnh theo kích thước màn hình
const PAGE_SIZE = window.innerWidth < 640 ? 3 : 6

const BlogPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [current, setCurrent] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Reset về trang đầu tiên khi thay đổi danh mục hoặc tìm kiếm
  useEffect(() => {
    setCurrent(1)
  }, [selectedCategory, searchQuery])

  // Cập nhật URL khi thay đổi danh mục
  useEffect(() => {
    if (selectedCategory) {
      searchParams.set('category', selectedCategory)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }, [selectedCategory, searchParams, setSearchParams])

  // Lấy tất cả bài viết để tìm kiếm client-side
  const { data: allBlogsData } = useQuery({
    queryKey: [BLOG_KEYS.FETCH_LIST_BLOG, 'all-for-search'],
    queryFn: () => fetchListBlog({ pageSize: 100 }),
    select: (res) => res.data?.results || []
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: [BLOG_KEYS.FETCH_LIST_BLOG, current, selectedCategory],
    queryFn: () => {
      if (selectedCategory) {
        return fetchBlogByCategory(selectedCategory, {
          current,
          pageSize: PAGE_SIZE
        })
      } else {
        return fetchListBlog({
          current,
          pageSize: PAGE_SIZE
        })
      }
    },
    select: (res) => res.data
  })

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )

  if (isError) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!</p>
      </div>
    </div>
  )

  // Filter out blogs where isPublic is false
  let blogs = Array.isArray(data?.results)
    ? data.results.filter((blog: Blog) => blog.isPublic !== false)
    : []

  // Nếu có từ khóa tìm kiếm, lọc bài viết client-side
  if (searchQuery && allBlogsData) {
    blogs = allBlogsData
      .filter((blog: Blog) =>
        blog.isPublic !== false &&
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  }

  const total = searchQuery
    ? allBlogsData?.filter((blog: Blog) =>
      blog.isPublic !== false &&
      blog.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).length || 0
    : data?.meta?.total || 0

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Xử lý khi chọn danh mục
  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setSearchTerm('')
    setSearchQuery('')
  }

  // Xử lý khi submit form tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchTerm)
    setSelectedCategory(null)
    setCurrent(1)
  }

  // Thêm dữ liệu mẫu cho dataIframe (nếu muốn)
  const dataIframe = [
    {
      type: 'frame',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      height: 180,
      title: 'Video mẫu'
    }
  ]

  // Nội dung chính của trang
  const mainContent = (
    <>
      {/* Featured blogs slider */}
      <SlideshowBlog blogs={blogs} navigate={navigate} />

      {/* Blog listing */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className='text-xl md:text-2xl font-bold flex items-center'>
            {searchQuery ?
              `Kết quả tìm kiếm: "${searchQuery}"` :
              selectedCategory ?
                `${data?.results?.[0]?.categoryBlogName || 'Danh mục'}` :
                'Bài viết mới nhất'}
            {(selectedCategory || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSearchTerm('')
                  setSearchQuery('')
                }}
                className="ml-3 text-sm font-normal text-gray-500 hover:text-purple-600"
              >
                (Xóa bộ lọc)
              </button>
            )}
          </h2>
          <div className="text-sm text-gray-500 hidden sm:block">
            Hiển thị {blogs.length} / {total} bài viết
          </div>
        </div>

        <BlogList blogs={blogs} fadeInUp={fadeInUp} navigate={navigate} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8'>
            <button
              className='px-2 sm:px-3 py-1 sm:py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              disabled={current === 1}
              onClick={() => setCurrent((c) => Math.max(1, c - 1))}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => {
              // Trên mobile, chỉ hiển thị nút trang hiện tại và các nút liền kề
              const isMobile = window.innerWidth < 640
              const shouldShow = !isMobile || (i + 1 === current || i + 1 === current - 1 || i + 1 === current + 1)

              if (!shouldShow) {
                // Hiển thị dấu ... nếu cần
                if (i === 0 || i === totalPages - 1 || i === current - 2 || i === current + 1) {
                  return (
                    <span key={i} className="text-gray-500 px-1">...</span>
                  )
                }
                return null
              }

              return (
                <button
                  key={i}
                  className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border text-sm sm:text-base ${current === i + 1 ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                  onClick={() => setCurrent(i + 1)}
                >
                  {i + 1}
                </button>
              )
            }).filter(Boolean)}
            <button
              className='px-2 sm:px-3 py-1 sm:py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              disabled={current === totalPages}
              onClick={() => setCurrent((c) => Math.min(totalPages, c + 1))}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <BlogLayout
      title="Tin tức & Bài viết"
      description="Khám phá những bài viết mới nhất về nước hoa, xu hướng và bí quyết làm đẹp"
      sidebar={
        <BlogSidebar
          dataIframe={dataIframe} // <-- Bổ sung dòng này
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      }
    >
      {mainContent}
    </BlogLayout>
  )
}

export default BlogPage
