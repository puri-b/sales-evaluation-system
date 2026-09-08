/** Shared by the form, API and tests. This describes fields, NOT customer values. */
const DATA_ENTRY_FIELD_TYPES = Object.freeze(['number', 'date', 'text']);
const DATA_ENTRY_LIMITS = Object.freeze({ fields: 100, fieldName: 200, fieldRemarks: 2000, remarks: 5000 });
const DATA_ENTRY_TEXT = Object.freeze({
  title: 'ฟิลด์ที่ลูกค้าต้องการให้บันทึก',
  add: '+ เพิ่มฟิลด์',
  remove: 'ลบฟิลด์',
  field: 'ฟิลด์',
  fieldName: 'ชื่อฟิลด์',
  order: 'ลำดับ',
  remarks: 'หมายเหตุ',
  generalRemarks: 'หมายเหตุเพิ่มเติม',
  optional: 'ไม่บังคับ',
  empty: 'ยังไม่ระบุรายการฟิลด์',
  chooseType: 'เลือก Data Type',
  number: 'number (ตัวเลข)',
  date: 'date (วันที่)',
  text: 'text (ข้อความ)',
  fieldPlaceholder: 'เช่น เลขที่เอกสาร',
  notePlaceholder: 'เช่น รูปแบบวันที่ DD/MM/YYYY',
  generalPlaceholder: 'ระบุรายละเอียดเพิ่มเติม',
  help: 'ระบุชื่อฟิลด์ ไม่ใช่ข้อมูลจริงของลูกค้า',
  textHint: 'รหัสที่ต้องเก็บเลข 0 นำหน้า ควรเลือก text',
  invalid: 'กรุณาตรวจสอบรายการฟิลด์และหมายเหตุ',
  nameRequired: 'กรุณาระบุชื่อฟิลด์',
  typeRequired: 'กรุณาเลือก Data Type: number, date, text',
  tooLong: 'ข้อความยาวเกินกำหนด',
  invalidValue: 'ข้อมูลไม่ถูกต้อง',
  limit: 'เพิ่มได้สูงสุด',
  migrationRequired: 'กรุณาให้ผู้ดูแลระบบรัน sql/003_data_entry_fields.sql ก่อนใช้งาน',
  saveFailed: 'บันทึกไม่สำเร็จ กรุณาลองใหม่',
});

class DataEntryValidationError extends Error {
  constructor(details) {
    super(DATA_ENTRY_TEXT.invalid);
    this.name = 'DataEntryValidationError';
    this.details = details;
  }
}

/** Missing fields/remarks remain valid for evaluations posted by the old UI. */
function validateDataEntryFields(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new DataEntryValidationError([{ path: 'data_entry_data', message: DATA_ENTRY_TEXT.invalidValue }]);
  }
  const errors = [];
  const addError = (path, message) => errors.push({ path, message });
  const source = data.fields === undefined ? [] : data.fields;
  const textValue = (value, path, limit) => {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string' || value.includes('\u0000')) {
      addError(path, DATA_ENTRY_TEXT.invalidValue);
      return '';
    }
    if (value.length > limit) addError(path, `${DATA_ENTRY_TEXT.tooLong} (${limit})`);
    return value.replace(/\r\n?/g, '\n');
  };
  const remarks = textValue(data.remarks, 'remarks', DATA_ENTRY_LIMITS.remarks);
  const fields = [];
  if (!Array.isArray(source)) {
    addError('fields', DATA_ENTRY_TEXT.invalidValue);
  } else if (source.length > DATA_ENTRY_LIMITS.fields) {
    addError('fields', `${DATA_ENTRY_TEXT.limit} ${DATA_ENTRY_LIMITS.fields} ${DATA_ENTRY_TEXT.field}`);
  } else {
    source.forEach((field, index) => {
      const path = `fields.${index}`;
      if (!field || typeof field !== 'object' || Array.isArray(field)) {
        addError(path, DATA_ENTRY_TEXT.invalidValue);
        return;
      }
      const fieldName = textValue(field.field_name, `${path}.field_name`, DATA_ENTRY_LIMITS.fieldName).trim();
      if (!fieldName) addError(`${path}.field_name`, DATA_ENTRY_TEXT.nameRequired);
      if (!DATA_ENTRY_FIELD_TYPES.includes(field.data_type)) {
        addError(`${path}.data_type`, DATA_ENTRY_TEXT.typeRequired);
      }
      fields.push({
        field_name: fieldName,
        data_type: field.data_type,
        remarks: textValue(field.remarks, `${path}.remarks`, DATA_ENTRY_LIMITS.fieldRemarks),
        sort_order: index + 1,
      });
    });
  }
  if (errors.length) throw new DataEntryValidationError(errors);
  return { fields, remarks };
}

// CommonJS keeps the same validation directly executable with Node's test runner.
module.exports = {
  DATA_ENTRY_FIELD_TYPES, DATA_ENTRY_LIMITS, DATA_ENTRY_TEXT,
  DataEntryValidationError, validateDataEntryFields,
};
