import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MCP Registry Growth Analytics',
  description: 'Analytics dashboard for Model Context Protocol server registry growth tracking',
  keywords: ['MCP', 'Model Context Protocol', 'analytics', 'registry', 'servers'],
  authors: [{ name: 'MCP Registry Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <header className="border-b bg-card">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold animate-gradient-shift">
                    MCP Registry Analytics
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Last updated:</span>
                    <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
            
            <footer className="border-t bg-card">
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
                  <p>
                    © {new Date().getFullYear()} Copyright{' '}
                    <a 
                      href="https://den.dev" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline"
                    >
                      Den Delimarsky
                    </a>
                    . Data collected from the official{' '}
                    <a 
                      href="https://github.com/modelcontextprotocol/registry" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline"
                    >
                      MCP registry
                    </a>
                    .
                  </p>
                  <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                    <a 
                      href="https://modelcontextprotocol.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      Model Context Protocol
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}