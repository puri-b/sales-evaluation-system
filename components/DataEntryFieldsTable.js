import { DATA_ENTRY_TEXT as t } from '../lib/dataEntryFields';

/** One read-only component for the pre-save summary and saved/printed report. */
export default function DataEntryFieldsTable({ fields = [], remarks = '' }) {
  const rows = Array.isArray(fields) ? fields : [];
  return (
    <section className="data-entry-fields-report">
      <h4>{t.title} ({rows.length})</h4>
      <table className="data-entry-fields-table">
        <caption className="sr-only">{t.title}</caption>
        <colgroup>
          <col style={{ width: '8%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '42%' }} />
        </colgroup>
        <thead>
          <tr><th scope="col">{t.order}</th><th scope="col">{t.fieldName}</th><th scope="col">Data Type</th><th scope="col">{t.remarks}</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={4}>{t.empty}</td></tr>
          ) : rows.map((field, index) => (
            <tr key={field.id ?? field._key ?? index}>
              <td>{index + 1}</td>
              <td>{field.field_name || '-'}</td>
              <td>{t[field.data_type] || field.data_type || '-'}</td>
              <td className="data-entry-free-text">{field.remarks?.trim() ? field.remarks : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="data-entry-report-remarks">
        <strong>{t.generalRemarks}</strong>
        <div className="data-entry-free-text">{remarks?.trim() ? remarks : '-'}</div>
      </div>
    </section>
  );
}
