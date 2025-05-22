import { SectionOverview } from "@/components/section-overview"

export default function SanksiPage() {
  return (
    <div className="flex flex-col gap-4">
      <SectionOverview
        title="Sanksi Peminjaman"
        description="Late return, lost item, etc."
      />
      <div className="bg-muted/50 flex-1 p-4 rounded-xl min-h-[400px]">
        <div className="h-full border border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center">
          List penerima sanksi peminjaman
        </div>
      </div>
    </div>
  )
}
