import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface QuantityInputProps {
  value: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  className = ''
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className={`flex items-center border border-[#bebbbc] rounded-lg ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-10 w-10 rounded-l-lg rounded-r-none border-0 hover:bg-gray-100 disabled:opacity-50"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>

      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="h-10 w-16 text-center border-0 border-l border-r border-[#bebbbc] rounded-none focus-visible:ring-0 [font-family:'Causten-Medium',Helvetica] font-medium text-[#3c4242]"
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-10 w-10 rounded-r-lg rounded-l-none border-0 hover:bg-gray-100 disabled:opacity-50"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
