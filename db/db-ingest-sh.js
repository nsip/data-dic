import { ingestEntity, ingestClassLinkage } from './db-ingest.js'

ingestEntity('../data/preproc/out', 'entity')

ingestClassLinkage('../data/preproc/out/class-link.json', 'class')