
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table/data-table"
import { productSchema } from "./data/schema"


import { products } from "./data/products"
// Simulate a database read for tasks.

export default async function TaskPage() {
  

  return (
    <>
     
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
          </div>
        </div>
        <DataTable data={products} columns={columns} />
      </div>
    </>
  )
}