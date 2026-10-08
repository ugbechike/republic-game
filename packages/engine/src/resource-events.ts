import { RESOURCE_INFO, RESOURCE_LABEL, type Crisis, type Republic, type Resource } from '@republic/contracts';
export function resourceEvents(r: Republic): Omit<Crisis, 'id' | 'expires'>[] {
  return r.resources.flatMap((resource) =>
    RESOURCE_INFO[resource].risks.map((title, index) => ({
      kind: 'resource' as const,
      resource,
      title,
      affectedMetric: impactMetric(resource, index),
      description: `${title} threatens your ${RESOURCE_LABEL[resource].toLowerCase()}. ${index === 1 ? 'Export revenue and services' : 'Production and communities'} are under pressure. Output from this advantage is halved for six months; ${impactMetric(resource, index)} falls by 4. Choose how to recover.`,
    })),
  );
}
function impactMetric(resource: Resource, index: number): 'infrastructure' | 'healthcare' | 'stability' | 'energy' {
  if (['uranium', 'rareEarths'].includes(resource)) return index === 2 ? 'stability' : 'healthcare';
  if (resource === 'gas') return 'energy';
  if (resource === 'gold' || (resource === 'oil' && index === 2)) return 'stability';
  return 'infrastructure';
}
