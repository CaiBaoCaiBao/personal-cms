export function stopEventBubble(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
}