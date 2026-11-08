import { ComponentInput } from '@/lib/validations/component';
import { CreateTemplateInput } from '@/lib/validations/template';

export const wonderlaComponents: ComponentInput[] = [
  // 1. Personal Details Section
  {
    key: 'sectionPersonal',
    label: 'Personal Details',
    type: 'section',
    category: 'Personal Details',
    defaultRequired: false,
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter your name',
    helpText: 'Primary attendee / employee full name',
    defaultRequired: true,
  },
  {
    key: 'companyName',
    label: 'Company Name',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter company name',
    defaultRequired: true,
  },
  {
    key: 'designation',
    label: 'Designation',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter designation',
    defaultRequired: true,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    category: 'Personal Details',
    placeholder: 'Enter email address',
    helpText: 'Official email for event passes and confirmations',
    defaultRequired: true,
  },
  {
    key: 'mobileNumber',
    label: 'Mobile Number',
    type: 'tel',
    category: 'Personal Details',
    placeholder: 'Enter 10-digit mobile number',
    helpText: '10-digit Indian mobile number',
    defaultRequired: true,
    validationConfig: {
      pattern: '^[6-9]\\d{9}$',
      patternMessage: 'Please enter a valid 10-digit mobile number.',
    },
  },
  {
    key: 'cabReq',
    label: 'Cab Required?',
    type: 'select',
    category: 'Travel & Stay',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  {
    key: 'address',
    label: 'Pickup Address',
    type: 'textarea',
    category: 'Travel & Stay',
    placeholder: 'Enter your pickup address',
    helpText: 'Pickup address is required if cab service is requested',
    defaultRequired: false,
  },
  {
    key: 'spouseName',
    label: 'Spouse / Partner Name',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter spouse / partner name',
    helpText: 'Leave empty if attending alone',
    defaultRequired: false,
  },

  // 2. ID Card Details Section
  {
    key: 'sectionIdCards',
    label: 'ID Card Details',
    type: 'section',
    category: 'ID & Verification',
    defaultRequired: false,
  },
  {
    key: 'employeeIdCard',
    label: 'Employee / Registrant ID Card',
    type: 'file',
    category: 'ID & Verification',
    helpText:
      'Upload the ID card of the person registering. JPG, JPEG, PNG or PDF. Maximum size: 5 MB.',
    defaultRequired: true,
    validationConfig: {
      maxFileSize: 5242880, // 5MB
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
    },
  },
  {
    key: 'spouseIdCard',
    label: 'Spouse / Partner ID Card (Wife / Husband)',
    type: 'file',
    category: 'ID & Verification',
    helpText:
      'Upload the ID card of your spouse / partner. Mandatory if your spouse / partner is attending. JPG, JPEG, PNG or PDF. Maximum size: 5 MB.',
    defaultRequired: false,
    validationConfig: {
      maxFileSize: 5242880,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
    },
  },

  // 3. Wonderla Ticket Details Section
  {
    key: 'sectionTicketDetails',
    label: 'Wonderla Ticket Details',
    type: 'section',
    category: 'Personal Details',
    defaultRequired: false,
  },
  {
    key: 'employeeTicket',
    label: 'Wonderla Ticket Required?',
    type: 'select',
    category: 'Personal Details',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  {
    key: 'spouseTicket',
    label: 'Wonderla Ticket Required?',
    type: 'select',
    category: 'Personal Details',
    defaultRequired: false,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },

  // 4. Kids Details Section
  {
    key: 'sectionKidsDetails',
    label: 'Kids Details',
    type: 'section',
    category: 'Family & Kids',
    defaultRequired: false,
  },
  {
    key: 'kids',
    label: 'Are you bringing kids to Wonderla?',
    type: 'select',
    category: 'Family & Kids',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  {
    key: 'kidsCount',
    label: 'How many kids are accompanying you?',
    type: 'select',
    category: 'Family & Kids',
    defaultRequired: false,
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
  {
    key: 'kidsDetails',
    label: 'Kids Details (Max 3 children)',
    type: 'repeatable',
    category: 'Family & Kids',
    helpText: 'Each child requires Name, Age (0–17), Height Eligibility, and Wonderla Ticket choice.',
    defaultRequired: false,
  },

  // 5. Ticket Summary Section
  {
    key: 'sectionTicketSummary',
    label: 'Wonderla Ticket Summary',
    type: 'section',
    category: 'Personal Details',
    defaultRequired: false,
  },

  // --- Aliases for Backward Compatibility ---
  {
    key: 'employeeName',
    label: 'Customer / Employee Name',
    type: 'text',
    category: 'Personal Details',
    placeholder: 'Enter full name',
    defaultRequired: true,
  },
  {
    key: 'cabRequired',
    label: 'Cab Required',
    type: 'select',
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
    placeholder: 'Enter complete residential / office pickup address',
    defaultRequired: false,
  },
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
    type: 'select',
    category: 'Personal Details',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
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
    type: 'select',
    category: 'Personal Details',
    defaultRequired: false,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  {
    key: 'bringingKids',
    label: 'Are you bringing kids?',
    type: 'select',
    category: 'Family & Kids',
    defaultRequired: true,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
];

export const wonderlaTemplateDefinition: CreateTemplateInput = {
  eventName: 'BANDHAN 13.2',
  slug: 'wonderla-bandhan-13-2',
  description: 'Please fill in the details below to complete your registration.',
  theme: {
    primaryColor: '#54258b', // Wonderla Bandhan Purple
    backgroundColor: '#1f0d43', // Deep Purple Dark
    backgroundImageUrl: 'https://vibrationevents.in/register/images/bandhanNovBG.png',
    logoUrl: 'https://vibrationevents.in/register/images/hitachi.png',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  allowedOrigins: ['http://localhost:3000', 'https://vibrationevents.in'],
  sheetTabId: 'Registrations',
  sheetMapping: {
    name: 'Name',
    companyName: 'Company Name',
    designation: 'Designation',
    email: 'Email',
    mobileNumber: 'Mobile Number',
    cabReq: 'Cab Required?',
    address: 'Pickup Address',
    spouseName: 'Spouse / Partner Name',
    employeeTicket: 'Employee Ticket Required',
    spouseTicket: 'Spouse Ticket Required',
    kids: 'Are you bringing kids?',
    kidsCount: 'Kids Count',
    totalTickets: 'Total Wonderla Tickets Required',
  },
  fields: [
    // 1. Personal Details Section
    {
      componentKey: 'sectionPersonal',
      fieldKey: 'sectionPersonal',
      label: 'Personal Details',
      required: false,
      order: 0,
      width: 'full',
    },
    {
      componentKey: 'name',
      fieldKey: 'name',
      label: 'Name',
      placeholder: 'Enter your name',
      required: true,
      order: 1,
      width: 'half',
    },
    {
      componentKey: 'companyName',
      fieldKey: 'companyName',
      label: 'Company Name',
      placeholder: 'Enter company name',
      required: true,
      order: 2,
      width: 'half',
    },
    {
      componentKey: 'designation',
      fieldKey: 'designation',
      label: 'Designation',
      placeholder: 'Enter designation',
      required: true,
      order: 3,
      width: 'half',
    },
    {
      componentKey: 'email',
      fieldKey: 'email',
      label: 'Email',
      placeholder: 'Enter email address',
      required: true,
      order: 4,
      width: 'half',
    },
    {
      componentKey: 'mobileNumber',
      fieldKey: 'mobileNumber',
      label: 'Mobile Number',
      placeholder: 'Enter 10-digit mobile number',
      required: true,
      order: 5,
      width: 'half',
    },
    {
      componentKey: 'cabReq',
      fieldKey: 'cabReq',
      label: 'Cab Required?',
      required: true,
      order: 6,
      width: 'half',
    },
    {
      componentKey: 'address',
      fieldKey: 'address',
      label: 'Pickup Address',
      placeholder: 'Enter your pickup address',
      required: true,
      order: 7,
      width: 'full',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'cabReq',
            operator: 'equals',
            value: 'Yes',
          },
        ],
      },
    },
    {
      componentKey: 'spouseName',
      fieldKey: 'spouseName',
      label: 'Spouse / Partner Name',
      placeholder: 'Enter spouse / partner name',
      required: false,
      order: 8,
      width: 'half',
    },

    // 2. ID Card Details Section
    {
      componentKey: 'sectionIdCards',
      fieldKey: 'sectionIdCards',
      label: 'ID Card Details',
      required: false,
      order: 9,
      width: 'full',
    },
    {
      componentKey: 'employeeIdCard',
      fieldKey: 'employeeIdCard',
      label: 'Employee / Registrant ID Card',
      helpText:
        'Upload the ID card of the person registering. JPG, JPEG, PNG or PDF. Maximum size: 5 MB.',
      required: true,
      order: 10,
      width: 'full',
    },
    {
      componentKey: 'spouseIdCard',
      fieldKey: 'spouseIdCard',
      label: 'Spouse / Partner ID Card (Wife / Husband)',
      helpText:
        'Upload the ID card of your spouse / partner. Mandatory if your spouse / partner is attending. JPG, JPEG, PNG or PDF. Maximum size: 5 MB.',
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

    // 3. Wonderla Ticket Details Section
    {
      componentKey: 'sectionTicketDetails',
      fieldKey: 'sectionTicketDetails',
      label: 'Wonderla Ticket Details',
      required: false,
      order: 12,
      width: 'full',
    },
    {
      componentKey: 'employeeTicket',
      fieldKey: 'employeeTicket',
      label: 'Wonderla Ticket Required?',
      required: true,
      order: 13,
      width: 'half',
    },
    {
      componentKey: 'spouseTicket',
      fieldKey: 'spouseTicket',
      label: 'Wonderla Ticket Required?',
      required: true,
      order: 14,
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

    // 4. Kids Details Section
    {
      componentKey: 'sectionKidsDetails',
      fieldKey: 'sectionKidsDetails',
      label: 'Kids Details',
      required: false,
      order: 15,
      width: 'full',
    },
    {
      componentKey: 'kids',
      fieldKey: 'kids',
      label: 'Are you bringing kids to Wonderla?',
      required: true,
      order: 16,
      width: 'half',
    },
    {
      componentKey: 'kidsCount',
      fieldKey: 'kidsCount',
      label: 'How many kids are accompanying you?',
      required: true,
      order: 17,
      width: 'half',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'kids',
            operator: 'equals',
            value: 'Yes',
          },
        ],
      },
    },
    {
      componentKey: 'kidsDetails',
      fieldKey: 'kidsDetails',
      label: 'Kids Details (Max 3 children)',
      helpText: 'Each child requires Name, Age (0–17), Height Eligibility, and Wonderla Ticket choice.',
      required: false,
      order: 18,
      width: 'full',
      conditionalConfig: {
        action: 'show',
        matchType: 'all',
        rules: [
          {
            fieldKey: 'kids',
            operator: 'equals',
            value: 'Yes',
          },
        ],
      },
    },

    // 5. Ticket Summary Section
    {
      componentKey: 'sectionTicketSummary',
      fieldKey: 'sectionTicketSummary',
      label: 'Wonderla Ticket Summary',
      required: false,
      order: 19,
      width: 'full',
    },
  ],
};
