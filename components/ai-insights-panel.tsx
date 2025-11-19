"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconBrain, IconX, IconTrendingUp, IconAlertTriangle, IconCheck, IconArrowRight } from "@tabler/icons-react"

interface Insight {
  id: string
  type: 'anomaly' | 'pattern' | 'suggestion' | 'risk' | 'trend'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  action?: string
  value?: string
}

export function AIInsightsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'anomaly',
      title: 'Unusual Vendor Pricing',
      description: 'TechCorp invoices are 15% above historical average',
      severity: 'medium',
      action: 'Review Pricing',
      value: '+15%'
    },
    {
      id: '2',
      type: 'suggestion',
      title: 'Auto-Match Available',
      description: '5 documents missing PO numbers can be auto-matched',
      severity: 'low',
      action: 'Auto-Match',
      value: '5 docs'
    },
    {
      id: '3',
      type: 'risk',
      title: 'High Exception Rate',
      description: 'Vendor ABC has 80% exception rate this month',
      severity: 'high',
      action: 'Contact Vendor',
      value: '80%'
    },
    {
      id: '4',
      type: 'trend',
      title: 'Volume Increase',
      description: 'Invoice processing up 25% vs last month',
      severity: 'low',
      value: '+25%'
    }
  ])

  const getIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <IconAlertTriangle className="w-4 h-4" />
      case 'pattern': return <IconTrendingUp className="w-4 h-4" />
      case 'suggestion': return <IconCheck className="w-4 h-4" />
      case 'risk': return <IconAlertTriangle className="w-4 h-4" />
      case 'trend': return <IconTrendingUp className="w-4 h-4" />
      default: return <IconBrain className="w-4 h-4" />
    }
  }

  const getColors = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
      case 'low': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
    }
  }

  // Simulate real-time insights
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newInsight: Insight = {
          id: Date.now().toString(),
          type: 'suggestion',
          title: 'New Optimization',
          description: 'AI detected potential process improvement',
          severity: 'low',
          action: 'Review'
        }
        setInsights(prev => [newInsight, ...prev.slice(0, 4)])
      }
    }, 15000)

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
        <IconBrain className="h-4 w-4" />
        <Badge 
          variant="secondary" 
          className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-purple-500 text-white"
        >
          {insights.filter(i => i.severity === 'high').length}
        </Badge>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed top-16 right-4 z-50 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <IconBrain className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">AI Insights</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <IconX className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-4 space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border ${getColors(insight.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{insight.title}</p>
                        {insight.value && (
                          <Badge variant="outline" className="text-xs">
                            {insight.value}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs mt-1 opacity-80">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs mt-2 p-1"
                        >
                          {insight.action}
                          <IconArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" size="sm" className="w-full">
                View All Insights
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}