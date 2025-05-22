"use client"

import React, { useState, useRef, ChangeEvent } from "react"
import Image from "next/image"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil1Icon, CheckIcon, UploadIcon, Cross2Icon, FontBoldIcon, FontItalicIcon, ListBulletIcon, HeadingIcon } from "@radix-ui/react-icons"
import ReactMarkdown from "react-markdown"
import "@/app/markdown-styles.css"

interface InfoCardProps {
  id: string
  title: string
  imageUrl?: string
  content?: string
  onSave: (id: string, imageFile: File | null, content: string) => Promise<void>
}

export function InfoCard({ id, title, imageUrl = "", content = "", onSave }: InfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentContent, setCurrentContent] = useState(content)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl || "")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleEditToggle = () => {
    if (isEditing) {
      // If we're currently editing, show confirm dialog before saving
      setShowConfirmDialog(true)
    } else {
      // Start editing
      setIsEditing(true)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)
      await onSave(id, imageFile, currentContent)
      setIsLoading(false)
      setIsEditing(false)
      setShowSuccessDialog(true)
      // Clear the image file state after successful upload
      setImageFile(null)
    } catch (error) {
      console.error("Error saving changes:", error)
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset to initial values
    setCurrentContent(content)
    setPreviewUrl(imageUrl || "")
    setImageFile(null)
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="relative aspect-video bg-muted rounded-md mb-4 overflow-hidden">
            {previewUrl ? (
              <Image 
                src={previewUrl} 
                alt={title}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">Tidak ada gambar</span>
              </div>
            )}
            
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Button onClick={triggerFileInput} variant="secondary" className="z-10">
                  <UploadIcon className="mr-2" /> Ganti Gambar
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
            {isEditing ? (
            <div className="min-h-[150px]">
              <div className="mb-2 flex gap-2 border-b pb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const textarea = document.getElementById(`content-${id}`) as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = textarea.value.substring(start, end);
                      const newText = `**${selectedText}**`;
                      const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
                      setCurrentContent(newContent);
                      textarea.focus();
                    }
                  }}
                >
                  <FontBoldIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const textarea = document.getElementById(`content-${id}`) as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = textarea.value.substring(start, end);
                      const newText = `*${selectedText}*`;
                      const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
                      setCurrentContent(newContent);
                      textarea.focus();
                    }
                  }}
                >
                  <FontItalicIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const textarea = document.getElementById(`content-${id}`) as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const newText = "\n- Item";
                      const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(start);
                      setCurrentContent(newContent);
                      textarea.focus();
                    }
                  }}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const textarea = document.getElementById(`content-${id}`) as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = textarea.value.substring(start, end);
                      const newText = `\n## ${selectedText}`;
                      const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
                      setCurrentContent(newContent);
                      textarea.focus();
                    }
                  }}
                >
                  <HeadingIcon className="h-4 w-4" />
                </Button>
              </div>
              <textarea
                id={`content-${id}`}
                value={currentContent}
                onChange={(e) => setCurrentContent(e.target.value)}
                className="w-full h-[150px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tulis deskripsi disini..."
              />
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Gunakan Markdown: <strong>**tebal**</strong>, <em>*miring*</em>, ## Judul, - Daftar</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {currentContent ? (
                <ReactMarkdown>{currentContent}</ReactMarkdown>
              ) : (
                <span className="text-muted-foreground">Tidak ada deskripsi</span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleEditToggle}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? (
              <>
                <CheckIcon className="mr-2" /> Simpan
              </>
            ) : (              <>
                <Pencil1Icon className="mr-2" /> Edit
              </>
            )}
          </Button>
          
          {isEditing && (
            <Button 
              onClick={handleCancelEdit} 
              variant="outline" 
              className="ml-2"
            >
              <Cross2Icon className="mr-2" /> Batal
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan pada {title}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Berhasil</AlertDialogTitle>
            <AlertDialogDescription>
              Perubahan pada {title} telah berhasil disimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
