import transactionsData from "@/data/transactions.json"

// Transaction status types - now unified
export type Status = "request" | "return" | "in-progress" | "decline" | "complete" | "pending"

// User transaction interface - updated to match the new JSON structure
export interface Transaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  itemId: string
  itemName: string
  startDate: string
  endDate: string
  status: Status
  avatar: string
  createdAt: string
  updatedAt: string
}

// Get all transactions from the data file
export const getAllTransactions = (): Transaction[] => {
  return transactionsData.transactions as Transaction[]
}

// Get transactions by status
export const getTransactionsByStatus = (status: Status): Transaction[] => {
  return getAllTransactions().filter(transaction => transaction.status === status)
}

// Get borrowing requests (request status)
export const getBorrowingRequests = (): Transaction[] => {
  return getAllTransactions().filter(transaction => transaction.status === "request")
}

// Get return requests (return status)
export const getReturnRequests = (): Transaction[] => {
  return getAllTransactions().filter(transaction => transaction.status === "return")
}

// Get overdue transactions (in-progress, return, or pending with end date in the past)
export const getOverdueTransactions = (): Transaction[] => {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  return getAllTransactions().filter(transaction => {
    // Include in-progress (borrowed), return (requested return), and pending (return declined) statuses
    if (!["in-progress", "return", "pending"].includes(transaction.status)) {
      return false
    }
    
    const endDate = new Date(transaction.endDate)
    endDate.setHours(0, 0, 0, 0)
    
    return endDate < currentDate
  })
}

// Calculate days remaining or exceeded
export const calculateDaysRemaining = (endDate: string): { days: number; isOverdue: boolean } => {
  const currentDate = new Date()
  const end = new Date(endDate)
  
  // Reset time to avoid timezone issues
  currentDate.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  
  const diffTime = end.getTime() - currentDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return {
    days: Math.abs(diffDays),
    isOverdue: diffDays < 0
  }
}

// Format date for display (e.g., "25 June 2025")
export const formatEndDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  })
}

// Sort transactions by priority (for status page)
export const sortTransactionsByPriority = (transactions: Transaction[]): Transaction[] => {
  const statusOrder: { [key in Status]: number } = {
    "request": 1,
    "return": 2,
    "pending": 3,
    "in-progress": 4,
    "decline": 5,
    "complete": 6
  }
  
  return [...transactions].sort((a, b) => {
    // Sort by status priority
    return statusOrder[a.status] - statusOrder[b.status]
  })
}

// Update transaction status (simulates API call)
export const updateTransactionStatus = (
  transactions: Transaction[], 
  transactionId: string, 
  newStatus: Status
): Transaction[] => {
  return transactions.map(transaction => 
    transaction.id === transactionId 
      ? { 
          ...transaction, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      : transaction
  )
}

// Search transactions by user name or item name
export const searchTransactions = (transactions: Transaction[], query: string): Transaction[] => {
  if (!query.trim()) return transactions
  
  const searchQuery = query.toLowerCase()
  return transactions.filter(transaction => 
    transaction.userName.toLowerCase().includes(searchQuery) ||
    transaction.itemName.toLowerCase().includes(searchQuery)
  )
}

// Filter transactions by status filter
export const filterTransactionsByStatus = (
  transactions: Transaction[], 
  statusFilter: string, 
  showCompleted: boolean = false
): Transaction[] => {
  let filtered = transactions
  
  // Apply status filter
  if (statusFilter !== "all") {
    filtered = filtered.filter(transaction => transaction.status === statusFilter)
  }
    // Apply completed filter - exclude complete and decline statuses
  if (!showCompleted) {
    filtered = filtered.filter(transaction => 
      transaction.status !== "complete" && transaction.status !== "decline"
    )
  }
  
  return filtered
}
