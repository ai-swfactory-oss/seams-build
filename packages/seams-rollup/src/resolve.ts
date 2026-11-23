import type { Tree } from '@ai-swfactory-oss/files'

export type TreeAliasPattern = '@/*' | '~/*'

export interface TreeAlias {
  readonly pattern: TreeAliasPattern
  readonly target: string
}

export interface TreeResolverConfig {
  readonly aliases: readonly TreeAlias[]
  readonly extensions: readonly string[]
}

export type TreeResolution =
  | { readonly kind: 'file'; readonly path: string }
  | { readonly kind: 'external'; readonly id: string }
  | { readonly kind: 'unresolved'; readonly specifier: string; readonly importer: string; readonly reason: string }

const segmentsOf = (path: string): readonly string[] | null => {
  const segments: string[] = []
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      if (segments.length === 0) return null
      segments.pop()
      continue
    }
    segments.push(segment)
  }
  return segments
}

const directoryOf = (path: string): string => path.slice(0, Math.max(path.lastIndexOf('/'), 0))

const isRelative = (specifier: string): boolean =>
  specifier.startsWith('./') || specifier.startsWith('../') || specifier === '.' || specifier === '..'

const aliasTargetOf = (specifier: string, aliases: readonly TreeAlias[]): string | undefined => {
  for (const alias of aliases) {
    const prefix = alias.pattern.slice(0, -1)
    if (specifier.startsWith(prefix)) return alias.target.replace('*', specifier.slice(prefix.length))
  }
  return undefined
}

const probe = (files: ReadonlySet<string>, base: string, extensions: readonly string[]): string | undefined => {
  const candidates = [
    base,
    ...extensions.map(extension => `${base}${extension}`),
    ...extensions.map(extension => (base === '' ? `index${extension}` : `${base}/index${extension}`)),
  ]
  return candidates.find(candidate => files.has(candidate))
}

export const resolveInTree = (tree: Tree, importer: string, specifier: string, config: TreeResolverConfig): TreeResolution => {
  const unresolved = (reason: string): TreeResolution => ({ kind: 'unresolved', specifier, importer, reason })
  const aliased = aliasTargetOf(specifier, config.aliases)
  if (aliased === undefined && !isRelative(specifier) && !specifier.startsWith('/')) return { kind: 'external', id: specifier }
  const joined = aliased ?? (specifier.startsWith('/') ? specifier : `${directoryOf(importer)}/${specifier}`)
  const segments = segmentsOf(joined)
  if (segments === null) return unresolved(`\`${specifier}\` from \`${importer}\` leaves the Tree`)
  const files = new Set(tree.entries.filter(entry => entry.kind === 'file').map(entry => segmentsOf(entry.path)?.join('/') ?? entry.path))
  const found = probe(files, segments.join('/'), config.extensions)
  return found === undefined
    ? unresolved(`\`${specifier}\` from \`${importer}\` names no file of the Tree, by itself, with an extension or as a directory index`)
    : { kind: 'file', path: found }
}
