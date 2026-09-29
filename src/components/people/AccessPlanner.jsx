import { useState } from 'react';
import { Button, Badge, Empty } from '../ui/Primitives';

export default function AccessPlanner({ demo, people, records, emergency, onSave }) {
  const [person, setPerson] = useState(''), [chosen, setChosen] = useState([]);
  const [permission, setPermission] = useState('View only'), [condition, setCondition] = useState('Owner approval');
  const [review, setReview] = useState(false), [saved, setSaved] = useState(false);
  const recipient = people.find(p => p.id === person);
  if (!people.length || !records.length) return <Empty title="Start with people and records" text="Add a trusted person and a record before planning selected access."/>;
  return <form className="stack-form" onSubmit={e => { e.preventDefault(); if (!demo || !person || !chosen.length) return; if (!review) setReview(true); else { onSave({ person, records: chosen, permission, condition }); setSaved(true); } }}>
    <p className="notice">{demo ? 'Sample access plan only. No invitation, record key or real permission will be sent.' : 'Recipient verification and cryptographic grants are not connected. This view does not grant access.'}</p>
    {saved ? <div role="status"><Badge>Sample plan saved</Badge><p>{recipient.display_name} · {chosen.length} selected records · {permission}</p><p className="muted">The plan lasts only for this preview session.</p></div> : review ? <><h3>Review selected access</h3><div className="setting-row"><span>Person</span><strong>{recipient.display_name}</strong></div><div className="setting-row"><span>Permission</span><strong>{permission}</strong></div><div className="setting-row"><span>Activation</span><strong>{condition}</strong></div><ul>{records.filter(r => chosen.includes(r.id)).map(r => <li key={r.id}>{r.title}</li>)}</ul><p className="field-hint">Removing access later cannot erase information someone has already copied.</p><div className="form-actions"><Button type="button" onClick={() => setReview(false)}>Back</Button><Button variant="primary">Save sample plan</Button></div></> : <>
      <label>Trusted person<select required value={person} onChange={e => setPerson(e.target.value)}><option value="">Select a person</option>{people.map(p => <option key={p.id} value={p.id}>{p.display_name} · {p.relationship}</option>)}</select></label>
      <label>Permission<select value={permission} onChange={e => setPermission(e.target.value)}><option>View only</option><option>Selected access</option></select></label>
      <label>Activation condition<select value={condition} onChange={e => setCondition(e.target.value)}><option>Owner approval</option>{emergency && <><option>Verified incapacity</option><option>Verified death and legal authority</option></>}</select></label>
      <fieldset><legend>Selected records ({chosen.length})</legend><div className="record-choice-list">{records.map(r => <label className="preference-check" key={r.id}><input type="checkbox" checked={chosen.includes(r.id)} onChange={e => setChosen(ids => e.target.checked ? [...ids, r.id] : ids.filter(id => id !== r.id))}/><span>{r.title}<small>{r.category}</small></span></label>)}</div></fieldset>
      <Button variant="primary" disabled={!demo || !person || !chosen.length}>Review sample access</Button>
    </>}
  </form>;
}
