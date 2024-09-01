// src/app/test/page.tsx
import { connectToDatabase } from '../../lib/mongodb' // 确保路径正确

interface Props {
  message: string
}

const TestDBPage: React.FC<Props> = async () => {
  let message = 'Failed to connect to the database.'

  try {
    const { client, db } = await connectToDatabase()
    if (client && db) {
      message = `Successfully connected to database: ${db.databaseName}`
    }
  } catch (error) {
    if (error instanceof Error) {
      message = `Error: ${error.message}`
    } else {
      message = `Error: ${String(error)}`
    }
  }

  return (
    <div>
      <h1>Database Connection Test</h1>
      <p>{message}</p>
    </div>
  )
}

export default TestDBPage
