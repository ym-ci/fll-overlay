import { Timer } from "@/components/timer"
import type { Field } from "@/server/db/schema"

interface PageProps {
  params: Promise<{
    field: Field
  }>
}

export default async function Page({ params }: PageProps) {
  const { field } = await params

  // verify field is valid and exists (alias) type Field = "Stone" | "Bronze"
  if (field !== "Stone" && field !== "Bronze") {
    return <div>Field {field} not found</div>
  }

  return <Timer field={field} />
}