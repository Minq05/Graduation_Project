import React from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { ChevronRightIcon } from 'lucide-react'

interface BlogLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
    active?: boolean
  }>
  sidebar?: React.ReactNode
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({
  children,
  title = 'Tin tức & Bài viết',
  description = 'Khám phá những bài viết mới nhất về nước hoa, xu hướng và bí quyết làm đẹp',
  breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tin tức', href: '/blogs', active: true }
  ],
  sidebar
}) => {
  return (
    <div className='bg-gradient-to-b from-[#b7d1d2]/30 to-gray-50 min-h-screen p-3 md:p-6'>
      {/* Header */}
      <header className='container mx-auto mb-6'>
        <div className='bg-white rounded-xl shadow-lg p-4 md:p-6'>
          <Breadcrumb className='mb-2'>
            <BreadcrumbList className='flex items-center gap-[15px]'>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRightIcon className='w-[5px] h-[10.14px] text-gray-600' />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className={`font-medium cursor-pointer text-sm md:text-base ${
                        item.active ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600 transition-colors'
                      } ${item.active && 'truncate max-w-[200px]'}`}
                    >
                      {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      </header>

      <section className='container mx-auto'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main content */}
          <div className='flex-1 min-w-0'>
            {children}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              {sidebar}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
