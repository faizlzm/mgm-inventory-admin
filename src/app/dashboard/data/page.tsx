"use client"

import { useState, useEffect } from "react"
import { SectionOverview } from "@/components/section-overview"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { CheckIcon, XIcon, SearchIcon } from "lucide-react"

// Transaction status types
type Status = "request" | "in-progress" | "return" | "completed"

// User transaction interface
interface Transaction {
  id: string
  userName: string
  itemName: string
  startDate: string
  endDate: string
  status: Status
}

// Import transaction data from JSON file
import transactionsData from "@/data/transactions.json"

// Use the imported data as mock transactions
const mockTransactions: Transaction[] = transactionsData as Transaction[]

export default function DataPage() {
  // State for transactions and filtering
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCompleted, setShowCompleted] = useState(false)
  
  // Filter transactions based on search, status, and completed toggle
  useEffect(() => {
    let filtered = [...transactions]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        transaction => 
          transaction.userName.toLowerCase().includes(query) ||
          transaction.itemName.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }
    
    // Apply completed toggle (hide completed if not checked)
    if (!showCompleted) {
      filtered = filtered.filter(transaction => transaction.status !== "completed")
    }
    
    setFilteredTransactions(filtered)
  }, [transactions, searchQuery, statusFilter, showCompleted])
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }
  
  // Handle approve request
  const handleApprove = (id: string) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, status: "in-progress" as Status } 
          : transaction
      )
    )
  }
  
  // Handle reject request or return
  const handleReject = (id: string) => {
    // In a real app, we might do something different for different statuses
    console.log("Rejected transaction", id)
  }
  
  // Handle approve return
  const handleApproveReturn = (id: string) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, status: "completed" as Status } 
          : transaction
      )
    )
  }
  
  // Get appropriate status badge color based on status
  const getStatusColor = (status: Status) => {
    switch (status) {
      case "request":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "return":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "completed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionOverview
        title="Data Peminjaman"
        description="Manajemen daftar peminjaman dan pengembalian barang"
      />
      
      <div className="bg-muted/50 flex-1 p-4 rounded-xl min-h-[600px]">
        {/* Filters and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari peminjam atau item..."
                className="pl-8"
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
              <Label htmlFor="show-completed">Tampilkan yang selesai</Label>
            </div>
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="request">Permintaan</SelectItem>
              <SelectItem value="in-progress">Dalam Peminjaman</SelectItem>
              <SelectItem value="return">Pengembalian</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Transaction table */}
        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="py-3 w-[250px]">Peminjam & Item</TableHead>
                <TableHead className="py-3">Tanggal Peminjaman</TableHead>
                <TableHead className="py-3 w-[150px]">Status</TableHead>
                <TableHead className="text-right py-3 w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/30">
                    <TableCell className="py-3">
                      <div className="font-medium">{transaction.userName}</div>
                      <div className="text-sm text-muted-foreground">{transaction.itemName}</div>
                    </TableCell>
                    <TableCell className="py-3">
                      {formatDate(transaction.startDate)} - {formatDate(transaction.endDate)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status === "request" && "Permintaan"}
                        {transaction.status === "in-progress" && "Dalam Peminjaman"}
                        {transaction.status === "return" && "Pengembalian"}
                        {transaction.status === "completed" && "Selesai"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {transaction.status === "request" && (
                        <div className="flex justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <CheckIcon className="mr-1 h-4 w-4" /> Setujui
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menyetujui permintaan peminjaman &ldquo;{transaction.itemName}&rdquo; oleh {transaction.userName}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApprove(transaction.id)}>
                                  Setujui
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <XIcon className="mr-1 h-4 w-4" /> Tolak
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menolak permintaan peminjaman &ldquo;{transaction.itemName}&rdquo; oleh {transaction.userName}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReject(transaction.id)}>
                                  Tolak
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                      {transaction.status === "return" && (
                        <div className="flex justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <CheckIcon className="mr-1 h-4 w-4" /> Terima
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Penerimaan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menerima pengembalian &ldquo;{transaction.itemName}&rdquo; dari {transaction.userName}? 
                                  Tindakan ini akan menyelesaikan transaksi.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApproveReturn(transaction.id)}>
                                  Terima
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <XIcon className="mr-1 h-4 w-4" /> Tolak
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menolak pengembalian &ldquo;{transaction.itemName}&rdquo; dari {transaction.userName}? 
                                  Mungkin ada masalah dengan kondisi barang.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReject(transaction.id)}>
                                  Tolak
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                      {(transaction.status === "in-progress" || transaction.status === "completed") && (
                        <span className="text-sm text-muted-foreground">Tidak ada aksi</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Tidak ada data peminjaman yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}
