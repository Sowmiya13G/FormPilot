import { google } from 'googleapis';
import { getAuthenticatedGoogleClient } from '@/lib/google/auth';
import { sanitizeForSheet, formatPhoneForSheet } from '@/lib/security/sanitize-sheet';
import connectDB from '@/lib/db/mongoose';
import Integration from '@/models/Integration';
import { IRegistrationTemplate } from '@/types';
import { IRegistrationDocument } from '@/models/Registration';

/**
 * Returns an authenticated Google Sheets API client
 */
export async function getSheetsClient() {
  const auth = await getAuthenticatedGoogleClient('sheets');
  return google.sheets({ version: 'v4', auth });
}

/**
 * Fetches existing headers from Row 1 of a spreadsheet tab
 */
export async function fetchSheetHeaders(
  spreadsheetId: string,
  sheetTabId: string = 'Registrations'
): Promise<string[]> {
  const sheets = await getSheetsClient();
  const safeTab = sheetTabId.includes(' ') ? `'${sheetTabId}'` : sheetTabId;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${safeTab}!1:1`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0 || !rows[0]) {
      return [];
    }

    return (rows[0] as string[]).map((h) => String(h || '').trim());
  } catch (err) {
    // If the tab doesn't exist, try getting spreadsheet sheets to find the first sheet name
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const firstSheetName = meta.data.sheets?.[0]?.properties?.title;
    if (firstSheetName && firstSheetName !== sheetTabId) {
      const fallbackTab = firstSheetName.includes(' ') ? `'${firstSheetName}'` : firstSheetName;
      const fallbackRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${fallbackTab}!1:1`,
      });
      return ((fallbackRes.data.values?.[0] || []) as string[]).map((h) => String(h || '').trim());
    }
    throw err;
  }
}

/**
 * Synchronizes a single registration document into the target Google Sheet.
 * Respects column header matching by name and auto-appends missing headers.
 */
