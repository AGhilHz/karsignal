import { use } from 'react';
import { Metadata } from 'next';
import { CompanyPageClient } from './company-page-client';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} | شرکتها`,
  };
}

export default function CompanyPage({ params }: Props) {
  const { slug } = use(params);
  return <CompanyPageClient slug={slug} />;
}
