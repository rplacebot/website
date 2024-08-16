'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'

interface ColorPickerProps {
  colors: Record<string, string>;
  selectedColor: string;
  setSelectedColor: Dispatch<SetStateAction<string>>;
  importingColors: boolean;
  setImportingColors: Dispatch<SetStateAction<boolean>>;
  setColors: Dispatch<SetStateAction<Record<string, string>>>;
}

const defaultColors = `(0, 0, 0): '1'
(105, 105, 105): '2'
(85, 85, 85): '3'
(128, 128, 128): '4'
(211, 211, 211): '5'
(255, 255, 255): '6'
(233, 158, 156): '7'
(179, 64, 58): '8'
(192, 49, 66): '9'
(133, 26, 17): 'a'
(111, 20, 12): 'b'
(226, 99, 44): 'c'
(216, 253, 155): 'd'
(158, 219, 131): 'e'
(56, 109, 65): 'f'
(72, 86, 174): 'g'
(131, 172, 218): 'h'
(166, 216, 251): 'i'
(140, 251, 253): 'j'
(174, 130, 247): 'k'
(173, 82, 246): 'l'
(220, 76, 130): 'm'
(232, 157, 58): 'n'
(246, 230, 80): 'o'
(79, 53, 14): 'p'`

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, selectedColor, setSelectedColor, importingColors, setImportingColors, setColors }) => {
  const [colorInput, setColorInput] = useState(defaultColors)

  useEffect(() => {
    const initialColors: Record<string, string> = {}
    defaultColors.split('\n').forEach(line => {
      const [rgb, code] = line.split(':').map(part => part.trim())
      initialColors[rgb] = code.replace(/'/g, '')
    })
    setColors(initialColors)
  }, [setColors])

  const handleImportSubmit = () => {
    const newColors: Record<string, string> = {}
    colorInput.split('\n').forEach(line => {
      const [rgb, code] = line.split(':').map(part => part.trim())
      newColors[rgb] = code.replace(/'/g, '')
    })
    setColors(newColors)
    setImportingColors(false)
  }

  return (
    <>
      {importingColors && (
        <div className="z-10 w-full h-full justify-center items-center import transition-opacity flex">
          <h1 className='absolute text-[#e9ecec] mb-[540px] text-[18px]  mr-[188px]'>Import colors</h1>
          <h3 className='absolute text-[#aaadad] mb-[460px] text-[15px] font-medium flex flex-wrap w-[300px]'>
            use the&nbsp;
            <a className='underline text-blue-400' href='https://github.com/Vaulco/r-place-bots' target='_blank'>official source code</a>
            to help you on extracting the latest colors
          </h3>
          <textarea
            rows={10}
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="border-[2px] text-[15px] outline-none rounded-lg px-3 py-2 w-[300px] h-[400px] bg-[#232727]/95 text-[#b5b8b8] placeholder-[#7f8080] border-[#232727] resize-none"
          ></textarea>
          <button className=" px-4 py-2 bg-[#242727] text-[#7f8080] rounded-lg text-[15px] w-24 font-medium absolute mt-[470px] mr-[203px]" onClick={handleImportSubmit}>
            Import
          </button>
        </div>
      )}
      <div className={`inline-flex overflow-x-auto absolute bottom-[25px] transition-opacity duration-300 h-[58px] rounded-lg w-[calc(100%-50px)] border-[1px] border-[#232727] p-2 ${importingColors ? 'opacity-0' : 'opacity-100'}`} style={{ whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        {Object.keys(colors).map((color) => (
          <div
            key={color}
            className={`w-8 h-8 m-1 cursor-pointer inline-block relative border-2 rounded-lg ${selectedColor === `rgb${color}` ? 'border-white' : 'border-transparent'}`}
            style={{ backgroundColor: `rgb${color}`, minWidth: '2rem' }}
            onClick={() => setSelectedColor(`rgb${color}`)}
          ></div>
        ))}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <button className=" px-4 py-2 bg-[#242727] text-[#7f8080] rounded-lg text-[13px] absolute top-4 right-16 font-medium" onClick={() => setImportingColors(true)}>
        Colors
      </button>
    </>
  )
}

export default ColorPicker
