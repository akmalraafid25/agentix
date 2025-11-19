
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationCenter } from "@/components/notification-center"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { ProcessingQueue } from "@/components/processing-queue"

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex-1" />
        {children}
        <div className="flex items-center gap-2">
          <ProcessingQueue />
          <AIInsightsPanel />
          <NotificationCenter />
        </div>
      </div>
    </header>
  )
}
