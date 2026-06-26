import { backupVerificationJob } from "./BackupVerificationJob";
import { cleanupJob } from "./CleanupJob";
import { integrityJob } from "./IntegrityJob";
import { riskRecalculationJob } from "./RiskRecalculationJob";

export const backgroundJobs = [
  integrityJob,
  cleanupJob,
  backupVerificationJob,
  riskRecalculationJob,
];

