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
        
        const itemsWithMatch = allItems.map((item: any) => {
          const invoiceItem = invoices.find((inv: any) => {
            const itemCodes = Array.isArray(inv.item_no) ? inv.item_no : [inv.item_no]
            return itemCodes.some((code: string) => code === item.itemCode) && 
                   inv.purchase_order_no === item.poNumber
          })
          const packingItem = packing.find((pack: any) => {
            const itemCodes = Array.isArray(pack.item_no) ? pack.item_no : [pack.item_no]
            return itemCodes.some((code: string) => code === item.itemCode) && 
                   pack.purchase_order_no === item.poNumber
          })
          
          let matchStatus = 'match'
          let mismatchReason = ''
          
          if (!invoiceItem && !packingItem) {
            matchStatus = 'not_found'
            mismatchReason = 'Item not found in both invoice and packing list'
          } else if (!invoiceItem) {
            matchStatus = 'packing_only'
            mismatchReason = 'Item only exists in packing list'
          } else if (!packingItem) {
            matchStatus = 'invoice_only'
            mismatchReason = 'Item only exists in invoice'
          } else {
            // Check both item code and quantity match
            const getQuantityForItem = (doc: any, itemCode: string) => {
              const itemCodes = Array.isArray(doc.item_no) ? doc.item_no : [doc.item_no]
              const quantities = Array.isArray(doc.quantity) ? doc.quantity : [doc.quantity]
              const itemIndex = itemCodes.findIndex((code: string) => code === itemCode)
              return itemIndex >= 0 ? quantities[itemIndex] : 0
            }
            
            const invoiceQty = getQuantityForItem(invoiceItem, item.itemCode)
            const packingQty = getQuantityForItem(packingItem, item.itemCode)
            
            if (Number(invoiceQty) !== Number(packingQty)) {
              matchStatus = 'qty_mismatch'
              mismatchReason = `Quantity mismatch: Invoice ${invoiceQty} ≠ Packing ${packingQty}`
            }
          }
          
          return {
            ...item,
            matchPL: matchStatus === 'match',
            matchStatus,
            mismatchReason
          }
        })
        
        const filteredItems = itemsWithMatch.filter((item: any) => 
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
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
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
                <TableHead>Match PL</TableHead>
                <TableHead>Skip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsData.map((item: any, index) => (
                <TableRow key={index}>
                  <TableCell>{item.poNumber}</TableCell>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitPrice}</TableCell>
                  <TableCell>{item.lineAmount}</TableCell>
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 max-h-60 overflow-y-auto">
          <div className="flex items-start gap-2">
            <IconCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-2">Items match between invoice and packing list:</h4>
              <div className="space-y-2 text-sm">
                {itemsData.map((item: any, index) => (
                  <div key={index} className={`flex items-start gap-2 p-2 rounded ${item.matchPL ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono font-medium">{item.itemCode}:</span>
                      <span>Qty {item.quantity}</span>
                      {item.matchPL ? (
                        <IconCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <IconX className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                    {!item.matchPL && item.mismatchReason && (
                      <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded flex-shrink-0">
                        {item.mismatchReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-green-700 mt-3 font-medium">
                {itemsData.filter((item: any) => item.matchPL).length} of {itemsData.length} items match between invoice and packing list.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}