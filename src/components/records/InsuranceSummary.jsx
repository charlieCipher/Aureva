import Icon from '../Icon';
import { claimReadiness, policiesForAsset } from '../../modules/insurance/continuity';
export function ClaimChecklist({ record, people }) {
  const readiness = claimReadiness(record, people);
  return <div className="claim-checklist"><h3>Claim Readiness <small>{readiness.completed} / {readiness.total} recorded</small></h3><p className="field-hint">Administrative information checklist. This does not assess a claim or legal eligibility.</p>{readiness.items.map(item => <div key={item.key}><Icon name={item.complete ? 'check' : 'circle'} size={16}/><span>{item.label}</span><small>{item.complete ? 'Recorded' : 'Missing'}</small></div>)}</div>;
}
export function LinkedPolicies({ records, assetId, go }) {
  const linked = policiesForAsset(records, assetId);
  return <section className="linked-policies"><h3>Linked insurance</h3>{linked.length ? linked.map(r => <button className="document-row" key={r.id} onClick={() => go('/app/vault/' + r.id)}><Icon name="shield"/><span>{r.title}<small>Policy linked · recorded information</small></span><Icon name="chevron"/></button>) : <p className="muted">No active policy linked.</p>}<button className="text-button" onClick={() => go('/app/vault/insurance')}>Open Insurance Hub →</button></section>;
}
