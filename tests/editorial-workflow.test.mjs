import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { correctPost } from '../scripts/correction-lib.mjs';
import {
  candidateDigest,
  createEditorialFile,
  editorialStatus,
  returnCandidateToDraft,
  validatePublicationEvidence,
} from '../scripts/editorial-lib.mjs';
import { scaffoldWorkspace } from '../scripts/workspace-lib.mjs';

const temporaryDirectories = [];

async function temporaryProject() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pc-blog-editorial-'));
  temporaryDirectories.push(root);
  const workspace = path.join(root, 'workspace');
  const postsDirectory = path.join(root, 'posts');
  await scaffoldWorkspace(workspace);
  await mkdir(postsDirectory, { recursive: true });
  return { root, workspace, postsDirectory };
}

async function createCandidate(workspace, slug = 'candidate') {
  const directory = path.join(workspace, 'publication-candidates', slug);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, 'article.md'),
    `---\nid: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad\ntitle: Candidate\ndescription: A candidate used to test editorial gates.\npublishedAt: 2026-07-31\ntags:\n  - writing\n---\n\nA checked claim.\n`,
    'utf8',
  );
  await writeFile(
    path.join(directory, 'sources.md'),
    '# Private source ledger\n\nThe claim is direct experience.\n',
    'utf8',
  );
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('editorial workflow', () => {
  it('routes a Draft by explicit verification gaps without requiring a source ledger', async () => {
    const { workspace, postsDirectory } = await temporaryProject();
    const slug = 'personal-draft';
    const draft = path.join(workspace, 'drafts', slug);
    await mkdir(draft, { recursive: true });
    const articleFile = path.join(draft, 'article.md');
    await writeFile(
      articleFile,
      `---\nid: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad\ntitle: Personal draft\ndescription: A personal Draft with no external evidence requirement.\npublishedAt: 2026-07-31\ntags:\n  - writing\n---\n\nA personal reflection.\n`,
      'utf8',
    );
    await writeFile(path.join(draft, 'brief.md'), '# Brief\n', 'utf8');

    await expect(
      editorialStatus({ workspace, postsDirectory, slug }),
    ).resolves.toMatchObject({ nextSkill: 'blog-promote' });

    await writeFile(
      articleFile,
      `${await readFile(articleFile, 'utf8')}\n<!-- TODO: SOURCE -->\n`,
      'utf8',
    );
    await expect(
      editorialStatus({ workspace, postsDirectory, slug }),
    ).resolves.toMatchObject({ nextSkill: 'blog-report' });
  });

  it('creates each review sidecar once and only in its valid lifecycle', async () => {
    const { workspace } = await temporaryProject();
    const candidate = await createCandidate(workspace);

    const factCheck = await createEditorialFile({
      workspace,
      slug: 'candidate',
      kind: 'fact-check',
    });
    expect(await readFile(factCheck, 'utf8')).toContain('independent: false');
    await expect(
      createEditorialFile({
        workspace,
        slug: 'candidate',
        kind: 'fact-check',
      }),
    ).rejects.toThrow('already exists; preserve and edit it');
    expect(factCheck).toBe(path.join(candidate, 'fact-check.md'));
  });

  it('routes candidates through fact-check, counter-discussion, package, then publish', async () => {
    const { workspace, postsDirectory } = await temporaryProject();
    const candidate = await createCandidate(workspace);
    const digest = await candidateDigest({ workspace, slug: 'candidate' });

    await expect(
      editorialStatus({ workspace, postsDirectory, slug: 'candidate' }),
    ).resolves.toEqual({
      stage: 'publication-candidate',
      nextSkill: 'blog-fact-check',
    });

    await writeFile(
      path.join(candidate, 'fact-check.md'),
      `---\nworkflowVersion: 1\nreviewedBy: Checker\nreviewedAt: 2026-07-31\ncandidateDigest: ${digest}\nindependent: true\nstatus: passed\n---\n\n# Fact-check\n\nPassed.\n`,
      'utf8',
    );
    await expect(
      editorialStatus({ workspace, postsDirectory, slug: 'candidate' }),
    ).resolves.toMatchObject({ nextSkill: 'blog-counter-discuss' });

    await writeFile(
      path.join(candidate, 'counter-discussion.md'),
      `---\nworkflowVersion: 1\nreviewedBy: Challenger\nreviewedAt: 2026-07-31\ncandidateDigest: ${digest}\nstatus: resolved\nfindings: []\n---\n\n# Counter-discussion\n\nResolved.\n`,
      'utf8',
    );
    await expect(
      editorialStatus({ workspace, postsDirectory, slug: 'candidate' }),
    ).resolves.toMatchObject({ nextSkill: 'blog-package' });

    await writeFile(
      path.join(candidate, 'publication-check.md'),
      `---\nworkflowVersion: 1\npreparedBy: Paolo Cargnin\npreparedAt: 2026-07-31\ncandidateDigest: ${digest}\nstatus: ready\nsourcesProposal: omitted\nsourcesRationale: The claim is direct experience.\naiDisclosure: not-material\naiDisclosureRationale: No material AI contribution appears in this fixture.\n---\n\n# Publication check\n\nReady.\n`,
      'utf8',
    );
    await expect(
      editorialStatus({ workspace, postsDirectory, slug: 'candidate' }),
    ).resolves.toMatchObject({ nextSkill: 'blog-publish' });
    await expect(
      validatePublicationEvidence({ workspace, slug: 'candidate' }),
    ).resolves.toBeUndefined();
  });

  it('blocks non-independent checks and unresolved counter-discussion findings', async () => {
    const { workspace } = await temporaryProject();
    const candidate = await createCandidate(workspace);
    const digest = await candidateDigest({ workspace, slug: 'candidate' });
    await writeFile(
      path.join(candidate, 'fact-check.md'),
      `---\nworkflowVersion: 1\nreviewedBy: Drafter\nreviewedAt: 2026-07-31\ncandidateDigest: ${digest}\nindependent: false\nstatus: passed\n---\n\n# Fact-check\n`,
      'utf8',
    );
    await writeFile(
      path.join(candidate, 'counter-discussion.md'),
      `---\nworkflowVersion: 1\nreviewedBy: Challenger\nreviewedAt: 2026-07-31\ncandidateDigest: ${digest}\nstatus: resolved\nfindings:\n  - summary: The main objection is unanswered.\n    disposition: open\n    rationale: It still needs work.\n---\n\n# Counter-discussion\n`,
      'utf8',
    );
    await writeFile(
      path.join(candidate, 'publication-check.md'),
      `---\nworkflowVersion: 1\npreparedBy: Paolo Cargnin\npreparedAt: 2026-07-31\ncandidateDigest: ${digest}\nstatus: ready\nsourcesProposal: omitted\nsourcesRationale: Direct experience only.\naiDisclosure: not-material\naiDisclosureRationale: No material contribution.\n---\n\n# Publication check\n`,
      'utf8',
    );

    await expect(
      validatePublicationEvidence({ workspace, slug: 'candidate' }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringContaining('independent must be true'),
        expect.stringContaining(
          'disposition must be fixed, rejected, or accepted',
        ),
      ]),
    });
  });

  it('blocks an unfinished package whose public Sources proposal does not match the article', async () => {
    const { workspace } = await temporaryProject();
    const candidate = await createCandidate(workspace);
    const digest = await candidateDigest({ workspace, slug: 'candidate' });
    await writeFile(
      path.join(candidate, 'fact-check.md'),
      `---\nworkflowVersion: 1\nreviewedBy: Checker\nreviewedAt: 2026-07-31\ncandidateDigest: ${digest}\nindependent: true\nstatus: passed\n---\n\n# Fact-check\n\nPassed.\n`,
      'utf8',
    );
    await writeFile(
      path.join(candidate, 'counter-discussion.md'),
      `---\nworkflowVersion: 1\nreviewedBy: Challenger\nreviewedAt: 2026-07-31\ncandidateDigest: ${digest}\nstatus: resolved\nfindings: []\n---\n\n# Counter-discussion\n\nResolved.\n`,
      'utf8',
    );
    await writeFile(
      path.join(candidate, 'publication-check.md'),
      `---\nworkflowVersion: 1\npreparedBy: Paolo Cargnin\npreparedAt: 2026-07-31\ncandidateDigest: ${digest}\nstatus: ready\nsourcesProposal: included\nsourcesRationale: Readers should receive the supporting source.\naiDisclosure: not-material\naiDisclosureRationale: No material contribution.\n---\n\n# Publication check\n\n- [ ] Add the proposed public Sources section.\n`,
      'utf8',
    );

    await expect(
      validatePublicationEvidence({ workspace, slug: 'candidate' }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringContaining('requires a public ## Sources section'),
        expect.stringContaining(
          'every publication-check item must be resolved',
        ),
      ]),
    });
  });

  it('returns substantive changes to Draft and invalidates stale review evidence', async () => {
    const { workspace } = await temporaryProject();
    const candidate = await createCandidate(workspace);
    const digest = await candidateDigest({ workspace, slug: 'candidate' });
    await writeFile(
      path.join(candidate, 'fact-check.md'),
      `---\nworkflowVersion: 1\nreviewedBy: Checker\nreviewedAt: 2026-07-31\ncandidateDigest: ${digest}\nindependent: true\nstatus: passed\n---\n\n# Fact-check\n\nPassed.\n`,
      'utf8',
    );

    const draft = await returnCandidateToDraft({
      workspace,
      slug: 'candidate',
    });
    expect(draft).toBe(path.join(workspace, 'drafts', 'candidate'));
    const invalidated = await readFile(
      path.join(draft, 'fact-check.md'),
      'utf8',
    );
    expect(invalidated).toContain('independent: false');
    expect(invalidated).toContain('status: open');
    expect(invalidated).toContain('candidateDigest: ""');
  });

  it('prepares visible Corrections while preserving stable identity and publication date', async () => {
    const { root, postsDirectory } = await temporaryProject();
    const postFile = path.join(postsDirectory, 'published-post.md');
    const original = `---\nid: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad\ntitle: Published Post\ndescription: An existing public Post.\npublishedAt: 2026-07-30\ntags:\n  - writing\n---\n\nThe claim is wrong.\n`;
    await writeFile(postFile, original, 'utf8');
    const replacement = path.join(root, 'replacement.md');
    await writeFile(replacement, original.replace('wrong', 'correct'), 'utf8');

    await correctPost({
      postsDirectory,
      slug: 'published-post',
      replacementFile: replacement,
      kind: 'correction',
      date: '2026-07-31',
      summary: 'Corrected the central claim.',
      approvedBy: 'Paolo Cargnin',
    });

    const corrected = await readFile(postFile, 'utf8');
    expect(corrected).toContain('publishedAt: 2026-07-30');
    expect(corrected).toContain('updatedAt: 2026-07-31');
    expect(corrected).toContain('Corrected the central claim.');
    expect(corrected).toContain('The claim is correct.');
    expect(corrected).toContain('## Corrections');
    expect(corrected).toContain(
      '**2026-07-31 — Correction:** Corrected the central claim.',
    );

    const historyRemovingTypo = path.join(root, 'history-removing-typo.md');
    await writeFile(
      historyRemovingTypo,
      corrected.replace(/\n## Corrections[\s\S]*$/, '\n'),
      'utf8',
    );
    await expect(
      correctPost({
        postsDirectory,
        slug: 'published-post',
        replacementFile: historyRemovingTypo,
        kind: 'typo',
        approvedBy: 'Paolo Cargnin',
      }),
    ).rejects.toThrow('must preserve the visible Corrections history');
  });
});
