"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPassageCode,
  listPassageCodes,
  type PassageCode,
} from "@/src/lib/api/instructor";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";

export default function PassageCodesPage() {
  const [codes, setCodes] = useState<PassageCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [book, setBook] = useState("");
  const [test, setTest] = useState("");
  const [passage, setPassage] = useState("");
  const [source, setSource] = useState("CAMBRIDGE");

  useEffect(() => {
    listPassageCodes()
      .then(setCodes)
      .catch(() => setCodes([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book.trim() || !test.trim() || !passage.trim() || !source.trim()) return;
    setSubmitting(true);
    try {
      const created = await createPassageCode({
        book: book.trim(),
        test: test.trim(),
        passage: passage.trim(),
        source: source.trim(),
      });
      setCodes((prev) => [created, ...prev]);
      setBook("");
      setTest("");
      setPassage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Passage codes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create passage identifiers (book, test, passage) used when creating
            passages.
          </p>
        </div>
        <Link href="/dashboard/instructor">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Create passage code</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="book">Book</Label>
            <Input
              id="book"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              placeholder="e.g. C18"
              required
            />
          </div>
          <div>
            <Label htmlFor="test">Test</Label>
            <Input
              id="test"
              value={test}
              onChange={(e) => setTest(e.target.value)}
              placeholder="e.g. 1"
              required
            />
          </div>
          <div>
            <Label htmlFor="passage">Passage</Label>
            <Input
              id="passage"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder="e.g. P1"
              required
            />
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="CAMBRIDGE">CAMBRIDGE</option>
              <option value="IELTS_HABIB">IELTS_HABIB</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create passage code
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <h2 className="border-b bg-muted/40 px-4 py-3 font-semibold">
          All passage codes
        </h2>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading…
          </div>
        ) : codes.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No passage codes yet. Create one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="p-4 font-medium">Book</th>
                  <th className="p-4 font-medium">Test</th>
                  <th className="p-4 font-medium">Passage</th>
                  <th className="p-4 font-medium">Source</th>
                  <th className="p-4 font-medium">ID</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c._id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-medium">{c.book}</td>
                    <td className="p-4">{c.test}</td>
                    <td className="p-4">{c.passage}</td>
                    <td className="p-4">{c.source}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {c._id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
