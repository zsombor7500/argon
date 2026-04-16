export function nestedMapToRecord(map: Map<string, Map<string, string>>): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};
    for (const [outerKey, innerMap] of map) {
        result[outerKey] = Object.fromEntries(innerMap);
    }
    return result;
}
