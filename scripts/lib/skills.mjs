/**
 * domainSchema enforces skill-slug uniqueness only within a domain, so two
 * domains may both declare e.g. "overview". Anything counting questions per
 * skill has to key on the pair, or it silently pools them and misreports both.
 *
 * Shared because balance-report and bank-metrics both do that counting and
 * must agree; the NUL separator cannot occur in a slug, which the schema
 * restricts to lowercase alphanumerics and hyphens.
 */
export function skillKey(domainSlug, skillSlug) {
  return `${domainSlug}\u0000${skillSlug}`;
}
