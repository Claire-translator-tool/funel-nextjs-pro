import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FUNEL® | Industrial Water Monitoring & Automation Solutions',
  description: 'FUNEL® supplies online water quality analyzers, sensors, PLC automation cabinets, and integrated monitoring systems for wastewater, municipal water, industrial process water and smart water projects.',
  keywords: ['online water quality analyzer', 'water monitoring system', 'industrial water instrumentation', 'wastewater monitoring', 'PLC automation'],
  openGraph: {
    title: 'FUNEL® Industrial Water Monitoring & Automation Solutions',
    description: 'Online water analyzers, sensors, monitoring stations and automation solutions for global water treatment projects.',
    images: ['/images/project-case.png'],
    type: 'website',
  },
  verification: {
    google: 'VMyAmPGnBrPR92tHmY9kmK2WFE3ybvZWKYloLDGz9tQ',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FUNEL®',
    url: 'https://funelsensor.com',
    logo: 'https://funelsensor.com/images/logo.png',
    description: 'Professional supplier of industrial water monitoring and automation solutions.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+86-156-0652-3212',
      email: 'Claire@funel-sensor.com',
    },
    sameAs: [
      'https://sxfne1688.en.alibaba.com',
      'https://linkedin.com/in/claire-chen-1a6629399',
    ],
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {children}
      </body>
    </html>
  )
}
