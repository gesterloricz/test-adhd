import { Info, Settings, Database, Cog, BarChart3, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SystemInfoPanel() {
  const infoItems = [
    {
      icon: Settings,
      label: "Model Framework",
      value: "XGBoost",
    },
    {
      icon: Database,
      label: "Dataset Source",
      value: "IEEE Dataport EEG ADHD & HBN Dataset",
    },
    {
      icon: Cog,
      label: "Preprocessing",
      value: "Band-pass filter, ASR, ICA",
    },
    {
      icon: BarChart3,
      label: "Features",
      value: "Statistical, Spectral, & Nonlinear Entropy",
    },
    {
      icon: TrendingUp,
      label: "Evaluation Metrics",
      value: "Accuracy, Precision, Recall, F1-Score, AUC-ROC",
    },
  ]

  return (
    <Card className="lg:sticky lg:top-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          <CardTitle>System Information</CardTitle>
        </div>
        <CardDescription>Model architecture and methodology details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {infoItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <div className="flex-shrink-0 w-9 h-9 bg-background rounded-lg flex items-center justify-center border">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-muted-foreground mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-foreground">{item.value}</div>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        <p className="text-xs text-muted-foreground leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
        </p>
      </CardContent>
    </Card>
  )
}
