import { normalized } from './tree-files'

const IMPLICIT_GLOB = /^[^.*?]+$/

const SKIPPED_BY_RECURSION = '(?:node_modules|bower_components|jspm_packages)'

const escaped = (text: string): string => text.replace(/[\\^$+()[\]{}|.]/g, '\\$&')

const componentPattern = (component: string): string => {
  const body = escaped(component).replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]')
  return component.startsWith('*') || component.startsWith('?') ? `(?!\\.)${body}` : body
}

const patternOf = (base: string, spec: string, usage: 'include' | 'exclude'): RegExp => {
  const components = normalized(spec.startsWith('/') ? spec : `${base}/${spec}`).split('/')
  const last = components.at(-1)
  if (usage === 'include' && last !== undefined && IMPLICIT_GLOB.test(last)) components.push('**', '*')
  if (usage === 'exclude' && last === '**') components.pop()
  const parts = components.map(component =>
    component === '**' ? `(?:(?!${SKIPPED_BY_RECURSION}(?:/|$))(?!\\.)[^/]+/)*` : `${componentPattern(component)}/`,
  )
  const joined = parts.join('').replace(/\/$/, '')
  return new RegExp(usage === 'include' ? `^${joined}$` : `^${joined}(?:$|/)`)
}

export const matchingFiles = (
  paths: readonly string[],
  base: string,
  extensions: readonly string[],
  excludes: readonly string[] | undefined,
  includes: readonly string[],
): string[] => {
  const root = normalized(base)
  const included = includes.map(spec => patternOf(root, spec, 'include'))
  const excluded = (excludes ?? []).map(spec => patternOf(root, spec, 'exclude'))
  return paths
    .filter(path => (root === '' || path.startsWith(`${root}/`)) && extensions.some(extension => path.endsWith(extension)))
    .filter(path => included.some(pattern => pattern.test(path)) && !excluded.some(pattern => pattern.test(path)))
    .sort()
    .map(path => `/${path}`)
}
