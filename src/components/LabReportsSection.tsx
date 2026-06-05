import type { LabContaminant, LabDetail, Source } from '@/types';

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default function LabReportsSection({
  lab,
  labReports,
}: {
  lab: LabDetail | null;
  labReports: Source[];
}) {
  if (!lab && labReports.length === 0) return null;

  const detected = lab?.contaminants ?? [];

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Lab reports</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Independent testing data backing this product&apos;s score.
      </p>

      {lab && (
        <div className="mb-5 rounded-xl border border-sky-100 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/20 p-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {lab.laboratory && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Laboratory</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{lab.laboratory}</dd>
              </div>
            )}
            {lab.reportDate && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Report date</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{formatDate(lab.reportDate)}</dd>
              </div>
            )}
            {lab.sampleDate && (
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Sample date</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{formatDate(lab.sampleDate)}</dd>
              </div>
            )}
            {lab.methodology && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500 dark:text-gray-400">Methodology</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{lab.methodology}</dd>
              </div>
            )}
          </dl>

          {detected.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Detected in lab report</h3>
              <ul className="space-y-1.5">
                {detected.map((item: LabContaminant) => (
                  <li key={`${item.name}-${item.amount}`} className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">
                      {item.amount} {item.measure}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {labReports.length > 0 && (
        <ul className="space-y-2">
          {labReports.map((source, index) => (
            <li key={`${source.url}-${index}`}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:underline text-sm break-all"
              >
                <span aria-hidden="true">📄</span>
                {source.label || source.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
