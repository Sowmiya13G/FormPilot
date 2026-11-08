import { describe, it, expect } from 'vitest';
import { calculateTicketSummary } from '@/features/templates/ticketCalculator';

describe('Wonderla Ticket Calculator', () => {
  it('should calculate 1 ticket for employee only', () => {
    const summary = calculateTicketSummary({
      employeeTicketRequired: 'Yes',
      spouseName: '',
      spouseTicketRequired: 'No',
      bringingKids: 'No',
    });

    expect(summary.employeeTickets).toBe(1);
    expect(summary.spouseTickets).toBe(0);
    expect(summary.kidsTickets).toBe(0);
    expect(summary.totalTickets).toBe(1);
  });

  it('should calculate 0 employee tickets if employeeTicketRequired is No', () => {
    const summary = calculateTicketSummary({
      employeeTicketRequired: 'No',
    });

    expect(summary.employeeTickets).toBe(0);
    expect(summary.totalTickets).toBe(0);
  });

  it('should allocate 1 spouse ticket only if spouse name is provided and ticket is Yes', () => {
    const withName = calculateTicketSummary({
      employeeTicketRequired: 'Yes',
      spouseName: 'Priya Sharma',
      spouseTicketRequired: 'Yes',
    });
    expect(withName.spouseTickets).toBe(1);
    expect(withName.totalTickets).toBe(2);

    const withoutName = calculateTicketSummary({
      employeeTicketRequired: 'Yes',
      spouseName: '   ',
      spouseTicketRequired: 'Yes',
    });
    expect(withoutName.spouseTickets).toBe(0);
    expect(withoutName.totalTickets).toBe(1);
  });

  it('should allocate 0 spouse ticket if spouse ticket required is No', () => {
    const summary = calculateTicketSummary({
      employeeTicketRequired: 'Yes',
      spouseName: 'Priya Sharma',
      spouseTicketRequired: 'No',
    });
    expect(summary.spouseTickets).toBe(0);
    expect(summary.totalTickets).toBe(1);
  });

  it('should calculate repeatable children tickets and height categories', () => {
    const summary = calculateTicketSummary({
      employeeTicketRequired: 'Yes',
      spouseName: 'Anita',
      spouseTicketRequired: 'Yes',
      bringingKids: 'Yes',
      kids: [
        {
          childName: 'Aarav',
          age: 6,
          heightEligibility: 'ABOVE 75 CM',
          ticketRequired: 'Yes',
        },
        {
          childName: 'Diya',
          age: 1,
          heightEligibility: 'BELOW 75 CM',
          ticketRequired: 'No',
        },
      ],
    });

    expect(summary.employeeTickets).toBe(1);
    expect(summary.spouseTickets).toBe(1);
    expect(summary.kidsTickets).toBe(1);
    expect(summary.kidsAbove75cm).toBe(1);
    expect(summary.kidsBelow75cm).toBe(1);
    expect(summary.totalTickets).toBe(3);
  });

  it('should cap children calculation strictly at 3 kids', () => {
    const summary = calculateTicketSummary({
      employeeTicketRequired: 'Yes',
      bringingKids: 'Yes',
      kids: [
        { childName: 'Child 1', ticketRequired: 'Yes', heightEligibility: 'ABOVE 75 CM' },
        { childName: 'Child 2', ticketRequired: 'Yes', heightEligibility: 'ABOVE 75 CM' },
        { childName: 'Child 3', ticketRequired: 'Yes', heightEligibility: 'ABOVE 75 CM' },
        { childName: 'Child 4', ticketRequired: 'Yes', heightEligibility: 'ABOVE 75 CM' },
        { childName: 'Child 5', ticketRequired: 'Yes', heightEligibility: 'ABOVE 75 CM' },
      ],
    });

    // Only the first 3 children should be counted
    expect(summary.kidsTickets).toBe(3);
    expect(summary.totalTickets).toBe(4);
  });
});

