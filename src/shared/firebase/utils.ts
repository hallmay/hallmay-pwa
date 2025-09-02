export const chunkArray = <T>(array: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

// Build a stable SWR tag for a collection and organization scoped data
export const buildTag = (orgId: string | undefined, name: string) => `${orgId ?? 'no-org'}:${name}`;