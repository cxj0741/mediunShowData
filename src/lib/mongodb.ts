import { MongoClient } from 'mongodb' // 导入 MongoClient

// 定义连接 URI 和选项
const uri = process.env.MONGODB_URI 
const options: any = {}

// 检查 uri 是否存在
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// 这段代码为 TypeScript 编译器声明了一个全局变量 _mongoClientPromise，它的类型是 Promise<MongoClient> 或 undefined。这个全局变量用于在开发模式下缓存 MongoDB 客户端的连接。
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)
  return { client, db }
}