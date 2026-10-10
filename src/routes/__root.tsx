import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { VerifyDialog } from '@/components/VerifyDialog'
import { PageHeader } from '@/components/PageHeader'
import { StoreProvider } from '@/lib/store'

import '../styles.css'

const siteName = 'Cruiser Trader — The Land Cruiser Marketplace'
const siteDescription = 'Vehicles, parts and auctions for Toyota Land Cruiser enthusiasts, filtered by the series and year of your rig.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: siteName },
      { name: 'description', content: siteDescription },
      { name: 'theme-color', content: '#18261e' },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/.netlify/images?url=/img/fj40.jpg&w=1200&h=630&fit=cover&fm=jpg' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/logo.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <StoreProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="min-h-[70vh]">
        <Outlet />
      </main>
      <SiteFooter />
      <VerifyDialog />
    </StoreProvider>
  )
}

function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" sub="That page took a wrong turn on the trail." />
      <div className="container-x py-12">
        <Link to="/" className="btn btn-primary">Back home</Link>
      </div>
    </>
  )
}
