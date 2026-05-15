/** Inserts spaces before capitals so compact API labels wrap cleanly (SubmissionClosed → Submission Closed). */
export function formatStatusLabel(label: string): string {
  return label.replace(/([a-z\d])([A-Z])/g, "$1 $2");
}
