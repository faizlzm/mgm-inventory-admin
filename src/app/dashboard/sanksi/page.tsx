"use client";

import { useState, useEffect, useCallback } from "react";
import { SectionOverview } from "@/components/section-overview";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SearchIcon, Check, RotateCcw, Mail } from "lucide-react";

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

export default function SanksiPage() {
  const [transactions, setTransactions] = useState<BorrowTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<BorrowTransaction[]>([]);
  const [itemsMap, setItemsMap] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSanctions, setSelectedSanctions] = useState<string[]>([]);
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

      // Filter to show only overdue or return-rejected transactions
      const sanctionTransactions = allTransactions.filter(transaction => {
        // Show overdue approved borrows (terlambat)
        if (transaction.status === "borrow-approved") {
          const today = new Date();
          const returnDate = new Date(transaction.returnDate);
          return today > returnDate; // overdue
        }
        // Show only return-rejected transactions
        return transaction.status === "return-rejected";
      });

      setTransactions(sanctionTransactions);
      setFilteredTransactions(sanctionTransactions);
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
  const calculateDaysOverdue = (returnDate: string) => {
    const today = new Date();
    const returnDateObj = new Date(returnDate);
    const diffTime = today.getTime() - returnDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays); // Only return positive days (overdue)
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

  // Handle resolve sanction - for rejected transactions, we can't change status anymore
  // For overdue approved borrows, we'll just mark them as resolved locally
  const handleResolve = async (transactionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // For demo purposes, we'll just remove from local state
      // In real implementation, you might want to create a separate sanctions API
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      setSelectedSanctions(prev => prev.filter(id => id !== transactionId));
      
      setSuccessMessage('Sanksi berhasil diselesaikan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve sanction');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual selection
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSanctions(prev => [...prev, id]);
    } else {
      setSelectedSanctions(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSanctions(filteredTransactions.map(transaction => transaction.id));
    } else {
      setSelectedSanctions([]);
    }
  };

  // Handle bulk resolve
  const handleBulkResolve = () => {
    selectedSanctions.forEach(id => {
      handleResolve(id);
    });
  };

  // Filter transactions based on search
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
    
    // Sort by overdue days (descending) and status
    filtered.sort((a, b) => {
      // Overdue approved borrows first
      if (a.status === "borrow-approved" && b.status !== "borrow-approved") return -1;
      if (b.status === "borrow-approved" && a.status !== "borrow-approved") return 1;
      
      // For overdue transactions, sort by days overdue (most overdue first)
      if (a.status === "borrow-approved" && b.status === "borrow-approved") {
        const aDays = calculateDaysOverdue(a.returnDate);
        const bDays = calculateDaysOverdue(b.returnDate);
        return bDays - aDays;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, getItemName]);

  return (
    <div className="flex flex-col gap-6 p-2">
      <SectionOverview
        title="Data Sanksi"
        description="Daftar pengguna dengan transaksi terlambat atau pengembalian ditolak"
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
          {/* Search and controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari peminjam, item, atau NIM..."
                className="pl-8 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              onClick={fetchTransactions}
              disabled={isLoading}
              className="rounded-lg"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Select All Header */}
          {filteredTransactions.length > 0 && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <Checkbox
                checked={selectedSanctions.length === filteredTransactions.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Pilih semua ({selectedSanctions.length}/{filteredTransactions.length})
              </span>
            </div>
          )}

          {/* Sanctions list */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <RotateCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Memuat data sanksi...</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border hover:bg-gray-50 transition-colors ${
                    selectedSanctions.includes(transaction.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={selectedSanctions.includes(transaction.id)}
                    onCheckedChange={(checked) => handleSelect(transaction.id, checked as boolean)}
                  />
                  
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-sm font-medium text-white">
                    {getInitials(transaction.userName)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{transaction.userName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {transaction.status === "borrow-approved" 
                        ? `Belum mengembalikan ${getItemName(transaction.itemId)}`
                        : `Pengembalian ${getItemName(transaction.itemId)} ditolak`
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      NIM: {transaction.userNIM} • {transaction.userProgramStudy}
                    </p>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center gap-3">
                    {/* Time remaining/overdue badge - shown for all transactions */}
                    {(() => {
                      if (transaction.status === "borrow-approved") {
                        const daysOverdue = calculateDaysOverdue(transaction.returnDate);
                        return (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {daysOverdue} hari terlambat
                          </div>
                        );
                      } else {
                        // For return-rejected, show remaining time
                        const { days, isOverdue } = calculateDaysRemaining(transaction.returnDate);
                        return (
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOverdue 
                              ? "bg-red-100 text-red-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {isOverdue ? `Terlambat ${days} hari` : `${days} hari lagi`}
                          </div>
                        );
                      }
                    })()}

                    {/* Status Badge */}
                    {transaction.status === "borrow-approved" ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Dalam Peminjaman
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Pengembalian Ditolak
                      </div>
                    )}
                    
                    {/* Mail Action */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                      onClick={() => window.open(`mailto:${transaction.userEmail}`, '_blank')}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    
                    {/* Resolve Action */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                          disabled={isLoading}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Selesaikan Sanksi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menyelesaikan sanksi untuk {transaction.userName}? 
                            Sanksi akan dihapus dari daftar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleResolve(transaction.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Selesaikan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Tidak ada sanksi aktif</p>
              </div>
            )}
          </div>

          {/* Bulk Resolve Button */}
          {selectedSanctions.length > 0 && (
            <div className="mt-6 pt-4 border-t flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Check className="h-4 w-4" />
                    Selesaikan ({selectedSanctions.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Selesaikan Sanksi Terpilih</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menyelesaikan {selectedSanctions.length} sanksi yang dipilih? 
                      Sanksi akan dihapus dari daftar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleBulkResolve}
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
