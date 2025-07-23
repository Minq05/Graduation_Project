import React from 'react'
import { motion } from 'framer-motion'
import { Variants } from 'framer-motion'

interface Blog {
  _id: string
  title: string
  description: string
  image?: string
  categoryBlogName?: string
  createdAt: string
}

interface BlogListProps {
  blogs: Blog[]
  fadeInUp: Variants
  navigate: (path: string) => void
}

export const BlogList: React.FC<BlogListProps> = ({ blogs, fadeInUp, navigate }) => {
  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Không có bài viết nào.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {blogs.map((blog, index) => (
        <motion.div
          key={blog._id}
          className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate(`/blogs/${blog._id}`)}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative">
            <img
              src={blog.image || 'https://via.placeholder.com/400x300'}
              alt={blog.title}
              className="w-full h-36 sm:h-48 object-cover"
              crossOrigin='anonymous'
            />
            {blog.categoryBlogName && (
              <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {blog.categoryBlogName}
              </div>
            )}
          </div>
          <div className="p-3 sm:p-4">
            <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2">{blog.title}</h3>
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3">{blog.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span className="text-purple-600 text-sm font-medium">Xem thêm</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