export async function syncRegistrationToSheet(
  template: IRegistrationTemplate,
  registration: IRegistrationDocument
): Promise<{ success: boolean; updatedRange?: string }> {
  let spreadsheetId = template.spreadsheetId;
  const sheetTab = template.sheetTabId || 'Registrations';

  if (!spreadsheetId) {
    await connectDB();
    const integration = await Integration.findOne({ provider: 'GOOGLE_WORKSPACE' });
    spreadsheetId = integration?.config?.defaultSpreadsheetId;
  }

  if (!spreadsheetId) {
    throw new Error('No Google Spreadsheet ID configured for this template or in global settings.');
  }

  const sheets = await getSheetsClient();
  const safeTab = sheetTab.includes(' ') ? `'${sheetTab}'` : sheetTab;

  // 1. Fetch existing headers from Row 1
  let existingHeaders: string[] = await fetchSheetHeaders(spreadsheetId, sheetTab).catch(() => []);

  // Default mapping for core registration properties
  const defaultMapping: Record<string, string> = {
    registrationId: 'Registration ID',
    eventName: 'Event Name',
    createdAt: 'Registration Date',
    totalTickets: 'Total Tickets',
    employeeTickets: 'Employee Tickets',
    spouseTickets: 'Spouse Tickets',
    kidsTickets: 'Kids Tickets',
    employeeName: 'Employee Name',
    email: 'Email',
    contactNumber: 'Contact Number',
    companyName: 'Company Name',
    cabRequired: 'Cab Required',
    cabPickupLocation: 'Pickup Location',
    kids: 'Children Attendees',
    ...template.sheetMapping,
  };

  // 2. If row 1 is completely empty, initialize it with all mapped headers
  if (existingHeaders.length === 0) {
    const initialHeaders = Array.from(new Set(Object.values(defaultMapping)));
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${safeTab}!1:1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [initialHeaders],
      },
    });
    existingHeaders = initialHeaders;
  } else {
    // 3. Check for any mapped target headers that are not currently in row 1, and append to the right
    const neededHeaders = Array.from(new Set(Object.values(defaultMapping)));
    const missingHeaders = neededHeaders.filter((h) => !existingHeaders.includes(h));

    if (missingHeaders.length > 0) {
      // Append missing headers to the end of row 1
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${safeTab}!1:1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [missingHeaders],
        },
      });
      existingHeaders = [...existingHeaders, ...missingHeaders];
    }
  }

  // 4. Assemble row values strictly aligned with existingHeaders order
  const data = registration.data || {};
  const ticketSummary = registration.ticketSummary || {
    employeeTickets: 1,
    spouseTickets: 0,
    kidsTickets: 0,
    kidsAbove75cm: 0,
    kidsBelow75cm: 0,
    totalTickets: 1,
  };

  const rowValues: string[] = existingHeaders.map((header) => {
    // Check which field key maps to this header
    const mappedKey = Object.entries(defaultMapping).find(([, h]) => h === header)?.[0];

    // Priority 1: System & ticket metadata
    if (header === 'Registration ID' || mappedKey === 'registrationId') {
      return sanitizeForSheet(registration.registrationId);
    }
    if (header === 'Event Name' || mappedKey === 'eventName') {
      return sanitizeForSheet(registration.eventName);
    }
    if (header === 'Registration Date' || mappedKey === 'createdAt') {
      return sanitizeForSheet(new Date(registration.createdAt).toLocaleString('en-IN'));
    }
    if (header === 'Total Tickets' || mappedKey === 'totalTickets') {
      return String(ticketSummary.totalTickets ?? 1);
    }
    if (header === 'Employee Tickets' || mappedKey === 'employeeTickets') {
      return String(ticketSummary.employeeTickets ?? 1);
    }
    if (header === 'Spouse Tickets' || mappedKey === 'spouseTickets') {
      return String(ticketSummary.spouseTickets ?? 0);
    }
    if (header === 'Kids Tickets' || mappedKey === 'kidsTickets') {
      return String(ticketSummary.kidsTickets ?? 0);
    }

    // Priority 2: Form field values
    const val = mappedKey ? data[mappedKey] : data[header];

    if (val !== undefined && val !== null) {
      // Format Indian phone numbers with leading quote
      if (mappedKey?.toLowerCase().includes('contact') || mappedKey?.toLowerCase().includes('phone') || mappedKey?.toLowerCase().includes('mobile')) {
        return formatPhoneForSheet(String(val));
      }

      // Format repeatable kids into a readable string
      if (mappedKey === 'kids' && Array.isArray(val)) {
        const formattedKids = (val as Array<Record<string, unknown>>)
          .map(
            (k, i) =>
              `Child ${i + 1}: ${k.childName || 'Child'} (Age: ${k.age}, Height: ${k.heightEligibility}, Ticket: ${k.ticketRequired})`
          )
          .join(' | ');
        return sanitizeForSheet(formattedKids);
      }

      return sanitizeForSheet(val);
    }

    return '';
  });

  // 5. Append row to Google Sheets
  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${safeTab}!A:A`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [rowValues],
    },
  });

  return {
    success: true,
    updatedRange: appendRes.data.updates?.updatedRange || undefined,
  };
}

/**
 * Tests connection to a Google Spreadsheet
 */
export async function testSheetsConnection(spreadsheetId?: string) {
  try {
    const sheets = await getSheetsClient();

    let targetId = spreadsheetId;
    if (!targetId) {
      await connectDB();
      const integration = await Integration.findOne({ provider: 'GOOGLE_WORKSPACE' });
      targetId = integration?.config?.defaultSpreadsheetId;
    }

    if (!targetId) {
      return {
        success: false,
        message: 'No Google Spreadsheet ID provided or configured to test.',
      };
    }

    const meta = await sheets.spreadsheets.get({ spreadsheetId: targetId });

    return {
      success: true,
      message: `Connected successfully to spreadsheet: "${meta.data.properties?.title || targetId}"`,
      spreadsheetTitle: meta.data.properties?.title || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Google Sheets API connection failed',
    };
  }
}

