import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router'
import { BLOG_KEYS } from '@/services/blog-service/blog.keys'
import { fetchBlogDetail, fetchListBlog } from '../../services/blog-service/blog.apis'
import { Calendar, Clock, Tag, Share2, Facebook, Twitter, Linkedin, Copy, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { BlogLayout } from './components/blog.layout'
import { BlogSidebar } from './components/blog.sidebar'

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 }
  }
}
interface Blog {
  _id: string
  title: string
  description: string
  image?: string
  categoryBlogName?: string
  createdAt: string
  categoryBlogId?: string
  content?: string
}
// Dữ liệu iframe mẫu
const dataIframe = [
  {
    type: 'frame',
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    height: 180,
    title: 'Hướng dẫn chọn nước hoa theo mùa'
  },
  {
    type: 'frame',
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    height: 180,
    title: 'Top 5 nước hoa nam được yêu thích'
  }
]

const BlogDetailPage = () => {
  const { blogId } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch blog detail
  const { data: blogDetail, isLoading, isError } = useQuery({
    queryKey: [BLOG_KEYS.FETCH_BLOG_DETAIL, blogId],
    queryFn: () => fetchBlogDetail(blogId as string),
    select: (res) => res?.data,
    enabled: !!blogId
  })

  // Fetch related blogs
  const { data: relatedBlogs } = useQuery({
    queryKey: [BLOG_KEYS.FETCH_LIST_BLOG, 'related', blogDetail?.categoryBlogId],
    queryFn: () => fetchListBlog({
      pageSize: 3,
      categoryId: blogDetail?.categoryBlogId, // Sửa từ categoryBlogId thành categoryId
      exclude: blogId
    }),
    select: (res) => res.data?.results?.filter((blog: Blog) => blog._id !== blogId) || [],
    enabled: !!blogDetail?.categoryBlogId
  })

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [blogId])

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )

  if (isError || !blogDetail) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!</p>
        <p className="mt-2">ID bài viết: {blogId}</p>
      </div>
    </div>
  )

  // Format date
  const formattedDate = new Date(blogDetail.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Xử lý khi submit form tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/blogs?search=${encodeURIComponent(searchTerm)}`)
  }

  // Breadcrumbs cho trang chi tiết
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tin tức', href: '/blogs' },
    { label: blogDetail.title, active: true }
  ]

  // Nội dung chính của trang
  const mainContent = (
    <>
      <div className='bg-white rounded-xl shadow-lg overflow-hidden mb-8'>
        {/* Blog header */}
        <div className="relative">
          <img
            src={blogDetail.image || 'https://via.placeholder.com/1200x600'}
            alt={blogDetail.title}
            className="w-full h-64 md:h-96 object-cover"
            crossOrigin='anonymous'
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          {blogDetail.categoryBlogName && (
            <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full">
              {blogDetail.categoryBlogName}
            </div>
          )}
        </div>

        <div className="p-4 md:p-8">
          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center text-purple-600 hover:text-purple-700 transition-colors mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Quay lại danh sách</span>
          </button>

          <h1 className="text-2xl md:text-4xl font-bold mb-4">{blogDetail.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-1.5" />
              <span>5 phút đọc</span>
            </div>
            {blogDetail.categoryBlogName && (
              <div className="flex items-center">
                <Tag size={16} className="mr-1.5" />
                <span>{blogDetail.categoryBlogName}</span>
              </div>
            )}
          </div>

          {blogDetail.description && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 italic text-gray-700">
              {blogDetail.description}
            </div>
          )}

          {/* Blog content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-purple-600 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: blogDetail.content || '' }}
          />

          {/* Share buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-700 font-medium flex items-center">
                <Share2 size={16} className="mr-1.5" />
                Chia sẻ:
              </span>
              <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Facebook size={16} />
              </button>
              <button className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors">
                <Twitter size={16} />
              </button>
              <button className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors">
                <Linkedin size={16} />
              </button>
              <button className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related blogs */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-2"></div>
            Bài viết liên quan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((blog: Blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => navigate(`/blogs/${blog._id}`)}
              >
                <div className="relative">
                  <img
                    src={blog.image || 'https://via.placeholder.com/400x300'}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                  {blog.categoryBlogName && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {blog.categoryBlogName}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{blog.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <BlogLayout
      title={blogDetail.title}
      description={undefined}
      breadcrumbs={breadcrumbs}
      sidebar={
        <BlogSidebar
          dataIframe={dataIframe}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          selectedCategory={blogDetail.categoryBlogId}
          onSelectCategory={(categoryId) => navigate(`/blogs?category=${categoryId}`)}
        />
      }
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {mainContent}
      </motion.div>
    </BlogLayout>
  )
}

export default BlogDetailPage
