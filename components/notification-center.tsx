"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconBell, IconX, IconCheck, IconAlertTriangle, IconClock, IconEye } from "@tabler/icons-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: 'processing' | 'success' | 'attention' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionLabel?: string
  actionUrl?: string
  actionCallback?: () => void
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  // Add notification function with duplicate prevention
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    setNotifications(prev => {
      // Check if similar notification already exists
      const exists = prev.some(n => 
        n.title === notification.title && 
        n.message === notification.message &&
        n.type === notification.type
      )
      
      if (exists) return prev
      
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      }
      
      return [newNotification, ...prev.slice(0, 9)]
    })
    
    // Show toast for important notifications
    if (notification.type === 'error') {
      toast.error(notification.title)
    } else if (notification.type === 'success') {
      toast.success(notification.title)
    }
  }

  // Fetch real data and generate notifications
  useEffect(() => {
    const fetchDataAndGenerateNotifications = async () => {
      try {
        const [invoices, packing, billOfLandings] = await Promise.all([
          fetch('/api/invoices').then(res => res.json()),
          fetch('/api/packing').then(res => res.json()),
          fetch('/api/bill-of-landings').then(res => res.json())
        ])

        // Check for recent uploads (last 5 minutes)
        const recentTime = new Date(Date.now() - 5 * 60 * 1000)
        
        // Process invoices
        invoices.forEach((invoice: any) => {
          const createdAt = new Date(invoice.created_at)
          if (createdAt > recentTime) {
            addNotification({
              type: 'success',
              title: 'Invoice Processed',
              message: `${invoice.source || invoice.invoice_no} processed successfully`,
              read: false,
              actionLabel: 'View',
              actionCallback: () => {
                router.push('/docs')
                setIsOpen(false)
              }
            })
          }
        })

        // Check for mismatches
        const poGroups: Record<string, any> = {}
        
        invoices.forEach((invoice: any) => {
          const po = invoice.purchase_order_no
          if (!poGroups[po]) poGroups[po] = { invoice: null, packing: null }
          poGroups[po].invoice = invoice
        })
        
        packing.forEach((pack: any) => {
          const po = pack.purchase_order_no
          if (!poGroups[po]) poGroups[po] = { invoice: null, packing: null }
          poGroups[po].packing = pack
        })

        // Generate mismatch notifications
        Object.entries(poGroups).forEach(([po, group]: [string, any]) => {
          const hasInvoice = !!group.invoice
          const hasPacking = !!group.packing
          
          if (hasInvoice && hasPacking) {
            const invoiceItems = group.invoice.item_no || []
            const packingItems = group.packing.item_no || []
            
            if (invoiceItems.length > 0 && packingItems.length > 0) {
              const matchingItems = invoiceItems.filter((item: string) => 
                packingItems.includes(item)
              )
              
              if (matchingItems.length !== invoiceItems.length || matchingItems.length !== packingItems.length) {
                addNotification({
                  type: 'attention',
                  title: 'Mismatch Detected',
                  message: `Item mismatch in PO-${po} requires review`,
                  read: false,
                  actionLabel: 'Review',
                  actionCallback: () => {
                    router.push('/report')
                    setIsOpen(false)
                  }
                })
              }
            }
          } else if (hasInvoice && !hasPacking) {
            addNotification({
              type: 'attention',
              title: 'Missing Document',
              message: `Packing list missing for PO-${po}`,
              read: false,
              actionLabel: 'Review',
              actionCallback: () => {
                router.push('/report')
                setIsOpen(false)
              }
            })
          }
        })

      } catch (error) {
        console.error('Failed to fetch data for notifications:', error)
      }
    }

    fetchDataAndGenerateNotifications()
    
    // Refresh notifications every 2 minutes to avoid spam
    const interval = setInterval(fetchDataAndGenerateNotifications, 120000)
    return () => clearInterval(interval)
  }, [router])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'processing': return <IconClock className="w-4 h-4 text-blue-500" />
      case 'success': return <IconCheck className="w-4 h-4 text-green-500" />
      case 'attention': return <IconAlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error': return <IconX className="w-4 h-4 text-red-500" />
      default: return <IconBell className="w-4 h-4" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'processing': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'attention': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  // Listen for document events
  useEffect(() => {
    const handleDocumentUpload = (event: CustomEvent) => {
      addNotification({
        type: 'processing',
        title: 'Document Uploaded',
        message: `${event.detail.filename} is being processed...`,
        read: false
      })
    }

    const handleDocumentComplete = (event: CustomEvent) => {
      addNotification({
        type: 'success',
        title: 'Processing Complete',
        message: `${event.detail.filename} processed successfully`,
        read: false,
        actionLabel: 'View',
        actionCallback: () => {
          router.push('/docs')
          setIsOpen(false)
        }
      })
    }

    const handleDocumentError = (event: CustomEvent) => {
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: `${event.detail.filename} failed to process`,
        read: false,
        actionLabel: 'Retry',
        actionCallback: () => {
          toast.info('Retrying document processing...')
          setIsOpen(false)
        }
      })
    }

    window.addEventListener('documentUpload', handleDocumentUpload as EventListener)
    window.addEventListener('documentComplete', handleDocumentComplete as EventListener)
    window.addEventListener('documentError', handleDocumentError as EventListener)

    return () => {
      window.removeEventListener('documentUpload', handleDocumentUpload as EventListener)
      window.removeEventListener('documentComplete', handleDocumentComplete as EventListener)
      window.removeEventListener('documentError', handleDocumentError as EventListener)
    }
  }, [router])



  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <IconBell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed top-16 right-4 z-50 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString()}
                          </span>
                          {notification.actionLabel && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (notification.actionCallback) {
                                  notification.actionCallback()
                                } else if (notification.actionUrl) {
                                  router.push(notification.actionUrl)
                                  setIsOpen(false)
                                }
                              }}
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}