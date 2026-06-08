import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"

export function StatsCard({ title, value, delta, children }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{children}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{value}</div>
            {delta && <div className="text-sm text-success">{delta}</div>}
          </div>
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  )
}

export default StatsCard
