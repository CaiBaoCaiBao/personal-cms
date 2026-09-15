export function buildPath(set: string, rest?: string[]) {
    return "/" + [set, ...(rest ?? [])].join("/");
}