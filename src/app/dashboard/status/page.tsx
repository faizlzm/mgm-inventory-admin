"use client"

import { useState, useEffect } from "react"
import { SectionOverview } from "@/components/section-overview"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchIcon, X, Check } from "lucide-react"
import { 
  Transaction, 
  Status, 
  getAllTransactions,
  calculateDaysRemaining,
  sortTransactionsByPriority,
  updateTransactionStatus,
  searchTransactions,
  filterTransactionsByStatus,
  formatEndDate
} from "@/lib/transactions"

export default function StatusPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(getAllTransactions())
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCompleted, setShowCompleted] = useState(false)

  // Initialize filteredTransactions on component mount
  useEffect(() => {
    const initialData = getAllTransactions()
    setTransactions(initialData)
    const sorted = sortTransactionsByPriority(initialData)
    setFilteredTransactions(sorted)
  }, [])
  // Handle approve action
  const handleApprove = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) return
    
    // Logic: request -> in-progress, return -> complete
    let newStatus: Status
    if (transaction.status === "request") {
      newStatus = "in-progress"
    } else if (transaction.status === "return") {
      newStatus = "complete"
    } else {
      return 
    }
    
    setTransactions(prev => updateTransactionStatus(prev, transactionId, newStatus))
  }

  // Handle reject action
  const handleReject = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) return
    
    // Logic: request -> decline, return -> pending
    let newStatus: Status
    if (transaction.status === "request") {
      newStatus = "decline"
    } else if (transaction.status === "return") {
      newStatus = "pending"
    } else {
      return
    }
    
    setTransactions(prev => updateTransactionStatus(prev, transactionId, newStatus))
  }
    // Filter transactions based on search, status, and completed toggle
  useEffect(() => {
    let filtered = [...transactions]
    
    // Apply search filter
    filtered = searchTransactions(filtered, searchQuery)
    
    // Apply status filter
    filtered = filterTransactionsByStatus(filtered, statusFilter, showCompleted)
    
    // Sort by priority
    filtered = sortTransactionsByPriority(filtered)
    
    setFilteredTransactions(filtered)
  }, [transactions, searchQuery, statusFilter, showCompleted])

  return (
    <div className="flex flex-col gap-6 p-2">
      <SectionOverview
        title="Status Peminjaman"
        description="Daftar status peminjaman barang aktif"
      />
      
      <Card className="bg-white rounded-2xl shadow-sm border">
        <CardContent className="p-6">
          {/* Filters and controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peminjam atau item..."
                  className="pl-8 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="show-completed" 
                  checked={showCompleted} 
                  onCheckedChange={(checked) => setShowCompleted(checked === true)}
                />
                <Label htmlFor="show-completed">Tampilkan yang selesai & ditolak</Label>
              </div>
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px] rounded-lg">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="request">Permintaan</SelectItem>
                <SelectItem value="return">Pengembalian</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">Dalam Peminjaman</SelectItem>
                <SelectItem value="decline">Ditolak</SelectItem>
                <SelectItem value="complete">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card-based list */}
          <div className="space-y-3">            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 rounded-xl border hover:bg-gray-50 transition-colors"
                >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-sm font-medium text-white">
                      {transaction.avatar}
                    </div>
                      {/* Content */}                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{transaction.userName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {transaction.itemName}
                    </p>
                  </div>                  
                  {/* Date pill for request status */}
                  {transaction.status === "request" && (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatEndDate(transaction.endDate)}
                    </div>
                  )}
                  
                  {/* Days Remaining Badge - Show for in-progress, pending, and return requests */}
                  {(transaction.status === "in-progress" || 
                    transaction.status === "pending" ||
                    transaction.status === "return") && (() => {
                    const { days, isOverdue } = calculateDaysRemaining(transaction.endDate)
                    
                    return (
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isOverdue 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {isOverdue ? `Terlambat ${days} hari` : `${days} hari lagi`}
                      </div>
                    )
                  })()}
                  
                  {/* Status Badge or Actions */}
                  <div className="flex items-center justify-end gap-2">                    
                    {(transaction.status === "request" || transaction.status === "return") ? (
                      <>
                          {/* Status pill */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === "request" 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {transaction.status === "request" 
                              ? "Permintaan Peminjaman" 
                              : "Permintaan Pengembalian"
                            }
                          </span>
                          {/* Action buttons for requests */}
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(transaction.id)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-green-200 hover:bg-green-50"
                              onClick={() => handleApprove(transaction.id)}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          </div>
                        </>                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === "decline" 
                            ? "bg-red-100 text-red-800" 
                            : transaction.status === "complete"
                              ? "bg-gray-100 text-gray-800"
                              : transaction.status === "pending"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                        }`}>
                          {transaction.status === "in-progress" && "Dalam Peminjaman"}
                          {transaction.status === "pending" && "Pending"}
                          {transaction.status === "complete" && "Selesai"}
                          {transaction.status === "decline" && "Ditolak"}
                        </span>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Tidak ada data peminjaman yang ditemukan.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
