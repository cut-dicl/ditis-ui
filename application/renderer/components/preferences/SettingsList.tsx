import { Button } from 'primereact/button'
import React from 'react'

export default function SettingsList({selectedSetting, setSelectedSetting}) {
  return (
      <div className='flex flex-col h-full space-y-2'>
          <Button text={selectedSetting===0?false:true} size='small' label="General Settings" onClick={()=>setSelectedSetting(0)}/>
          <Button text={selectedSetting===1?false:true} size='small' label="Local Simulator" onClick={()=>setSelectedSetting(1)}/>
            <Button text={selectedSetting===2?false:true} size='small' label="Server Manager" onClick={()=>setSelectedSetting(2)}/>
          
    </div>
  )
}
