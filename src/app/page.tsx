'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, ExternalLink } from 'lucide-react'
import { ArticleModal } from '@/components/ArticleModal'

import { ArticleType } from '@/types/article'

// 删除 Article 接口定义

export default function Home() {
  const [articles, setArticles] = useState<ArticleType[]>([]) //文章数据

  const [page, setPage] = useState(1) //分页数据

  const [loading, setLoading] = useState(false) //这通常用于在 UI 中显示加载指示器（如旋转动画或进度条），告知用户数据正在加载中。

  const [search, setSearch] = useState('')
  const [ref, inView] = useInView() //它用于检测某个元素是否在视口中（即可见区域），从而实现懒加载、动画触发等功能。

  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://20.168.59.101:5000';
      console.log(`正在请求：${apiUrl}/api/articles?page=${page}&limit=10&search=${search}`)
      const res = await fetch(`${apiUrl}/api/articles?page=${page}&limit=10&search=${search}`)
      if (!res.ok) {
        throw new Error(`HTTP 错误！状态: ${res.status}`)
      }
      const data = await res.json()
      console.log('收到的数据:', data)

      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('收到的数据格式不正确')
      }

      const articlesWithTitles = data.articles.map((article: ArticleType) => ({
        ...article,
        title: article.title || article.content.substring(0, 50) + '...'
      }))

      setArticles(prev => [...prev, ...articlesWithTitles])
    } catch (error) {
      console.error('获取文章时出错:', error)
      // 这里可以添加错误处理，比如设置一个错误状态并在UI中显示
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [page])

  useEffect(() => {
    if (inView) {
      setPage(prev => prev + 1)
    }
  }, [inView])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault() //这个方法用于阻止表单的默认提交行为。
    setArticles([]) //将 articles 状态设置为空数组，表示在新的搜索请求开始时清空当前显示的文章列表。
    setPage(1) //setPage(1) 将 page 状态重置为 1，表示用户重新开始从第一页获取数据。
    fetchArticles()
  }

  const openModal = (article: ArticleType) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const getDisplayTitle = (article: ArticleType) => {
    if (article.title) return article.title;
    return article.content.substring(0, 50) + '...';
  };

  const getDisplayContent = (article: ArticleType) => {
    // 我们仍然只使用 content，不使用 summary
    return article.content.substring(0, 150) + '...';
  };

  return (
    // container 通常用于包裹页面的主要内容，使得内容在较大屏幕上不至于显得太宽，同时在小屏幕上能够保持自适应和居中。
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Article List</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search articles..." //搜索提示词
            value={search} 
            onChange={(e) => setSearch(e.target.value)} //这是一个事件处理器，当输入框的值发生改变时触发。e 是事件对象，setSearch(e.target.value) 更新 search 状态为当前输入框的值。
            className="flex-grow" //使得输入框在 Flexbox 容器中占用尽可多的空间。flex-grow 会让 Input 随着容器的大小变化而变化
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: ArticleType) => (
          <Card 
            key={article.id} 
            className="flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => openModal(article)}
          >
            <CardHeader>
              <h2 className="text-xl font-semibold">{getDisplayTitle(article)}</h2>
              <p className="text-sm text-gray-500">{article.author || '未知作者'}</p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 line-clamp-3">{getDisplayContent(article)}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center mt-auto">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{article.likes || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{article.comments || 0}</span>
                </div>
              </div>
              {article.url && (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡，防止触发卡的点击事件
                  }}
                >
                  <span className="text-sm">查看原文</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {loading && <p className="text-center mt-4">Loading more articles...</p>}
      <div ref={ref} style={{ height: '10px' }}></div>

      <ArticleModal
        article={selectedArticle}  // 修改这里，从 article1 改为 article
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}