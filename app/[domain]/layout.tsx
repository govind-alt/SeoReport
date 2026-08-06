import { prisma } from '@/lib/prisma';
import React from 'react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const agency = await prisma.agency.findFirst({
    where: {
      OR: [
        { slug: domain },
        { subdomain: domain },
        { customDomain: domain },
      ],
    },
    select: {
      name: true,
    }
  });

  if (!agency) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: {
      template: `%s | ${agency.name}`,
      default: `${agency.name} | Client Portal`,
    },
  };
}

export default async function DomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  // Resolve agency
  const agency = await prisma.agency.findFirst({
    where: {
      OR: [
        { slug: domain },
        { subdomain: domain },
        { customDomain: domain },
      ],
    },
    select: {
      brandingJson: true,
    }
  });

  let brandingStyles = null;

  if (agency?.brandingJson) {
    try {
      const branding = JSON.parse(agency.brandingJson);
      
      const primary = branding.primaryColor;
      const accent = branding.accentColor || primary;
      
      if (primary) {
        brandingStyles = `
          :root {
            --primary: ${primary};
            --primary-hover: ${primary}cc; /* slight transparency for hover */
            --primary-dark: ${accent};
            --primary-light: ${primary}1a; /* 10% opacity */
            --primary-glow: 0 0 20px ${primary}59;
          }
        `;
      }
    } catch (e) {
      console.error('Failed to parse brandingJson', e);
    }
  }

  return (
    <>
      {brandingStyles && (
        <style dangerouslySetInnerHTML={{ __html: brandingStyles }} />
      )}
      {children}
    </>
  );
}
