import { ComponentInput } from '@/lib/validations/component';
import { CreateTemplateInput } from '@/lib/validations/template';

export const wonderlaComponents: ComponentInput[] = [
  // 1. Personal Details
  {
    key: 'employeeName',
    label: 'Customer / Employee Name',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter full name',
    helpText: 'Primary attendee full name',
    defaultRequired: true,
  },
  {
    key: 'companyName',
    label: 'Company Name',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter company or organization name',
    defaultRequired: true,
  },
  {
    key: 'designation',
    label: 'Designation',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter job designation / title',
    defaultRequired: true,
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'email',
    category: 'Personal Details',
    placeholder: 'name@company.com',
    helpText: 'Official email for event passes and confirmations',
    defaultRequired: true,
  },
  {
    key: 'mobileNumber',
    label: 'Mobile Number',
    type: 'tel',
    category: 'Personal Details',
    placeholder: '9876543210',
    helpText: '10-digit Indian mobile number',
    defaultRequired: true,
    validationConfig: {
      pattern: '^[6-9]\\d{9}$',
      patternMessage: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9',
    },
  },

  // 2. Travel & Stay
  {
    key: 'cabRequired',
    label: 'Cab Required',
    type: 'radio',
    category: 'Travel & Stay',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  {
    key: 'pickupAddress',
    label: 'Pickup Address',
    type: 'textarea',
    category: 'Travel & Stay',
    placeholder: 'Enter complete residential / office pickup address for cab pickup',
    helpText: 'Required if cab service is requested',
    defaultRequired: false,
  },

  // 3. Spouse Details
  {
    key: 'spouseName',
    label: 'Spouse / Partner Name',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter spouse/partner full name if attending',
    helpText: 'Leave blank if attending alone',
    defaultRequired: false,
  },
  {
    key: 'spouseHeightEligibility',
    label: 'Spouse Height Eligibility',
    type: 'select',
    category: 'Personal Details',
    defaultRequired: false,
    options: [
      { label: 'ABOVE 75 CM', value: 'ABOVE 75 CM' },
      { label: 'BELOW 75 CM', value: 'BELOW 75 CM' },
    ],
  },
  {
    key: 'spouseTicketRequired',
    label: 'Spouse Ticket Required',
    type: 'radio',
    category: 'Personal Details',
    defaultRequired: false,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },

  // 4. ID Card Uploads
  {
    key: 'employeeIdCard',
    label: 'Employee ID Card',
    type: 'file',
    category: 'ID & Verification',
    helpText: 'Upload valid employee ID or company badge (Max 5MB, JPG/PNG/PDF)',
    defaultRequired: true,
    validationConfig: {
      maxFileSize: 5242880, // 5MB
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
    },
  },
  {
    key: 'spouseIdCard',
    label: 'Spouse / Partner ID Card',
    type: 'file',
    category: 'ID & Verification',
    helpText: 'Upload valid ID proof for spouse/partner (Max 5MB, JPG/PNG/PDF)',
    defaultRequired: false,
    validationConfig: {
      maxFileSize: 5242880,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
    },
  },

  // 5. Employee Ticket Settings
  {
    key: 'employeeHeightEligibility',
    label: 'Employee Height Eligibility',
    type: 'select',
    category: 'Personal Details',
    defaultRequired: true,
    options: [
      { label: 'ABOVE 75 CM', value: 'ABOVE 75 CM' },
      { label: 'BELOW 75 CM', value: 'BELOW 75 CM' },
    ],
  },
  {
    key: 'employeeTicketRequired',
    label: 'Employee Ticket Required',
    type: 'radio',
    category: 'Personal Details',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },

  // 6. Kids Section
  {
    key: 'bringingKids',
    label: 'Are you bringing kids?',
    type: 'radio',
    category: 'Family & Kids',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  {
    key: 'kids',
    label: 'Kids Details (Max 3 children)',
    type: 'repeatable',
    category: 'Family & Kids',
    helpText: 'Provide child name, age (0–17), height eligibility, and ticket requirement for each child.',
    defaultRequired: false,
  },
];

export const wonderlaTemplateDefinition: CreateTemplateInput = {
  eventName: 'Wonderla BANDHAN 13.2',
  slug: 'wonderla-bandhan-13-2',
  description: 'Official Registration & Ticket Management for Wonderla BANDHAN 13.2 Event',
  theme: {
    primaryColor: '#0284c7', // Sky-600 / Wonderla Cyan-Blue
    backgroundColor: '#ffffff',
    bannerImageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1200&auto=format&fit=crop',
    fontFamily: 'Inter, sans-serif',
  },
  allowedOrigins: ['http://localhost:3000', 'http://localhost:5500'],
  sheetTabId: 'Registrations',
  sheetMapping: {
    employeeName: 'Customer / Employee Name',
    companyName: 'Company Name',
    designation: 'Designation',
    email: 'Email',
    mobileNumber: 'Mobile Number',
    cabRequired: 'Cab Required',
    pickupAddress: 'Pickup Address',
    employeeHeightEligibility: 'Employee Height Eligibility',
    employeeTicketRequired: 'Employee Ticket Required',
    spouseName: 'Spouse / Partner Name',
    spouseHeightEligibility: 'Spouse Height Eligibility',
    spouseTicketRequired: 'Spouse Ticket Required',
    bringingKids: 'Are you bringing kids?',
    totalTickets: 'Total Wonderla Tickets',
  },
  fields: [
    // 1. Personal Details Section
    {
      componentKey: 'employeeName',
      fieldKey: 'employeeName',
      label: 'Customer / Employee Name',
      placeholder: 'Enter full name',
      required: true,
      order: 0,
      width: 'full',
    },
    {
      componentKey: 'companyName',
      fieldKey: 'companyName',
      label: 'Company Name',
      placeholder: 'Enter company name',
      required: true,
      order: 1,
      width: 'half',
    },
    {
      componentKey: 'designation',
      fieldKey: 'designation',
      label: 'Designation',
      placeholder: 'Enter designation',
      required: true,
      order: 2,
      width: 'half',
    },
    {
      componentKey: 'email',
      fieldKey: 'email',
      label: 'Email Address',
      placeholder: 'name@company.com',
      required: true,
      order: 3,
      width: 'half',
    },
    {
      componentKey: 'mobileNumber',
      fieldKey: 'mobileNumber',
      label: 'Mobile Number',
      placeholder: '9876543210',
      helpText: '10-digit Indian mobile number',
      required: true,
      order: 4,
      width: 'half',
    },

    // 2. Cab & Travel
    {
      componentKey: 'cabRequired',
      fieldKey: 'cabRequired',
      label: 'Cab Required',
      required: true,
      order: 5,
      width: 'full',
    },
    {
      componentKey: 'pickupAddress',
      fieldKey: 'pickupAddress',
      label: 'Pickup Address',
      placeholder: 'Enter complete residential / office pickup address',
      required: true,
      order: 6,
      width: 'full',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'cabRequired',
            operator: 'equals',
            value: 'Yes',
          },
        ],
      },
    },

    // 3. Employee ID & Adult Ticket
    {
      componentKey: 'employeeIdCard',
      fieldKey: 'employeeIdCard',
      label: 'Employee ID Card',
      helpText: 'Upload valid employee ID (JPG, PNG, or PDF up to 5MB)',
      required: true,
      order: 7,
      width: 'full',
    },
    {
      componentKey: 'employeeHeightEligibility',
      fieldKey: 'employeeHeightEligibility',
      label: 'Employee Height Eligibility',
      required: true,
      order: 8,
      width: 'half',
    },
    {
      componentKey: 'employeeTicketRequired',
      fieldKey: 'employeeTicketRequired',
      label: 'Employee Ticket Required',
      required: true,
      order: 9,
      width: 'half',
    },

    // 4. Spouse Details & ID (Conditional on spouseName is not empty)
    {
      componentKey: 'spouseName',
      fieldKey: 'spouseName',
      label: 'Spouse / Partner Name',
      placeholder: 'Enter spouse name if attending (optional)',
      required: false,
      order: 10,
      width: 'full',
    },
    {
      componentKey: 'spouseIdCard',
      fieldKey: 'spouseIdCard',
      label: 'Spouse / Partner ID Card',
      helpText: 'Upload valid ID proof for spouse/partner (JPG, PNG, or PDF up to 5MB)',
      required: true,
      order: 11,
      width: 'full',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'spouseName',
            operator: 'isNotEmpty',
          },
        ],
      },
    },
    {
      componentKey: 'spouseHeightEligibility',
      fieldKey: 'spouseHeightEligibility',
      label: 'Spouse Height Eligibility',
      required: false,
      order: 12,
      width: 'half',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'spouseName',
            operator: 'isNotEmpty',
          },
        ],
      },
    },
    {
      componentKey: 'spouseTicketRequired',
      fieldKey: 'spouseTicketRequired',
      label: 'Spouse Ticket Required',
      required: true,
      order: 13,
      width: 'half',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'spouseName',
            operator: 'isNotEmpty',
          },
        ],
      },
    },

    // 5. Kids Section (Conditional on bringingKids == 'Yes', max 3 kids)
    {
      componentKey: 'bringingKids',
      fieldKey: 'bringingKids',
      label: 'Are you bringing kids?',
      required: true,
      order: 14,
      width: 'full',
    },
    {
      componentKey: 'kids',
      fieldKey: 'kids',
      label: 'Kids Details (Max 3 children)',
      helpText: 'Provide child name, age (0–17), height eligibility, and ticket requirement.',
      required: false,
      order: 15,
      width: 'full',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'bringingKids',
            operator: 'equals',
            value: 'Yes',
          },
        ],
      },
    },
  ],
};

