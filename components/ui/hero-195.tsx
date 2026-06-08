import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"

export function Hero195() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Dashboard</CardTitle>
            <CardDescription>Overview • Analytics • Reports • Notifications</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-1 rounded-md bg-primary text-white">Download</button>
            <button className="px-3 py-1 rounded-md border">Pick a date</button>
          </div>
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  )
}

export default Hero195
