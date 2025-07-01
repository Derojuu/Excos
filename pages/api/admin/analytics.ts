import { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '@/lib/db'
import { verifyAdminAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    // Verify admin authentication
    const userId = verifyAdminAuth(req)
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { startDate, endDate, status, type } = req.query

    const db = await getDb()

    // Build base query with filters
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (startDate) {
      whereClause += ' AND createdAt >= ?'
      params.push(startDate)
    }

    if (endDate) {
      whereClause += ' AND createdAt <= ?'
      params.push(endDate)
    }

    if (status && status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }

    if (type && type !== 'all') {
      whereClause += ' AND complaintType = ?'
      params.push(type)
    }

    console.log('Analytics query parameters:', { whereClause, params })

    // Complaint trends (last 30 days by default)
    const trendQuery = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'under-review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints 
      ${whereClause}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    `
    
    console.log('Executing trend query:', trendQuery)
    const [trendRows] = await db.execute(trendQuery, params)
    const trends = trendRows as any[]
    console.log('Trends result:', trends)    // Complaint types distribution
    const typeDistributionQuery = `
      SELECT 
        complaintType as type,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints ${whereClause})), 2) as percentage
      FROM complaints 
      ${whereClause}
      GROUP BY complaintType
      ORDER BY count DESC
    `
    // For subqueries, we need to duplicate the parameters for both main query and subquery
    const typeParams = [...params, ...params]
    console.log('Executing type distribution query:', typeDistributionQuery)
    const [typeRows] = await db.execute(typeDistributionQuery, typeParams)
    const typeDistribution = typeRows as any[]
    console.log('Type distribution result:', typeDistribution)

    // Status distribution
    const statusDistributionQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints ${whereClause})), 2) as percentage
      FROM complaints 
      ${whereClause}
      GROUP BY status
      ORDER BY 
        CASE status 
          WHEN 'pending' THEN 1 
          WHEN 'under-review' THEN 2 
          WHEN 'resolved' THEN 3 
          ELSE 4 
        END
    `
    // For subqueries, we need to duplicate the parameters for both main query and subquery
    const statusParams = [...params, ...params]
    console.log('Executing status distribution query:', statusDistributionQuery)
    const [statusRows] = await db.execute(statusDistributionQuery, statusParams)
    const statusDistribution = statusRows as any[]
    console.log('Status distribution result:', statusDistribution)    // Average resolution time
    const resolutionTimeQuery = `
      SELECT 
        AVG(DATEDIFF(updatedAt, createdAt)) as avg_resolution_days,
        MIN(DATEDIFF(updatedAt, createdAt)) as min_resolution_days,
        MAX(DATEDIFF(updatedAt, createdAt)) as max_resolution_days
      FROM complaints 
      ${whereClause} AND status = 'resolved' AND updatedAt IS NOT NULL
    `
    const [resolutionRows] = await db.execute(resolutionTimeQuery, params)
    const resolutionTimes = (resolutionRows as any[])[0] || { avg_resolution_days: 0, min_resolution_days: 0, max_resolution_days: 0 }    // Monthly comparison (current month vs previous month)
    const monthlyComparisonQuery = `
      SELECT 
        MONTH(createdAt) as month,
        YEAR(createdAt) as year,
        COUNT(*) as count
      FROM complaints 
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
      GROUP BY YEAR(createdAt), MONTH(createdAt)
      ORDER BY year DESC, month DESC
      LIMIT 2
    `
    const [monthlyRows] = await db.execute(monthlyComparisonQuery, [])
    const monthlyComparison = monthlyRows as any[]

    // Most active hours
    const hourlyDistributionQuery = `
      SELECT 
        HOUR(createdAt) as hour,
        COUNT(*) as count
      FROM complaints 
      ${whereClause}
      GROUP BY HOUR(createdAt)
      ORDER BY hour
    `
    const [hourlyRows] = await db.execute(hourlyDistributionQuery, params)
    const hourlyDistribution = hourlyRows as any[]    // Top exam types with most complaints
    const topExamTypesQuery = `
      SELECT 
        examName as exam_name,
        COUNT(*) as complaint_count,
        AVG(CASE WHEN status = 'resolved' THEN DATEDIFF(updatedAt, createdAt) ELSE NULL END) as avg_resolution_time
      FROM complaints 
      ${whereClause}
      GROUP BY examName      ORDER BY complaint_count DESC
      LIMIT 10
    `
    const [examRows] = await db.execute(topExamTypesQuery, params)
    const topExamTypes = examRows as any[]

    // Response statistics
    const responseStatsQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as complaints_with_responses,
        COUNT(r.id) as total_responses,
        AVG(DATEDIFF(r.createdAt, c.createdAt)) as avg_first_response_time
      FROM complaints c
      LEFT JOIN responses r ON c.id = r.complaintId
      ${whereClause.replace('WHERE 1=1', 'WHERE c.id IS NOT NULL').replace(/createdAt/g, 'c.createdAt')}
    `
    const [responseRows] = await db.execute(responseStatsQuery, params)
    const responseStats = (responseRows as any[])[0] || { complaints_with_responses: 0, total_responses: 0, avg_first_response_time: 0 }

    const analytics = {
      trends: trends.reverse(), // Show chronological order
      typeDistribution,
      statusDistribution,
      resolutionTimes,
      monthlyComparison,
      hourlyDistribution,
      topExamTypes,
      responseStats,
      summary: {
        totalComplaints: trends.reduce((sum: number, day: any) => sum + (day.count || 0), 0),
        avgDailyComplaints: trends.length > 0 ? parseFloat((trends.reduce((sum: number, day: any) => sum + (day.count || 0), 0) / trends.length).toFixed(1)).toString() : "0",
        resolutionRate: parseFloat((statusDistribution.find((s: any) => s.status === 'resolved')?.percentage || 0).toString()),
        pendingRate: parseFloat((statusDistribution.find((s: any) => s.status === 'pending')?.percentage || 0).toString())
      }
    }

    res.status(200).json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics data' })
  }
}
