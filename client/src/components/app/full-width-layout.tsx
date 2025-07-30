import { useEffect } from 'react';

/**
 * Component này đảm bảo tất cả các trang con đều hiển thị full màn hình
 * Nó sẽ được sử dụng trong các trang con để áp dụng style full màn hình
 */
const FullWidthLayout = ({ children }) => {
  useEffect(() => {
    // Đảm bảo tất cả các container đều có chiều rộng tối đa
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      container.classList.add('container-full');
    });

    return () => {
      // Cleanup khi component unmount (nếu cần)
    };
  }, []);

  return (
    <div className="w-full content-section">
      {children}
    </div>
  );
};

export default FullWidthLayout;