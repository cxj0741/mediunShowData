// import https from 'https';
// import { ArticleType } from '@/types/article';

// export async function fetchArticles(page: number, search: string): Promise<ArticleType[]> {
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL;

//   const agent = new https.Agent({
//     rejectUnauthorized: false,
//   });

//   const res = await fetch(`${apiUrl}/api/articles?page=${page}&limit=10&search=${search}`, {
//     agent,
//   });

//   if (!res.ok) {
//     throw new Error(`HTTP 错误！状态: ${res.status}`);
//   }

//   const data = await res.json();

//   if (!data.articles || !Array.isArray(data.articles)) {
//     throw new Error('收到的数据格式不正确');
//   }

//   return data.articles.map((article: ArticleType) => ({
//     ...article,
//     title: article.title || article.content.substring(0, 50) + '...',
//   }));
// }