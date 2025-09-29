"use client"
import { ButtonModule } from "components/ui/Button/Button"
import React, { useState } from "react"
import { motion } from "framer-motion"

interface EditSubscriptionData {
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  targetAudience: string
  points: number
  discount: number
  features: string[]
}

interface EditSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: EditSubscriptionData) => void
  initialData: EditSubscriptionData
}

type FormData = Omit<EditSubscriptionData, "features"> & { features: string }

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({ isOpen, onClose, onUpdate, initialData }) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name,
    tagline: initialData.tagline,
    monthlyPrice: initialData.monthlyPrice,
    yearlyPrice: initialData.yearlyPrice,
    targetAudience: initialData.targetAudience,
    points: initialData.points,
    discount: initialData.discount,
    features: initialData.features.join(", "),
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      if (name === "monthlyPrice" || name === "yearlyPrice" || name === "points" || name === "discount") {
        return { ...prev, [name]: Number(value) } as FormData
      }
      return { ...prev, [name]: value } as FormData
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const updatedData: EditSubscriptionData = {
      ...formData,
      features: formData.features.split(",").map((f) => f.trim()),
    }
    onUpdate(updatedData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
        >
          x
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Subscription Plan</h2>
          <p className="text-sm text-gray-500">Update your subscription plan details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Plan Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Monthly Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                <input
                  type="number"
                  name="monthlyPrice"
                  value={formData.monthlyPrice}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pl-8 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Yearly Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                <input
                  type="number"
                  name="yearlyPrice"
                  value={formData.yearlyPrice}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pl-8 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Audience</label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Points</label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Discount (%)</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pr-8 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Key Features (comma separated)</label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#00a4a6] focus:ring-[#00a4a6]"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Separate each feature with a comma</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <ButtonModule
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </ButtonModule>
            <ButtonModule
              type="submit"
              variant="primary"
              size="md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save Changes
            </ButtonModule>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default EditSubscriptionModal
