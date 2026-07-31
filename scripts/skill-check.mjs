import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parse } from 'yaml';

const suite = Object.freeze([
  'blog-workflow',
  'blog-capture',
  'blog-develop',
  'blog-report',
  'blog-promote',
  'blog-fact-check',
  'blog-counter-discuss',
  'blog-package',
  'blog-publish',
  'blog-correct',
]);

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`${filePath}: YAML frontmatter is required.`);
  }
  return parse(match[1]);
}

const errors = [];
for (const name of suite) {
  const skillDirectory = path.join('.agents', 'skills', name);
  const skillFile = path.join(skillDirectory, 'SKILL.md');
  const agentFile = path.join(skillDirectory, 'agents', 'openai.yaml');
  const skillSource = await readFile(skillFile, 'utf8');
  const metadata = parseFrontmatter(skillSource, skillFile);
  if (metadata.name !== name) {
    errors.push(`${skillFile}: name must be ${name}.`);
  }
  if (
    typeof metadata.description !== 'string' ||
    metadata.description.trim() === ''
  ) {
    errors.push(`${skillFile}: description is required.`);
  }
  if (skillSource.includes('TODO')) {
    errors.push(`${skillFile}: generated TODO text remains.`);
  }

  const agent = parse(await readFile(agentFile, 'utf8'));
  if (agent?.policy?.allow_implicit_invocation !== false) {
    errors.push(`${agentFile}: implicit invocation must be disabled.`);
  }
  if (!agent?.interface?.default_prompt?.includes(`$${name}`)) {
    errors.push(`${agentFile}: default_prompt must name $${name}.`);
  }
}

const router = await readFile(
  path.join('.agents', 'skills', 'blog-workflow', 'SKILL.md'),
  'utf8',
);
const documentation = await readFile('docs/editorial-skills.md', 'utf8');
for (const name of suite.slice(1)) {
  if (!router.includes(`$${name}`)) {
    errors.push(`blog-workflow: router must point to $${name}.`);
  }
  if (!documentation.includes(`$${name}`)) {
    errors.push(`docs/editorial-skills.md: must document $${name}.`);
  }
}

if (errors.length > 0) {
  throw new Error(
    `Editorial skill validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`,
  );
}
console.log(`Validated ${suite.length} editorial skills.`);
