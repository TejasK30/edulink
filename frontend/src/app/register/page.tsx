"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { AdminRegistrationForm } from "@/components/auth/admin-register"
import { StudentTeacherRegistrationForm } from "@/components/auth/studentandteacherregister"

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<
    "admin" | "studentTeacher" | null
  >(null)

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!registrationType && (
            <>
              <Button
                className="w-full"
                onClick={() => setRegistrationType("admin")}
              >
                Admin Registration
              </Button>
              <Button
                className="w-full"
                onClick={() => setRegistrationType("studentTeacher")}
              >
                Student/Teacher Registration
              </Button>
              <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-500 hover:underline">
                  Log in
                </Link>
              </div>
            </>
          )}

          {registrationType === "admin" && (
            <>
              <h3 className="text-lg font-semibold mb-2">Admin Registration</h3>
              <AdminRegistrationForm onBack={() => setRegistrationType(null)} />
            </>
          )}

          {registrationType === "studentTeacher" && (
            <>
              <h3 className="text-lg font-semibold mb-2">
                Student/Teacher Registration
              </h3>
              <StudentTeacherRegistrationForm
                onBack={() => setRegistrationType(null)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
