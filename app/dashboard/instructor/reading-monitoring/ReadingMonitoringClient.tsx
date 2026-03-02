"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFailedStudents,
  getRestartRequests,
  getPermanentLocks,
  getVersionUsage,
  approveRestartRequest,
  type FailedStudentItem,
  type RestartRequestItem,
  type PermanentLockItem,
  type VersionUsageItem,
  type MonitoringMeta,
} from "@/src/lib/api/adminReadingMonitoring";
import {
  getReadingLevels,
  type ReadingLevel,
} from "@/src/lib/api/adminReadingVersions";
import {
  FailedStudentsTable,
  RestartRequestsTable,
  PermanentLocksTable,
  VersionUsageTable,
  MonitoringPagination,
} from "@/src/features/reading-monitoring";
import { cn } from "@/lib/utils";

type TabId = "failed" | "restart" | "locks" | "version-usage";

const TABS: { id: TabId; label: string }[] = [
  { id: "failed", label: "Failed" },
  { id: "restart", label: "Restart queue" },
  { id: "locks", label: "Permanent locks" },
  { id: "version-usage", label: "Version usage" },
];

const PAGE_SIZE = 20;

export function ReadingMonitoringClient() {
  const [activeTab, setActiveTab] = useState<TabId>("failed");
  const [failed, setFailed] = useState<FailedStudentItem[]>([]);
  const [failedMeta, setFailedMeta] = useState<MonitoringMeta | null>(null);
  const [failedPage, setFailedPage] = useState(1);
  const [failedLoading, setFailedLoading] = useState(false);

  const [restart, setRestart] = useState<RestartRequestItem[]>([]);
  const [restartMeta, setRestartMeta] = useState<MonitoringMeta | null>(null);
  const [restartPage, setRestartPage] = useState(1);
  const [restartStatus, setRestartStatus] = useState<string>("");
  const [restartLoading, setRestartLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [locks, setLocks] = useState<PermanentLockItem[]>([]);
  const [locksMeta, setLocksMeta] = useState<MonitoringMeta | null>(null);
  const [locksPage, setLocksPage] = useState(1);
  const [locksLoading, setLocksLoading] = useState(false);

  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [versionUsage, setVersionUsage] = useState<VersionUsageItem[]>([]);
  const [versionUsageLoading, setVersionUsageLoading] = useState(false);

  const loadFailed = useCallback(async () => {
    setFailedLoading(true);
    try {
      const res = await getFailedStudents(failedPage, PAGE_SIZE);
      setFailed(res.data);
      setFailedMeta(res.meta);
    } catch {
      setFailed([]);
      setFailedMeta(null);
    } finally {
      setFailedLoading(false);
    }
  }, [failedPage]);

  const loadRestart = useCallback(async () => {
    setRestartLoading(true);
    try {
      const res = await getRestartRequests({
        status: restartStatus || undefined,
        page: restartPage,
        limit: PAGE_SIZE,
      });
      setRestart(res.data);
      setRestartMeta(res.meta);
    } catch {
      setRestart([]);
      setRestartMeta(null);
    } finally {
      setRestartLoading(false);
    }
  }, [restartPage, restartStatus]);

  const loadLocks = useCallback(async () => {
    setLocksLoading(true);
    try {
      const res = await getPermanentLocks(locksPage, PAGE_SIZE);
      setLocks(res.data);
      setLocksMeta(res.meta);
    } catch {
      setLocks([]);
      setLocksMeta(null);
    } finally {
      setLocksLoading(false);
    }
  }, [locksPage]);

  const loadLevels = useCallback(async () => {
    try {
      const list = await getReadingLevels();
      setLevels(list);
      if (list.length > 0 && !selectedLevelId) {
        setSelectedLevelId(list[0]._id);
      }
    } catch {
      setLevels([]);
    }
  }, [selectedLevelId]);

  const loadVersionUsage = useCallback(async () => {
    if (!selectedLevelId) {
      setVersionUsage([]);
      return;
    }
    setVersionUsageLoading(true);
    try {
      const res = await getVersionUsage(selectedLevelId);
      setVersionUsage(res.versions);
    } catch {
      setVersionUsage([]);
    } finally {
      setVersionUsageLoading(false);
    }
  }, [selectedLevelId]);

  useEffect(() => {
    if (activeTab === "failed") loadFailed();
  }, [activeTab, loadFailed]);

  useEffect(() => {
    if (activeTab === "restart") loadRestart();
  }, [activeTab, loadRestart]);

  useEffect(() => {
    if (activeTab === "locks") loadLocks();
  }, [activeTab, loadLocks]);

  useEffect(() => {
    if (activeTab === "version-usage") loadLevels();
  }, [activeTab, loadLevels]);

  useEffect(() => {
    if (activeTab === "version-usage" && selectedLevelId) loadVersionUsage();
  }, [activeTab, selectedLevelId, loadVersionUsage]);

  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId);
    try {
      await approveRestartRequest(requestId);
      await loadRestart();
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary bg-muted/50"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "failed" && (
        <Card>
          <CardHeader>
            <CardTitle>Failed (max attempts)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FailedStudentsTable items={failed} loading={failedLoading} />
            {failedMeta && (
              <MonitoringPagination
                page={failedMeta.page}
                totalPages={failedMeta.totalPage}
                total={failedMeta.total}
                limit={failedMeta.limit}
                onPageChange={setFailedPage}
                disabled={failedLoading}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "restart" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Restart requests</CardTitle>
            <select
              value={restartStatus}
              onChange={(e) => {
                setRestartStatus(e.target.value);
                setRestartPage(1);
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </CardHeader>
          <CardContent className="space-y-4">
            <RestartRequestsTable
              items={restart}
              loading={restartLoading}
              onApprove={handleApprove}
              approvingId={approvingId}
            />
            {restartMeta && (
              <MonitoringPagination
                page={restartMeta.page}
                totalPages={restartMeta.totalPage}
                total={restartMeta.total}
                limit={restartMeta.limit}
                onPageChange={setRestartPage}
                disabled={restartLoading}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "locks" && (
        <Card>
          <CardHeader>
            <CardTitle>Permanent locks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermanentLocksTable items={locks} loading={locksLoading} />
            {locksMeta && (
              <MonitoringPagination
                page={locksMeta.page}
                totalPages={locksMeta.totalPage}
                total={locksMeta.total}
                limit={locksMeta.limit}
                onPageChange={setLocksPage}
                disabled={locksLoading}
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "version-usage" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Version usage</CardTitle>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm min-w-[200px]"
              disabled={versionUsageLoading}
            >
              <option value="">Select level</option>
              {levels.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.title} ({l.slug})
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="space-y-4">
            <VersionUsageTable
              versions={versionUsage}
              loading={versionUsageLoading}
              levelSelected={!!selectedLevelId}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
