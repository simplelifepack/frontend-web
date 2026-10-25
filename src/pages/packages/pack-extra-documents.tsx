import { useState } from "react";
import { Button, Checkbox, Heading, ModalBackdrop, ModalPanel, SearchField, Text } from "@/design-system";
import type { DocumentRecord } from "@/lib/api";
import { X } from "lucide-react";
import { documentPerson } from "../documents/document-filters";

export default function PackExtraDocuments({ documents, selected, onChange, onClose }: {
  documents: DocumentRecord[];
  selected: Set<string>;
  onChange: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = documents.filter(document => `${document.displayName ?? document.title ?? document.originalName} ${documentPerson(document)}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <ModalBackdrop className="lp-pack-change-backdrop">
    <ModalPanel className="lp-pack-change-panel" role="dialog" aria-modal="true" aria-label="Add documents to download" onDismiss={onClose}>
      <div className="lp-pack-change-head"><Heading level={2} size="sm">Add documents to download</Heading><Button iconOnly variant="tertiary" aria-label="Close document picker" onClick={onClose}><X size={16} /></Button></div>
      <div className="lp-pack-change-section">
        <SearchField aria-label="Search documents for download" placeholder="Search documents" value={query} onChange={event => setQuery(event.target.value)} />
        {filtered.map(document => <Text as="label" size="md" className="lp-pack-document-option" key={document.id}>
          <Checkbox checked={selected.has(document.id)} onChange={() => onChange(document.id)} />
          <span>{document.displayName || document.title || document.originalName}<small>{documentPerson(document)}</small></span>
        </Text>)}
        {!filtered.length && <Text as="p">No other documents match your search.</Text>}
      </div>
      <div className="lp-pack-change-actions"><Button variant="primary" onClick={onClose}>Done</Button></div>
    </ModalPanel>
  </ModalBackdrop>;
}
