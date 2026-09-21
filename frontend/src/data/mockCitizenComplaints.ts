import type { Complaint } from '../types';

/**
 * MOCK DATA — citizen's own submitted complaints.
 * Clearly separated from the authority-wide dataset.
 * Replace with authenticated API call when backend is ready.
 */
export const CITIZEN_ID = 'citizen-demo-01';
export const CITIZEN_NAME = 'Arjun Mehta'; // demo citizen name

export const MY_MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'my-001',
    referenceNo: 'CX-2026-0042',
    title: 'Deep pothole near apartment gate',
    description: 'Large pothole right at the entrance of our housing society. Vehicles are swerving into oncoming traffic.',
    location: {
      address: '14, Kalyani Nagar, Near Marriott, Pune',
      coordinates: { lat: 18.5490, lng: 73.9010 },
      ward: 'Ward 9',
    },
    severity: 'high',
    status: 'in_progress',
    reportedBy: CITIZEN_NAME,
    reportedAt: '2026-09-08T07:30:00Z',
    assignedTo: 'c2',
    contractorName: 'SurePath Infrastructure',
    updatedAt: '2026-09-10T11:00:00Z',
  },
  {
    id: 'my-002',
    referenceNo: 'CX-2026-0067',
    title: 'Pothole blocking cycle lane',
    description: 'A 30 cm deep pothole in the dedicated cycle lane near the park.',
    location: {
      address: 'Viman Nagar Cycle Path, Pune',
      coordinates: { lat: 18.5679, lng: 73.9143 },
      ward: 'Ward 7',
    },
    severity: 'medium',
    status: 'pending',
    reportedBy: CITIZEN_NAME,
    reportedAt: '2026-09-14T09:15:00Z',
    updatedAt: '2026-09-14T09:15:00Z',
  },
  {
    id: 'my-003',
    referenceNo: 'CX-2026-0019',
    title: 'Pothole at school crossing',
    description: 'Children at risk every morning. Multiple potholes at the zebra crossing.',
    location: {
      address: 'DPS School Road, Wakad, Pune',
      coordinates: { lat: 18.5995, lng: 73.7742 },
      ward: 'Ward 4',
    },
    severity: 'critical',
    status: 'verified',
    reportedBy: CITIZEN_NAME,
    reportedAt: '2026-08-25T08:00:00Z',
    assignedTo: 'c1',
    contractorName: 'Apex Road Works Ltd.',
    verificationResult: {
      outcome: 'verified',
      confidence: 93,
      checks: [
        { label: 'Location match', passed: true },
        { label: 'Pothole visible in before photo', passed: true },
        { label: 'Repair visible in after photo', passed: true },
        { label: 'Lighting & angle consistent', passed: true },
      ],
    },
    updatedAt: '2026-09-05T14:00:00Z',
  },
  {
    id: 'my-004',
    referenceNo: 'CX-2026-0088',
    title: 'Road cave-in near water main',
    description: 'Road surface has caved in near a water main. Possible pipe leak underneath.',
    location: {
      address: 'Boat Club Road, Pune',
      coordinates: { lat: 18.5162, lng: 73.8547 },
      ward: 'Ward 18',
    },
    severity: 'critical',
    status: 'flagged',
    reportedBy: CITIZEN_NAME,
    reportedAt: '2026-09-12T06:45:00Z',
    assignedTo: 'c3',
    contractorName: 'Bharat Civil Corp.',
    verificationResult: {
      outcome: 'flagged',
      confidence: 38,
      checks: [
        { label: 'Location match', passed: true },
        { label: 'Pothole visible in before photo', passed: true },
        { label: 'Repair visible in after photo', passed: false, detail: 'Photo does not show repair area clearly' },
        { label: 'Lighting & angle consistent', passed: false, detail: 'Significant shift in camera angle' },
      ],
      flagReason: 'Repair evidence is inconclusive. Sent for manual review.',
    },
    updatedAt: '2026-09-16T10:00:00Z',
  },
];

export function computeCitizenStats(complaints: Complaint[]) {
  return {
    total:    complaints.length,
    pending:  complaints.filter(c => c.status === 'pending').length,
    verified: complaints.filter(c => c.status === 'verified').length,
    flagged:  complaints.filter(c => c.status === 'flagged').length,
  };
}

/** Generate a demo reference number for new mock submissions */
export function generateDemoRefNo(): string {
  const seq = Math.floor(Math.random() * 900) + 100;
  return `CX-2026-${seq}`;
}
