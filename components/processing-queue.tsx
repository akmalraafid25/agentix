"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconList, IconX, IconPlayerPlay, IconPlayerPause, IconRefresh, IconTrash, IconChevronUp, IconChevronDown } from "@tabler/icons-react"

interface QueueItem {
  id: string
  filename: string
  type: 'invoice' | 'packing' | 'bol'
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  stage: string
  estimatedTime: string
  priority: number
}

export function ProcessingQueue() {
  const [isOpen, setIsOpen] = useState(false)
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    {
      id: '1',
      filename: 'Invoice_2024_001.pdf',
      type: 'invoice',
      status: 'processing',
      progress: 65,
      stage: 'Validating',
      estimatedTime: '1m 30s',
      priority: 1
    },
    {
      id: '2',
      filename: 'PackingList_ABC.pdf',
      type: 'packing',
      status: 'queued',
      progress: 0,
      stage: 'Waiting',
      estimatedTime: '3m 15s',
      priority: 2
    },
    {
      id: '3',
      filename: 'BOL_XYZ_123.pdf',
      type: 'bol',
      status: 'completed',
      progress: 100,
      stage: 'Complete',
      estimatedTime: '0s',
      priority: 3
    }
  ])

  const activeCount = queueItems.filter(item => item.status === 'processing' || item.status === 'queued').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-500'
      case 'queued': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return '📄'
      case 'packing': return '📦'
      case 'bol': return '🚢'
      default: return '📄'
    }
  }

  const pauseItem = (id: string) => {
    setQueueItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'queued' as const, stage: 'Paused' } : item
      )
    )
  }

  const resumeItem = (id: string) => {
    setQueueItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'processing' as const, stage: 'Processing' } : item
      )
    )
  }

  const retryItem = (id: string) => {
    setQueueItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'queued' as const, progress: 0, stage: 'Retrying' } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setQueueItems(prev => prev.filter(item => item.id !== id))
  }

  // Simulate processing progress
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueItems(prev => 
        prev.map(item => {
          if (item.status === 'processing' && item.progress < 100) {
            const newProgress = Math.min(item.progress + Math.random() * 10, 100)
            const stages = ['Extracting', 'Validating', 'Matching', 'Complete']
            const stageIndex = Math.floor((newProgress / 100) * stages.length)
            
            return {
              ...item,
              progress: newProgress,
              stage: stages[Math.min(stageIndex, stages.length - 1)],
              status: newProgress >= 100 ? 'completed' as const : 'processing' as const
            }
          }
          return item
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <IconList className="h-4 w-4" />
        {activeCount > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-blue-500 text-white animate-pulse"
          >
            {activeCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed top-16 right-4 z-50 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <IconList className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Processing Queue</h3>
                <Badge variant="secondary">{queueItems.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <IconX className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {queueItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No documents in queue
                </div>
              ) : (
                queueItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{getTypeIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{item.filename}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(item.status)} text-white border-0`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${getStatusColor(item.status)}`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{item.progress}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {item.stage} • {item.estimatedTime}
                          </span>
                          <div className="flex items-center gap-1">
                            {item.status === 'processing' && (
                              <Button variant="ghost" size="sm" onClick={() => pauseItem(item.id)} className="h-6 w-6 p-0">
                                <IconPlayerPause className="w-3 h-3" />
                              </Button>
                            )}
                            {(item.status === 'queued' || item.status === 'failed') && (
                              <Button variant="ghost" size="sm" onClick={() => resumeItem(item.id)} className="h-6 w-6 p-0">
                                <IconPlayerPlay className="w-3 h-3" />
                              </Button>
                            )}
                            {item.status === 'failed' && (
                              <Button variant="ghost" size="sm" onClick={() => retryItem(item.id)} className="h-6 w-6 p-0">
                                <IconRefresh className="w-3 h-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-6 w-6 p-0">
                              <IconTrash className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Pause All
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Clear Completed
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}