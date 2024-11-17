"use server"

import { Suspense } from "react"
import FileUploader from "./_components/file-uploader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Patents</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <FileUploader />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
