'use client'

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, ExternalLink } from 'lucide-react';
import { ArticleModal } from '@/components/ArticleModal';
import { ArticleType } from '@/types/article';

export default function Home() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true); // 新增状态变量
  const [ref, inView] = useInView();
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchArticlesData = useCallback(async (page: number, search: string, reset: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy?page=${page}&limit=10&search=${search}`);
      if (!res.ok) {
        throw new Error(`HTTP 错误！状态: ${res.status}`);
      }
      const data = await res.json();
      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('收到的数据格式不正确');
      }
      const newArticles = data.articles.map((article: ArticleType) => ({
        ...article,
        title: article.title || article.content.substring(0, 50) + '...',
      }));
      setArticles((prev) => reset ? newArticles : [...prev, ...newArticles]);
      setHasMore(data.articles.length > 0); // 更新 hasMore 状态
    } catch (error) {
      console.error('获取文章时出错:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoad) {
      fetchArticlesData(page, search);
      setInitialLoad(false);
    }
  }, [initialLoad, page, search, fetchArticlesData]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      fetchArticlesData(page + 1, search);
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore, page, search, fetchArticlesData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setArticles([]); // 清空现有数据
    setPage(1); // 重置页码
    setHasMore(true); // 重置 hasMore 状态
    fetchArticlesData(1, search, true); // 只调用一次，并重置数据
  };

  const openModal = (article: ArticleType) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const getDisplayTitle = (article: ArticleType) => {
    if (article.title) return article.title;
    return article.content.substring(0, 50) + '...';
  };

  const getDisplayContent = (article: ArticleType) => {
    return article.content.substring(0, 150) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Article List</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: ArticleType) => (
          <Card 
            key={article.id} // 确保每个 Card 组件都有一个唯一的 key 属性
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
                    e.stopPropagation();
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
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}