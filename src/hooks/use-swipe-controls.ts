'use client';

import { useState } from 'react';
import type { Direction } from '@/lib/types';

export const useSwipeControls = (onSwipe: (direction: Direction) => void) => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

    const minSwipeDistance = 30;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStart) return;
        
        // Prevent the browser's default behavior, like pull-to-refresh
        e.preventDefault();

        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        const diffX = touchStart.x - currentX;
        const diffY = touchStart.y - currentY;

        if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
            return;
        }

        if (Math.abs(diffX) > Math.abs(diffY)) {
            onSwipe(diffX > 0 ? 'LEFT' : 'RIGHT');
        } else {
            onSwipe(diffY > 0 ? 'UP' : 'DOWN');
        }
        
        setTouchStart(null); // Reset after a swipe is detected to prevent multiple swipes in one gesture
    };

    return { onTouchStart, onTouchMove };
};

    