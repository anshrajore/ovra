/**
 * Supabase Storage Provider with automatic >64KiB Payload Offloading
 */

import crypto from "crypto";
import { StorageProvider, StorageMetadata } from "./storage";
import { getSupabaseAdminClient } from "../supabase";

const PAYLOAD_BUCKET = "ovra-execution-payloads";
const OFFLOAD_THRESHOLD_BYTES = 64 * 1024; // 64 KiB

class SupabaseStorageProvider implements StorageProvider {
  // In-memory fallback for local dev or offline mode
  private memoryStore = new Map<string, { data: Buffer; meta: StorageMetadata }>();

  /**
   * Store raw object/buffer in storage
   */
  public async putObject(
    key: string,
    data: Buffer | string,
    mimeType: string = "application/json"
  ): Promise<StorageMetadata> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const size = buffer.length;

    const meta: StorageMetadata = {
      storageKey: key,
      fileName: key.split("/").pop() || key,
      mimeType,
      size,
      sha256,
    };

    // 1. Try Supabase Storage if configured
    const admin = getSupabaseAdminClient();
    if (admin) {
      try {
        const { error } = await admin.storage
          .from(PAYLOAD_BUCKET)
          .upload(key, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!error) {
          return meta;
        }
      } catch (err) {
        // Fall back to memoryStore
      }
    }

    // 2. Fallback to memory store
    this.memoryStore.set(key, { data: buffer, meta });
    return meta;
  }

  /**
   * Retrieve raw object from storage
   */
  public async getObject(key: string): Promise<Buffer | null> {
    const admin = getSupabaseAdminClient();
    if (admin) {
      try {
        const { data, error } = await admin.storage
          .from(PAYLOAD_BUCKET)
          .download(key);

        if (!error && data) {
          const arrayBuf = await data.arrayBuffer();
          return Buffer.from(arrayBuf);
        }
      } catch (err) {
        // Fall back
      }
    }

    const item = this.memoryStore.get(key);
    return item ? item.data : null;
  }

  /**
   * Create a signed download URL valid for specified seconds
   */
  public async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const admin = getSupabaseAdminClient();
    if (admin) {
      try {
        const { data, error } = await admin.storage
          .from(PAYLOAD_BUCKET)
          .createSignedUrl(key, expiresInSeconds);

        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        // Fall back
      }
    }

    return `/api/v1/storage/payloads/${encodeURIComponent(key)}`;
  }

  /**
   * Offload large execution payload if > 64 KiB
   */
  public async offloadIfNeeded(
    executionId: string,
    stepId: string,
    payload: Record<string, unknown>
  ): Promise<{ isOffloaded: boolean; payload: Record<string, unknown> }> {
    const jsonString = JSON.stringify(payload);
    const byteLength = Buffer.byteLength(jsonString, "utf8");

    if (byteLength <= OFFLOAD_THRESHOLD_BYTES) {
      return { isOffloaded: false, payload };
    }

    const key = `executions/${executionId}/${stepId}_payload.json`;
    const meta = await this.putObject(key, jsonString, "application/json");

    return {
      isOffloaded: true,
      payload: {
        __ovra_storage_ref: true,
        storageKey: meta.storageKey,
        size: meta.size,
        sha256: meta.sha256,
        preview: jsonString.slice(0, 1024),
      },
    };
  }

  /**
   * Rehydrate payload if it contains a storage reference
   */
  public async rehydrateIfNeeded(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!payload || !payload.__ovra_storage_ref || typeof payload.storageKey !== "string") {
      return payload;
    }

    const buffer = await this.getObject(payload.storageKey);
    if (!buffer) {
      return payload;
    }

    try {
      return JSON.parse(buffer.toString("utf8"));
    } catch {
      return payload;
    }
  }
}

export const supabaseStorageProvider = new SupabaseStorageProvider();
