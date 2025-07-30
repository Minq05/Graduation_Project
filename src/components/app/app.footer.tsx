import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'

const AppFooter = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-neutral-800 to-neutral-900 text-white py-12 md:py-16 mt-8">
      <div className="container-full">
        {/* Newsletter */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 md:p-8 mb-12 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Đăng ký nhận thông tin</h3>
              <p className="text-white/80 max-w-md">Nhận thông báo về sản phẩm mới và ưu đãi đặc biệt</p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email của bạn"
                className="px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-white/50 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 min-w-[250px]"
              />
              <button className="px-6 py-3 bg-white text-purple-700 font-bold rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center">
                Đăng ký <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 border-b border-neutral-700 pb-10">
          {/* Location */}
          <div>
            <div className="text-2xl font-bold mb-6 text-purple-300 flex items-center">
              <MapPin className="mr-2" size={20} /> Thông tin liên hệ
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail size={18} className="mr-2 mt-1 text-purple-300" />
                <span className="text-base font-medium">support@vietperfume.in</span>
              </div>
              <div className="flex items-start">
                <Phone size={18} className="mr-2 mt-1 text-purple-300" />
                <span className="text-base font-medium">+84 123 456 789</span>
              </div>
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-purple-300" />
                <span className="text-base font-medium">Eklingpura Chouraha, Ahmedabad Main Road (NH 8- Near Mahadev Hotel) Udaipur, India- 313002</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <div className="text-lg font-semibold mb-3">Kết nối với chúng tôi</div>
              <div className="flex space-x-3">
                <a href="#" className="bg-neutral-700 hover:bg-purple-600 transition-colors p-2 rounded-full">
                  <Facebook size={20} />
                </a>
                <a href="#" className="bg-neutral-700 hover:bg-purple-600 transition-colors p-2 rounded-full">
                  <Instagram size={20} />
                </a>
                <a href="#" className="bg-neutral-700 hover:bg-purple-600 transition-colors p-2 rounded-full">
                  <Twitter size={20} />
                </a>
                <a href="#" className="bg-neutral-700 hover:bg-purple-600 transition-colors p-2 rounded-full">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* More Info */}
          <div>
            <div className="text-2xl font-bold mb-6 text-purple-300">Thông tin thêm</div>
            <ul className="space-y-3">
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Điều khoản và điều kiện
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Chính sách bảo mật
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Chính sách vận chuyển
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Sơ đồ trang web
              </li>
            </ul>
          </div>

          {/* Need Help */}
          <div>
            <div className="text-2xl font-bold mb-6 text-purple-300">Trợ giúp</div>
            <ul className="space-y-3">
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Liên hệ với chúng tôi
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Theo dõi đơn hàng
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Đổi trả & Hoàn tiền
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Câu hỏi thường gặp
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Tuyển dụng
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-2xl font-bold mb-6 text-purple-300">Công ty</div>
            <ul className="space-y-3">
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Về chúng tôi
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Blog euphoria
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> euphoriastan
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Hợp tác
              </li>
              <li className="text-base font-medium hover:text-purple-300 cursor-pointer transition-colors flex items-center">
                <ArrowRight size={16} className="mr-2 text-purple-400" /> Truyền thông
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="py-8 border-b border-neutral-700">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-3">Phương thức thanh toán</h4>
              <div className="flex space-x-3">
                <div className="bg-white rounded p-1 h-8 w-12 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" />
                </div>
                <div className="bg-white rounded p-1 h-8 w-12 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
                </div>
                <div className="bg-white rounded p-1 h-8 w-12 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-4" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Tải ứng dụng</h4>
              <div className="flex space-x-3">
                <div className="bg-neutral-700 cursor-pointer hover:bg-neutral-600 transition-colors rounded p-2 flex items-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" alt="App Store" className="h-5 mr-2" />
                  <span>App Store</span>
                </div>
                <div className="bg-neutral-700 cursor-pointer hover:bg-neutral-600 transition-colors rounded p-2 flex items-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Play_Arrow_logo.svg/1024px-Google_Play_Arrow_logo.svg.png" alt="Google Play" className="h-5 mr-2" />
                  <span>Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 text-base font-medium text-neutral-400">
          <p>Copyright © 2025 VIETPERFUME Folks Pvt Ltd. All rights reserved.</p>
          <p className="mt-2 text-sm">Thiết kế và phát triển bởi <span className="text-purple-400 font-semibold">VIETPERFUME Team</span></p>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter
