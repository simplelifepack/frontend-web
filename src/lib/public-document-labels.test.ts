import { expect, it } from 'vitest';
import { publicDocumentLabels } from './public-document-labels';
it('only sends known document types, never titles, amounts, content or prototype keys', () => {
  expect(publicDocumentLabels(['PAN', 'Bank Statement', 'Salary 50000', 'Private document title', 'constructor', '__proto__'])).toEqual(['pan', 'bank_statement']);
});
