import { School } from "lucide-react"
import React from "react"

type Props = {
  college: { name: string }
}
const Header = ({ college }: Props) => {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <School className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold md:text-xl text-foreground">
              {college.name} Admin Dashboard
            </h1>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
