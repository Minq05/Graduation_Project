import { useRef } from "react"
import ReactQuill, { Quill } from "react-quill"

const Size = Quill.import('formats/size') as any
Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '28px']
Quill.register(Size, true)

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ size: ['12px', '14px', '16px', '18px', '20px', '24px', '28px'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean']
  ]
}
const formats = [
  'header',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'align',
  'color',
  'background',
  'script',
  'sub',
  'super',
  'clean',
  'link',
  'image',
  'video',
  'blockquote',
  'code',
  'code-block'
]

interface IProps {
  value?: string
  onChange?: (value: string) => void
}

const Editor = (props: IProps) => {
  const { value, onChange } = props
  const quillRef = useRef(null)

  return (
    <ReactQuill
      ref={quillRef}
      theme='snow'
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      className='h-80 mb-12'
    />
  )
}

export default Editor
