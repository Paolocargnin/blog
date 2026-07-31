import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createNote,
  developNote,
  promoteDraft,
  publishCandidate,
  scaffoldWorkspace,
  validateWorkspace,
} from '../scripts/workspace-lib.mjs';
import { optionsFromArguments } from '../scripts/workspace-cli.mjs';

const temporaryDirectories = [];

async function createWorkspace() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pc-blog-workspace-'));
  temporaryDirectories.push(directory);
  const workspace = path.join(directory, 'workspace');
  await scaffoldWorkspace(workspace);
  return { directory, workspace };
}

async function writeCompleteCandidateEvidence(candidateDirectory) {
  await writeFile(
    path.join(candidateDirectory, 'sources.md'),
    '# Private source ledger\n\nNo external claims in this fixture.\n',
    'utf8',
  );
  await writeFile(
    path.join(candidateDirectory, 'fact-check.md'),
    `---\nworkflowVersion: 1\nreviewedBy: Independent Checker\nreviewedAt: 2026-07-31\nindependent: true\nstatus: passed\n---\n\n# Fact-check\n\nEvery fixture claim was checked.\n`,
    'utf8',
  );
  await writeFile(
    path.join(candidateDirectory, 'counter-discussion.md'),
    `---\nworkflowVersion: 1\nreviewedBy: Adversarial Reviewer\nreviewedAt: 2026-07-31\nstatus: resolved\nfindings: []\n---\n\n# Counter-discussion\n\nNo material objection remained.\n`,
    'utf8',
  );
  await writeFile(
    path.join(candidateDirectory, 'publication-check.md'),
    `---\nworkflowVersion: 1\npreparedBy: Paolo Cargnin\npreparedAt: 2026-07-31\nstatus: ready\nsourcesProposal: omitted\nsourcesRationale: This disposable fixture contains no external claims.\naiDisclosure: not-material\naiDisclosureRationale: No material AI contribution exists in this fixture.\n---\n\n# Publication check\n\nThe fixture package is ready.\n`,
    'utf8',
  );
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('private Workspace lifecycle', () => {
  it("accepts pnpm's argument separator before command options", () => {
    expect(
      optionsFromArguments(['--', '--workspace', 'private', '--slug', 'idea']),
    ).toEqual(
      new Map([
        ['--workspace', 'private'],
        ['--slug', 'idea'],
      ]),
    );
  });

  it('creates a Note, assigns a stable id when developing it, and validates the result', async () => {
    const { workspace } = await createWorkspace();

    await createNote({ workspace, slug: 'a-promising-idea' });
    await writeFile(
      path.join(workspace, 'notes', 'a-promising-idea', 'notes.md'),
      'Existing supporting context.\n',
      'utf8',
    );
    await developNote({ workspace, slug: 'a-promising-idea' });
    await validateWorkspace(workspace);

    const article = await readFile(
      path.join(workspace, 'drafts', 'a-promising-idea', 'article.md'),
      'utf8',
    );
    expect(article).toMatch(/^---\nid: [0-9a-f-]{36}\n---/);
    const preservedNotes = await readFile(
      path.join(workspace, 'drafts', 'a-promising-idea', 'notes.md'),
      'utf8',
    );
    expect(preservedNotes).toContain('Existing supporting context.');
    expect(preservedNotes).toContain('# a promising idea');
  });

  it('will not promote a Draft without a named human approval', async () => {
    const { workspace } = await createWorkspace();
    await createNote({ workspace, slug: 'needs-review' });
    await developNote({ workspace, slug: 'needs-review' });

    await expect(
      promoteDraft({ workspace, slug: 'needs-review' }),
    ).rejects.toThrow('stops for explicit human approval');

    await writeFile(
      path.join(workspace, 'drafts', 'needs-review', 'article.md'),
      `---\nid: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad\ntitle: Needs review\ndescription: A complete Draft ready for promotion.\npublishedAt: 2026-07-31\ntags:\n  - writing\n---\n\nA complete Draft.\n`,
      'utf8',
    );

    await promoteDraft({
      workspace,
      slug: 'needs-review',
      approvedBy: 'Paolo Cargnin',
    });
    await validateWorkspace(workspace);
  });

  it('will not publish without approval or review evidence and copies only a ready Post', async () => {
    const { directory, workspace } = await createWorkspace();
    const slug = 'ready-to-publish';
    const candidateDirectory = path.join(
      workspace,
      'publication-candidates',
      slug,
    );
    await mkdir(candidateDirectory, { recursive: true });
    await writeFile(
      path.join(candidateDirectory, 'article.md'),
      `---\nid: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad\ntitle: Ready to publish\ndescription: A complete candidate ready for a human-approved publication PR.\npublishedAt: 2026-07-31\ntags:\n  - writing\n---\n\nA complete candidate.\n`,
      'utf8',
    );
    const postsDirectory = path.join(directory, 'posts');
    await mkdir(postsDirectory, { recursive: true });
    await writeFile(path.join(postsDirectory, '.gitkeep'), '', 'utf8');

    await expect(
      publishCandidate({ workspace, postsDirectory, slug }),
    ).rejects.toThrow('stops for explicit human approval');

    await expect(
      publishCandidate({
        workspace,
        postsDirectory,
        slug,
        approvedBy: 'Paolo Cargnin',
      }),
    ).rejects.toThrow('Editorial publication gates failed');

    await writeCompleteCandidateEvidence(candidateDirectory);

    const postFile = await publishCandidate({
      workspace,
      postsDirectory,
      slug,
      approvedBy: 'Paolo Cargnin',
    });
    expect(await readFile(postFile, 'utf8')).toContain('Ready to publish');
  });
});
