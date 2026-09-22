import { Badge } from '@/components/ui/Display';
import { COURSE_STATUS_TONES, STATUS_LABELS } from '@/lib/format';
import type { CourseStatus } from '@/types/api';

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  return <Badge tone={COURSE_STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}
