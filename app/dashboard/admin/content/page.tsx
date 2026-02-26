"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listAdminPassages,
  listAdminQuestionSets,
  listAdminQuestions,
  listAdminPassageQuestionSets,
  publishPassage,
  unpublishPassage,
  archivePassage,
  restorePassage,
  publishQuestion,
  unpublishQuestion,
  publishQuestionSet,
  unpublishQuestionSet,
  publishPassageQuestionSet,
  unpublishPassageQuestionSet,
  type AdminPassage,
  type AdminQuestionSet,
  type AdminQuestion,
  type AdminPassageQuestionSet,
} from "@/src/lib/api/admin-content";
import { ArrowLeft, CheckCircle2, XCircle, Archive, Loader2 } from "lucide-react";

type Tab = "passages" | "question-sets" | "questions" | "passage-question-sets";

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("passages");
  const [passages, setPassages] = useState<AdminPassage[]>([]);
  const [questionSets, setQuestionSets] = useState<AdminQuestionSet[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [passageQuestionSets, setPassageQuestionSets] = useState<
    AdminPassageQuestionSet[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, qs, q, pqs] = await Promise.all([
        listAdminPassages(),
        listAdminQuestionSets(),
        listAdminQuestions(),
        listAdminPassageQuestionSets(),
      ]);
      setPassages(p);
      setQuestionSets(qs);
      setQuestions(q);
      setPassageQuestionSets(pqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePublishPassage = async (id: string) => {
    setActionId(id);
    try {
      const updated = await publishPassage(id);
      setPassages((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...updated } : p)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleUnpublishPassage = async (id: string) => {
    setActionId(id);
    try {
      const updated = await unpublishPassage(id);
      setPassages((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...updated } : p)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleArchivePassage = async (id: string) => {
    setActionId(id);
    try {
      const updated = await archivePassage(id);
      setPassages((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...updated } : p)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleRestorePassage = async (id: string) => {
    setActionId(id);
    try {
      const updated = await restorePassage(id);
      setPassages((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...updated } : p)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handlePublishQuestion = async (id: string) => {
    setActionId(id);
    try {
      await publishQuestion(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, isPublished: true } : q)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleUnpublishQuestion = async (id: string) => {
    setActionId(id);
    try {
      await unpublishQuestion(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, isPublished: false } : q)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handlePublishQuestionSet = async (id: string) => {
    setActionId(id);
    try {
      await publishQuestionSet(id);
      setQuestionSets((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isPublished: true } : s)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleUnpublishQuestionSet = async (id: string) => {
    setActionId(id);
    try {
      await unpublishQuestionSet(id);
      setQuestionSets((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isPublished: false } : s)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handlePublishPassageQSet = async (id: string) => {
    setActionId(id);
    try {
      await publishPassageQuestionSet(id);
      setPassageQuestionSets((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isPublished: true } : s)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleUnpublishPassageQSet = async (id: string) => {
    setActionId(id);
    try {
      await unpublishPassageQuestionSet(id);
      setPassageQuestionSets((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isPublished: false } : s)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "passages", label: "Passages" },
    { id: "question-sets", label: "Question sets" },
    { id: "questions", label: "Questions" },
    { id: "passage-question-sets", label: "Passage question sets" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Content management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish, unpublish, and archive content so students can take tests.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {tab === "passages" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Difficulty</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-muted-foreground">
                        No passages yet.
                      </td>
                    </tr>
                  ) : (
                    passages.map((p) => (
                      <tr key={p._id} className="border-b hover:bg-muted/20">
                        <td className="p-4 font-medium">{p.title}</td>
                        <td className="p-4">{p.difficulty}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                              p.isPublished
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            } ${p.isArchived ? "bg-destructive/20 text-destructive" : ""}`}
                          >
                            {p.isArchived
                              ? "Archived"
                              : p.isPublished
                                ? "Published"
                                : "Draft"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {!p.isArchived && (
                              <>
                                {p.isPublished ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={actionId === p._id}
                                    onClick={() => handleUnpublishPassage(p._id)}
                                  >
                                    {actionId === p._id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <XCircle className="h-3 w-3" />
                                    )}{" "}
                                    Unpublish
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={actionId === p._id}
                                    onClick={() => handlePublishPassage(p._id)}
                                  >
                                    {actionId === p._id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}{" "}
                                    Publish
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionId === p._id}
                                  onClick={() => handleArchivePassage(p._id)}
                                >
                                  <Archive className="h-3 w-3" /> Archive
                                </Button>
                              </>
                            )}
                            {p.isArchived && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionId === p._id}
                                onClick={() => handleRestorePassage(p._id)}
                              >
                                Restore
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "question-sets" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-4 font-medium">Instruction</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Q range</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questionSets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground">
                        No question sets yet.
                      </td>
                    </tr>
                  ) : (
                    questionSets.map((s) => (
                      <tr key={s._id} className="border-b hover:bg-muted/20">
                        <td className="max-w-[200px] truncate p-4 text-foreground">
                          {s.instruction}
                        </td>
                        <td className="p-4">{s.questionType}</td>
                        <td className="p-4">
                          {s.startQuestionNumber}–{s.endQuestionNumber}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                              s.isPublished
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {s.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {s.isPublished ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionId === s._id}
                                onClick={() =>
                                  handleUnpublishQuestionSet(s._id)
                                }
                              >
                                Unpublish
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={actionId === s._id}
                                onClick={() =>
                                  handlePublishQuestionSet(s._id)
                                }
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "questions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-4 font-medium">Q#</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Difficulty</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground">
                        No questions yet.
                      </td>
                    </tr>
                  ) : (
                    questions.map((q) => (
                      <tr key={q._id} className="border-b hover:bg-muted/20">
                        <td className="p-4 font-medium">{q.questionNumber}</td>
                        <td className="p-4">{q.type}</td>
                        <td className="p-4">{q.difficulty}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                              q.isPublished
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {q.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {q.isPublished ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionId === q._id}
                                onClick={() =>
                                  handleUnpublishQuestion(q._id)
                                }
                              >
                                Unpublish
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={actionId === q._id}
                                onClick={() =>
                                  handlePublishQuestion(q._id)
                                }
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "passage-question-sets" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-4 font-medium">Passage</th>
                    <th className="p-4 font-medium">P#</th>
                    <th className="p-4 font-medium">Questions</th>
                    <th className="p-4 font-medium">Time</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passageQuestionSets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-muted-foreground">
                        No passage question sets yet.
                      </td>
                    </tr>
                  ) : (
                    passageQuestionSets.map((s) => (
                      <tr key={s._id} className="border-b hover:bg-muted/20">
                        <td className="p-4 font-mono text-xs">{s._id.slice(0, 8)}…</td>
                        <td className="p-4">P{s.passageNumber}</td>
                        <td className="p-4">{s.totalQuestions}</td>
                        <td className="p-4">{s.recommendedTime} min</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                              s.isPublished
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {s.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {s.isPublished ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionId === s._id}
                                onClick={() =>
                                  handleUnpublishPassageQSet(s._id)
                                }
                              >
                                Unpublish
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={actionId === s._id}
                                onClick={() =>
                                  handlePublishPassageQSet(s._id)
                                }
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
