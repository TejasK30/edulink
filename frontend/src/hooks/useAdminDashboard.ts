import { useState, useEffect } from "react"
import { dashboardService } from "@/services/dashboardService"

export function useAdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardService
      .getAdminDashboard()
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err)
        setError("Failed to load dashboard data")
      })
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
