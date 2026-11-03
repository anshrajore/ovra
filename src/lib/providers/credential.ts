/**
 * Core interface for credential management and secret leasing.
 * Initial implementation: AES-256-GCM Envelope Encryption with Master Key
 * Production implementation: HashiCorp Vault Transit / AWS KMS
 */

export interface CredentialLease {
  credentialId: string;
  decryptedData: Record<string, string>;
  expiresAt: string;
}

export interface CredentialProvider {
  encryptSecret(
    secret: Record<string, string>,
    metadata: { organizationId: string; workspaceId: string }
  ): Promise<{ ciphertext: string; dekCiphertext: string }>;

  acquireLease(
    credentialId: string,
    context: { executionId: string; nodeId: string }
  ): Promise<CredentialLease>;
}
