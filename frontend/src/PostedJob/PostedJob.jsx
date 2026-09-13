import { Tabs } from '@mantine/core'
import React from 'react'
import { activeJobs } from '../Data/PostedJob'
import PostedJobCard from './PostedJobCard'

function PostedJob() {
  return (
    <div className='w-1/6 mt-5 text-heading'>
        <div className='text-2xl font-semibold mb-5 text-heading'>Jobs</div>
        <div>
        <Tabs autoContrast variant='pills' defaultValue="active">
      <Tabs.List>
        <Tabs.Tab value="active" >
          Active [4]
        </Tabs.Tab>
        <Tabs.Tab value="draft" >
          Draft [1]
        </Tabs.Tab>
        
      </Tabs.List>

      <Tabs.Panel value="active">
        <div className='flex flex-col mt-4'>
            {
                activeJobs.map((item,index)=> <PostedJobCard key={index} props={item}/>)
            }
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="draft">
    
      </Tabs.Panel>

     
    </Tabs>
        </div>
    </div>
  )
}

export default PostedJob