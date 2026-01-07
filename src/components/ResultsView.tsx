"use client"

import { useState } from "react"
import { RefreshCw, ChevronRight, ChevronDown, AlertTriangle, FileText } from "lucide-react"
import type { ClassificationResult } from "../App"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

type Props = {
  results: ClassificationResult[]
  onNewAnalysis: () => void
}

export default function ResultsView({ results, onNewAnalysis }: Props) {
  const [expandedFile, setExpandedFile] = useState<string | null>(null)

  const adhdCount = results.filter((r) => r.result === "ADHD Detected").length
  const controlCount = results.filter((r) => r.result === "Control (No ADHD)").length

  const toggleExpand = (filename: string) => {
    setExpandedFile(expandedFile === filename ? null : filename)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Output / Results Section</CardTitle>
          <Button variant="outline" onClick={onNewAnalysis}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Total Files Processed</div>
              <div className="text-3xl font-bold">{results.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-sm text-red-600 mb-1">ADHD Detected</div>
              <div className="text-3xl font-bold text-red-700">{adhdCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-sm text-green-600 mb-1">Control (No ADHD)</div>
              <div className="text-3xl font-bold text-green-700">{controlCount}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-4">Batch Classification Results</h3>
          <div className="space-y-3">
            {results.map((result) => (
              <Collapsible
                key={result.filename}
                open={expandedFile === result.filename}
                onOpenChange={() => toggleExpand(result.filename)}
              >
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium truncate">{result.filename}</div>
                          <div className="text-xs text-muted-foreground">
                            Confidence: {result.confidence.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge
                          variant={result.result === "ADHD Detected" ? "destructive" : "outline"}
                          className={
                            result.result === "ADHD Detected"
                              ? ""
                              : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                          }
                        >
                          {result.result}
                        </Badge>
                        {expandedFile === result.filename ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <Separator />
                    <div className="p-6 bg-muted/50 space-y-6">
                      {/* Alert card */}
                      <Card className="border-2 border-yellow-200 bg-yellow-50/50">
                        <CardContent className="pt-6">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-semibold mb-1">{result.result}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Detailed analysis for {result.filename}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Confidence Score:</span>
                                <span className="text-lg font-bold">{result.confidence.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Confidence Visualization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Confidence</span>
                              <span>Uncertainty</span>
                            </div>
                            <Progress value={result.confidence} className="h-8" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0</span>
                              <span>25</span>
                              <span>50</span>
                              <span>75</span>
                              <span>100</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Features table */}
                      {result.topFeatures && (
                        <Card>
                          <CardContent className="p-0">
                            <div className="divide-y">
                              <div className="grid grid-cols-2 bg-muted/50">
                                <div className="px-4 py-2 text-xs font-semibold">Parameter</div>
                                <div className="px-4 py-2 text-xs font-semibold">Value</div>
                              </div>
                              <div className="grid grid-cols-2">
                                <div className="px-4 py-3 text-sm text-muted-foreground">Classification Result</div>
                                <div className="px-4 py-3 text-sm font-semibold">{result.result}</div>
                              </div>
                              <div className="grid grid-cols-2">
                                <div className="px-4 py-3 text-sm text-muted-foreground">Confidence Score</div>
                                <div className="px-4 py-3 text-sm font-semibold">{result.confidence.toFixed(1)}%</div>
                              </div>
                              <div className="grid grid-cols-2">
                                <div className="px-4 py-3 text-sm text-muted-foreground">Top Influential Features</div>
                                <div className="px-4 py-3 text-sm">
                                  {result.topFeatures.map((feature, idx) => (
                                    <div key={idx} className="mb-1 last:mb-0">
                                      {feature.name} ({feature.value}%)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
