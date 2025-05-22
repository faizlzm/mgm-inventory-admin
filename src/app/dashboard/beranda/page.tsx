import { SectionOverview } from "@/components/section-overview"

export default function BerandaPage() {
  return (
    <div className="flex flex-col gap-4">
      <SectionOverview
        title="Statistik Peminjaman"
        description="placeholder desc"
      />
      <div className="bg-muted/50 min-h-[400px] flex-1 rounded-xl md:min-h-min flex items-center justify-center">
        <span className="text-muted-foreground">Main Dashboard Content</span>
      </div>

      <SectionOverview
        title="Detail Informasi Aktivitas Inventaris Lab"
        description="placeholder desc"
      />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">Summary Card 1</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">Summary Card 2</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">Summary Card 3</span>
        </div>
      </div>
    </div>
  )
}
