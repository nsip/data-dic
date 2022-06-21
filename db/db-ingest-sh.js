import { ingestEntity, ingestClassLinkage, ingestEntityPathVal, ingestCollection, ingestCollectionEntities } from './db-ingest.js'

ingestEntity('../data/out', 'entity')
ingestClassLinkage('../data/out/class-link.json', 'class')
ingestEntityPathVal('../data/out/path_val', 'pathval')
ingestCollection('../data/out/collections', 'collection')
ingestCollectionEntities('../data/out/collection-entities.json', 'colentities')