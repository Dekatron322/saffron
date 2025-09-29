"use client"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"

interface CustomPaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
}

export default function CustomPagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: CustomPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page)
    }
  }

  return (
    <div className="mt-4 flex items-center justify-end gap-2 px-6">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ArrowLeftIcon style={{ color: currentPage === 1 ? "#BDBDBD" : "#044982" }} />
      </button>
      <div className="flex space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageClick(index + 1)}
            className={`px-2 py-1 ${
              currentPage === index + 1
                ? "size-10 rounded-2xl bg-[#044982] text-white"
                : "size-10 rounded-2xl border-2 border-[#BDBDBD] text-[#044982]"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        <ArrowRightIcon style={{ color: currentPage === totalPages ? "#BDBDBD" : "#044982" }} />
      </button>
    </div>
  )
}
