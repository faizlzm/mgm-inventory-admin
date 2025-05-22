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
import { InfoCard } from "@/components/ui/info-card"

import itemsData from "@/data/items.json"
import aturanData from "@/data/aturan.json"

interface Item {
  id: number;
  no: string;
  nama: string;
  jumlah_tersedia: number;
  jumlah_peminjam: number;
}

interface InfoData {
  id: string;
  title: string;
  imageUrl: string;
  content: string;
}

export default function BerandaPage() {
  const [items, setItems] = useState<Item[]>(itemsData.items)
  const [filteredItems, setFilteredItems] = useState<Item[]>(itemsData.items)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [isAddMode, setIsAddMode] = useState<boolean>(false)
    const [infoData, setInfoData] = useState<InfoData[]>(aturanData.info)
  
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

  const handleSaveInfoCard = async (id: string, imageFile: File | null, content: string) => {
    // Simulate API call with a delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // In a real application, you would upload the image and save the content to your backend
        setInfoData(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              content,
              // In a real application, the imageUrl would come from your backend after upload
              imageUrl: imageFile ? URL.createObjectURL(imageFile) : item.imageUrl
            }
          }
          return item
        }))
        resolve()
      }, 1000)
    })
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
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
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px] py-3">No</TableHead>
                <TableHead className="py-3">Nama Barang</TableHead>
                <TableHead className="py-3">Jumlah Tersedia</TableHead>
                <TableHead className="py-3">Jumlah Peminjam</TableHead>
                <TableHead className="text-right py-3 w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="py-3 font-medium">{item.no}</TableCell>
                  <TableCell className="py-3">{item.nama}</TableCell>
                  <TableCell className="py-3">{item.jumlah_tersedia}</TableCell>
                  <TableCell className="py-3">{item.jumlah_peminjam}</TableCell>
                  <TableCell className="text-right py-3">
                    <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                      <Pencil1Icon className="mr-1 h-4 w-4" /> Edit
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
      
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isAddMode ? 'Tambah Item Baru' : 'Edit Item'}</DrawerTitle>
            <DrawerDescription>
              {isAddMode ? 'Isi form berikut untuk menambahkan item baru.' : 'Edit detail item.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
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
