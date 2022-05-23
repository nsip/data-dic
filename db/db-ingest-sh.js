import { ingestEntity, ingestClassLinkage } from './db-ingest.js'

ingestEntity('../data/out', 'entity')

ingestClassLinkage('../data/out/class-link.json', 'class')