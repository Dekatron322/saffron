"use client"
import React, { useState, useEffect } from "react"
import { ButtonModule } from "components/ui/Button/Button"
import { DropdownPopoverModule } from "components/ui/Input/DropdownModule"
import { FormInputModule } from "components/ui/Input/Input"
import AddCategoryModal from "components/ui/Modal/add-category-modal"
import AddUnitModal from "components/ui/Modal/add-unit-modal"
import AddBatchModal from "components/ui/Modal/add-batch-modal"
import AddBusiness from "public/add-business"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  createProduct,
  fetchAllCategories,
  fetchAllBranches,
  selectCategories,
  selectCreateProduct,
  selectBranches,
  fetchAllHSN,
  selectHSN,
} from "app/api/store/productSlice"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"
import { fetchAllUnits, selectUnits } from "app/api/store/unitSlice"
import { createBatch, fetchAllBatches, selectBatches } from "app/api/store/batchSlice"
import { notify } from "components/ui/Notification/Notification"
import { motion, AnimatePresence } from "framer-motion"

interface Category {
  catId: number
  catName: string
}

interface Supplier {
  id: number
  name: string
}

interface Unit {
  unitId: number
  baseUnit: string
  shortName: string
}

interface Branch {
  branchId: number
  branchName: string
  location: string
}

interface HSN {
  hsnId: number
  hsnNumber: number
  description: string
}

interface Batch {
  mrp: number
  batchNo: string
  mfg: string
  mfgDate: string
  expDate: string
  packing: string
  product: {
    productId: number
    productName: string | null
  }
}

