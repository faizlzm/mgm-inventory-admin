"use client"

import { useState, useEffect } from "react"
import { SectionOverview } from "@/components/section-overview"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { PlusIcon, Pencil1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { ScrollArea } from "@/components/ui/scroll-area"

import itemsData from "@/data/items.json"

interface Item {
  id: number;
  no: string;
  nama: string;
  jumlah_tersedia: number;
  jumlah_peminjam: number;
}

export default function BerandaPage() {
  const [items, setItems] = useState<Item[]>(itemsData.items)
  const [filteredItems, setFilteredItems] = useState<Item[]>(itemsData.items)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [isAddMode, setIsAddMode] = useState<boolean>(false)
  
  // Filter items when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = items.filter(item => 
        item.nama.toLowerCase().includes(query) || 
        item.no.toLowerCase().includes(query)
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, items])
  
  const handleEditItem = (item: Item) => {
    setCurrentItem(item)
    setIsAddMode(false)
    setIsDrawerOpen(true)
  }
  
  const handleAddItem = () => {
    setCurrentItem({
      id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
      no: "",
      nama: "",
      jumlah_tersedia: 0,
      jumlah_peminjam: 0
    })
    setIsAddMode(true)
    setIsDrawerOpen(true)
  }
  
  const handleSaveItem = () => {
    if (currentItem) {
      if (isAddMode) {
        setItems([...items, currentItem])
      } else {
        setItems(items.map(item => item.id === currentItem.id ? currentItem : item))
      }
      setIsDrawerOpen(false)
    }
  }
    return (
    <div className="flex flex-col gap-4">      <div className="flex justify-between items-center">
        <SectionOverview
          title="Statistik Peminjaman"
          description="placeholder desc"
        />
      </div>
        <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari item..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddItem}>
            <PlusIcon className="mr-1" /> Tambah Item
          </Button>
        </div>
        
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Jumlah Tersedia</TableHead>
                <TableHead>Jumlah Peminjam</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.no}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.jumlah_tersedia}</TableCell>
                  <TableCell>{item.jumlah_peminjam}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                      <Pencil1Icon /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <SectionOverview
        title="Detail Informasi Aktivitas Inventaris Lab"
        description="placeholder desc"
      />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">alur peminjaman</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">Alur pengembalian</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">Detail sanksi</span>
        </div>
      </div>
      
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isAddMode ? 'Tambah Item Baru' : 'Edit Item'}</DrawerTitle>
            <DrawerDescription>
              {isAddMode ? 'Isi form berikut untuk menambahkan item baru.' : 'Edit detail item.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid gap-4">              <div className="grid gap-2">
                <Label htmlFor="no">No Item</Label>
                <Input 
                  id="no" 
                  value={currentItem?.no || ''} 
                  onChange={(e) => setCurrentItem(currentItem ? {...currentItem, no: e.target.value} : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama Barang</Label>
                <Input 
                  id="nama" 
                  value={currentItem?.nama || ''} 
                  onChange={(e) => setCurrentItem(currentItem ? {...currentItem, nama: e.target.value} : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tersedia">Jumlah Tersedia</Label>
                <Input 
                  id="tersedia" 
                  type="number"
                  value={currentItem?.jumlah_tersedia || 0} 
                  onChange={(e) => setCurrentItem(currentItem ? 
                    {...currentItem, jumlah_tersedia: parseInt(e.target.value) || 0} : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="peminjam">Jumlah Peminjam</Label>
                <Input 
                  id="peminjam" 
                  type="number"
                  value={currentItem?.jumlah_peminjam || 0} 
                  onChange={(e) => setCurrentItem(currentItem ? 
                    {...currentItem, jumlah_peminjam: parseInt(e.target.value) || 0} : null)}
                />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSaveItem}>Simpan</Button>
            <DrawerClose asChild>
              <Button variant="outline">Batal</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
