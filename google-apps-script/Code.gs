/**
 * PostBuild — Lista de espera
 * Pegar este código en el proyecto de Apps Script vinculado al despliegue:
 * https://script.google.com/macros/s/AKfycby3Z5a2L9_CXP4RnT_ocE-At_IBWT6GUWOQWAVAXkovTtu0uk5_E3BjKC_j8Dv0EwGgJg/exec
 *
 * Pasos:
 * 1. Abrir el proyecto de Apps Script (Extensiones > Apps Script desde la hoja, o script.google.com).
 * 2. Reemplazar el contenido de Code.gs por este archivo. Guardar.
 * 3. Ejecutar la función "setupSheet" una sola vez desde el editor (se pedirá autorización).
 * 4. Volver a Implementar > Administrar implementaciones > editar la implementación existente
 *    y elegir "Nueva versión" para que el doPost actualizado quede activo en la URL /exec.
 */

const SHEET_NAME = 'Lista de espera';
const NOTIFY_EMAIL = 'benriveros@gestracoo.com';
const ESTADOS = ['Contactado', 'En seguimiento', 'Agendado', 'Tiempo de prueba', 'Cerrado', 'No contesta', 'Rechazado'];
const HEADERS = ['Fecha', 'Nombre', 'Empresa', 'Cargo', 'Correo', 'Teléfono', 'Estado'];

const COLOR_BRAND_BLUE = '#154BAE';
const COLOR_BRAND_DARK = '#111111';
const COLOR_ROW_ALT = '#F5F7FB';

const ESTADO_COLORS = {
  'Contactado': '#FFF4CC',
  'En seguimiento': '#FFE1B3',
  'Agendado': '#CFE0FB',
  'Tiempo de prueba': '#D6CCFB',
  'Cerrado': '#CDEFD8',
  'No contesta': '#E4E4E4',
  'Rechazado': '#F9D2D2',
};

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function doPost(e) {
  const sheet = getSheet_();
  const params = (e && e.parameter) || {};

  sheet.appendRow([
    new Date(),
    params.nombre || '',
    params.empresa || '',
    params.cargo || '',
    params.correo || '',
    params.telefono || '',
    'Contactado',
  ]);

  notifyNewContact_(params);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function notifyNewContact_(params) {
  const subject = 'Nuevo contacto en la lista de espera — PostBuild';
  const body = [
    'Se sumó un nuevo contacto a la lista de espera:',
    '',
    'Nombre: ' + (params.nombre || '-'),
    'Empresa: ' + (params.empresa || '-'),
    'Cargo: ' + (params.cargo || '-'),
    'Correo: ' + (params.correo || '-'),
    'Teléfono: ' + (params.telefono || '-'),
  ].join('\n');

  try {
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    // Si falla el envío de mail, no debe romper el guardado del contacto,
    // pero sí queda registrado en Ejecuciones para poder diagnosticarlo.
    console.error('Error enviando notificación por mail: ' + err);
  }
}

/**
 * Ejecutar una sola vez a mano desde el editor de Apps Script
 * para darle formato profesional a la hoja.
 */
function setupSheet() {
  const sheet = getSheet_();
  const numRows = 1000;

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Encabezado con colores de marca
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange
    .setBackground(COLOR_BRAND_BLUE)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);

  // Anchos de columna
  const widths = [150, 180, 200, 160, 220, 140, 160];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // Bordes prolijos en toda la tabla
  const fullRange = sheet.getRange(1, 1, numRows, HEADERS.length);
  fullRange.setBorder(true, true, true, true, true, true, '#DDDDDD', SpreadsheetApp.BorderStyle.SOLID);
  fullRange.setFontFamily('Arial').setFontColor(COLOR_BRAND_DARK).setVerticalAlignment('middle');

  // Bandeado de filas (alternando blanco / gris claro) en el cuerpo
  const bodyRange = sheet.getRange(2, 1, numRows - 1, HEADERS.length);
  const banding = bodyRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
  banding.setHeaderRowColor(null);
  banding.setFirstRowColor('#FFFFFF');
  banding.setSecondRowColor(COLOR_ROW_ALT);

  // Dropdown de Estado
  const estadoRange = sheet.getRange(2, HEADERS.length, numRows - 1, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(ESTADOS, true)
    .setAllowInvalid(false)
    .build();
  estadoRange.setDataValidation(rule);

  // Formato condicional: un color por estado
  const rules = ESTADOS.map((estado) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(estado)
      .setBackground(ESTADO_COLORS[estado])
      .setFontColor(COLOR_BRAND_DARK)
      .setRanges([estadoRange])
      .build()
  );
  sheet.setConditionalFormatRules(rules);

  sheet.autoResizeColumns(1, HEADERS.length);
}
