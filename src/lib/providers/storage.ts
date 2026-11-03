/**
 * Core interface for offloading large payloads (>64KB) and binary files.
 * Initial implementation: Local in-memory / S3-compatible Blob storage
 * Production implementation: Distributed S3 bucket with signed URLs
 */

export interface StorageMetadata {
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  sha256: string;
}

export interface StorageProvider {
  putObject(
    key: string,
    data: Buffer | string,
    mimeType: string
  ): Promise<StorageMetadata>;

  getObject(key: string): Promise<Buffer | null>;
}
