'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle } from 'lucide-react'

interface Article {
  id: string
  url: string
  author: string
  likes: number
  comments: number
  content: string
  images: string[]
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]) //文章数据

  const [page, setPage] = useState(1) //分页数据

  const [loading, setLoading] = useState(false) //这通常用于在 UI 中显示加载指示器（如旋转动画或进度条），告知用户数据正在加载中。

  const [search, setSearch] = useState('')
  const [ref, inView] = useInView() //它用于检测某个元素是否在视口中（即可见区域），从而实现懒加载、动画触发等功能。

  const fetchArticles = async () => {
    setLoading(true)
    const res = await fetch(`/api/articles?page=${page}&limit=10&search=${search}`)
    const data = await res.json()

    setArticles(prev => [...prev, ...data.articles])  //可以直接接受一个新的状态值，也可以接受一个回调函数。回调函数的形式是 (prev) => newState，它允许根据前一个状态计算新的状态。
    setLoading(false)
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

  return (
    // container 类通常用于包裹页面的主要内容，使得内容在较大屏幕上不至于显得太宽，同时在小屏幕上能够保持自适应和居中。
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Article List</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search articles..." //搜索提示词
            value={search} 
            onChange={(e) => setSearch(e.target.value)} //这是一个事件处理器，当输入框的值发生改变时触发。e 是事件对象，setSearch(e.target.value) 更新 search 状态为当前输入框的值。
            className="flex-grow" //使得输入框在 Flexbox 容器中占用尽可能多的空间。flex-grow 会让 Input 随着容器的大小变化而变化
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <CardHeader>
              <h2 className="text-xl font-semibold">{article.author}</h2>
            </CardHeader>
            {article.images && article.images.length > 0 && (
           
                <div></div>
              // <Image
              //   src={article.images[0]}
              //   alt="Article image"
              //   width={400}
              //   height={200}
              //   className="object-cover w-full h-48"
              // />
            
            )}
            <CardContent>
              {/* 它限制为显示 3 行文本，超出部分会用省略号（...）显示。这个功能通常用于文本过长时，以保持界面整洁。 */}
              <p className="text-gray-600 line-clamp-3">{article.content}</p>
            </CardContent>
            
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-5 h-5" />
                <span>{article.likes}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>{article.comments}</span>
              </div>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Read More
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      {loading && <p className="text-center mt-4">Loading more articles...</p>}
      <div ref={ref} style={{ height: '10px' }}></div>
    </div>
  )
}