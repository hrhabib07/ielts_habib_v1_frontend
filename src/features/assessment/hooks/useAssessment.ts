"use client";

import { useCallback, useState } from "react";
import {
  listModules,
  getModuleById,
  updateModule,
  createModule,
  getAssessmentByModuleId,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  getQuestionsByAssessmentId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type AssessmentModule,
  type Assessment,
  type AssessmentQuestion,
  type CreateModulePayload,
  type UpdateModulePayload,
  type CreateAssessmentPayload,
  type UpdateAssessmentPayload,
  type CreateQuestionPayload,
  type UpdateQuestionPayload,
} from "@/src/lib/api/assessment";

export function useModules() {
  const [data, setData] = useState<AssessmentModule[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listModules();
      setData(list);
      return list;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load modules";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

export function useModule(id: string | null) {
  const [data, setData] = useState<AssessmentModule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const module = await getModuleById(id);
      setData(module);
      return module;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load module";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { data, loading, error, fetch };
}

export function useModuleMutate(id: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (payload: UpdateModulePayload) => {
      if (!id) throw new Error("No module id");
      setLoading(true);
      setError(null);
      try {
        return await updateModule(id, payload);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update module";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  return { update, loading, error };
}

export function useCreateModule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreateModulePayload) => {
    setLoading(true);
    setError(null);
    try {
      return await createModule(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create module";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useAssessmentByModule(moduleId: string | null) {
  const [data, setData] = useState<Assessment | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!moduleId) return null;
    setLoading(true);
    setError(null);
    try {
      const assessment = await getAssessmentByModuleId(moduleId);
      setData(assessment);
      return assessment;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load assessment";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  return { data, loading, error, fetch };
}

export function useAssessment(id: string | null) {
  const [data, setData] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const assessment = await getAssessmentById(id);
      setData(assessment);
      return assessment;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load assessment";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { data, loading, error, fetch };
}

export function useCreateAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreateAssessmentPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await createAssessment(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create assessment";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useUpdateAssessment(id: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (payload: UpdateAssessmentPayload) => {
      if (!id) throw new Error("No assessment id");
      setLoading(true);
      setError(null);
      try {
        return await updateAssessment(id, payload);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update assessment";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  return { update, loading, error };
}

export function useQuestions(assessmentId: string | null) {
  const [data, setData] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!assessmentId) return [];
    setLoading(true);
    setError(null);
    try {
      const list = await getQuestionsByAssessmentId(assessmentId);
      setData(list);
      return list;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load questions";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  return { data, loading, error, fetch };
}

export function useQuestionMutate(assessmentId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (payload: Omit<CreateQuestionPayload, "assessmentId">) => {
      if (!assessmentId) throw new Error("No assessment id");
      setLoading(true);
      setError(null);
      try {
        return await createQuestion({ ...payload, assessmentId });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create question";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [assessmentId],
  );

  const update = useCallback(
    async (questionId: string, payload: UpdateQuestionPayload) => {
      setLoading(true);
      setError(null);
      try {
        return await updateQuestion(questionId, payload);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update question";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const remove = useCallback(async (questionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteQuestion(questionId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete question";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
      }
  }, []);

  return { create, update, remove, loading, error };
}
