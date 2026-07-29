import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Card, Field } from '@/components/primitives';

/**
 * Internal operational feedback form (F-03, Sprint v1.2 Track B W3).
 *
 * Copy register matters here as much as on the trust page: this asks about
 * what happened operationally -- did the consultation occur, was the fee
 * and format what was disclosed, how was communication -- and never asks
 * the client to rate or recommend the attorney. There is deliberately no
 * "overall rating" and no star control: nothing collected here is a public
 * review (Shared Contract 2.4 constraint 2), and the wording should not
 * imply one is being written.
 */

const YES_NO = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

const COMMUNICATION = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Below expectations' },
  { value: 3, label: 'As expected' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
];

function ChoiceRow({ legend, hint, options, value, onChange, disabled }) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="ds-type-label text-[var(--text-2)] mb-1.5">{legend}</legend>
      {hint && <p className="text-xs text-[var(--text-3)] ds-type-body-m mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : opt.value)}
              className={`px-3 h-9 rounded-[var(--radius-s)] border ds-type-body-m text-sm transition-colors disabled:opacity-50 ${
                selected
                  ? 'border-transparent bg-[var(--accent)] text-[var(--accent-on)]'
                  : 'border-[var(--line-2)] text-[var(--text-2)] hover:bg-[var(--surface-sunk)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function FeedbackForm({ attorneyName, onSubmit, submitting, error }) {
  const [attended, setAttended] = useState(null);
  const [feeAsDisclosed, setFeeAsDisclosed] = useState(null);
  const [formatAsDisclosed, setFormatAsDisclosed] = useState(null);
  const [communicationRating, setCommunicationRating] = useState(null);
  const [comment, setComment] = useState('');

  const answered =
    attended !== null ||
    feeAsDisclosed !== null ||
    formatAsDisclosed !== null ||
    communicationRating !== null ||
    comment.trim() !== '';

  const submit = () => {
    onSubmit({ attended, feeAsDisclosed, formatAsDisclosed, communicationRating, comment: comment.trim() });
  };

  return (
    <Card tone="raised">
      <p className="text-sm text-[var(--text-2)] ds-type-body-m mb-6 leading-relaxed">
        This goes to Brief's team only. It is not published, is not shown on
        {attorneyName ? ` ${attorneyName}'s` : ' the attorney’s'} profile, and is not a review.
        Every question is optional.
      </p>

      <div className="space-y-6">
        <ChoiceRow
          legend="Did the consultation take place?"
          options={YES_NO}
          value={attended}
          onChange={setAttended}
          disabled={submitting}
        />
        <ChoiceRow
          legend="Was the fee what was disclosed?"
          hint="The consultation fee shown on the profile when you booked."
          options={YES_NO}
          value={feeAsDisclosed}
          onChange={setFeeAsDisclosed}
          disabled={submitting}
        />
        <ChoiceRow
          legend="Was the format what was disclosed?"
          hint="For example, a video call when a video call was booked."
          options={YES_NO}
          value={formatAsDisclosed}
          onChange={setFormatAsDisclosed}
          disabled={submitting}
        />
        <ChoiceRow
          legend="How was communication?"
          hint="Scheduling, reminders, and responsiveness around the consultation."
          options={COMMUNICATION}
          value={communicationRating}
          onChange={setCommunicationRating}
          disabled={submitting}
        />
        <Field
          label="Anything else?"
          type="textarea"
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={2000}
          hint="Optional. Shared with Brief's team only."
          disabled={submitting}
        />
      </div>

      {error && (
        <p
          className="mt-4 px-3 py-2 rounded-[var(--radius-s)] border text-xs ds-type-body-m"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--noshow) 10%, transparent)',
            borderColor: 'var(--noshow)',
            color: 'var(--noshow)',
          }}
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={submit} disabled={submitting || !answered}>
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Send to Brief
        </Button>
        {!answered && (
          <span className="text-xs text-[var(--text-3)] ds-type-body-m">Answer at least one question to send.</span>
        )}
      </div>
    </Card>
  );
}
