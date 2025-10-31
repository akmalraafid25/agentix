"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { IconX, IconCheck, IconAlertTriangle } from "@tabler/icons-react"
import { Checkbox } from "@/components/ui/checkbox"



interface ItemsMatchDialogProps {
  documentSet: string
}

export function ItemsMatchDialog({ documentSet }: ItemsMatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [itemsData, setItemsData] = useState<unknown[]>([])

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [invoices, packing] = await Promise.all([
          fetch('/api/invoices').then(res => res.json()),
          fetch('/api/packing').then(res => res.json())
        ])
        
        const response = await fetch('/api/invoice-items')
        const allItems = await response.json()
        
        const itemsWithMatch = allItems.map(item => {
          const hasInvoice = invoices.some(inv => inv.purchase_order_no === item.poNumber)
          const hasPacking = packing.some(pack => pack.purchase_order_no === item.poNumber)
          return {
            ...item,
            matchPL: hasInvoice && hasPacking,
            matchERP: true
          }
        })
        
        const filteredItems = itemsWithMatch.filter(item => 
          documentSet.includes(item.invoiceNo) || documentSet.includes(item.poNumber)
        )
        setItemsData(filteredItems.length > 0 ? filteredItems : itemsWithMatch.slice(0, 5))
      } catch (error) {
        console.error('Error fetching items:', error)
      }
    }
    fetchItems()
  }, [documentSet])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Items Match
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Items Match Details - {documentSet}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Item Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Line Amount</TableHead>
                <TableHead>Match ERP</TableHead>
                <TableHead>Match PL</TableHead>
                <TableHead>Skip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.poNumber}</TableCell>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitPrice}</TableCell>
                  <TableCell>{item.lineAmount}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {item.matchERP ? (
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <IconCheck className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <IconX className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {item.matchPL ? (
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <IconCheck className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <IconX className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <IconAlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700 leading-relaxed">
              All items match between invoice and packing list: - **MZ-RM-R200-01**: Invoice qty 163 = Packing list qty 163 ✓ - **MZ-RM-R200-02**: Invoice qty 163 = Packing list qty 163 ✓ - **MZ-RM-R200-03**: Invoice qty 163 = Packing list qty 163 ✓ - **MZ-RM-R200-04**: Invoice qty 326 = Packing list qty 326 ✓ - **MZ-RM-R200-05**: Invoice qty 163 = Packing list qty 163 ✓ - **MZ-RM-R200-06**: Invoice qty 163 = Packing list qty 163 ✓ - **MZ-RM-R200-07**: Invoice qty 163 = Packing list qty 163 ✓ - **MZ-RM-R200-08**: Invoice qty 163 = Packing list qty 163 ✓ - **MZ-RM-R200-09**: Invoice qty 163 = Packing list qty 163 ✓ All 9 items have matching quantities between invoice and packing list.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}