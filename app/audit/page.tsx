"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsSidebar } from "@/components/analytics-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { IconRobotFace, IconFileText, IconShield, IconUsers, IconClock, IconDownload } from "@tabler/icons-react"

const auditData = [
  {
    timestamp: "14 Oct 2025 14:18:38",
    user: "SWO Demo",
    action: "UPDATE",
    collection: "pending_reviews",
    documentId: "",
    status: "Success",
    compliance: "Compliant"
  },
  {
    timestamp: "14 Oct 2025 14:18:35",
    user: "SWO Demo", 
    action: "CREATE",
    collection: "agent_action_history",
    documentId: "",
    status: "Success",
    compliance: "Compliant"
  },
  {
    timestamp: "14 Oct 2025 14:18:28",
    user: "SWO Demo",
    action: "UPDATE", 
    collection: "pending_reviews",
    documentId: "",
    status: "Success",
    compliance: "Compliant"
  },
  {
    timestamp: "14 Oct 2025 14:18:25",
    user: "SWO Demo",
    action: "CREATE",
    collection: "agent_action_history", 
    documentId: "",
    status: "Success",
    compliance: "Compliant"
  },
  {
    timestamp: "14 Oct 2025 14:18:15",
    user: "SWO Demo",
    action: "UPDATE",
    collection: "pending_reviews",
    documentId: "",
    status: "Success", 
    compliance: "Compliant"
  },
  {
    timestamp: "14 Oct 2025 14:18:12",
    user: "SWO Demo",
    action: "CREATE",
    collection: "agent_action_history",
    documentId: "",
    status: "Success",
    compliance: "Compliant"
  }
]

export default function AuditPage() {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "14rem",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <div className="flex flex-1">
        <SidebarInset className={`flex-1 transition-all duration-300 ${isAnalyticsOpen ? 'mr-96' : 'mr-0'}`}>
          <SiteHeader>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
              className="ml-auto"
            >
              <IconRobotFace className="h-4 w-4 mr-2" />
              AI Analytics
            </Button>
          </SiteHeader>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <h1 className="text-2xl font-semibold mb-6">Audit Trails & Compliance</h1>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 gap-4 mb-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                    <Card className="@container/card h-36">
                      <CardHeader>
                        <CardDescription className="text-md flex items-center gap-2">
                          <IconFileText className="h-4 w-4" />
                          Total Audit Records
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
                          282
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    
                    <Card className="@container/card h-36">
                      <CardHeader>
                        <CardDescription className="flex items-center gap-2">
                          <IconShield className="h-4 w-4" />
                          Compliance Rate
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
                          95.2%
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    
                    <Card className="@container/card h-36">
                      <CardHeader>
                        <CardDescription className="flex items-center gap-2">
                          <IconUsers className="h-4 w-4" />
                          Active Users
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
                          12
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    
                    <Card className="@container/card h-36">
                      <CardHeader>
                        <CardDescription className="flex items-center gap-2">
                          <IconClock className="h-4 w-4" />
                          Failed Actions
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
                          3
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Tabs and Table */}
                  <Card>
                    <div className="p-6">
                      <Tabs defaultValue="audit-trail" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <TabsList>
                            <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
                            <TabsTrigger value="compliance-reports">Compliance Reports</TabsTrigger>
                            <TabsTrigger value="activity-timeline">Activity Timeline</TabsTrigger>
                          </TabsList>
                          <Button variant="outline" size="sm">
                            <IconDownload className="h-4 w-4 mr-2" />
                            Export to CSV
                          </Button>
                        </div>
                        
                        <TabsContent value="audit-trail">
                          <div className="mb-4">
                            <div className="flex gap-2">
                              <input
                                type="date"
                                placeholder="Start date"
                                className="px-3 py-2 border rounded-md text-sm"
                              />
                              <span className="flex items-center text-sm text-muted-foreground">to</span>
                              <input
                                type="date"
                                placeholder="End date"
                                className="px-3 py-2 border rounded-md text-sm"
                              />
                            </div>
                          </div>
                          
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Collection</TableHead>
                                <TableHead>Document ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Compliance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {auditData.map((record, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-mono text-sm">{record.timestamp}</TableCell>
                                  <TableCell>{record.user}</TableCell>
                                  <TableCell>
                                    <Badge variant={record.action === "CREATE" ? "default" : "secondary"}>
                                      {record.action}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">{record.collection}</TableCell>
                                  <TableCell className="font-mono text-sm">{record.documentId}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                      {record.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                      {record.compliance}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TabsContent>
                        
                        <TabsContent value="compliance-reports">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Compliance Status Overview</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Report Type</TableHead>
                                  <TableHead>Period</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Findings</TableHead>
                                  <TableHead>Last Generated</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>SOX Compliance Report</TableCell>
                                  <TableCell>Q1 2024</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                      Compliant
                                    </Badge>
                                  </TableCell>
                                  <TableCell>0</TableCell>
                                  <TableCell>22 Sep 2025 08:12:51</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Data Privacy Audit</TableCell>
                                  <TableCell>March 2024</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                      Compliant
                                    </Badge>
                                  </TableCell>
                                  <TableCell>2</TableCell>
                                  <TableCell>22 Sep 2025 08:12:51</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Financial Compliance</TableCell>
                                  <TableCell>Q1 2024</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                      Pending
                                    </Badge>
                                  </TableCell>
                                  <TableCell>0</TableCell>
                                  <TableCell>22 Sep 2025 08:12:51</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Security Audit</TableCell>
                                  <TableCell>March 2024</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                      Non-Compliant
                                    </Badge>
                                  </TableCell>
                                  <TableCell>5</TableCell>
                                  <TableCell>22 Sep 2025 08:12:51</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="activity-timeline">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Recent Activity</h3>
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:38</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">UPDATE - pending_reviews</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:35</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">CREATE - agent_action_history</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:28</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">UPDATE - pending_reviews</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:25</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">CREATE - agent_action_history</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:15</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">UPDATE - pending_reviews</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:12</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">CREATE - agent_action_history</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:04</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">UPDATE - pending_reviews</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-muted-foreground">14 Oct 2025 14:18:01</div>
                                  <div className="font-medium">SWO Demo</div>
                                  <div className="text-sm text-muted-foreground">UPDATE - pending_reviews</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
        <AnalyticsSidebar 
          isOpen={isAnalyticsOpen} 
          onClose={() => setIsAnalyticsOpen(false)} 
        />
      </div>
    </SidebarProvider>
  )
}