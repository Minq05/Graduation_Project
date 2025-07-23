interface CartCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export const CartCheckbox = ({ checked, onCheckedChange }: CartCheckboxProps) => {
  const handleClick = () => {
    console.log('CartCheckbox clicked, current checked:', checked)
    onCheckedChange(!checked)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
        checked
          ? 'bg-green-500 border-green-500 text-white'
          : 'bg-white border-gray-300 hover:border-green-400'
      }`}
    >
      {checked && (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}