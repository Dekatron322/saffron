import React, { useState } from "react"
import Image from "next/image"

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const states = [
    "Oba-Ajao, Lekki",
    "Tarkwa Bay, Lekki",
    "Elegusi Beach, Lekki",
    "Lekki Phase 1, Lekki",
    "Ikate, Lekki",
    "Banana Island, Ikoyi ",
  ]

  const handleInputChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchTerm(event.target.value)
    setShowDropdown(true)
  }

  const handleDropdownSelect = (state: React.SetStateAction<string>) => {
    setSearchTerm(state)
    setShowDropdown(false)
  }

  const handleCancelSearch = () => {
    setSearchTerm("")
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <div className="search-bg mb-4 flex h-[50px] w-[100%] items-center justify-between gap-3  rounded   px-3 py-1  hover:border-[#5378F6]  focus:border-[#5378F6] focus:bg-[#FBFAFC] max-sm:mb-2">
        <Image className="icon-style" src="./icons.svg" width={16} height={16} alt="dekalo" />
        <Image className="dark-icon-style" src="./search-dark.svg" width={16} height={16} alt="dekalo" />
        <input
          type="text"
          id="search"
          placeholder="Enter Address"
          className="h-[50px] w-full bg-transparent  outline-none focus:outline-none"
          style={{ width: "100%", height: "50px" }}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
        />
        {searchTerm && (
          <button className="focus:outline-none" onClick={handleCancelSearch}>
            <Image className="icon-style" src="./cancel.svg" width={16} height={16} alt="cancel" />
            <Image className="dark-icon-style" src="./dark_cancel.svg" width={16} height={16} alt="cancel" />
          </button>
        )}
      </div>
      {showDropdown && (
        <div className="dropdown absolute left-0 top-full z-10 w-full rounded-md">
          {states
            .filter((state) => state.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((state, index) => (
              <div
                key={index}
                className="cursor-pointer overflow-hidden px-4 py-2 hover:bg-[#D4DCF1]"
                onClick={() => handleDropdownSelect(state)}
              >
                <p className="text-sm font-medium">{state}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default Search
