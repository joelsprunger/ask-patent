"use client"

import { useState, useEffect, useRef } from "react"
import { getPaginatedPatentsAction } from "@/actions/db/patents-actions"
import { Patent } from "@/types/patent-types"

interface Column {
  width: number
  minWidth: number
}

function useResizableColumns(initialColumns: Column[]) {
  const [columns, setColumns] = useState(initialColumns)
  const isResizing = useRef(false)
  const currentColumn = useRef<number | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const startResize = (index: number, event: React.MouseEvent) => {
    isResizing.current = true
    currentColumn.current = index
    startX.current = event.clientX
    startWidth.current = columns[index].width
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizing.current || currentColumn.current === null) return

    const diff = event.clientX - startX.current
    const newWidth = Math.max(
      columns[currentColumn.current].minWidth,
      startWidth.current + diff
    )

    setColumns(prev => {
      const totalWidth = prev.reduce((sum, col) => sum + col.width, 0)
      const updatedColumns = prev.map((col, i) =>
        i === currentColumn.current ? { ...col, width: newWidth } : col
      )
      const newTotalWidth = updatedColumns.reduce(
        (sum, col) => sum + col.width,
        0
      )

      // Adjust the next column to maintain the total width
      if (currentColumn.current < prev.length - 1) {
        const nextColumnIndex = currentColumn.current + 1
        const nextColumn = updatedColumns[nextColumnIndex]
        const adjustedNextWidth =
          nextColumn.width - (newTotalWidth - totalWidth)
        updatedColumns[nextColumnIndex] = {
          ...nextColumn,
          width: Math.max(nextColumn.minWidth, adjustedNextWidth)
        }
      }

      return updatedColumns
    })
  }

  const handleMouseUp = () => {
    isResizing.current = false
    currentColumn.current = null
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  return { columns, startResize }
}

export default function BrowsePatents() {
  const [patents, setPatents] = useState<Patent[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortBy, setSortBy] = useState("title")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { columns, startResize } = useResizableColumns([
    { width: 150, minWidth: 100 }, // Patent Number
    { width: 300, minWidth: 200 }, // Title
    { width: 200, minWidth: 150 }, // Authors
    { width: 400, minWidth: 200 } // Abstract
  ])

  useEffect(() => {
    async function fetchPatents() {
      const { data, isSuccess } = await getPaginatedPatentsAction(
        page,
        pageSize,
        sortBy,
        sortOrder
      )
      if (isSuccess) {
        setPatents(data)
      }
    }
    fetchPatents()
  }, [page, pageSize, sortBy, sortOrder])

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between mb-4">
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <table
        className="min-w-full border-separate border-spacing-0"
        style={{ tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            {["Patent Number", "Title", "Authors", "Abstract"].map(
              (header, i) => (
                <th
                  key={header}
                  className="relative bg-gray-100 dark:bg-gray-800 p-2 text-left border-b border-gray-200 dark:border-gray-700"
                  style={{
                    width: columns[i].width,
                    maxWidth: columns[i].width,
                    minWidth: columns[i].minWidth
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="cursor-pointer truncate"
                      onClick={() =>
                        setSortBy(header.toLowerCase().replace(" ", "_"))
                      }
                    >
                      {header}
                    </span>

                    {i < 3 && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize bg-transparent hover:bg-blue-500/25 flex items-center justify-center"
                        onMouseDown={e => {
                          e.preventDefault()
                          startResize(i, e)
                        }}
                      >
                        <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600" />
                      </div>
                    )}
                  </div>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {patents.map(patent => (
            <tr key={patent.patent_number}>
              {[
                patent.patent_number,
                patent.title,
                patent.authors?.join(", ") || "N/A",
                patent.abstract || "N/A"
              ].map((content, i) => (
                <td
                  key={i}
                  className="p-2 border-b border-gray-200 dark:border-gray-700"
                  style={{
                    width: columns[i].width,
                    maxWidth: columns[i].width,
                    minWidth: columns[i].minWidth,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(prev => prev + 1)}
          className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
        >
          Next
        </button>
      </div>
    </div>
  )
}
