export function assertExists<T>(value: T | null | undefined, message = "value missing"): asserts value is T {
    if (value == null) {
        throw new Error(message);
    }
}