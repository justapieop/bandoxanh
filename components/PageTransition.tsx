'use client';

import React from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    // Simple passthrough - Next.js App Router handles transitions natively
    // Removing complex loading states prevents white flash
    return (
        <div className="h-full w-full">
            {children}
        </div>
    );
}

