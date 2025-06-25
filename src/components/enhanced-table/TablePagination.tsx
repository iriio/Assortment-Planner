import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps {
  table: any; // TanStack table instance
  pageSizes?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showRowSelection?: boolean;
}

export function TablePagination({
  table,
  pageSizes = [10, 20, 30, 40, 50],
  showPageSizeSelector = true,
  showPageInfo = true,
  showRowSelection = true,
}: TablePaginationProps) {
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowCount = table.getFilteredRowModel().rows.length;
  const currentPageSize = table.getState().pagination.pageSize;
  const currentPageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Row selection info */}
      <div className="flex-1 text-sm text-muted-foreground">
        {showRowSelection && selectedRowCount > 0 ? (
          <span>
            {selectedRowCount} of {totalRowCount} row(s) selected.
          </span>
        ) : (
          <span>{totalRowCount} row(s) total.</span>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${currentPageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizes.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page info */}
        {showPageInfo && (
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPageIndex + 1} of {pageCount}
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
