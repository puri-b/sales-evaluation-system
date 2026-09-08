import { useEffect, useId, useRef } from 'react';
import { DATA_ENTRY_FIELD_TYPES, DATA_ENTRY_LIMITS, DATA_ENTRY_TEXT as t } from '../lib/dataEntryFields';
import { glassInput, glassTextarea, glassButton, buttonColors } from '../styles/glass';

export default function DataEntryFieldsEditor({ fields, remarks, onFieldsChange, onRemarksChange, errors = [] }) {
  const id = useId();
  const counter = useRef(0);
  const inputs = useRef(new Map());
  const focusKey = useRef(null);
  const errorFor = (path) => errors.find((error) => error.path === path)?.message;

  useEffect(() => {
    if (focusKey.current) {
      inputs.current.get(focusKey.current)?.focus();
      focusKey.current = null;
    }
  }, [fields]);

  const addField = () => {
    if (fields.length >= DATA_ENTRY_LIMITS.fields) return;
    const key = `${id}-${counter.current++}`;
    focusKey.current = key;
    onFieldsChange([...fields, { _key: key, field_name: '', data_type: '', remarks: '' }]);
  };
  const changeField = (index, property, value) => {
    onFieldsChange(fields.map((field, i) => i === index ? { ...field, [property]: value } : field));
  };

  return (
    <section className="data-entry-fields-editor" aria-labelledby={`${id}-heading`}>
      <div className="data-entry-fields-heading">
        <h4 id={`${id}-heading`}>{t.title}</h4>
        <span className="data-entry-fields-count" aria-live="polite">{fields.length} / {DATA_ENTRY_LIMITS.fields}</span>
      </div>
      <p className="data-entry-fields-help">{t.help}<br />{t.textHint}</p>
      {errors.length > 0 && (
        <div role="alert" className="data-entry-fields-errors">
          <strong>{t.invalid}</strong>
          {errors.map((error, index) => (
            <div key={`${error.path}-${index}`}>
              {error.path.startsWith('fields.') ? `${t.field} ${Number(error.path.split('.')[1]) + 1}: ` : ''}
              {error.message}
            </div>
          ))}
        </div>
      )}
      {fields.length === 0 && <p className="data-entry-fields-empty">{t.empty}</p>}
      {fields.map((field, index) => {
        const key = field._key;
        const rowId = `${id}-row-${index}`;
        return (
          <fieldset key={key} className="data-entry-field-row">
            <legend>{t.field} {index + 1}</legend>
            <div className="data-entry-field-inputs">
              <div>
                <label htmlFor={`${rowId}-name`}>{t.fieldName} *</label>
                <input
                  ref={(element) => element ? inputs.current.set(key, element) : inputs.current.delete(key)}
                  id={`${rowId}-name`}
                  type="text"
                  value={field.field_name}
                  maxLength={DATA_ENTRY_LIMITS.fieldName}
                  onChange={(event) => changeField(index, 'field_name', event.target.value)}
                  aria-invalid={Boolean(errorFor(`fields.${index}.field_name`))}
                  style={glassInput}
                  placeholder={t.fieldPlaceholder}
                />
              </div>
              <div>
                <label htmlFor={`${rowId}-type`}>Data Type *</label>
                <select
                  id={`${rowId}-type`}
                  value={field.data_type}
                  onChange={(event) => changeField(index, 'data_type', event.target.value)}
                  aria-invalid={Boolean(errorFor(`fields.${index}.data_type`))}
                  style={glassInput}
                >
                  <option value="">{t.chooseType}</option>
                  {DATA_ENTRY_FIELD_TYPES.map((type) => <option key={type} value={type}>{t[type]}</option>)}
                </select>
              </div>
            </div>
            <label htmlFor={`${rowId}-remarks`}>{t.remarks} ({t.optional})</label>
            <textarea
              id={`${rowId}-remarks`}
              value={field.remarks}
              maxLength={DATA_ENTRY_LIMITS.fieldRemarks}
              onChange={(event) => changeField(index, 'remarks', event.target.value)}
              aria-invalid={Boolean(errorFor(`fields.${index}.remarks`))}
              style={{ ...glassTextarea, minHeight: '72px' }}
              placeholder={t.notePlaceholder}
            />
            <div className="data-entry-field-actions">
              <small>{field.remarks.length} / {DATA_ENTRY_LIMITS.fieldRemarks}</small>
              <button
                type="button"
                className="data-entry-field-remove"
                aria-label={`${t.remove} ${index + 1}`}
                onClick={() => onFieldsChange(fields.filter((_, i) => i !== index))}
              >{t.remove}</button>
            </div>
          </fieldset>
        );
      })}
      <button
        type="button"
        onClick={addField}
        disabled={fields.length >= DATA_ENTRY_LIMITS.fields}
        style={{ ...glassButton(...buttonColors.primary), opacity: fields.length >= DATA_ENTRY_LIMITS.fields ? 0.5 : 1 }}
      >{t.add}</button>
      <div className="data-entry-general-remarks">
        <label htmlFor={`${id}-remarks`}>{t.generalRemarks} ({t.optional})</label>
        <textarea
          id={`${id}-remarks`}
          value={remarks}
          maxLength={DATA_ENTRY_LIMITS.remarks}
          onChange={(event) => onRemarksChange(event.target.value)}
          aria-invalid={Boolean(errorFor('remarks'))}
          style={{ ...glassTextarea, minHeight: '100px' }}
          placeholder={t.generalPlaceholder}
        />
        <small>{remarks.length} / {DATA_ENTRY_LIMITS.remarks}</small>
      </div>
    </section>
  );
}
