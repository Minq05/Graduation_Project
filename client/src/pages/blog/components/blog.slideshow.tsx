import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Blog {
  _id: string
  title: string
  description: string
  image?: string
  categoryBlogName?: string
  createdAt: string
}

interface SlideshowBlogProps {
  blogs: Blog[]
  navigate: (path: string) => void
}

export const SlideshowBlog: React.FC<SlideshowBlogProps> = ({ blogs, navigate }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const featuredBlogs = blogs.slice(0, 3)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredBlogs.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredBlogs.length) % featuredBlogs.length)
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (featuredBlogs.length === 0) return null

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg mb-8 bg-white">
      <div className="relative h-[300px] md:h-[400px]">
        {featuredBlogs.map((blog, idx) => (
          <motion.div
            key={blog._id}
            className="absolute inset-0 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: idx === currentSlide ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(`/blogs/${blog._id}`)}
          >
            <div className="relative h-full">
              <img
                src={blog.image || 'https://via.placeholder.com/1200x600'}
                alt={blog.title}
                className="w-full h-full object-cover"
                crossOrigin='anonymous'
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                {blog.categoryBlogName && (
                  <div className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full mb-2">
                    {blog.categoryBlogName}
                  </div>
                )}
                <h2 className="text-xl md:text-3xl font-bold text-white mb-2">{blog.title}</h2>
                <p className="text-gray-200 line-clamp-2 md:line-clamp-3">{blog.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          prevSlide()
        }}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          nextSlide()
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredBlogs.map((_, idx) => (
          <button
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>
    </div>
  )
}
