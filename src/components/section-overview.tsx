import * as React from "react"

interface SectionOverviewProps {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}

export function SectionOverview({
  title,
  description,
  icon,
  className,
  ...props
}: SectionOverviewProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`bg-muted/30 p-4 rounded-lg mb-4 ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 p-1.5 bg-primary/10 rounded-md text-primary">{icon}</div>}
        <div className="space-y-1">
          <h2 className="font-medium text-lg">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}
