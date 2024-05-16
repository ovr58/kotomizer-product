// all credits to this MASTER https://phuoc.ng/collection/react-drag-drop/drag-an-element-along-a-circle/

import { useCallback, useEffect, useState } from "react";

export const useDraggable = () => {
    const [node, setNode] = useState();
    const [{ dx, dy, angle }, setOffset] = useState({
        dx: 0,
        dy: 0,
        angle: 0,
    });

    const ref = useCallback((nodeEle) => {
        setNode(nodeEle);
    }, []);

    const handleMouseDown = useCallback((e) => {
        if (!node) {
            return;
        }
        const width = node.getBoundingClientRect().width;
        const containerWidth = node.parentElement.getBoundingClientRect().width;
        const radius = containerWidth / 2;
        const center = radius - width / 2;
        
        const startPos = {
            x: e.clientX - dx,
            y: e.clientY - dy,
        };


        const handleMouseMove = (e) => {
            let dx = e.clientX - startPos.x;
            let dy = e.clientY - startPos.y;
            let angle

            const centerDistance = Math.sqrt(
                Math.pow(dx - center, 2) + Math.pow(dy - center, 2)
            );
            const sinValue = (dy - center) / centerDistance;
            const cosValue = (dx - center) / centerDistance;
            dx = center + radius * cosValue;
            dy = center + radius * sinValue;
            angle = (Math.acos(cosValue)*180)/Math.PI

            setOffset({ dx, dy, angle });
            updateCursor();
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            resetCursor();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [node, dx, dy]);

    const handleTouchStart = useCallback((e) => {
        if (!node) {
            return;
        }
        const touch = e.touches[0];

        const startPos = {
            x: touch.clientX - dx,
            y: touch.clientY - dy,
        };
        const width = node.getBoundingClientRect().width;
        const containerWidth = node.parentElement.getBoundingClientRect().width;
        const radius = containerWidth / 2;
        const center = radius - width / 2;

        const handleTouchMove = (e) => {
            const touch = e.touches[0];
            let dx = touch.clientX - startPos.x;
            let dy = touch.clientY - startPos.y;
            let angle
            const centerDistance = Math.sqrt(
                Math.pow(dx - center, 2) + Math.pow(dy - center, 2)
            );
            const sinValue = (dy - center) / centerDistance;
            const cosValue = (dx - center) / centerDistance;
            dx = center + radius * cosValue;
            dy = center + radius * sinValue;
            angle = (Math.acos(cosValue)*180)/Math.PI;

            setOffset({ dx, dy, angle });
            updateCursor();
        };

        const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            resetCursor();
        };

        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    }, [node, dx, dy]);

    const updateCursor = () => {
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
    };

    const resetCursor = () => {
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');
    };

    useEffect(() => {
        if (!node) {
            return;
        }
        node.addEventListener("mousedown", handleMouseDown);
        node.addEventListener("touchstart", handleTouchStart);
        return () => {
            node.removeEventListener("mousedown", handleMouseDown);
            node.removeEventListener("touchstart", handleTouchStart);
        };
    }, [node, dx, dy]);

    return [ref, dx, dy, angle];
};