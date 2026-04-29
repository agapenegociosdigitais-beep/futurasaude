import type { Metadata } from 'next';
import { Sora, Lora } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export const metadata: Metadata = {
  title: 'Futura Saúde | Cartão de Saúde Digital para Beneficiários',
  description:
    'Plataforma de cartão de saúde digital para beneficiários em várias cidades da região oeste do Pará',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${lora.variable}`}>
      <body className="font-sora">{children}</body>
    </html>
  );
}
