
'use client';

import { useState } from 'react';
import type { Direction } from '@/lib/types';

export const useSwipeControls = (onSwipe: (direction: Direction) => void) => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [lastSwipe, setLastSwipe] = useState<{ x: number; y: number } | null>(null);

    const minSwipeDistance = 20; // Reduced for more sensitivity

    const onTouchStart = (e: React.TouchEvent) => {
        const touch = e.targetTouches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
        setLastSwipe({ x: touch.clientX, y: touch.clientY });
    };

    const onTouchMove = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent default browser actions like scrolling
        
        if (!touchStart || !lastSwipe) return;

        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        
        const diffX = lastSwipe.x - currentX;
        const diffY = lastSwipe.y - currentY;

        if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
            return;
        }

        if (Math.abs(diffX) > Math.abs(diffY)) {
            onSwipe(diffX > 0 ? 'LEFT' : 'RIGHT');
        } else {
            onSwipe(diffY > 0 ? 'UP' : 'DOWN');
        }
        
        // Update the last swipe position to the current one
        setLastSwipe({ x: currentX, y: currentY });
    };

    const onTouchEnd = () => {
        setTouchStart(null);
        setLastSwipe(null);
    }

    return { onTouchStart, onTouchMove, onTouchEnd };
};
