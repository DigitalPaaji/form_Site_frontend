import Loder from '@/components/Loder'
import React, { Suspense } from 'react'
import { FetchingPage } from './FetchingPage'

const page = () => {
  return (
    <Suspense fallback={<Loder />} >
<FetchingPage />
   </Suspense>
  )
}

export default page