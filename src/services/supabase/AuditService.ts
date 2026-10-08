// JANSAATHI AI - Audit Service
// Records immutable audit entries for security, clinical review, and patient safety events.

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AuditLogItem } from '../../types';

const LOCAL_AUDIT_STORAGE_KEY = 'jansaathi_audit_logs';

export class AuditService {
  public static async logEvent(
    eventType: AuditLogItem['event_type'],
    actorRole: string,
    details: Record<string, unknown>,
    caseId?: string,
    actorId?: string
  ): Promise<AuditLogItem> {
    const logItem: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event_type: eventType,
      actor_role: actorRole,
      actor_id: actorId,
      case_id: caseId,
      action_details: details,
      created_at: new Date().toISOString(),
    };

    // 1. If Supabase is connected, record to Postgres audit_logs table
    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert({
          event_type: eventType,
          actor_role: actorRole,
          actor_id: actorId || null,
          case_id: caseId || null,
          action_details: details,
        });
      } catch (err) {
        console.error('Failed to write audit to Supabase:', err);
      }
    }

    // 2. Persist locally in browser storage for instant inspection and resilience
    try {
      const existing = this.getLocalAuditLogs();
      existing.unshift(logItem);
      // Keep latest 200 audit entries
      if (existing.length > 200) existing.pop();
      localStorage.setItem(LOCAL_AUDIT_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }

    return logItem;
  }

  public static getLocalAuditLogs(): AuditLogItem[] {
    try {
      const raw = localStorage.getItem(LOCAL_AUDIT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async fetchAuditLogs(caseId?: string): Promise<AuditLogItem[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
        if (caseId) {
          query = query.eq('case_id', caseId);
        }
        const { data, error } = await query.limit(100);
        if (!error && data) {
          return data as AuditLogItem[];
        }
      } catch (err) {
        console.warn('Falling back to local audit records:', err);
      }
    }

    const localLogs = this.getLocalAuditLogs();
    if (caseId) {
      return localLogs.filter((l) => l.case_id === caseId);
    }
    return localLogs;
  }
}
