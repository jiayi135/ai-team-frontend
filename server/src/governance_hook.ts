import { createLogger } from './logger';

const logger = createLogger('GovernanceHook');

export interface GovernanceValidationResult {
  isValid: boolean;
  reason?: string;
  constitutionalClause?: string;
}

// Red-line rules based on the AI Team Constitution
const RED_LINES = [
  {
    pattern: /rm\s+-rf\s+\//,
    reason: "Attempted to delete root directory. Violation of system integrity.",
    clause: "Article V: System Safety & Infrastructure Protection"
  },
  {
    pattern: /rm\s+-rf\s+\.\/logs/,
    reason: "Attempted to delete audit logs. Violation of transparency and zero-trust principles.",
    clause: "Article I: Pillar 6 (Full Observability)"
  },
  {
    pattern: /curl|wget|nc|socat/,
    reason: "Unauthorized external network utility detected. Potential data exfiltration risk.",
    clause: "Article IV: Data Security & Privacy"
  },
  {
    pattern: /chmod\s+777/,
    reason: "Attempted to set insecure file permissions. Violation of least privilege principle.",
    clause: "Article V: Access Control"
  },
  {
    pattern: /env|printenv|cat\s+\.env/,
    reason: "Attempted to access sensitive environment variables or secrets directly.",
    clause: "Article IV: Secret Management"
  }
];

/**
 * Validates any generated command or action against the AI Team Constitution.
 * This is a pre-execution synchronous/asynchronous guardrail.
 */
export async function validateAgainstConstitution(
  codeOrAction: string, 
  role: string, 
  context: string
): Promise<GovernanceValidationResult> {
  logger.info('Performing constitutional scan', { role, commandLength: codeOrAction.length });

  // 1. Static Red-Line Scanning (Regex based)
  for (const rule of RED_LINES) {
    if (rule.pattern.test(codeOrAction)) {
      logger.warn('Red-line violation detected', { rule: rule.reason });
      return {
        isValid: false,
        reason: rule.reason,
        constitutionalClause: rule.clause
      };
    }
  }

  // 2. Role-Based Boundary Check
  // Example: Only Architect can modify configuration files
  if (codeOrAction.includes('config') && role !== 'architect') {
    return {
      isValid: false,
      reason: `Role '${role}' is not authorized to modify system configuration files.`,
      constitutionalClause: "Article II: Role Boundaries & Metadata Constraints"
    };
  }

  // 3. Resource & Quota Check (Heuristic)
  if (codeOrAction.includes('deploy') && context.includes('budget_exceeded')) {
    return {
      isValid: false,
      reason: "Operation aborted: Global project budget exceeded.",
      constitutionalClause: "Article III: Economic Safeguards & Quota Management"
    };
  }

  logger.debug('Constitutional scan passed');
  return { isValid: true };
}
