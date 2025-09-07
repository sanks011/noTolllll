'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLoginModal from '@/components/AdminLoginModal';

interface UploadResult {
  success: boolean;
  message: string;
  recordsProcessed?: number;
  errors?: string[];
}

interface TradeDataUploadProps {
  onUploadComplete?: () => void;
}

export default function TradeDataUpload({ onUploadComplete }: TradeDataUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { admin } = useAdminAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!admin) {
      setShowAdminLogin(true);
      return;
    }

    if (acceptedFiles.length === 0) {
      toast.error('Please select a valid CSV file');
      return;
    }

    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    uploadFile(file);
  }, [admin]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const uploadFile = async (file: File) => {
    if (!admin) {
      setShowAdminLogin(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:3001/api/trade-data/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadResult({
          success: true,
          message: result.message,
          recordsProcessed: result.recordsProcessed
        });
        toast.success(`Successfully uploaded ${result.recordsProcessed} trade records`);
        onUploadComplete?.();
      } else {
        setUploadResult({
          success: false,
          message: result.message,
          errors: result.errors
        });
        toast.error(result.message);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error.message || 'Failed to upload trade data'
      });
      toast.error('Failed to upload trade data');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  const handleAdminLoginSuccess = () => {
    toast.success('Admin access granted. You can now upload trade data.');
  };

  if (!admin) {
    return (
      <>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Trade Data Upload
            </CardTitle>
            <CardDescription>
              Admin access required to upload trade data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
              <p className="text-muted-foreground mb-4">
                This feature requires admin credentials to upload and manage trade data.
              </p>
              <Button 
                onClick={() => setShowAdminLogin(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Login as Admin
              </Button>
            </div>
          </CardContent>
        </Card>

        <AdminLoginModal
          open={showAdminLogin}
          onOpenChange={setShowAdminLogin}
          onSuccess={handleAdminLoginSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Trade Data Upload
          </CardTitle>
          <CardDescription>
            Upload CSV files containing trade data. Authenticated as admin: {admin.adminId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop a CSV file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supported format: CSV files up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading trade data...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div>
                    <p className="font-medium">{uploadResult.message}</p>
                    {uploadResult.recordsProcessed && (
                      <p className="text-sm mt-1">
                        {uploadResult.recordsProcessed} records processed successfully
                      </p>
                    )}
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div className="text-sm mt-2">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside ml-2">
                          {uploadResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <AdminLoginModal
        open={showAdminLogin}
        onOpenChange={setShowAdminLogin}
        onSuccess={handleAdminLoginSuccess}
      />
    </>
  );
}
