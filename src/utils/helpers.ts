export function sortDays<T>(days: Record<string, { menu: T, dayNumber: string }>): { day: string; menu: T; dayNumber: string }[] {
    const order = [
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado",
        "domingo",
    ];

    const sorted: { day: string; menu: T; dayNumber: string }[] = [];

    // Find all keys that match our order
    order.forEach((targetDay) => {
        const key = Object.keys(days).find(k => k.toLowerCase() === targetDay.toLowerCase());
        if (key && days[key] !== undefined) {
            sorted.push({
                day: key,
                menu: days[key].menu,
                dayNumber: days[key].dayNumber
            });
        }
    });

    // Add any remaining keys that were not in the order list
    Object.keys(days).forEach((key) => {
        if (!order.includes(key.toLowerCase()) && days[key] !== undefined) {
            sorted.push({
                day: key,
                menu: days[key].menu,
                dayNumber: days[key].dayNumber
            });
        }
    });

    return sorted;
}
