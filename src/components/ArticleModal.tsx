import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArticleType } from '@/types/article'

interface ArticleModalProps {
  article: ArticleType | null
  isOpen: boolean
  onClose: () => void
}

export function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  if (!article) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article.title || '无标题'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">作者：{article.author || '未知作者'}</p>
          {article.summary && (
            <p className="text-sm text-gray-700 mb-4">摘要：{article.summary}</p>
          )}
          <div className="prose max-w-none">
            {article.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}