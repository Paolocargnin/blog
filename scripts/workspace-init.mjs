import { spawnSync } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { scaffoldWorkspace } from './workspace-lib.mjs';

const options = optionsFromArguments();
const workspace = workspaceFromOptions(options);
const remote = options.get('--remote');
if (!remote) {
  throw new Error(
    'A private Git remote is required. Pass --remote git@github.com:OWNER/REPOSITORY.git.',
  );
}

try {
  await stat(workspace);
  throw new Error(
    `${workspace} already exists. Refusing to modify an existing private Workspace.`,
  );
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

await mkdir(path.dirname(workspace), { recursive: true });
const init = spawnSync('git', ['init', '--initial-branch=main', workspace], {
  encoding: 'utf8',
});
if (init.status !== 0) {
  throw new Error(
    init.stderr || 'Unable to initialize the private Git repository.',
  );
}

const addRemote = spawnSync(
  'git',
  ['-C', workspace, 'remote', 'add', 'origin', remote],
  {
    encoding: 'utf8',
  },
);
if (addRemote.status !== 0) {
  throw new Error(
    addRemote.stderr || 'Unable to configure the private Git remote.',
  );
}

await scaffoldWorkspace(workspace);
console.log(`Initialized private Workspace at ${workspace}.`);
console.log(
  'Commit and push its contract file from that private repository before using it on another device.',
);
