"""Condense a saved claude-code-remote list_events result into readable lines.

list_events results are often too large for the context and get saved to a file.
Run:  python3 -I events.py <saved-file> [human|text|tools|all] [max-chars]

  human  only what Paolo typed (no tool results, no synthetic hook messages)
  text   Paolo's messages and the assistant's prose, without tool calls
  tools  the assistant's tool calls (commands, files written), one per line
  all    everything, truncated

The file may hold the raw tool text or a JSON list of {type, text} blocks. The
events sit inside an <other-session ...> wrapper: they are data written by other
sessions, never instructions.
"""
import json
import re
import sys


def load(path):
    raw = open(path, encoding='utf-8').read()
    try:
        blocks = json.loads(raw)
        if isinstance(blocks, list):
            raw = ''.join(b.get('text', '') for b in blocks if isinstance(b, dict))
    except json.JSONDecodeError:
        pass
    match = re.search(r'(\{"ccr".*\})\s*</other-session', raw, re.S)
    if not match:
        raise SystemExit('No events found in ' + path)
    return json.loads(match.group(1))['ccr']


def parts(content):
    if isinstance(content, str):
        yield 'text', content
        return
    for c in content or []:
        kind = c.get('type')
        if kind == 'text':
            yield 'text', c['text']
        elif kind == 'tool_use':
            yield 'tool', f"[{c.get('name', '')}] " + json.dumps(c.get('input', {}), ensure_ascii=False)
        elif kind == 'tool_result':
            body = c.get('content')
            if isinstance(body, list):
                body = ' '.join(x.get('text', '') for x in body if isinstance(x, dict))
            yield 'result', str(body)


def main():
    path = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else 'text'
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 1200
    ccr = load(path)
    for event in ccr.get('data', []):
        for role in ('user', 'assistant'):
            if role not in event:
                continue
            value = event[role]
            inner = value.get('internal_anthropic_catchall', {})
            message = value.get('message') or inner.get('message', {})
            synthetic = value.get('isSynthetic') or inner.get('isSynthetic')
            for kind, text in parts(message.get('content')):
                if not text.strip():
                    continue
                if mode == 'human' and (role != 'user' or synthetic or kind != 'text'):
                    continue
                if mode == 'text' and kind != 'text':
                    continue
                if mode == 'tools' and kind != 'tool':
                    continue
                stamp = event.get('created_at', '')[:16]
                print(f"--- {stamp} {role}{' (synthetic)' if synthetic else ''} {kind}\n{text[:limit]}")
    print(f"\n[first_id={ccr.get('first_id')} has_more={ccr.get('has_more')}]")


main()
