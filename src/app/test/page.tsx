'use client'

import { useEffect, useState } from 'react'
import { testDatabaseSetup } from '@/lib/test-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function runTests() {
      const results = await testDatabaseSetup()
      setTestResults(results)
      setLoading(false)
    }
    runTests()
  }, [])

  if (loading) {
    return <div>Running database tests...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Database Setup Test Results</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {testResults?.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Tables:</span>
                <span className={testResults.tables ? 'text-green-500' : 'text-red-500'}>
                  {testResults.tables ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">RLS:</span>
                <span className={testResults.rls ? 'text-green-500' : 'text-red-500'}>
                  {testResults.rls ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Policies:</span>
                <span className={testResults.policies ? 'text-green-500' : 'text-red-500'}>
                  {testResults.policies ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-red-500">
              Error: {testResults?.error?.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 