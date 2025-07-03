"use client";

import { useState, useEffect, useCallback } from "react";
import { SectionOverview } from "@/components/section-overview";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SearchIcon, X, Check, RotateCcw } from "lucide-react";

// Status type definition
type Status = "borrow-pending" | "borrow-approved" | "borrow-rejected" | "return-pending" | "return-approved" | "return-rejected";

// Interface untuk data dari API
interface BorrowTransaction {
  id: string;
  userId: number;
  itemId: string;
  userName: string;
  userEmail: string;
  userNIM: string;
  userProgramStudy: string;
  userKTM: string;
  reason: string;
  borrowDate: string;
  pickupDate: string;
  returnDate: string;
  status: Status;
  damagedItem: string | null;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk item
interface Item {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export default function StatusPage() {
  const [transactions, setTransactions] = useState<BorrowTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<BorrowTransaction[]>([]);
  const [itemsMap, setItemsMap] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to fetch items and create a mapping
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items?page=1&limit=100');
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        // Create a map of item ID to item name
        const map = new Map<string, string>();
        data.data.forEach((item: Item) => {
          map.set(item.id, item.name);
        });
        setItemsMap(map);
        console.log(`Loaded ${map.size} items into the map`);
      } else {
        console.warn('Failed to fetch items:', data.message);
      }
    } catch (err) {
      console.warn('Error fetching items:', err);
    }
  }, []);

  // Function to fetch transactions from both borrow and return APIs
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both borrow and return transactions in parallel
      const [borrowResponse, returnResponse] = await Promise.all([
        fetch('/api/borrow?page=1&limit=100'),
        fetch('/api/return?page=1&limit=100')
      ]);

      const [borrowData, returnData] = await Promise.all([
        borrowResponse.json(),
        returnResponse.json()
      ]);

      let allTransactions: BorrowTransaction[] = [];

      // Add borrow transactions if successful
      if (borrowResponse.ok && borrowData.success) {
        allTransactions = [...allTransactions, ...borrowData.data];
      } else {
        console.warn('Failed to fetch borrow transactions:', borrowData.message);
      }

      // Add return transactions if successful
      if (returnResponse.ok && returnData.success) {
        allTransactions = [...allTransactions, ...returnData.data];
      } else {
        console.warn('Failed to fetch return transactions:', returnData.message);
      }

      // If both APIs failed, show error
      if (!borrowResponse.ok && !returnResponse.ok) {
        throw new Error('Failed to fetch transactions from both borrow and return APIs');
      }

      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchItems();
      await fetchTransactions();
    };
    initializeData();
  }, [fetchItems, fetchTransactions]);

  // Clear messages after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const calculateDaysRemaining = (returnDate: string) => {
    const today = new Date();
    const returnDateObj = new Date(returnDate);
    const diffTime = returnDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: Math.abs(diffDays),
      isOverdue: diffDays < 0
    };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to get item name by ID
  const getItemName = useCallback((itemId: string) => {
    return itemsMap.get(itemId) || `Item ${itemId}`;
  }, [itemsMap]);

  // Handle approve action
  const handleApprove = async (transactionId: string, currentStatus: Status) => {
    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '';
      if (currentStatus === "borrow-pending") {
        endpoint = `/api/borrow/${transactionId}/status`;
      } else if (currentStatus === "return-pending") {
        endpoint = `/api/return/${transactionId}/status`;
      } else {
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to approve transaction');
      }

      // Update local state
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: (currentStatus === "borrow-pending" ? "borrow-approved" : "return-approved") as Status }
            : t
        )
      );

      setSuccessMessage('Transaction approved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject action
  const handleReject = async (transactionId: string, currentStatus: Status) => {
    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '';
      if (currentStatus === "borrow-pending") {
        endpoint = `/api/borrow/${transactionId}/status`;
      } else if (currentStatus === "return-pending") {
        endpoint = `/api/return/${transactionId}/status`;
      } else {
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reject transaction');
      }

      // Update local state
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: (currentStatus === "borrow-pending" ? "borrow-rejected" : "return-rejected") as Status }
            : t
        )
      );

      setSuccessMessage('Transaction rejected successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject transaction');
    } finally {
      setIsLoading(false);
    }
  };
  // Filter transactions based on search, status, and completed toggle
  useEffect(() => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => {
        const itemName = getItemName(transaction.itemId).toLowerCase();
        return (
          transaction.userName.toLowerCase().includes(query) ||
          transaction.userEmail.toLowerCase().includes(query) ||
          transaction.userNIM.toLowerCase().includes(query) ||
          transaction.itemId.toLowerCase().includes(query) ||
          itemName.includes(query)
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }
    
    // Apply completed/rejected filter
    if (!showCompleted) {
      filtered = filtered.filter(transaction => 
        !["borrow-approved", "borrow-rejected", "return-approved", "return-rejected"].includes(transaction.status)
      );
    }
    
    // Sort by status priority and date
    filtered.sort((a, b) => {
      const statusPriority = {
        "borrow-pending": 1,
        "return-pending": 2,
        "borrow-approved": 3,
        "return-approved": 4,
        "borrow-rejected": 5,
        "return-rejected": 6,
      };
      
      const aPriority = statusPriority[a.status] || 999;
      const bPriority = statusPriority[b.status] || 999;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, statusFilter, showCompleted, getItemName]);

  return (
    <div className="flex flex-col gap-6 p-2">
      <SectionOverview
        title="Status Peminjaman"
        description="Daftar status peminjaman barang aktif"
      />
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <Card className="bg-white rounded-2xl shadow-sm border">
        <CardContent className="p-6">
          {/* Filters and controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peminjam, item, atau NIM..."
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
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={fetchTransactions}
                disabled={isLoading}
                className="rounded-lg"
              >
                <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px] rounded-lg">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="borrow-pending">Permintaan Peminjaman</SelectItem>
                <SelectItem value="borrow-approved">Peminjaman Disetujui</SelectItem>
                <SelectItem value="borrow-rejected">Peminjaman Ditolak</SelectItem>
                <SelectItem value="return-pending">Permintaan Pengembalian</SelectItem>
                <SelectItem value="return-approved">Pengembalian Disetujui</SelectItem>
                <SelectItem value="return-rejected">Pengembalian Ditolak</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* Card-based list */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <RotateCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Memuat data peminjaman...</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 rounded-xl border hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-sm font-medium text-white">
                    {getInitials(transaction.userName)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{transaction.userName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {getItemName(transaction.itemId)}
                    </p>
                    <p className="text-sm text-gray-500">
                      NIM: {transaction.userNIM} • {transaction.userProgramStudy}
                    </p>
                  </div>                  
                  {/* Date pill for pending requests */}
                  {(transaction.status === "borrow-pending" || transaction.status === "return-pending") && (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatDate(transaction.returnDate)}
                    </div>
                  )}
                  
                  {/* Days Remaining Badge - Show for approved borrows */}
                  {transaction.status === "borrow-approved" && (() => {
                    const { days, isOverdue } = calculateDaysRemaining(transaction.returnDate)
                    
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
                    {(transaction.status === "borrow-pending" || transaction.status === "return-pending") ? (
                      <>
                          {/* Status pill */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === "borrow-pending" 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {transaction.status === "borrow-pending" 
                              ? "Permintaan Peminjaman" 
                              : "Permintaan Pengembalian"
                            }
                          </span>
                          {/* Action buttons for requests */}
                          <div className="flex items-center gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tolak Permintaan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menolak permintaan {transaction.status === "borrow-pending" ? "peminjaman" : "pengembalian"} ini?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleReject(transaction.id, transaction.status)}>
                                    Tolak
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-green-200 hover:bg-green-50"
                                  disabled={isLoading}
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Setujui Permintaan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menyetujui permintaan {transaction.status === "borrow-pending" ? "peminjaman" : "pengembalian"} ini?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleApprove(transaction.id, transaction.status)}>
                                    Setujui
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === "borrow-rejected" || transaction.status === "return-rejected"
                            ? "bg-red-100 text-red-800" 
                            : transaction.status === "return-approved"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-blue-100 text-blue-800"
                        }`}>
                          {transaction.status === "borrow-approved" && "Dalam Peminjaman"}
                          {transaction.status === "return-approved" && "Selesai"}
                          {transaction.status === "borrow-rejected" && "Peminjaman Ditolak"}
                          {transaction.status === "return-rejected" && "Pengembalian Ditolak"}
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
