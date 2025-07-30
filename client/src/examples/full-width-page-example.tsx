// Ví dụ về cách sử dụng FullWidthLayout trong các trang con

// 1. Import FullWidthLayout vào trang con
import FullWidthLayout from '@/components/app/full-width-layout';

// 2. Sử dụng FullWidthLayout để bao bọc nội dung trang
const SomePage = () => {
  return (
    <FullWidthLayout>
      {/* Nội dung trang sẽ hiển thị full màn hình */}
      <div className="hero-section">
        {/* Hero content */}
      </div>
      
      <div className="products-section">
        {/* Products content */}
      </div>
      
      {/* Các section khác */}
    </FullWidthLayout>
  );
};

export default SomePage;