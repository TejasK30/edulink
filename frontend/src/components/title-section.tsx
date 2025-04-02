import { TitleSectionProps } from "@/lib/types"
import React from "react"

const TitleSection: React.FC<TitleSectionProps> = ({
  title,
  subheading,
  pill,
}) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center text-center cursor-pointer">
        <div className="rounded-full px-4 py-1.5 mb-4 border-2 border-primary-purple-900  bg-white dark:bg-black dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {pill}
          </p>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
          {title}
        </h1>

        {subheading && (
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
            {subheading}
          </p>
        )}
      </div>
    </>
  )
}

export default TitleSection
