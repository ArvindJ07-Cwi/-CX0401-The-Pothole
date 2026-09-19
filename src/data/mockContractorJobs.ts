import type { Complaint } from '../types';
import { MOCK_COMPLAINTS } from './mockComplaints';

/**
 * MOCK DATA - Contractor specific jobs.
 * We'll use contractor 'c1' (Apex Road Works Ltd.) as the logged-in user.
 */
export const CONTRACTOR_ID = 'c1';
export const CONTRACTOR_NAME = 'Apex Road Works Ltd.';

// Filter main mock complaints to only those assigned to c1
export const MOCK_CONTRACTOR_JOBS: Complaint[] = MOCK_COMPLAINTS.filter(
  (c) => c.assignedTo === CONTRACTOR_ID
);

export function computeContractorStats(jobs: Complaint[]) {
  return {
    assigned: jobs.filter(c => c.status === 'assigned').length,
    inProgress: jobs.filter(c => c.status === 'in_progress').length,
    submitted: jobs.filter(c => c.status === 'submitted').length,
    completed: jobs.filter(c => c.status === 'verified').length, // Consider verified as completed for contractor
  };
}
