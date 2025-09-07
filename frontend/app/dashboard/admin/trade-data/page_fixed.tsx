'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Trash2, Upload, Download, BarChart3, Shield, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import AdminLoginModal from '@/components/AdminLoginModal'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DataSummary {
  totalRecords: number
  latestYear: number
  oldestYear: number
  totalValue: number
  uniquePartners: string[]
  categories: string[]
}

export default function TradeDataManagement() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const { admin, verifyToken, logout } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = async () => {
      const isValidAdmin = await verifyToken()
      if (!isValidAdmin) {
        setShowAdminLogin(true)
      }
      setIsVerifying(false)
    }
    
    checkAdminAuth()
  }, [verifyToken])

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false)
    fetchDataSummary()
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Fetch data summary
  const fetchDataSummary = useCallback(async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/trade-data/summary', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setDataSummary(result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error fetching data summary:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data summary',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('csvFile', file)

      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/trade-data/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Upload Successful',
          description: `${result.data.recordsInserted} records uploaded successfully`
        })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('csvFile') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // Refresh data summary
        fetchDataSummary()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload CSV',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const clearAllData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/trade-data/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Data Cleared',
          description: result.message
        })
        setDataSummary(null)
        setClearDialogOpen(false)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      toast({
        title: 'Clear Failed',
        description: error instanceof Error ? error.message : 'Failed to clear data',
        variant: 'destructive'
      })
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `reporter_name,reporter_code,year,classification,classification_version,product_code,mtn_categories,partner_code,partner_name,value
India,IND,2023,SITC,5,0341,AG,USA,United States,1234567.89
India,IND,2023,SITC,5,6522,NON_AG,GBR,United Kingdom,987654.32`
    
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'sample-trade-data.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // Show loading spinner while verifying admin token
  if (isVerifying) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Verifying admin access...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show admin login modal if not authenticated
  if (!admin) {
    return (
      <>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-amber-500" />
              <h2 className="text-2xl font-bold">Admin Access Required</h2>
              <p className="text-muted-foreground">You need admin credentials to access trade data management.</p>
              <Button 
                onClick={() => setShowAdminLogin(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
        <AdminLoginModal 
          open={showAdminLogin}
          onOpenChange={setShowAdminLogin}
          onSuccess={handleAdminLoginSuccess}
        />
      </>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trade Data Management</h1>
          <p className="text-muted-foreground">Logged in as: {admin.adminId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={downloadSampleCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Sample CSV
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Data Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Database Summary
          </CardTitle>
          <CardDescription>
            Overview of currently stored trade data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading summary...</div>
          ) : dataSummary ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {dataSummary.totalRecords?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {dataSummary.uniquePartners?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Trading Partners</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {dataSummary.categories?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Product Categories</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {dataSummary.latestYear ? `${dataSummary.oldestYear} - ${dataSummary.latestYear}` : 'No data'}
                </div>
                <div className="text-sm text-muted-foreground">Year Range</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No trade data available. Upload a CSV file to get started.
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              onClick={fetchDataSummary}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Trade Data
          </CardTitle>
          <CardDescription>
            Upload CSV files with trade data. Files should follow the UN Comtrade format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="csvFile" className="text-sm font-medium">
              Select CSV File
            </label>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded-md"
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={uploadFile}
              disabled={!file || uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
            
            {file && !uploading && (
              <Button
                onClick={() => {
                  setFile(null)
                  const fileInput = document.getElementById('csvFile') as HTMLInputElement
                  if (fileInput) fileInput.value = ''
                }}
                variant="outline"
              >
                Clear
              </Button>
            )}
          </div>

          <Alert>
            <AlertDescription>
              <strong>CSV Format Requirements:</strong> The CSV should contain columns for 
              reporter_name, reporter_code, year, classification, product_code, partner_name, 
              partner_code, and value. Use the sample CSV as a reference.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect all trade data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all
                  trade data from the database.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setClearDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={clearAllData}
                >
                  Yes, Clear All Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
