import { describe, it, expect } from 'vitest';
import { generateStandaloneHtml } from '@/lib/html-export/generate-standalone-html';
import { wonderlaTemplateDefinition } from '@/features/templates/wonderla-template.definition';
import { IRegistrationTemplate, IComponent } from '@/types';

describe('Standalone HTML Generator for BANDHAN 13.2', () => {
  it('should compile standalone HTML containing the exact BANDHAN 13.2 output components', () => {
    const mockTemplate = {
      _id: '654321098765432109876543',
      ...wonderlaTemplateDefinition,
      status: 'PUBLISHED',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as IRegistrationTemplate;

    const mockComponents: IComponent[] = [];

    const html = generateStandaloneHtml(mockTemplate, mockComponents, 'http://localhost:3000');

    // 1. Structure & Branding
    expect(html).toContain('BANDHAN 13.2');
    expect(html).toContain('https://vibrationevents.in/register/images/hitachi.png');
    expect(html).toContain('https://vibrationevents.in/register/images/bandhanNovBG.png');
    expect(html).toContain('#54258b');

    // 2. Form Input Elements
    expect(html).toContain('id="name"');
    expect(html).toContain('id="companyName"');
    expect(html).toContain('id="designation"');
    expect(html).toContain('id="email"');
    expect(html).toContain('id="mobileNumber"');
    expect(html).toContain('id="cabReq"');
    expect(html).toContain('id="address"');
    expect(html).toContain('id="spouseName"');

    // 3. ID Card Upload Elements
    expect(html).toContain('id="employeeIdCard"');
    expect(html).toContain('id="spouseIdCard"');

    // 4. Wonderla Sub-Cards
    expect(html).toContain('id="employeeTicketCard"');
    expect(html).toContain('id="employeeNameDisplay"');
    expect(html).toContain('id="spouseTicketCard"');
    expect(html).toContain('id="spouseNameDisplay"');
    expect(html).toContain('ABOVE 75 CM');

    // 5. Kids & Summary Cards
    expect(html).toContain('id="kids"');
    expect(html).toContain('id="kidsCount"');
    expect(html).toContain('id="kidsContainer"');
    expect(html).toContain('id="ticketSummary"');
    expect(html).toContain('id="sumTotal"');
    expect(html).toContain('Thank You for Your Interest!');
  });
});

