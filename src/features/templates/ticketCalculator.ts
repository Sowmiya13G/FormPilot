export interface ITicketSummary {
  employeeTickets: number; // 0 or 1
  spouseTickets: number; // 0 or 1
  kidsTickets: number; // 0 to 3
  kidsAbove75cm: number;
  kidsBelow75cm: number;
  totalTickets: number;
}

export interface IChildAttendee {
  name?: string;
  childName?: string;
  age?: number | string;
  heightEligibility?: 'ABOVE 75 CM' | 'BELOW 75 CM' | string;
  ticketRequired?: 'Yes' | 'No' | string;
}

export function calculateTicketSummary(data: Record<string, unknown>): ITicketSummary {
  // 1. Adult Employee Ticket (accepts both employeeTicket and employeeTicketRequired)
  const empTicketVal = data['employeeTicket'] || data['employeeTicketRequired'];
  const employeeTickets = empTicketVal === 'Yes' ? 1 : 0;

  // 2. Adult Spouse Ticket (Only if spouse name is provided and ticket required is Yes)
  const spouseName = data['spouseName'];
  const hasSpouse = Boolean(spouseName && String(spouseName).trim().length > 0);
  const spouseTicketVal = data['spouseTicket'] || data['spouseTicketRequired'];
  const spouseTickets = hasSpouse && spouseTicketVal === 'Yes' ? 1 : 0;

  // 3. Children Tickets (Strict max 3 kids)
  let kidsTickets = 0;
  let kidsAbove75cm = 0;
  let kidsBelow75cm = 0;

  const hasKidsAnswer =
    data['bringingKids'] === 'Yes' ||
    data['kids'] === 'Yes' ||
    (data['bringingKids'] === undefined && Array.isArray(data['kids']));

  if (hasKidsAnswer) {
    const rawKids =
      Array.isArray(data['kidsDetails'])
        ? data['kidsDetails']
        : Array.isArray(data['kids'])
        ? data['kids']
        : [];
    const kidsArray: IChildAttendee[] = rawKids.slice(0, 3);

    for (const kid of kidsArray) {
      if (!kid || typeof kid !== 'object') continue;

      if (kid.ticketRequired === 'Yes') {
        kidsTickets++;
      }

      const height = kid.heightEligibility;
      if (height === 'ABOVE 75 CM') {
        kidsAbove75cm++;
      } else if (height === 'BELOW 75 CM') {
        kidsBelow75cm++;
      }
    }
  }

  const totalTickets = employeeTickets + spouseTickets + kidsTickets;

  return {
    employeeTickets,
    spouseTickets,
    kidsTickets,
    kidsAbove75cm,
    kidsBelow75cm,
    totalTickets,
  };
}

export default calculateTicketSummary;
