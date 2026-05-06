import { parseFrontmatter } from "@astrojs/markdown-remark";

export interface ParseResult {
    data: Record<string, string>;
    frontMatter: string;
    body: string;
}

// Matches the opening F# front matter comments
//
// (**
// ---
// ...
// ---
// *)
//
const FRONTMATTER_RE =
    /\(\*\*+[\r\n]*(?<front_matter>---((?!\*\)).)*---)[\r\n]*\*+\)/s;

function splitLines(text: string): string[] {
    return text.split(/\r\n|\r|\n/);
}

function trimBlankLines(lines: string[]): string[] {
    let result = lines;
    while (result.length > 0 && result.at(0)?.trim() === "") result = result.slice(1);
    while (result.length > 0 && result.at(-1)?.trim() === "") result = result.slice(0, -1);
    return result;
}

function pushSection(result: string[], lines: string[]): void {
    if (lines.length === 0) return;
    if (result.length > 0) result.push("");
    result.push(...lines);
}

function processFile(lines: string[]): string[] {
    const result: string[] = [];
    let remaining = lines;

    while (remaining.length > 0) {
        const [currentLine, ...tail] = remaining;
        if (currentLine === undefined) break;
        const trimmedLine = currentLine.trim();

        if (trimmedLine.startsWith("(*** hide ***)")) {
            // Skip all lines until the next (** block
            const idx = tail.findIndex((line) => line.trim().startsWith("(**"));
            remaining = idx === -1 ? [] : tail.slice(idx);
            continue;
        }

        if (trimmedLine.startsWith("(*** show ***)")) {
            const endIdx = tail.findIndex((line) => line.trim().startsWith("(**"));
            const codeLines = trimBlankLines(endIdx === -1 ? tail : tail.slice(0, endIdx));
            remaining = endIdx === -1 ? [] : tail.slice(endIdx);
            pushSection(result, codeLines.length > 0 ? ["```fsharp", ...codeLines, "```"] : []);
            continue;
        }

        if (trimmedLine.startsWith("(*** verbatim ***)")) {
            const idx = tail.findIndex((line) => line.trim() === "(*** end-verbatim ***)");
            if (idx === -1) {
                pushSection(result, tail);
                remaining = [];
            } else {
                pushSection(result, tail.slice(0, idx));
                remaining = tail.slice(idx + 1);
            }
            continue;
        }

        if (trimmedLine.startsWith("(**")) {
            const afterOpen = trimmedLine.slice(3);
            const selfClose = afterOpen.indexOf("*)");

            if (selfClose !== -1) {
                // Single-line block: (** prose *) — closing *) is on the same line
                const content = afterOpen.slice(0, selfClose).trim();
                if (content) pushSection(result, [content]);
                remaining = tail;
                continue;
            }

            // Multi-line block: closing *) is on a subsequent line
            const firstLine = afterOpen.trim();
            const endIdx = tail.findIndex((line) => line.trimEnd().endsWith("*)"));
            if (endIdx === -1) {
                result.push(firstLine, ...tail);
                remaining = [];
            } else {
                // Include any prose text sitting before *) on the closing line
                const closingLine = tail[endIdx]!;
                const closeIdx = closingLine.lastIndexOf("*)");
                const closingContent = closingLine.slice(0, closeIdx).trim();
                const proseLines = [firstLine, ...tail.slice(0, endIdx)];
                if (closingContent) proseLines.push(closingContent);
                pushSection(result, trimBlankLines(proseLines));
                // The *) line becomes currentLine in the next iteration, triggering
                // the code branch below
                remaining = tail.slice(endIdx);
            }
            continue;
        }

        // Code branch: currentLine is the *) separator (or a leading blank line).
        // Collect subsequent lines from tail until the next (** block.
        const endIdx = tail.findIndex((line) => line.trim().startsWith("(**"));
        const codeLines = trimBlankLines(endIdx === -1 ? tail : tail.slice(0, endIdx));
        remaining = endIdx === -1 ? [] : tail.slice(endIdx);

        pushSection(result, codeLines.length > 0 ? ["```fsharp", ...codeLines, "```"] : []);
    }

    return result;
}

/**
 * Parses an .fsx literate file.
 * Returns the parsed frontmatter data and processed markdown body,
 * or null if the file has no frontmatter block.
 */
export function tryParse(fileContent: string): ParseResult | null {
    const match = FRONTMATTER_RE.exec(fileContent);
    if (!match) return null;

    const rawFrontmatter = match.groups!["front_matter"];

    if (!rawFrontmatter) {
        return null;
    }

    const frontMatterData = parseFrontmatter(rawFrontmatter);

    const remaining = fileContent.slice(match.index + match[0].length);

    const lines = splitLines(remaining);
    const body = processFile(lines).join("\n");

    return {
        data: frontMatterData.frontmatter,
        frontMatter: rawFrontmatter,
        body
    };
}
