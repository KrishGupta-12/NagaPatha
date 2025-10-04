
'use client';

import { useState, useRef } from 'react';
import type { Direction } from '@/lib/types';

export const useSwipeControls = (onSwipe: (direction: Direction) => void) => {
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const lastDirectionRef = useRef<Direction | null>(null);

    const minSwipeDistance = 20;

    const onTouchStart = (e: React.TouchEvent) => {
        // Only start a new swipe if there isn't one already in progress
        if (touchStartRef.current === null) {
            const touch = e.targetTouches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            lastDirectionRef.current = null;
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling and pull-to-refresh
        
        if (!touchStartRef.current) return;

        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        
        const diffX = touchStartRef.current.x - currentX;
        const diffY = touchStartRef.current.y - currentY;
        
        let currentDirection: Direction | null = null;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > minSwipeDistance) {
                currentDirection = diffX > 0 ? 'LEFT' : 'RIGHT';
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > minSwipeDistance) {
                currentDirection = diffY > 0 ? 'UP' : 'DOWN';
            }
        }

        // Only call onSwipe if the direction has changed and is not null
        if (currentDirection && currentDirection !== lastDirectionRef.current) {
            onSwipe(currentDirection);
            lastDirectionRef.current = currentDirection;
        }
    };

    const onTouchEnd = () => {
        // Reset for the next touch
        touchStartRef.current = null;
        lastDirectionRef.current = null;
    }

    return { onTouchStart, onTouchMove, onTouchEnd };
};

    