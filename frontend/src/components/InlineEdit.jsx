import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function InlineEdit({ value, options, onSave, renderValue }) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="group -mx-2 -my-1 inline-flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-left text-body text-text-primary transition hover:border-ui-border hover:bg-gray-50"
        title="Click to change"
      >
        {renderValue ? renderValue(value) : value}
        <ChevronDown
          size={13}
          strokeWidth={2}
          className="text-gray-400 group-hover:text-text-secondary"
        />
      </button>
    );
  }

  return (
    <select
      autoFocus
      value={value}
      className="rounded-md border border-ui-border bg-white px-2 py-1 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      onChange={(e) => {
        onSave(e.target.value);
        setEditing(false);
      }}
      onBlur={() => setEditing(false)}
    >
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}
