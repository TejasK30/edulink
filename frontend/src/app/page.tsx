import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            College Management System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Access your personalized portal for students, teachers, and
            administrators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Student Panel */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 flex flex-col space-y-4 border border-blue-100 dark:border-blue-700 transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
              Students
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
              Access your courses, grades, and campus resources
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/student/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Login
                </Button>
              </Link>
              <Link href="/student/register">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500">
                  Register
                </Button>
              </Link>
            </div>
          </div>

          {/* Teacher Panel */}
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6 flex flex-col space-y-4 border border-green-100 dark:border-green-700 transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
              Teachers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
              Manage your classes, assignments, and student records
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/teacher/login">
                <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                  Login
                </Button>
              </Link>
              <Link href="/teacher/register">
                <Button className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500">
                  Register
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Panel */}
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-6 flex flex-col space-y-4 border border-purple-100 dark:border-purple-700 transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200">
              Administrators
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
              Oversee institution operations and user management
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/admin/login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                  Login
                </Button>
              </Link>
              <Link href="/admin/register">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-400 dark:hover:bg-purple-500">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} College Management System. All rights
          reserved.
        </p>
      </footer>
    </div>
  )
}
