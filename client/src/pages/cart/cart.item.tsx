import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import React from 'react'

// Cart item data for mapping
const cartItems = [
  {
    id: 1,
    name: 'Blue Flower Print Crop Top',
    color: 'Yellow',
    size: 'M',
    price: '$29.00',
    quantity: 1,
    shipping: 'FREE',
    subtotal: '$29.00',
    image: '/rectangle-734.png'
  },
  {
    id: 2,
    name: 'Levender Hoodie',
    color: 'Levender',
    size: 'XXL',
    price: '$119.00',
    quantity: 2,
    shipping: 'FREE',
    subtotal: '$119.00',
    image: '/rectangle-734-1.png'
  },
  {
    id: 3,
    name: 'Black Sweatshirt',
    color: 'Black',
    size: 'XXL',
    price: '$123.00',
    quantity: 2,
    shipping: '$5.00',
    subtotal: '$123.00',
    image: '/rectangle-734-2.png'
  }
]

export const CartItemsSection = () => {
  return (
    <section className="w-full mx-auto">
      <div className="w-full bg-[#3c4242] py-6">
        <div className="max-w-[1240px] mx-auto flex justify-between items-center">
          <div className="[font-family:'Causten-SemiBold',Helvetica] font-semibold text-white text-lg">
            PRODUCT DETAILS
          </div>
          <div className="flex gap-[120px]">
            <div className="[font-family:'Causten-SemiBold',Helvetica] font-semibold text-white text-lg">
              PRICE
            </div>
            <div className="[font-family:'Causten-SemiBold',Helvetica] font-semibold text-white text-lg">
              QUANTITY
            </div>
            <div className="[font-family:'Causten-SemiBold',Helvetica] font-semibold text-white text-lg">
              SHIPPING
            </div>
            <div className="[font-family:'Causten-SemiBold',Helvetica] font-semibold text-white text-lg">
              SUBTOTAL
            </div>
            <div className="[font-family:'Causten-SemiBold',Helvetica] font-semibold text-white text-lg">
              ACTION
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto mt-[70px]">
        {cartItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="flex justify-between items-center py-6">
              <div className="flex gap-5">
                <img
                  className="w-[105px] h-[120px] object-cover"
                  alt={item.name}
                  src={item.image}
                />
                <div className="flex flex-col justify-center">
                  <div className="[font-family:'Causten-Bold',Helvetica] font-bold text-[#3c4242] text-lg tracking-[0.36px]">
                    {item.name}
                  </div>
                  <div className="[font-family:'Causten-Medium',Helvetica] font-medium text-[#807d7e] text-sm mt-[10px]">
                    Color : {item.color}
                  </div>
                  <div className="[font-family:'Causten-Medium',Helvetica] font-medium text-[#807d7e] text-sm mt-[10px]">
                    Size : {item.size}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-[120px]">
                <div className="[font-family:'Causten-Bold',Helvetica] font-bold text-[#3c4242] text-lg w-[80px]">
                  {item.price}
                </div>

                <div className="w-[100px] h-9 bg-[#f6f6f6] rounded-xl flex items-center justify-between px-4">
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    <MinusIcon className="h-2.5 w-2.5" />
                  </Button>
                  <span className="[font-family:'Causten-Medium',Helvetica] font-medium text-[#3c4242] text-xs">
                    {item.quantity}
                  </span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    <PlusIcon className="h-2.5 w-2.5" />
                  </Button>
                </div>

                <div
                  className={`[font-family:'Causten-Bold',Helvetica] font-bold ${item.shipping === 'FREE' ? 'text-[#bebcbd]' : 'text-[#bebcbd]'} text-lg tracking-[0.36px] w-[80px]`}
                >
                  {item.shipping}
                </div>

                <div className="[font-family:'Causten-Bold',Helvetica] font-bold text-[#3c4242] text-lg w-[80px]">
                  {item.subtotal}
                </div>

                <Button variant="ghost" size="icon" className="p-0">
                  <Trash2Icon className="h-5 w-[17px] text-[#3c4242]" />
                </Button>
              </div>
            </div>

            {index < cartItems.length - 1 && (
              <Separator className="w-full h-px bg-[#e4e4e4]" />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
