import { useRef } from 'react';

// Manual activation: moving focus never opens a different record section.
export default function TabList({ id, label, items, value, onChange }) {
  const buttons = useRef([]);
  function move(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % items.length
      : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? items.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
  }
  return <div className="category-tabs" role="tablist" aria-label={label}>
    {items.map((item, index) => <button
      type="button" key={item} ref={node => { buttons.current[index] = node; }}
      id={`${id}-tab-${index}`} role="tab" aria-selected={value === item}
      aria-controls={`${id}-panel`} tabIndex={value === item ? 0 : -1}
      className={value === item ? 'active' : ''}
      onKeyDown={event => move(event, index)} onClick={() => onChange(item)}
    >{item}</button>)}
  </div>;
}
