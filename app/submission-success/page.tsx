"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion";
import { CheckCircle, FileText, Search, Home, Copy, Check, ArrowLeft } from "lucide-react"

export default function SubmissionSuccess() {
  const searchParams = useSearchParams();
  // Get reference number from URL or provide fallback without random generation
  const referenceNumber = searchParams?.get("ref") || "ECS-PENDING";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/10 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-effect border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold text-gradient">Complaint Submitted!</CardTitle>

              </div>
            </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Your exam complaint has been submitted successfully.</p>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your complaint reference number is:</p>
            <p className="text-xl font-mono font-medium text-gray-900 dark:text-gray-100">{referenceNumber}</p>
          </div>

          <p className="text-sm text-gray-500">
            Please save this reference number for tracking your complaint status. You will also receive a confirmation
            email with this information.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/track-complaint">
            <Button variant="outline">Return to Home</Button>
          </Link>
          <Link href="/track-complaint">
            <Button>Track Your Complaint</Button>
          </Link>
        </CardFooter>
      </Card>
      </motion.div>
    </div>
    </div>
  );
}
