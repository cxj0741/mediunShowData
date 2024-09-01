// NextResponse: 是 Next.js 提供的用于构造 API 响应的对象。
// connectToDatabase: 是你自定义的函数，用于连接到 MongoDB 数据库并获取 db 对象。
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// 定义 GET 处理函数
export async function GET(request: Request) {
    // 解析查询参数
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''

//   skip 计算要跳过的文档数量，用于分页。(page - 1) * limit 计算从哪一条记录开始取数据。
  const skip = (page - 1) * limit

  const { db } = await connectToDatabase()

 // 使用聚合管道进行查询和排序
 const articles = await db.collection('article_data').aggregate([
    {
      $match: {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
        ],
      },
    },
    {
      $addFields: {
        likesNumeric: { $toInt: "$likes" },  // 将 likes 字段转换为整数类型
      },
    },
    {
      $sort: { likesNumeric: -1 },  // 使用转换后的数值字段进行排序
    },
    {
      $skip: skip,  // 跳过文档数量，用于分页
    },
    {
      $limit: limit,  // 限制返回的文档数量
    },
  ]).toArray();

  const total = await db.collection('articles').countDocuments()

  return NextResponse.json({ articles, total })
}