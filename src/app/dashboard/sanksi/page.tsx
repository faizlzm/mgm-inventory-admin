"use client"

import { useState, useEffect } from "react"
import { SectionOverview } from "@/components/section-overview"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Mail, X, Check, Trash2 } from "lucide-react"
import { 
  Transaction, 
  getAllTransactions,
  getOverdueTransactions,
  calculateDaysRemaining,
  updateTransactionStatus
} from "@/lib/transactions"

export default function SanksiPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(getAllTransactions())
  const [sanctions, setSanctions] = useState<Transaction[]>([])
  const [selectedSanctions, setSelectedSanctions] = useState<string[]>([])

  // Filter transactions to show only overdue ones
  useEffect(() => {
    const overdueTransactions = getOverdueTransactions()
    setSanctions(overdueTransactions)
  }, [allTransactions]) 
  const handleApprove = (id: string) => {
    setAllTransactions(prev => updateTransactionStatus(prev, id, "complete"))
    setSelectedSanctions(prev => prev.filter(selectedId => selectedId !== id))
  }

  // Handle individual sanction rejection (remove) - change status to complete
  const handleReject = (id: string) => {
    setAllTransactions(prev => updateTransactionStatus(prev, id, "complete"))
    setSelectedSanctions(prev => prev.filter(selectedId => selectedId !== id))
  }
  // Handle bulk delete - change all selected transactions to complete
  const handleBulkDelete = () => {
    setAllTransactions(prev => 
      prev.map(transaction => 
        selectedSanctions.includes(transaction.id)
          ? updateTransactionStatus([transaction], transaction.id, "complete")[0]
          : transaction
      )
    )
    setSelectedSanctions([])
  }

  // Handle individual selection
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSanctions(prev => [...prev, id])
    } else {
      setSelectedSanctions(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSanctions(sanctions.map(sanction => sanction.id))
    } else {
      setSelectedSanctions([])
    }
  }

  return (
    <div className="flex flex-col gap-4">      <SectionOverview
        title="Data Sanksi"
        description="Daftar pengguna dengan transaksi terlambat (peminjaman, pengembalian, atau tertunda)"
      />
      
      <Card className="flex-1">
        <CardContent className="p-6">
          {/* Select All Header */}
          {sanctions.length > 0 && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <Checkbox
                checked={selectedSanctions.length === sanctions.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Pilih semua ({selectedSanctions.length}/{sanctions.length})
              </span>
            </div>
          )}

          <div className="space-y-4">
            {sanctions.map((sanction) => (
              <div 
                key={sanction.id}
                className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors ${
                  selectedSanctions.includes(sanction.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <Checkbox
                  checked={selectedSanctions.includes(sanction.id)}
                  onCheckedChange={(checked) => handleSelect(sanction.id, checked as boolean)}
                />
                
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-sm font-medium text-white">
                  {sanction.avatar}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{sanction.userName}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Belum mengembalikan {sanction.itemName}. Harap hubungi segera!
                  </p>
                </div>
                
                {/* Days Overdue and Actions */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const { days } = calculateDaysRemaining(sanction.endDate)
                    return (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {days} hari terlambat
                      </div>
                    )
                  })()}
                  
                  {/* Mail Action */}
                  <Mail className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-600 transition-colors" />
                  
                  {/* Reject Action */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Selesaikan Sanksi</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menyelesaikan sanksi untuk {sanction.userName}? 
                          Status peminjaman akan diubah menjadi selesai.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleReject(sanction.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Selesaikan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Approve Action */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                        <Check className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Selesaikan Sanksi</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menyelesaikan sanksi untuk {sanction.userName}? 
                          Status peminjaman akan diubah menjadi selesai.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleApprove(sanction.id)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Selesaikan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {sanctions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Tidak ada sanksi aktif</p>
              </div>
            )}
          </div>

          {/* Bulk Delete Button */}
          {selectedSanctions.length > 0 && (
            <div className="mt-6 pt-4 border-t flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Selesaikan ({selectedSanctions.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Selesaikan Sanksi Terpilih</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menyelesaikan {selectedSanctions.length} sanksi yang dipilih? 
                      Status peminjaman akan diubah menjadi selesai.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleBulkDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Selesaikan Semua
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
