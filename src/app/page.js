import { Button } from "@/components/ui/button";
import Link from "next/link";

const CanvasIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const DesignIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
    />
  </svg>
);

const ControlIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CanvasIcon />
            SCADA Visualization Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Design & Manage
            <span className="block text-primary">Industrial Systems</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, visualize, and control your SCADA systems with our powerful
            canvas editor. Build professional industrial control interfaces with
            ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/canvas" className="flex items-center gap-2">
                <CanvasIcon />
                Start Designing
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 border-2 hover:bg-accent/50 transition-all duration-200"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card rounded-xl p-8 shadow-lg border hover:shadow-xl transition-all duration-200">
            <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <DesignIcon />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Visual Design
            </h3>
            <p className="text-muted-foreground">
              Drag-and-drop interface for creating professional SCADA diagrams
              with SVG elements and custom components.
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-lg border hover:shadow-xl transition-all duration-200">
            <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <ControlIcon />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              System Control
            </h3>
            <p className="text-muted-foreground">
              Manage and monitor industrial processes with real-time
              visualization and control capabilities.
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-lg border hover:shadow-xl transition-all duration-200">
            <div className="bg-secondary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Export & Share
            </h3>
            <p className="text-muted-foreground">
              Export your designs as JSON files and share them across your team
              or integrate with other systems.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card rounded-2xl p-12 shadow-lg border">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of engineers using our platform to design better
            industrial systems.
          </p>
          <Button
            asChild
            size="lg"
            className="text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link href="/canvas" className="flex items-center gap-2">
              <CanvasIcon />
              Launch Canvas Editor
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