const AddProduct: React.FC = () => {
  const dispatch = useAppDispatch()
  const { categories } = useAppSelector(selectCategories)
  const { suppliers } = useAppSelector(selectSuppliers)
  const { units } = useAppSelector(selectUnits)
  const { branches } = useAppSelector(selectBranches)
  const { hsnCodes } = useAppSelector(selectHSN)
  const { loading: creatingProduct, error: productError, success: productSuccess } = useAppSelector(selectCreateProduct)
  const { batches, loading: loadingBatches, error: batchError } = useAppSelector(selectBatches)

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    category: { catId: 0, catName: "" },
    supplierId: 0,
    manufacturer: "",
    defaultMRP: 0,
    salePrice: 0,
    purchasePrice: 0,
    discountType: "Discount %",
    saleDiscount: 0,
    openingStockQuantity: 0,
    minimumStockQuantity: 0,
    itemLocation: "",
    taxRate: 0,
    inclusiveOfTax: false,
    branch: 0,
    batchNo: "",
    modelNo: "",
    size: "",
    mfgDate: "",
    expDate: "",
    mrp: 0,
    hsn: 0,
    reorderQuantity: 0,
    currentStockLevel: 0,
    reorderThreshold: 0,
    packagingSize: 0,
    unitId: 0,
    refundable: "N",
    productStatus: true,
    paymentCategory: "CASH",
    type: "STOCK",
    paidAmount: "0",
    linkPayment: false,
    deductibleWalletAmount: 0,
  })

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    exit: { opacity: 0, scale: 0.9 },
  }

  useEffect(() => {
    if (productError) {
      notify("error", productError, {
        title: "Error",
        description: productError,
        duration: 5000,
      })
    }
    if (productSuccess) {
      notify("success", "Product created successfully!", {
        title: "Success",
        description: "Product Successfully created.",
        duration: 4000,
      })
      setFormData({
        productName: "",
        description: "",
        category: { catId: 0, catName: "" },
        supplierId: 0,
        manufacturer: "",
        defaultMRP: 0,
        salePrice: 0,
        purchasePrice: 0,
        discountType: "Discount %",
        saleDiscount: 0,
        openingStockQuantity: 0,
        minimumStockQuantity: 0,
        itemLocation: "",
        taxRate: 0,
        inclusiveOfTax: false,
        branch: 0,
        batchNo: "",
        modelNo: "",
        size: "",
        mfgDate: "",
        expDate: "",
        mrp: 0,
        hsn: 0,
        reorderQuantity: 0,
        currentStockLevel: 0,
        reorderThreshold: 0,
        packagingSize: 0,
        unitId: 0,
        refundable: "N",
        productStatus: true,
        paymentCategory: "CASH",
        type: "STOCK",
        paidAmount: "0",
        linkPayment: false,
        deductibleWalletAmount: 0,
      })
    }
  }, [productError, productSuccess])

  useEffect(() => {
    dispatch(fetchAllCategories())
    dispatch(fetchAllSuppliers())
    dispatch(fetchAllUnits())
    dispatch(fetchAllBranches())
    dispatch(fetchAllHSN())
    dispatch(fetchAllBatches())
  }, [dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "paidAmount" ? value : name.includes("Date") ? value : !isNaN(Number(value)) ? Number(value) : value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    const selectedCategory = categories.find((cat) => cat.catName === value)
    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        category: { catId: selectedCategory.catId, catName: selectedCategory.catName },
      }))
    }
  }

  const handleSupplierChange = (value: string) => {
    const selectedSupplier = suppliers.find((sup) => sup.name === value)
    if (selectedSupplier) {
      setFormData((prev) => ({
        ...prev,
        supplierId: selectedSupplier.id,
      }))
    }
  }

  const handleUnitChange = (value: string) => {
    const selectedUnit = units.find((unit) => unit.baseUnit === value)
    if (selectedUnit) {
      setFormData((prev) => ({
        ...prev,
        unitId: selectedUnit.unitId,
      }))
    }
  }

  const handleBranchChange = (value: string) => {
    const selectedBranch = branches.find((branch) => branch.branchName === value)
    if (selectedBranch) {
      setFormData((prev) => ({
        ...prev,
        branch: selectedBranch.branchId,
      }))
    }
  }

  const handleHSNChange = (value: string) => {
    const selectedHSN = hsnCodes.find((hsn) => hsn.hsnNumber.toString() === value)
    if (selectedHSN) {
      setFormData((prev) => ({
        ...prev,
        hsn: selectedHSN.hsnNumber,
      }))
    }
  }

  const handleBatchChange = (value: string) => {
    const selectedBatch = batches.find((batch) => batch.batchNo === value)
    if (selectedBatch) {
      setFormData((prev) => ({
        ...prev,
        batchNo: selectedBatch.batchNo,
        mfgDate: selectedBatch.mfgDate,
        expDate: selectedBatch.expDate,
        mrp: selectedBatch.mrp,
        manufacturer: selectedBatch.mfg,
      }))
    }
  }

  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [field]: field === "refundable" ? (checked ? "Y" : "N") : checked,
    }))
  }

  const handleAddBatch = async (batchData: {
    batchNo: string
    mfg: string
    mfgDate: string
    expDate: string
    mrp: number
  }) => {
    try {
      await dispatch(
        createBatch({
          mrp: batchData.mrp,
          batchNo: batchData.batchNo,
          mfg: batchData.mfg,
          mfgDate: batchData.mfgDate,
          expDate: batchData.expDate,
          packing: "Box",
          product: {
            productId: 1,
          },
        })
      )
      await dispatch(fetchAllBatches())
      setFormData((prev) => ({
        ...prev,
        batchNo: batchData.batchNo,
        mfgDate: batchData.mfgDate,
        expDate: batchData.expDate,
        mrp: batchData.mrp,
        manufacturer: batchData.mfg,
      }))
      setIsAddBatchOpen(false)
    } catch (error: any) {
      notify("error", error.message || "Failed to add batch", {
        title: "Error",
        duration: 5000,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productName) {
      notify("error", "Product name is required", { title: "Validation Error", duration: 3000 })
      return
    }
    if (!formData.category.catId) {
      notify("error", "Please select a category", { title: "Validation Error", duration: 3000 })
      return
    }
    if (!formData.supplierId) {
      notify("error", "Please select a supplier", { title: "Validation Error", duration: 3000 })
      return
    }
    if (!formData.unitId) {
      notify("error", "Please select a unit", { title: "Validation Error", duration: 3000 })
      return
    }
    if (!formData.branch) {
      notify("error", "Please select a branch", { title: "Validation Error", duration: 3000 })
      return
    }
    if (!formData.hsn) {
      notify("error", "Please select an HSN code", { title: "Validation Error", duration: 3000 })
      return
    }
    if (!formData.batchNo) {
      notify("error", "Please select a batch", { title: "Validation Error", duration: 3000 })
      return
    }

    try {
      const productData = {
        ...formData,
        batchDetails: {
          mrp: formData.mrp.toString(),
          batchNo: formData.batchNo,
          mfg: formData.manufacturer,
          mfgDate: formData.mfgDate,
          expDate: formData.expDate,
          packing: "Box",
        },
        paidAmount: typeof formData.paidAmount === "string" ? parseFloat(formData.paidAmount) : formData.paidAmount,
        paymentCategory: formData.paymentCategory.toLowerCase(),
      }
      await dispatch(createProduct(productData))
    } catch (error: any) {
      console.error("Product creation failed:", error)
    }
  }

  const paymentMethods = [
    { value: "CASH", label: "Cash" },
    { value: "CREDIT", label: "Credit" },
    { value: "UPI", label: "UPI" },
  ]

  const itemLocations = [
    { value: "Pharma Shelf 1", label: "Pharma Shelf 1" },
    { value: "Pharma Shelf 2", label: "Pharma Shelf 2" },
    { value: "Storage Room", label: "Storage Room" },
  ]

  const discountTypes = [
    { value: "Discount %", label: "Discount %" },
    { value: "Fixed Amount", label: "Fixed Amount" },
  ]

  const productTypes = [
    { value: "STOCK", label: "Stock" },
    { value: "NON_STOCK", label: "Non-Stock" },
  ]

  const hsnOptions = hsnCodes.map((hsn) => ({
    value: hsn.hsnNumber.toString(),
    label: `${hsn.hsnNumber} - ${hsn.description}`,
  }))

  const selectedSupplierName = suppliers.find((s) => s.id === formData.supplierId)?.name || ""
  const selectedUnitName = units.find((u) => u.unitId === formData.unitId)?.baseUnit || ""
  const selectedBranchName = branches.find((b) => b.branchId === formData.branch)?.branchName || ""
  const selectedHSN = hsnCodes.find((h) => h.hsnNumber === formData.hsn)
  const selectedHSNLabel = selectedHSN ? `${selectedHSN.hsnNumber} - ${selectedHSN.description}` : ""

  return (
    <motion.div
      className="relative flex w-full flex-col gap-4 rounded-md bg-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {isAddCategoryOpen && (
          <AddCategoryModal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddUnitOpen && <AddUnitModal isOpen={isAddUnitOpen} onClose={() => setIsAddUnitOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isAddBatchOpen && (
          <AddBatchModal isOpen={isAddBatchOpen} onClose={() => setIsAddBatchOpen(false)} onSubmit={handleAddBatch} />
        )}
      </AnimatePresence>

      <motion.div
        className="flex w-full items-center justify-between"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-lg font-semibold">Product Information</p>
        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ButtonModule
              variant="secondary"
              size="md"
              icon={<AddBusiness />}
              iconPosition="start"
              onClick={() => setIsAddUnitOpen(true)}
            >
              <p className="max-sm:hidden">Add Unit</p>
            </ButtonModule>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ButtonModule variant="primary" size="md" onClick={() => setIsAddCategoryOpen(true)}>
              <p className="max-sm:hidden">Add Category</p>
            </ButtonModule>
          </motion.div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          className="mt-4 grid w-full grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Product Name *"
              name="productName"
              type="text"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Supplier *"
              options={suppliers.map((sup) => ({ value: sup.name, label: sup.name }))}
              placeholder="Select Supplier"
              value={selectedSupplierName}
              onChange={handleSupplierChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Unit *"
              options={units.map((unit) => ({ value: unit.baseUnit, label: unit.baseUnit }))}
              placeholder="Select Unit"
              value={selectedUnitName}
              onChange={handleUnitChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Description"
              name="description"
              type="text"
              placeholder="Product description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Category *"
              options={categories.map((cat) => ({ value: cat.catName, label: cat.catName }))}
              placeholder="Select Category"
              value={formData.category.catName}
              onChange={handleCategoryChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Branch *"
              options={branches.map((branch) => ({ value: branch.branchName, label: branch.branchName }))}
              placeholder="Select Branch"
              value={selectedBranchName}
              onChange={handleBranchChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Manufacturer *"
              name="manufacturer"
              type="text"
              placeholder="Manufacturer name"
              value={formData.manufacturer}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col">
            <div className="flex items-center justify-between">
              <label className="mb-1 text-sm font-medium text-gray-700">Batch No *</label>
              <motion.button
                type="button"
                onClick={() => setIsAddBatchOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Add New Batch
              </motion.button>
            </div>

            <DropdownPopoverModule
              options={batches.map((batch) => ({
                value: batch.batchNo,
                label: `${batch.batchNo} (${batch.mfg})`,
              }))}
              placeholder="Select Batch"
              value={formData.batchNo}
              onChange={handleBatchChange}
              className="w-full"
              label={""}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Model No"
              name="modelNo"
              type="text"
              placeholder="Model number"
              value={formData.modelNo}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Size"
              name="size"
              type="text"
              placeholder="Product size"
              value={formData.size}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="HSN Code *"
              options={hsnOptions}
              placeholder="Select HSN Code"
              value={selectedHSNLabel}
              onChange={handleHSNChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Manufacturing Date *"
              name="mfgDate"
              type="date"
              placeholder="Select date"
              value={formData.mfgDate}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Expiry Date *"
              name="expDate"
              type="date"
              placeholder="Select date"
              value={formData.expDate}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Payment Category *"
              options={paymentMethods}
              placeholder="Select payment method"
              value={formData.paymentCategory}
              onChange={(value) => setFormData((prev) => ({ ...prev, paymentCategory: value }))}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Product Type *"
              options={productTypes}
              placeholder="Select product type"
              value={formData.type}
              onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Discount Type *"
              options={discountTypes}
              placeholder="Select discount type"
              value={formData.discountType}
              onChange={(value) => setFormData((prev) => ({ ...prev, discountType: value }))}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DropdownPopoverModule
              label="Item Location *"
              options={itemLocations}
              placeholder="Select location"
              value={formData.itemLocation}
              onChange={(value) => setFormData((prev) => ({ ...prev, itemLocation: value }))}
              className="w-full"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="w-2/4 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex w-full justify-between pl-2">
            <motion.label className="inline-flex items-center" whileHover={{ scale: 1.02 }}>
              <input
                type="checkbox"
                checked={formData.refundable === "Y"}
                onChange={handleCheckboxChange("refundable")}
                className="mr-2 h-4 w-4 rounded border-[#E0E0E0] focus:ring-2 focus:ring-[#00a4a6]"
              />
              Refundable
            </motion.label>
            <motion.label className="inline-flex items-center" whileHover={{ scale: 1.02 }}>
              <input
                type="checkbox"
                checked={formData.productStatus}
                onChange={handleCheckboxChange("productStatus")}
                className="mr-2 h-4 w-4 rounded border-[#E0E0E0] focus:ring-2 focus:ring-[#00a4a6]"
              />
              Product Status
            </motion.label>
            <motion.label className="inline-flex items-center" whileHover={{ scale: 1.02 }}>
              <input
                type="checkbox"
                checked={formData.linkPayment}
                onChange={handleCheckboxChange("linkPayment")}
                className="mr-2 h-4 w-4 rounded border-[#E0E0E0] focus:ring-2 focus:ring-[#00a4a6]"
              />
              Link Payment
            </motion.label>
            <motion.label className="inline-flex items-center" whileHover={{ scale: 1.02 }}>
              <input
                type="checkbox"
                checked={formData.inclusiveOfTax}
                onChange={handleCheckboxChange("inclusiveOfTax")}
                className="mr-2 h-4 w-4 rounded border-[#E0E0E0] focus:ring-2 focus:ring-[#00a4a6]"
              />
              Inclusive of Tax
            </motion.label>
          </div>
        </motion.div>

        <motion.div
          className="mt-4 flex w-full items-center justify-between border-b"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-lg font-semibold">Pricing</p>
        </motion.div>

        <motion.div
          className="grid w-full grid-cols-3 gap-4 pt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Default MRP *"
              name="defaultMRP"
              type="number"
              placeholder="0.00"
              value={formData.defaultMRP}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="MRP *"
              name="mrp"
              type="number"
              placeholder="0.00"
              value={formData.mrp}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Sale Price *"
              name="salePrice"
              type="number"
              placeholder="0.00"
              value={formData.salePrice}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Purchase Price *"
              name="purchasePrice"
              type="number"
              placeholder="0.00"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Sale Discount"
              name="saleDiscount"
              type="number"
              placeholder="0"
              value={formData.saleDiscount}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Tax Rate (%)"
              name="taxRate"
              type="number"
              placeholder="0"
              value={formData.taxRate}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Paid Amount"
              name="paidAmount"
              type="text"
              placeholder="0.00"
              value={formData.paidAmount}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Deductible Wallet Amount"
              name="deductibleWalletAmount"
              type="number"
              placeholder="0"
              value={formData.deductibleWalletAmount}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-4 flex w-full items-center justify-between border-b"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-lg font-semibold">Stock Information</p>
        </motion.div>

        <motion.div
          className="grid w-full grid-cols-3 gap-4 pt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Opening Stock *"
              name="openingStockQuantity"
              type="number"
              placeholder="0"
              value={formData.openingStockQuantity}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Current Stock Level"
              name="currentStockLevel"
              type="number"
              placeholder="0"
              value={formData.currentStockLevel}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Minimum Stock *"
              name="minimumStockQuantity"
              type="number"
              placeholder="0"
              value={formData.minimumStockQuantity}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Reorder Quantity *"
              name="reorderQuantity"
              type="number"
              placeholder="0"
              value={formData.reorderQuantity}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Reorder Threshold *"
              name="reorderThreshold"
              type="number"
              placeholder="0"
              value={formData.reorderThreshold}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInputModule
              label="Packaging Size *"
              name="packagingSize"
              type="number"
              placeholder="0"
              value={formData.packagingSize}
              onChange={handleInputChange}
              className="w-full"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="flex w-full justify-end gap-2 pt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ButtonModule
              variant="ghost"
              size="md"
              type="button"
              onClick={() => {
                setFormData({
                  productName: "",
                  description: "",
                  category: { catId: 0, catName: "" },
                  supplierId: 0,
                  manufacturer: "",
                  defaultMRP: 0,
                  salePrice: 0,
                  purchasePrice: 0,
                  discountType: "Discount %",
                  saleDiscount: 0,
                  openingStockQuantity: 0,
                  minimumStockQuantity: 0,
                  itemLocation: "",
                  taxRate: 0,
                  inclusiveOfTax: false,
                  branch: 0,
                  batchNo: "",
                  modelNo: "",
                  size: "",
                  mfgDate: "",
                  expDate: "",
                  mrp: 0,
                  hsn: 0,
                  reorderQuantity: 0,
                  currentStockLevel: 0,
                  reorderThreshold: 0,
                  packagingSize: 0,
                  unitId: 0,
                  refundable: "N",
                  productStatus: true,
                  paymentCategory: "CASH",
                  type: "STOCK",
                  paidAmount: "0",
                  linkPayment: false,
                  deductibleWalletAmount: 0,
                })
              }}
            >
              Reset
            </ButtonModule>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={
              creatingProduct
                ? {
                    scale: [1, 1.02, 1],
                    transition: { repeat: Infinity, duration: 1.5 },
                  }
                : {}
            }
          >
            <ButtonModule variant="primary" size="md" type="submit" disabled={creatingProduct}>
              {creatingProduct ? "Creating Product..." : "Create Product"}
            </ButtonModule>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  )
}

export default AddProduct
