'use client';

import { Suspense } from 'react';
import PagamentoContent from './PagamentoContent';

export default function PagamentoPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Sora, sans-serif'
      }}>
        Carregando...
      </div>
    }>
      <PagamentoContent />
    </Suspense>
  );
}
