"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"
import { getDb } from "@/lib/db"

// Mock database - replace with your actual database calls
const mockDatabase = {
  settings: {
    complaintCategories: [
      { id: "1", name: "Academic Issues", description: "Exam content, grading, academic misconduct", isActive: true },
      {
        id: "2",
        name: "Administrative Issues",
        description: "Registration, documentation, procedures",
        isActive: true,
      },
      {
        id: "3",
        name: "Facilities & Infrastructure",
        description: "Classroom, equipment, accessibility issues",
        isActive: true,
      },
      { id: "4", name: "Student Services", description: "Support services, counseling, financial aid", isActive: true },
    ],
    statusWorkflow: [
      { id: "1", name: "Submitted", order: 1, color: "blue", isActive: true },
      { id: "2", name: "Under Review", order: 2, color: "yellow", isActive: true },
      { id: "3", name: "In Progress", order: 3, color: "orange", isActive: true },
      { id: "4", name: "Resolved", order: 4, color: "green", isActive: true },
      { id: "5", name: "Closed", order: 5, color: "gray", isActive: true },
    ],
    systemSettings: {
      autoAssignment: true,
      requireApproval: false,
      enableNotifications: true,
      sessionTimeout: 30,
      maxFileSize: 10,
      allowedFileTypes: ["pdf", "jpg", "png", "doc", "docx"],
    },
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: false,
      escalationTime: 48,
      reminderTime: 24,
      adminNotifications: true,
      studentNotifications: true,
    },
  },
}

export async function getAdminSettings() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    const db = await getDb()
    
    // For now, return mock data. You can implement actual database queries later.
    return {
      success: true,
      data: mockDatabase.settings,
    }
  } catch (error) {
    console.error("Error fetching admin settings:", error)
    return {
      success: false,
      error: "Failed to fetch admin settings",
    }
  }
}

export async function updateComplaintCategories(categories: any[]) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Validate categories
    for (const category of categories) {
      if (!category.name || category.name.trim().length < 2) {
        throw new Error("Category name must be at least 2 characters long")
      }
    }

    // In a real app, update your database
    mockDatabase.settings.complaintCategories = categories

    revalidatePath("/admin/settings")
    return {
      success: true,
      message: "Complaint categories updated successfully",
    }
  } catch (error) {
    console.error("Error updating complaint categories:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update complaint categories",
    }
  }
}

export async function updateStatusWorkflow(statuses: any[]) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Validate statuses
    for (const status of statuses) {
      if (!status.name || status.name.trim().length < 2) {
        throw new Error("Status name must be at least 2 characters long")
      }
      if (!status.order || status.order < 1) {
        throw new Error("Status order must be a positive number")
      }
    }

    // Check for duplicate orders
    const orders = statuses.map((s) => s.order)
    if (new Set(orders).size !== orders.length) {
      throw new Error("Status orders must be unique")
    }

    mockDatabase.settings.statusWorkflow = statuses

    revalidatePath("/admin/settings")
    return {
      success: true,
      message: "Status workflow updated successfully",
    }
  } catch (error) {
    console.error("Error updating status workflow:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status workflow",
    }
  }
}

export async function updateSystemSettings(settings: any) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Validate settings
    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
      throw new Error("Session timeout must be between 5 and 480 minutes")
    }
    if (settings.maxFileSize < 1 || settings.maxFileSize > 100) {
      throw new Error("Max file size must be between 1 and 100 MB")
    }

    mockDatabase.settings.systemSettings = { ...mockDatabase.settings.systemSettings, ...settings }

    revalidatePath("/admin/settings")
    return {
      success: true,
      message: "System settings updated successfully",
    }
  } catch (error) {
    console.error("Error updating system settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update system settings",
    }
  }
}

export async function updateNotificationSettings(settings: any) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Validate settings
    if (settings.escalationTime < 1 || settings.escalationTime > 168) {
      throw new Error("Escalation time must be between 1 and 168 hours")
    }
    if (settings.reminderTime < 1 || settings.reminderTime > 72) {
      throw new Error("Reminder time must be between 1 and 72 hours")
    }

    mockDatabase.settings.notificationSettings = { ...mockDatabase.settings.notificationSettings, ...settings }

    revalidatePath("/admin/settings")
    return {
      success: true,
      message: "Notification settings updated successfully",
    }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update notification settings",
    }
  }
}

export async function createComplaintCategory(category: { name: string; description: string }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    if (!category.name || category.name.trim().length < 2) {
      throw new Error("Category name must be at least 2 characters long")
    }

    const newCategory = {
      id: Date.now().toString(),
      name: category.name.trim(),
      description: category.description?.trim() || "",
      isActive: true,
    }

    mockDatabase.settings.complaintCategories.push(newCategory)

    revalidatePath("/admin/settings")
    return {
      success: true,
      message: "Complaint category created successfully",
      data: newCategory,
    }
  } catch (error) {
    console.error("Error creating complaint category:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create complaint category",
    }
  }
}

export async function deleteComplaintCategory(categoryId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    mockDatabase.settings.complaintCategories = mockDatabase.settings.complaintCategories.filter(
      (cat) => cat.id !== categoryId,
    )

    revalidatePath("/admin/settings")
    return {
      success: true,
      message: "Complaint category deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting complaint category:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete complaint category",
    }
  }
}

export async function testEmailConfiguration() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "Test email sent successfully",
    }
  } catch (error) {
    console.error("Error sending test email:", error)
    return {
      success: false,
      error: "Failed to send test email",
    }
  }
}

export async function exportSystemData(dataType: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    const mockData = {
      complaints: "CSV data for complaints...",
      users: "CSV data for users...",
      settings: "JSON data for settings...",
    }

    return {
      success: true,
      message: "Data exported successfully",
      data: mockData[dataType as keyof typeof mockData] || "No data available",
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    return {
      success: false,
      error: "Failed to export data",
    }
  }
}

export async function importSystemData(file: File) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Simulate file import
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "Data imported successfully",
      data: "Imported data summary...",
    }
  } catch (error) {
    console.error("Error importing data:", error)
    return {
      success: false,
      error: "Failed to import data",
    }
  }
}
