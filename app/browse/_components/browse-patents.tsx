"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  getPaginatedPatentsAction,
  getPatentsCountAction
} from "@/actions/db/patents-actions"
import { Patent } from "@/types/patent-types"
import Link from "next/link"

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

      // Add null check before using currentColumn.current
      const columnIndex = currentColumn.current
      if (columnIndex !== null && columnIndex < prev.length - 1) {
        const nextColumnIndex = columnIndex + 1
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

function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxMiddleButtons = 3
    const halfMiddleButtons = Math.floor(maxMiddleButtons / 2)

    let startPage = Math.max(1, currentPage - halfMiddleButtons)
    const endPage = Math.min(totalPages, startPage + maxMiddleButtons - 1)

    if (endPage - startPage + 1 < maxMiddleButtons) {
      startPage = Math.max(1, endPage - maxMiddleButtons + 1)
    }

    if (startPage > 1) {
      pageNumbers.push(1)
      if (startPage > 2) pageNumbers.push("...")
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("...")
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="flex justify-center items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        ←
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
              page === currentPage
                ? "border-blue-500 text-blue-500"
                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2 py-2 text-muted-foreground">
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        →
      </button>
    </div>
  )
}

function toCamelCase(str: string) {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export default function BrowsePatents() {
  const [patents, setPatents] = useState<Patent[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortBy, setSortBy] = useState("title")
  const [sortOrder] = useState<"asc" | "desc">("asc")
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  const { columns, startResize } = useResizableColumns([
    { width: 150, minWidth: 100 }, // Patent Number
    { width: 300, minWidth: 200 }, // Title
    { width: 200, minWidth: 150 }, // Authors
    { width: 400, minWidth: 200 } // Abstract
  ])

  useEffect(() => {
    // Load total count from localStorage or fetch it
    async function fetchTotalCount() {
      const cachedCount = localStorage.getItem("patentsTotalCount")

      if (cachedCount) {
        setTotalPages(Math.ceil(parseInt(cachedCount) / pageSize))
      } else {
        const { data, isSuccess } = await getPatentsCountAction()
        if (isSuccess && data) {
          localStorage.setItem("patentsTotalCount", data.toString())
          setTotalPages(Math.ceil(data / pageSize))
        }
      }
    }

    fetchTotalCount()
  }, [pageSize])

  useEffect(() => {
    async function fetchPatents() {
      const { data, isSuccess } = await getPaginatedPatentsAction(
        page,
        pageSize,
        sortBy,
        sortOrder
      )
      if (isSuccess && data) {
        setPatents(data)
      }
    }
    fetchPatents()
  }, [page, pageSize, sortBy, sortOrder])

  // Update total pages when page size changes
  useEffect(() => {
    const cachedCount = localStorage.getItem("patentsTotalCount")
    if (cachedCount) {
      setTotalPages(Math.ceil(parseInt(cachedCount) / pageSize))
    }
  }, [pageSize])

  const handleRowClick = (patentId: string) => {
    router.push(`/patents/${patentId}`)
  }

  return (
    <div className="overflow-x-auto">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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
            <tr
              key={patent.patent_number}
              onClick={() => handleRowClick(patent.id)}
              className="cursor-pointer hover:bg-gray-100"
            >
              {[
                patent.patent_number,
                <Link
                  key={patent.id}
                  href={`/patents/${patent.id}`}
                  className="text-blue-500"
                >
                  {toCamelCase(patent.title)}
                </Link>,
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          Next
        </button>
      </div>
    </div>
  )
}
