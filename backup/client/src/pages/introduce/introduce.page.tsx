import React, { useEffect, useRef, useState } from 'react'
import './introduce.css'
import { useNavigate } from 'react-router'

interface VisibilityState {
  [key: string]: boolean
}

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<VisibilityState>({})
  const sectionRefs = useRef<HTMLElement[]>([])
  const nav = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el)
    }
  }

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section" id="hero" ref={addToRefs}>
        <div className="hero-background">
          <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        <div className={`hero-content ${isVisible.hero ? 'animate-in' : ''}`}>
          <h1 className="hero-title">
            <span className="brand-name">VIET</span>
            <span className="brand-accent">PERFUME</span>
          </h1>
          <p className="hero-subtitle">
            Khám phá thế giới hương thơm đẳng cấp
          </p>
          <div className="hero-description">
            <p>Thương hiệu nước hoa hàng đầu Việt Nam</p>
            <p>Chuyên cung cấp nước hoa cao cấp, chính hãng</p>
          </div>
          <button className="cta-button" type="button" onClick={() => nav('/')}>
            <span>Khám phá ngay</span>
            <div className="button-glow"></div>
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about" ref={addToRefs}>
        <div className="container">
          <div className={`about-grid ${isVisible.about ? 'animate-in' : ''}`}>
            <div className="about-image">
              <div className="image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000"
                  alt="Luxury Perfume"
                />
                <div className="image-overlay"></div>
              </div>
            </div>
            <div className="about-content">
              <h2 className="section-title">
                <span className="title-accent">Câu chuyện</span> của chúng tôi
              </h2>
              <div className="story-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>10+ năm kinh nghiệm</h3>
                    <p>Tuyển chọn kỹ lưỡng từ các thương hiệu nổi tiếng thế giới</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>Đam mê hương thơm</h3>
                    <p>Truyền tải giá trị phong cách và cảm xúc qua từng mùi hương</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>Đội ngũ chuyên gia</h3>
                    <p>Am hiểu sâu sắc, tư vấn tận tâm cho từng khách hàng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section" id="values" ref={addToRefs}>
        <div className="container">
          <h2 className={`section-title center ${isVisible.values ? 'animate-in' : ''}`}>
            <span className="title-accent">Giá trị cốt lõi</span>
          </h2>
          <div className={`values-grid ${isVisible.values ? 'animate-in' : ''}`}>
            {[
              {
                icon: '💎',
                title: 'Chất lượng',
                desc: 'Cam kết 100% sản phẩm chính hãng, được kiểm định nghiêm ngặt',
                color: '#8B5CF6'
              },
              {
                icon: '🎨',
                title: 'Tinh tế',
                desc: 'Mỗi hương thơm là một tác phẩm nghệ thuật được chăm chút tỉ mỉ',
                color: '#EC4899'
              },
              {
                icon: '❤️',
                title: 'Khách hàng',
                desc: 'Trải nghiệm khách hàng là ưu tiên hàng đầu trong mọi hoạt động',
                color: '#F59E0B'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="value-card"
                style={{
                  '--delay': `${index * 0.2}s`,
                  '--color': item.color
                } as React.CSSProperties}
              >
                <div className="card-glow"></div>
                <div className="value-icon">{item.icon}</div>
                <h3 className="value-title">{item.title}</h3>
                <p className="value-desc">{item.desc}</p>
                <div className="card-border"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" id="stats" ref={addToRefs}>
        <div className="container">
          <div className={`stats-grid ${isVisible.stats ? 'animate-in' : ''}`}>
            {[
              { number: '10+', label: 'Năm kinh nghiệm', icon: '🏆' },
              { number: '50K+', label: 'Khách hàng tin tưởng', icon: '👥' },
              { number: '500+', label: 'Sản phẩm cao cấp', icon: '🌟' },
              { number: '99%', label: 'Khách hàng hài lòng', icon: '💯' }
            ].map((stat, index) => (
              <div
                key={index}
                className="stat-item"
                style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section" id="mission" ref={addToRefs}>
        <div className="container">
          <div className={`mission-content ${isVisible.mission ? 'animate-in' : ''}`}>
            <h2 className="section-title center">
              <span className="title-accent">Tầm nhìn</span> & Sứ mệnh
            </h2>
            <div className="mission-text">
              <p>
                VIETPERFUME hướng đến trở thành <strong>hệ thống phân phối nước hoa hàng đầu Đông Nam Á</strong>.
                Chúng tôi cam kết truyền cảm hứng và sự tự tin cho mọi người thông qua hương thơm –
                <em>một ngôn ngữ không lời của cảm xúc</em>.
              </p>
            </div>
            <div className="mission-features">
              {[
                { icon: '🌍', text: 'Mở rộng toàn khu vực' },
                { icon: '✨', text: 'Truyền cảm hứng' },
                { icon: '💫', text: 'Tạo sự tự tin' }
              ].map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">{feature.icon}</div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta" ref={addToRefs}>
        <div className="container">
          <div className={`cta-content ${isVisible.cta ? 'animate-in' : ''}`}>
            <h2 className="cta-title">Sẵn sàng khám phá hương thơm của bạn?</h2>
            <p className="cta-subtitle">Hãy để chúng tôi giúp bạn tìm được mùi hương hoàn hảo</p>
            <div className="cta-buttons">
              <button className="btn-primary" type="button">
                <span>Mua sắm ngay</span>
                <div className="btn-shine"></div>
              </button>
              <button className="btn-secondary" type="button">
                <span>Liên hệ tư vấn</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
