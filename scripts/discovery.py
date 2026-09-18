#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Content discovery engine (s.txt 16/47/70). READ-ONLY: proposes candidates, never publishes."""
import os, io, json, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEOD = os.path.join(ROOT, 'seo')

def load(name, default):
    p = os.path.join(SEOD, name)
    if not os.path.exists(p):
        return default
    with io.open(p, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except Exception:
            return default

entities = load('chat-entities.json', {}).get('entities', [])
queue = load('content-queue.json', {}).get('queue', [])
clusters = load('TOPIC_CLUSTERS.json', {}).get('clusters', [])
refresh = load('CONTENT_REFRESH_SYSTEM.json', {})

served = set(e.get('normalizedName', '') for e in entities)
candidates = []
# Candidates from queue already in candidate state
for q in queue:
    if q.get('state') == 'candidate':
        candidates.append({'kind': 'queued-candidate', 'title': q.get('title'), 'url': q.get('url'),
                           'keyword': q.get('keyword'), 'cluster': q.get('cluster')})
# Internal opportunities: clusters with a single page are thin
for c in clusters:
    if c.get('count') == 1:
        candidates.append({'kind': 'thin-cluster', 'cluster': c.get('cluster'),
                           'pages': c.get('samplePages', [])})
report = {
    'site': os.path.basename(ROOT),
    'generatedAt': datetime.date.today().isoformat(),
    'note': 'Discover only. No automatic publishing; goes to Quality Gate (s.txt 16/50).',
    'counts': {'entities': len(entities), 'queue': len(queue),
               'clusters': len(clusters), 'candidates': len(candidates)},
    'candidates': candidates,
}
out = os.path.join(SEOD, 'discovery-report.json')
with io.open(out, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(report, f, ensure_ascii=False, indent=1)
print('== discovery | entities=%d queue=%d clusters=%d candidates=%d -> seo/discovery-report.json'
      % (len(entities), len(queue), len(clusters), len(candidates)))
