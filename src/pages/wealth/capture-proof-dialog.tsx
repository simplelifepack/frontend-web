import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, FileCheck, Paperclip, X } from "lucide-react";

import { api, type DynamicFormCategory, type DynamicFormField, type DynamicFormSchema, type DynamicFormSubtype, type WealthRecord } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";

type Value = string | number | boolean | null | string[];

type Props = {
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function optionValue(option: unknown) {
  if (typeof option === "string") return { label: option, value: option };
  if (option && typeof option === "object" && "value" in option && "label" in option) {
    return { label: String(option.label), value: String(option.value) };
  }
  return null;
}

function initialSchemaValues(schema: DynamicFormSchema) {
  return Object.fromEntries(schema.fields.map((field) => [field.id, field.defaultValue == null ? "" : String(field.defaultValue)]));
}

export default function CaptureProofDialog({ onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categories, setCategories] = useState<DynamicFormCategory[]>([]);
  const [subtypes, setSubtypes] = useState<DynamicFormSubtype[]>([]);
  const [schema, setSchema] = useState<DynamicFormSchema | null>(null);
  const [baseValues, setBaseValues] = useState<Record<string, string>>({ amount: "0", date: today(), direction: "Paid" });
  const [dynamicValues, setDynamicValues] = useState<Record<string, Value>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedCategory = categories.find((category) => category.code === baseValues.categoryCode);

  useEffect(() => {
    api.wealth.formCategories().then(setCategories).catch((err) => setError(err instanceof Error ? err.message : "Unable to load categories."));
  }, []);

  const canContinue = Boolean(baseValues.title?.trim() && baseValues.amount?.trim() && baseValues.date && baseValues.categoryCode);
  const orderedFields = useMemo(() => schema?.fields.slice().sort((a, b) => a.order - b.order) ?? [], [schema]);

  async function loadSubtypes() {
    if (!baseValues.categoryCode) return;
    setLoading(true);
    setError(null);
    try {
      setSubtypes(await api.wealth.formSubtypes(baseValues.categoryCode));
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load subtypes.");
    } finally {
      setLoading(false);
    }
  }

  async function chooseSubtype(subtypeCode: string) {
    if (!baseValues.categoryCode) return;
    setLoading(true);
    setError(null);
    try {
      const nextSchema = await api.wealth.formSchema(baseValues.categoryCode, subtypeCode);
      setSchema(nextSchema);
      setDynamicValues(initialSchemaValues(nextSchema));
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load form.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFiles(values: Record<string, Value>) {
    if (!schema) return values;
    const next = { ...values };
    for (const field of schema.fields.filter((item) => item.inputType === "file")) {
      const selected = files[field.id] ?? [];
      if (!selected.length) continue;
      const ids: string[] = [];
      for (const file of selected) {
        const analysis = await api.documents.analyze(file, false);
        const saved = await api.documents.save({
          tempFileId: analysis.tempFileId,
          originalName: analysis.file.originalName,
          mimeType: analysis.file.mimeType,
          size: analysis.file.size,
          title: baseValues.title.trim() || analysis.title || analysis.file.originalName,
          category: schema.category.label,
          documentType: schema.subtype.label,
          confidence: analysis.confidence ?? 90,
          fields: { ...(analysis.extractedFields ?? {}), ...baseValues },
          reviewFields: analysis.reviewFields ?? [],
          rawExtractedText: analysis.extractedText ?? "",
          warnings: analysis.warnings ?? [],
          extraction: analysis.extraction,
          evidence: analysis.evidence ?? [],
          analysisSource: analysis.analysisSource ?? "rules",
          userConfirmedUnknown: true,
        });
        ids.push(saved.document.id);
      }
      next[field.id] = [...(Array.isArray(next[field.id]) ? next[field.id] as string[] : []), ...ids];
    }
    return next;
  }

  async function submit() {
    if (!schema || !baseValues.categoryCode) return;
    setSaving(true);
    setError(null);
    try {
      const values = await uploadFiles({ ...baseValues, ...dynamicValues });
      const record = await api.wealth.createRecordFromForm({ categoryCode: schema.category.code, subtypeCode: schema.subtype.code, values });
      void dispatch(fetchDocuments());
      onSaved(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save Wealth record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lp-sos-backdrop" role="presentation">
      <div className="lp-sos-dialog lp-capture-dialog" role="dialog" aria-modal="true">
        <div className="lp-sos-head">
          <div><span><FileCheck size={16} /> Wealth vault</span><h2>Capture proof</h2><p>Capture the core details, choose the record type, then LifePack renders the rest from backend form metadata.</p></div>
          <button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="lp-capture-steps"><span className={step === 1 ? "active" : ""}>1</span><span className={step === 2 ? "active" : ""}>2</span><span className={step === 3 ? "active" : ""}>3</span></div>
        <div className="lp-capture-panel">
          {step === 1 ? <StepOne categories={categories} values={baseValues} setValues={setBaseValues} /> : null}
          {step === 2 ? <StepTwo category={selectedCategory} subtypes={subtypes} onChoose={chooseSubtype} /> : null}
          {step === 3 && schema ? <DynamicFields fields={orderedFields} values={dynamicValues} files={files} setFiles={setFiles} setValue={(id, value) => setDynamicValues((current) => ({ ...current, [id]: value }))} /> : null}
          {error ? <div className="lp-sos-error">{error}</div> : null}
        </div>
        <div className="lp-sos-foot">
          {step > 1 ? <button type="button" style={{ marginRight: "auto" }} onClick={() => setStep(step === 3 ? 2 : 1)}><ChevronLeft size={15} /> Back</button> : null}
          {step === 1 ? <button type="button" className="primary" disabled={!canContinue || loading} onClick={loadSubtypes}>{loading ? "Loading..." : "Next"}</button> : null}
          {step === 3 ? <button type="button" className="primary" disabled={saving} onClick={submit}>{saving ? "Saving..." : "Confirm"}</button> : null}
        </div>
      </div>
    </div>
  );
}

function StepOne({ categories, values, setValues }: { categories: DynamicFormCategory[]; values: Record<string, string>; setValues: (update: (current: Record<string, string>) => Record<string, string>) => void }) {
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  return <div className="lp-capture-grid compact"><label className="lp-wealth-field wide">Title<input placeholder="What is it for?" value={values.title ?? ""} onChange={(event) => set("title", event.target.value)} /></label><label className="lp-wealth-field">Amount<input inputMode="decimal" value={values.amount ?? ""} onChange={(event) => set("amount", event.target.value)} /></label><label className="lp-wealth-field">Direction<select value={values.direction ?? "Paid"} onChange={(event) => set("direction", event.target.value)}><option>Paid</option><option>Received</option></select></label><label className="lp-wealth-field">Date<input type="date" value={values.date ?? ""} onChange={(event) => set("date", event.target.value)} /></label><label className="lp-wealth-field wide">Category<select value={values.categoryCode ?? ""} onChange={(event) => set("categoryCode", event.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category.code} value={category.code}>{category.label}</option>)}</select></label></div>;
}

function StepTwo({ category, subtypes, onChoose }: { category?: DynamicFormCategory; subtypes: DynamicFormSubtype[]; onChoose: (code: string) => void }) {
  return <div className="lp-dynamic-options"><h3>{category ? `${category.label} subtype` : "Select subtype"}</h3>{subtypes.map((subtype) => <button key={subtype.code} type="button" onClick={() => void onChoose(subtype.code)}><b>{subtype.label}</b>{subtype.description ? <small>{subtype.description}</small> : null}</button>)}</div>;
}

function DynamicFields(props: { fields: DynamicFormField[]; values: Record<string, Value>; files: Record<string, File[]>; setFiles: (update: (current: Record<string, File[]>) => Record<string, File[]>) => void; setValue: (id: string, value: Value) => void }) {
  return <div className="lp-capture-grid">{props.fields.map((field) => <DynamicField key={field.id} field={field} value={props.values[field.id]} files={props.files[field.id] ?? []} setFiles={(files) => props.setFiles((current) => ({ ...current, [field.id]: files }))} setValue={(value) => props.setValue(field.id, value)} />)}</div>;
}

function DynamicField({ field, value, files, setFiles, setValue }: { field: DynamicFormField; value: Value | undefined; files: File[]; setFiles: (files: File[]) => void; setValue: (value: Value) => void }) {
  if (field.inputType === "file") return <label className="lp-wealth-field wide">{field.label}<span className="lp-wealth-proof-drop"><Paperclip size={22} /><b>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Attach documents"}</b><small>{field.placeholder ?? "Photo · screenshot · receipt · PDF"}</small><input type="file" hidden multiple accept="image/*,application/pdf" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></span></label>;
  if (field.inputType === "textarea") return <label className="lp-wealth-field wide">{field.label}<textarea required={field.required} placeholder={field.placeholder ?? ""} value={String(value ?? "")} onChange={(event) => setValue(event.target.value)} /></label>;
  if (field.inputType === "select") return <label className="lp-wealth-field">{field.label}<select required={field.required} value={String(value ?? "")} onChange={(event) => setValue(event.target.value)}><option value="">Select</option>{Array.isArray(field.options) ? field.options.map(optionValue).filter(Boolean).map((option) => <option key={option.value} value={option.value}>{option.label}</option>) : null}</select></label>;
  return <label className="lp-wealth-field">{field.label}<input type={field.inputType === "number" ? "number" : field.inputType === "date" ? "date" : "text"} required={field.required} placeholder={field.placeholder ?? ""} value={String(value ?? "")} onChange={(event) => setValue(event.target.value)} /></label>;
}
