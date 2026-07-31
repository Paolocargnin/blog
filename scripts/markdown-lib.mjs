import { parse, stringify } from 'yaml';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isIsoDate(value) {
  if (typeof value !== 'string' || !isoDatePattern.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function parseMarkdownDocument(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`${filePath}: YAML frontmatter is required.`);
  }
  let data;
  try {
    data = parse(match[1]);
  } catch (error) {
    throw new Error(
      `${filePath}: invalid YAML frontmatter (${error.message}).`,
    );
  }
  if (!isPlainObject(data)) {
    throw new Error(`${filePath}: frontmatter must be a mapping.`);
  }
  return { data, body: source.slice(match[0].length) };
}

export function serializeMarkdownDocument(data, body) {
  return `---\n${stringify(data).trimEnd()}\n---\n\n${body.replace(/^\s+/, '')}`;
}

export function markdownSections(body) {
  const sections = [];
  let fence;
  let offset = 0;
  for (const match of body.matchAll(/.*(?:\n|$)/g)) {
    const lineWithEnding = match[0];
    if (lineWithEnding === '') {
      continue;
    }
    const line = lineWithEnding.replace(/\r?\n$/, '');
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.character &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = undefined;
      }
      offset += lineWithEnding.length;
      continue;
    }
    if (fenceMatch) {
      fence = {
        character: fenceMatch[1][0],
        length: fenceMatch[1].length,
      };
      offset += lineWithEnding.length;
      continue;
    }

    const heading = line.match(/^ {0,3}##(?!#)\s+(.+?)\s*#*\s*$/);
    if (heading) {
      if (sections.length > 0) {
        sections.at(-1).end = offset;
      }
      sections.push({
        title: heading[1].trim(),
        start: offset,
        contentStart: offset + lineWithEnding.length,
        end: body.length,
      });
    }
    offset += lineWithEnding.length;
  }
  return sections;
}
