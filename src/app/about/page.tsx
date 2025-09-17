import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          About MCP Registry Analytics
        </h1>
        <p className="text-xl text-muted-foreground">
          Understanding the growth and distribution of Model Context Protocol servers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">What is MCP?</CardTitle>
            <CardDescription>
              Model Context Protocol overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The Model Context Protocol (MCP) is an open standard that enables secure, 
              controlled interactions between AI assistants and data sources. It provides 
              a standardized way for AI systems to access and manipulate data across 
              different platforms and services.
            </p>
            <p className="text-muted-foreground">
              MCP servers act as bridges between AI assistants and various data sources, 
              tools, and services, enabling more sophisticated and context-aware AI interactions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Registry Analytics</CardTitle>
            <CardDescription>
              Tracking ecosystem growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This dashboard tracks the growth and distribution of MCP servers across 
              the ecosystem. It provides insights into:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Total server registrations over time</li>
              <li>Distribution between local and remote servers</li>
              <li>Growth patterns and trends</li>
              <li>Unique server implementations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Data Sources</CardTitle>
            <CardDescription>
              How we collect information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
                                Our dashboard doesn&apos;t just present raw numbers - it provides meaningful insights into the growth patterns and adoption trends of the MCP ecosystem.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Official MCP registry API data</li>
              <li>GitHub repository analytics</li>
              <li>Community-submitted server registrations</li>
              <li>Automated discovery of public MCP implementations</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Data is collected hourly and aggregated to provide real-time insights 
              into the MCP ecosystem's growth.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Technical Stack</CardTitle>
            <CardDescription>
              Built with modern web technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This dashboard is built using:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Next.js 14+ with App Router</li>
              <li>TypeScript for type safety</li>
              <li>Recharts for data visualization</li>
              <li>ShadCN/UI component library</li>
              <li>Tailwind CSS for styling</li>
              <li>GitHub Actions for automated data collection</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Contributing</CardTitle>
            <CardDescription>
              Help improve MCP registry analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This project is open source and welcomes contributions. Whether you want to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 text-left max-w-md mx-auto space-y-1">
              <li>Report bugs or suggest features</li>
              <li>Improve data collection accuracy</li>
              <li>Enhance the dashboard interface</li>
              <li>Add new analytics visualizations</li>
            </ul>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Dashboard
              </Link>
              <a 
                href="https://github.com/dend/mcp-registry-growth"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                GitHub Repository
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}