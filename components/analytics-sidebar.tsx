"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSend, IconUser, IconRobot, IconX } from "@tabler/icons-react"

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface AnalyticsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AnalyticsSidebar({ isOpen, onClose }: AnalyticsSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your Assistant. Ask me anything about your data analytics.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [width, setWidth] = useState(384) // 96 * 4 = 384px (w-96)
  const [isResizing, setIsResizing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      setWidth(Math.max(300, Math.min(800, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    
    try {
      const response = await fetch('/api/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      })
      
      const { response: cortexResponse } = await response.json()
      
      if (Array.isArray(cortexResponse)) {
        cortexResponse.forEach((item, index) => {
          let content = ''
          
          if (item.type === 'text') {
            content = item.text
          } else if (item.type === 'sql') {
            // Format SQL as code block with preserved indentation
            content = '<strong>SQL Query:</strong><br/><br/>'
            content += '<div class="bg-gray-100 border rounded p-3 font-mono text-xs overflow-x-auto">'
            content += '<pre class="whitespace-pre">' + item.statement + '</pre>'
            content += '</div>'
          } else if (item.type === 'results') {
            content = '<strong>Query Results:</strong><br/><br/>'
            if (item.results && item.results.length > 0) {
              const headers = Object.keys(item.results[0])
              content += '<div class="overflow-x-auto">'
              content += '<table class="min-w-full border border-gray-300 text-xs">'
              content += '<thead><tr>' + headers.map(h => `<th class="border border-gray-300 px-1 py-1 text-left">${h}</th>`).join('') + '</tr></thead>'
              content += '<tbody>'
              item.results.forEach(row => {
                content += '<tr>' + headers.map(h => `<td class="border border-gray-300 px-1 py-1">${row[h] || ''}</td>`).join('') + '</tr>'
              })
              content += '</tbody></table></div>'
            } else {
              content += 'No results found'
            }
          }
          
          const assistantMessage: Message = {
            id: (Date.now() + index + 1).toString(),
            content: content,
            sender: 'assistant',
            timestamp: new Date()
          }
          
          setTimeout(() => {
            setMessages(prev => [...prev, assistantMessage])
          }, index * 500)
        })
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: typeof cortexResponse === 'string' ? cortexResponse : JSON.stringify(cortexResponse),
          sender: 'assistant',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div 
      className={`fixed right-0 top-0 h-screen bg-background border-l transition-all duration-300 ${isOpen ? '' : 'w-0'} overflow-hidden z-40`}
      style={{ width: isOpen ? `${width}px` : '0px' }}
    >
      {isOpen && (
        <div 
          className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}
      <Card className="h-full flex flex-col rounded-none border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Analytics Chat</CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Cortex Analyst Connected"></div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <IconRobot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.content }} />
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <IconUser className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your data..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <IconSend className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}