'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { DbPassage } from '@/types/database';

// Dynamically import react-pdf to avoid SSR issues
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((m) => ({ default: m.PDFDownloadLink })),
    { ssr: false }
);

import { KICEDocument } from './KICEDocument';

interface Props {
    passage: DbPassage;
}

export default function PDFDownloadButton({ passage }: Props) {
    const fileName = `KICE-Gen_${passage.keyword.replace(/\s+/g, '_')}.pdf`;

    return (
        <PDFDownloadLink
            document={<KICEDocument passage={passage} />}
            fileName={fileName}
            className="inline-flex items-center gap-2 bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/30 text-accent-green font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
            {({ loading: pdfLoading }) =>
                pdfLoading ? '📄 PDF 생성 중...' : '⬇️ PDF 다운로드'
            }
        </PDFDownloadLink>
    );
}
