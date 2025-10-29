"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconCirclePlusFilled } from "@tabler/icons-react"
import { toast } from "sonner"

interface AddInvoiceDialogProps {
  onAdd: (invoice: any) => void
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
    } catch (error) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <IconCirclePlusFilled className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
               onClick={() => document.getElementById('file-input')?.click()}>
            <div className="mx-auto w-12 h-12 mb-4 text-muted-foreground">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Drop your PDF file here, or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF files only, up to 10MB</p>
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
          
          {formData.source && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{formData.source}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!formData.source}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}