"use client"
import { useRouter } from 'next/router'
 
export default function Page() {
  const router = useRouter()
  return <p>Field: {router.query.field}</p>
}