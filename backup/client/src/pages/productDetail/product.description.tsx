import { Play } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ProductDescriptionProps {
  product?: {
    description?: string
    videoUrl?: string
  }
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const [activeTab] = useState('description')
  const [isPlaying, setIsPlaying] = useState(false)
  const videoUrl = product?.videoUrl || '/videos/sample.mp4' // Đường dẫn video mẫu

  useEffect(() => {
    // console.log('Mô tả sản phẩm:', product?.description)
  }, [product])
  const descriptionText = product?.description?.trim()

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ...Left side giữ nguyên... */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-purple-600"></div>
            <h2 className="text-2xl font-bold text-gray-900">Mô tả sản phẩm</h2>
          </div>
          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {descriptionText ? descriptionText : 'Không có mô tả cho sản phẩm này.'}
              </p>
            </div>
          )}
        </div>

        {/* Right side - Video */}
        <div className="flex items-center justify-center">
          <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-video w-full max-w-md mt-10">
            {isPlaying ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <>
                <img src="/images/product-video.png" alt="Product video thumbnail" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  1:00 M
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <h3 className="text-white text-lg font-medium">Raven hoodie with black colored design</h3>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDescription
