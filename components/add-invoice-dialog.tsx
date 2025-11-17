"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconCirclePlusFilled, IconUpload, IconX, IconCheck } from "@tabler/icons-react"
import { toast } from "sonner"

interface AddInvoiceDialogProps {
  onAdd: (invoice: Record<string, unknown>) => void
}

export function AddInvoiceDialog({ onAdd }: AddInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    source: "",
    invoice_no: "",
    vendor_name: "",
    purchase_order_no: "",
    item_no: [""],
    quantity: 0,
    price: "",
    currency: "USD",
    created_at: new Date().toISOString().split('T')[0],
    header: "",
    type: "Invoice"
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) return
    
    // Upload file to Snowflake and send webhook
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('webhookUrl', 'http://localhost:3000/api/webhook')
      
      await fetch(`/api/pdf/${selectedFile.name}`, {
        method: 'POST',
        body: uploadFormData
      })
      toast.success("Document uploaded successfully")
    } catch {
      toast.error("Upload failed")
      return
    }
    
    const newInvoice = {
      ...formData,
      id: Date.now(),
      header: formData.source || `Invoice ${formData.invoice_no}`,
      item_no: formData.item_no.filter(item => item.trim() !== "")
    }
    
    onAdd(newInvoice)
    setOpen(false)
    
    // Reset form
    setFormData({
      source: "",
      invoice_no: "",
      vendor_name: "",
      purchase_order_no: "",
      item_no: [""],
      quantity: 0,
      price: "",
      currency: "USD",
      created_at: new Date().toISOString().split('T')[0],
      header: "",
      type: "Invoice"
    })
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <IconCirclePlusFilled className="mr-2 h-4 w-4" />
        Add Document
      </Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 animate-in fade-in-0 duration-200"
            onClick={() => setOpen(false)}
          />
          
          {/* Dialog */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 border border-gray-200/50 dark:border-gray-700/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upload Document</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <IconX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
              {/* Upload Area */}
              <div 
                className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="mx-auto w-12 h-12 mb-4 text-gray-400 group-hover:text-primary transition-colors duration-300">
                  <IconUpload className="w-full h-full" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop PDF here or click to browse</p>
                  <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                </div>
              </div>
              
              <Input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setFormData({...formData, source: file.name})
                    setSelectedFile(file)
                  }
                }}
                className="hidden"
                required
              />
              
              {/* Selected File */}
              {formData.source && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <IconCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">{formData.source}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Ready to upload</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 font-medium bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                disabled={!formData.source}
              >
                {formData.source ? 'Upload Document' : 'Select a file first'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}