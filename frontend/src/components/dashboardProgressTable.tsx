'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchAllStudentsProgress } from '@/store/slices/AllStudentsProgressSlice'
import { useDispatch, useSelector } from 'react-redux'

// const data: Progress[] = [
//   {
//     studentId: 'EB9lxn1eH3YSowFuCEbrODm9wiq2',
//     firebaseUid: 'EB9lxn1eH3YSowFuCEbrODm9wiq2',
//     email: '2021meb1265@iitrpr.ac.in',
//     firstName: 'AKSHAT',
//     lastName: 'CHOUHAN',
//     averageProgress: 1,
//   },
//   {
//     studentId: 'WRUgtmCFcDU1Xw79pvNW4Dya52K3',
//     firebaseUid: 'WRUgtmCFcDU1Xw79pvNW4Dya52K3',
//     email: '2024eeb1175@iitrpr.ac.in',
//     firstName: 'AASHI',
//     lastName: 'VERMA',
//     averageProgress: 7,
//   },
// ]

export type Progress = {
  studentId: string
  averageProgress: number
  email: string
  firstName: string
  lastName: string
  firebaseUid: string
  rank: number
}

export const columns: ColumnDef<Progress>[] = [
  {
    accessorKey: 'rank',
    header: 'rank',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('rank')}</div>,
  },
  {
    accessorKey: 'firstName',
    header: 'firstName',
    cell: ({ row }) => (
      <div className='capitalize'>{row.getValue('firstName')}</div>
    ),
  },

  {
    accessorKey: 'lastName',
    header: () => <div className=''>Last Name</div>,
    cell: ({ row }) => {
      const name = row.getValue('lastName')

      // Format the amount as a dollar amount

      return <div className=''>{name}</div>
    },
  },
  {
    accessorKey: 'averageProgress',
    header: ({ column }) => {
      return (
        <Button
          className='m-0 p-0'
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Progress
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className='lowercase'>{row.getValue('averageProgress')} %</div>
    ),
  },
]

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const dispatch = useDispatch()
  const studentsProgress = useSelector(
    (state) => state.studentsProgress?.AllstudentsProgress?? []
  )

  console.log('studentsProgress:', studentsProgress)

  React.useEffect(() => {
    if (studentsProgress === undefined || studentsProgress?.length === 0) {
      dispatch(fetchAllStudentsProgress())
    }
  }, [dispatch, studentsProgress])

  console.log('studentsProgress2 :', studentsProgress)

  //   const { studentsProgress, isLoading, error } = useSelector(
  //     (state) => state.studentProgress?.AllstudentsProgress ?? []
  //   )
  //   console.log('studentsProgress:', studentsProgress)

  //   React.useEffect(() => {
  //     if (studentsProgress === undefined) {
  //       dispatch(fetchAllStudentsProgress())
  //     }
  //   }, [dispatch, studentsProgress])

  const data = studentsProgress.map(student => ({
    ...student // This spreads each student into a new object, making it mutable
  }));
  
  data.sort((a, b) => b.averageProgress - a.averageProgress);
  
  let rank = 1;
  let previousProgress = data[0]?.averageProgress; // Start with the highest progress
  let sameRankCount = 0;
  
  data.forEach((student, index) => {
    if (student.averageProgress === previousProgress) {
      // Assign the current rank
      student.rank = rank;
      sameRankCount++; // Increment the count of students with the same rank
    } else {
      // Update the rank (skip ranks by number of students with same previous progress)
      rank += sameRankCount;
      student.rank = rank;
      previousProgress = student.averageProgress;
      sameRankCount = 1; // Reset count for this new progress level
    }
  });
  
  // You can now use 'data' in your table, where each object is extensible and mutable.
  
// Now you can use the modified 'data' array to render your table, etc.


  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel({
        pageCount: 5, // This will ensure only 5 pages are displayed in the pagination
        manualPagination: true,
        rowCount: 5,
      }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter name...'
          value={
            (table.getColumn('firstName')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('firstName')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className=''>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-right'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
