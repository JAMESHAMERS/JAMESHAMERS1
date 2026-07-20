"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MicIcon, SquareIcon, Trash2Icon } from "lucide-react";

import type { JournalVoiceNote } from "../../domain/types";
import { useJournalStore } from "../../application/journal-store";
import { Button } from "@/shared/components/ui/button";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Records audio via `MediaRecorder` into an object URL — same
 * doesn't-survive-a-reload trade-off as Photos (see
 * `modules/journal/README.md`). Mic access can fail (denied permission,
 * no device, insecure context); that's caught and surfaced inline rather
 * than left to throw, since a browser without a mic shouldn't crash the
 * rest of the entry editor.
 */
export function VoiceNoteRecorder({ entryId, voiceNotes }: { entryId: string; voiceNotes: JournalVoiceNote[] }) {
  const t = useTranslations("journal");
  const addVoiceNote = useJournalStore((s) => s.addVoiceNote);
  const deleteVoiceNote = useJournalStore((s) => s.deleteVoiceNote);

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      elapsedRef.current = 0;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        void addVoiceNote({ entryId, url, durationSeconds: elapsedRef.current });
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
    } catch {
      setError(t("micUnavailable"));
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <div className="space-y-2.5">
      {voiceNotes.length > 0 ? (
        <ul className="space-y-1.5">
          {voiceNotes.map((note) => (
            <li
              key={note.id}
              className="group hover:bg-accent/50 flex items-center gap-2.5 rounded-md border px-2.5 py-2"
            >
              <audio src={note.url} controls className="h-8 flex-1" />
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {formatDuration(note.durationSeconds)}
              </span>
              <button
                type="button"
                onClick={() => void deleteVoiceNote(note.id)}
                className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t("actions.delete")}
              >
                <Trash2Icon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {isRecording ? (
        <Button variant="destructive" size="sm" className="gap-1.5" onClick={stopRecording}>
          <SquareIcon className="size-3 fill-current" />
          {t("stopRecording")} · {formatDuration(elapsed)}
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void startRecording()}>
          <MicIcon className="size-3.5" />
          {t("recordVoiceNote")}
        </Button>
      )}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
