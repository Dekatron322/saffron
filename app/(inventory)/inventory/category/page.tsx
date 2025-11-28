"use client"
import { fetchAllCategories, fetchAllProducts } from "app/api/store/productSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddCategoryModal from "components/ui/Modal/add-category-modal"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter } from "next/navigation"
import AddBusiness from "public/add-business"
import ArrowForwardIcon from "public/arrow-forward-icon"
import EmptyState from "public/empty-state"
import FilterIcon from "public/Icons/filter-icon"
import React, { useEffect, useRef, useState } from "react"
import { RxDotsVertical } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence, motion } from "framer-motion"

interface Category {
  catId: number
  catName: string
  createdDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
}

interface Product {
  productId: number
  productName: string
  description: string
  category: Category
  manufacturer: string
  currentStockLevel: number | null
  salePrice: number
  batchDetailsDtoList: BatchDetail[]
}

interface BatchDetail {
  mrp: number
  batchNo: string
  packing: string
}

const SkeletonLoader = () => {
  return (
    <motion.div
      className="flex h-screen w-full flex-col px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-5 flex w-full justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="flex w-full gap-6">
        <div className="w-1/4 rounded-md bg-white p-4">
          <div className="flex h-10 items-center gap-2">
            <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="size-10 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="mt-3 space-y-2">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="h-10 w-full animate-pulse rounded bg-gray-200"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
        <div className="w-3/4 rounded-md bg-white p-4">
          <div className="mb-4 h-8 w-1/3 animate-pulse rounded bg-gray-200"></div>
          <div className="mb-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200"></div>
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-4">
            <div className="h-12 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="mt-2 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const InventoryCategory = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: any) => state.product)
  const { products, loading: productsLoading } = useSelector((state: any) => state.product)

  const [searchText, setSearchText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(230, 247, 247, 0.5)",
      transition: { duration: 0.2 },
    },
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  useEffect(() => {
    dispatch(fetchAllCategories() as any)
    dispatch(fetchAllProducts() as any)
  }, [dispatch])

  useEffect(() => {
    // Filter categories based on search text
    if (searchText) {
      const filtered = categories.filter((category: Category) =>
        category.catName.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchText, categories])

  useEffect(() => {
    // Filter products when a category is selected
    if (selectedCategory) {
      const categoryProducts = products.filter((product: Product) => product.category.catId === selectedCategory.catId)
      setFilteredProducts(categoryProducts)
    } else {
      setFilteredProducts([])
    }
  }, [selectedCategory, products])

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredProducts])

  const handleCancelSearch = () => {
    setSearchText("")
    setFilteredCategories(categories)
  }

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
  }

  const toggleAddCategory = () => {
    setIsAddCategoryOpen((prev) => !prev)
  }

  const getStatusColor = (quantity: number | null) => {
    if (quantity === null) return "bg-gray-100 text-gray-800"
    return quantity > 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-yellow-800"
  }

  const getStatusText = (quantity: number | null) => {
    if (quantity === null) return "Unknown"
    return quantity > 10 ? "In Stock" : "Low Stock"
  }

  const calculateStockValue = (product: Product) => {
    if (product.currentStockLevel === null) return 0
    return product.currentStockLevel * product.salePrice
  }

  const pageSize = 10
  const totalItems = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize)

  const handleAddProduct = () => {
    router.push(`product/add-product`)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)
      ) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  const DropdownMenu = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    const handleViewDetails = () => {
      router.push(`/product/${product.productId}`)
      onClose()
    }

    const handleEdit = () => {
      router.push(`/product/edit/${product.productId}`)
      onClose()
    }

    const handleDelete = () => {
      console.log("Delete product:", product.productId)
      onClose()
    }

    return (
      <motion.div
        className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        variants={dropdownVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="py-1">
          <motion.button
            onClick={handleViewDetails}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            whileHover={{ backgroundColor: "#f3f4f6" }}
          >
            View Details
          </motion.button>
          <motion.button
            onClick={handleEdit}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            whileHover={{ backgroundColor: "#f3f4f6" }}
          >
            Edit
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            whileHover={{ backgroundColor: "#f3f4f6" }}
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (categoriesLoading || productsLoading) {
    return (
      <section className="h-auto w-full bg-[#F4F9F8]">
        <div className="flex min-h-screen w-full">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <SkeletonLoader />
          </div>
        </div>
      </section>
    )
  }

  if (categoriesError) {
    return (
      <motion.div
        className="flex h-screen items-center justify-center text-red-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Error: {categoriesError}
      </motion.div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {isAddCategoryOpen && <AddCategoryModal isOpen={isAddCategoryOpen} onClose={toggleAddCategory} />}
      </AnimatePresence>

      <section className="h-auto w-full bg-[#F4F9F8]">
        <div className="flex min-h-screen w-full">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <motion.div
              className="mt-4 flex flex-col items-start px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="mb-5 flex w-full justify-between"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <p className="text-[#94A3B8]">Inventory</p>
                  <ArrowForwardIcon />
                  <p>Category</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    icon={<AddBusiness color="#ffffff" />}
                    iconPosition="start"
                    onClick={toggleAddCategory}
                  >
                    <p className="max-sm:hidden">Add Category</p>
                  </ButtonModule>
                </motion.div>
              </motion.div>
              <div className="max-sm-my-4 flex w-full gap-6 max-md:flex-col">
                <div className="flex w-full items-start gap-4">
                  <motion.div
                    className="w-1/4 rounded-md bg-white p-4"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex h-10 items-center gap-2">
                      <SearchModule
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onCancel={handleCancelSearch}
                        className="w-full rounded-md"
                      />
                      <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                        <FilterIcon />
                      </motion.div>
                    </div>

                    <motion.div
                      className="mt-3 flex max-h-[calc(100vh-250px)] flex-col gap-2 overflow-y-auto"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredCategories.map((category: Category, index: number) => (
                        <motion.p
                          key={category.catId}
                          className={`cursor-pointer rounded-md p-2 text-sm ${
                            selectedCategory?.catId === category.catId
                              ? "bg-[#e6f7f7] text-[#00a4a6]"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleCategoryClick(category)}
                          variants={itemVariants}
                          whileHover={selectedCategory?.catId === category.catId ? {} : "hover"}
                        >
                          {category.catName}
                        </motion.p>
                      ))}
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="w-3/4 rounded-md bg-white p-4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {selectedCategory ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        <h2 className="mb-4 border-b text-lg font-semibold">Category: {selectedCategory.catName}</h2>

                        {/* Category Overview Section */}
                        <motion.div
                          className="mb-6 flex items-center justify-between gap-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200"
                              whileHover={{ scale: 1.05 }}
                            >
                              <span className="text-xl font-semibold">
                                {selectedCategory.catName.charAt(0).toUpperCase()}
                              </span>
                            </motion.div>
                            <p className="text-xl font-semibold">{selectedCategory.catName}</p>
                          </div>

                          <motion.div className="rounded-lg" whileHover={{ scale: 1.05 }}>
                            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                            <p className="text-2xl font-bold">{filteredProducts.length}</p>
                          </motion.div>
                          <motion.div className="rounded-lg" whileHover={{ scale: 1.05 }}>
                            <h3 className="text-sm font-medium text-gray-500">Stock Value</h3>
                            <p className="text-2xl font-bold">
                              ₹
                              {filteredProducts
                                .reduce((sum, product) => sum + calculateStockValue(product), 0)
                                .toLocaleString()}
                            </p>
                          </motion.div>
                        </motion.div>

                        <h3 className="mb-4 text-lg font-semibold">Products in this Category</h3>
                        {filteredProducts.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    S/N
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Product Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Quantity
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Stock Value
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Manufacturer
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedProducts.map((product: Product, index: number) => (
                                  <motion.tr
                                    key={product.productId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                                  >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{startIndex + index + 1}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      {product.productName}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      {product.currentStockLevel ?? "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      ₹{calculateStockValue(product).toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      {product.manufacturer}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                      <motion.span
                                        className={`rounded-full px-2 py-1 text-xs ${getStatusColor(
                                          product.currentStockLevel
                                        )}`}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        {getStatusText(product.currentStockLevel)}
                                      </motion.span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-1 text-sm">
                                      <div
                                        className="relative flex items-center gap-2"
                                        ref={(el) => {
                                          dropdownRefs.current[index] = el
                                        }}
                                      >
                                        <motion.button
                                          onClick={() => toggleDropdown(index)}
                                          className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                        >
                                          <RxDotsVertical />
                                        </motion.button>
                                        <AnimatePresence>
                                          {activeDropdown === index && (
                                            <DropdownMenu product={product} onClose={() => setActiveDropdown(null)} />
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="mt-4 flex items-center justify-between">
                              <p className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages} • Showing {paginatedProducts.length} of {totalItems}
                              </p>
                              <div className="flex items-center gap-2">
                                <ButtonModule
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                  disabled={currentPage === 1}
                                >
                                  Prev
                                </ButtonModule>
                                <ButtonModule
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={currentPage === totalPages}
                                >
                                  Next
                                </ButtonModule>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <motion.div
                            className="flex w-full flex-col items-center justify-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <EmptyState />
                            <p>No products found in this category.</p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <ButtonModule variant="primary" size="sm" onClick={handleAddProduct}>
                                <p className="max-sm:hidden">Add Product</p>
                              </ButtonModule>
                            </motion.div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex h-full items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-gray-500">Select a category to view products</p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

export default InventoryCategory
