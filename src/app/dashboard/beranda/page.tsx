"use client";

import { useState, useEffect, useCallback } from "react";
import { SectionOverview } from "@/components/section-overview";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import {
  PlusIcon,
  Pencil1Icon,
  MagnifyingGlassIcon,
  TrashIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InfoCard } from "@/components/ui/info-card";

import aturanData from "@/data/aturan.json";

interface Item {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface InfoData {
  id: string;
  title: string;
  imageUrl: string;
  content: string;
}

export default function BerandaPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [infoData, setInfoData] = useState<InfoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState<boolean>(false);

  // Function to shorten ID display
  const shortenId = (id: string) => {
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

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

  // Function to fetch items from API
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/items?page=1&limit=50');

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch items');
      }

      setItems(data.data || []);
      setFilteredItems(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to create item
  const createItem = async (name: string, quantity: number) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, quantity }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create item');
      }

      return data.data;
    } catch (err) {
      throw err;
    }
  };

  // Function to update item
  const updateItem = async (id: string, name: string, quantity: number) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, quantity }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update item');
      }

      return data.data;
    } catch (err) {
      throw err;
    }
  };

  // Function to delete item
  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete item');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  // Initialize data on client only
  useEffect(() => {
    fetchItems();
    setInfoData(aturanData.info);
  }, [fetchItems]);

  // Filter items when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const handleEditItem = (item: Item) => {
    setCurrentItem(item);
    setIsAddMode(false);
    setIsDrawerOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      await deleteItem(itemId);
      setItems(items.filter((item) => item.id !== itemId));
      setError(null);
      setSuccessMessage('Item deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    setCurrentItem({
      id: '', // Will be generated by the API
      name: "",
      quantity: 0,
      createdAt: '',
      updatedAt: '',
    });
    setIsAddMode(true);
    setIsDrawerOpen(true);
  };

  const handleSaveItem = async () => {
    setShowSaveConfirmation(true);
  };

  const confirmSaveItem = async () => {
    if (currentItem) {
      try {
        setIsLoading(true);
        setError(null);

        if (isAddMode) {
          const newItem = await createItem(currentItem.name, currentItem.quantity);
          setItems([...items, newItem]);
          setSuccessMessage('Item created successfully');
        } else {
          const updatedItem = await updateItem(currentItem.id, currentItem.name, currentItem.quantity);
          setItems(
            items.map((item) => (item.id === currentItem.id ? updatedItem : item))
          );
          setSuccessMessage('Item updated successfully');
        }
        setIsDrawerOpen(false);
        setShowSaveConfirmation(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save item');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveInfoCard = async (
    id: string,
    imageFile: File | null,
    content: string
  ) => {
    // Simulate API call with a delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setInfoData((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                content,
                imageUrl: imageFile
                  ? URL.createObjectURL(imageFile)
                  : item.imageUrl,
              };
            }
            return item;
          })
        );
        resolve();
      }, 1000);
    });
  };
  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Error notification */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Success notification */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <SectionOverview
          title="Statistik Peminjaman"
          description="placeholder desc"
        />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari item..."
              className="pl-8 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchItems}
              variant="outline"
              className="rounded-lg"
              disabled={isLoading}
            >
              <ReloadIcon className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              disabled={isLoading}
            >
              <PlusIcon className="mr-1" /> Tambah Item
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[400px] rounded-xl border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[150px] py-3 text-center">ID</TableHead>
                <TableHead className="py-3 text-left">Nama Barang</TableHead>
                <TableHead className="py-3 text-center">
                  Quantity
                </TableHead>
                <TableHead className="py-3 text-center">
                  Created At
                </TableHead>
                <TableHead className="text-center py-3 w-[150px]">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="py-3 font-medium text-center">
                      <span title={item.id}>{shortenId(item.id)}</span>
                    </TableCell>
                    <TableCell className="py-3 text-left">{item.name}</TableCell>
                    <TableCell className="py-3 text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handleEditItem(item)}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={isLoading}
                        >
                          <Pencil1Icon className="h-4 w-4" />
                          Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isLoading}
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus item &quot;{item.name}&quot;? 
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <SectionOverview
        title="Detail Informasi Aktivitas Inventaris Lab"
        description="placeholder desc"
      />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {infoData.map((info) => (
          <InfoCard
            key={info.id}
            id={info.id}
            title={info.title}
            imageUrl={info.imageUrl}
            content={info.content}
            onSave={handleSaveInfoCard}
          />
        ))}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={(open) => {
        setIsDrawerOpen(open);
        if (!open) {
          setShowSaveConfirmation(false);
        }
      }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {isAddMode ? "Tambah Item Baru" : "Edit Item"}
            </DrawerTitle>
            <DrawerDescription>
              {isAddMode
                ? "Isi form berikut untuk menambahkan item baru."
                : "Edit detail item."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Barang</Label>
                <Input
                  id="name"
                  value={currentItem?.name ?? ""}
                  onChange={(e) =>
                    setCurrentItem(
                      currentItem
                        ? { ...currentItem, name: e.target.value }
                        : null
                    )
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={currentItem?.quantity ?? 0}
                  onChange={(e) =>
                    setCurrentItem(
                      currentItem
                        ? {
                            ...currentItem,
                            quantity: parseInt(e.target.value) || 0,
                          }
                        : null
                    )
                  }
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>{" "}
          <DrawerFooter>
            <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={handleSaveItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  disabled={isLoading || !currentItem?.name || currentItem?.quantity < 0}
                >
                  {isLoading ? 'Saving...' : 'Simpan'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isAddMode ? 'Konfirmasi Tambah Item' : 'Konfirmasi Edit Item'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isAddMode 
                      ? `Apakah Anda yakin ingin menambahkan item "${currentItem?.name}"?`
                      : `Apakah Anda yakin ingin menyimpan perubahan pada item "${currentItem?.name}"?`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmSaveItem}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAddMode ? 'Tambah' : 'Simpan'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-lg" disabled={isLoading}>
                Batal
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
