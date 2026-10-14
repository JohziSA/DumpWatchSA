import type { LabeledMedia, Report, ReportKind } from './types';

export function labeledMedia(
  report: Pick<
    Report,
    'kind' | 'videoUri' | 'photoCar' | 'photoPerson' | 'photoPlate' | 'photoScene' | 'photos'
  >,
): LabeledMedia[] {
  const photos = Array.isArray(report.photos) ? report.photos : [];
  if (report.kind === 'water') {
    return [
      { slot: 'video', label: 'Scene video (5s)', type: 'video', uri: report.videoUri },
      {
        slot: 'scene',
        label: 'Water picture',
        type: 'image',
        uri: report.photoScene || report.photoCar || photos[0],
      },
    ];
  }
  const car = report.photoCar ?? photos[0];
  const person = report.photoPerson ?? photos[1];
  const plate = report.photoPlate ?? photos[2];
  return [
    { slot: 'video', label: 'Scene video (5s)', type: 'video', uri: report.videoUri },
    { slot: 'car', label: 'Car picture', type: 'image', uri: car },
    { slot: 'person', label: 'Person picture', type: 'image', uri: person },
    { slot: 'plate', label: 'Number plate picture', type: 'image', uri: plate },
  ];
}

export function coverUri(
  report: Pick<Report, 'kind' | 'photoCar' | 'photoPerson' | 'photoPlate' | 'photoScene' | 'photos'>,
): string | undefined {
  const photos = Array.isArray(report.photos) ? report.photos : [];
  if (report.kind === 'water') {
    return report.photoScene || report.photoCar || photos[0];
  }
  return report.photoCar || report.photoPerson || report.photoPlate || photos[0];
}

export function imageUris(report: Parameters<typeof labeledMedia>[0]): string[] {
  return labeledMedia(report)
    .filter((item) => item.type === 'image' && item.uri)
    .map((item) => item.uri as string);
}

export function kindLabel(kind: ReportKind | undefined): string {
  return kind === 'water' ? 'WaterWatch' : 'DumpWatch';
}

export function splitByKind(reports: Report[]) {
  return {
    dumping: reports.filter((report) => report.kind !== 'water'),
    water: reports.filter((report) => report.kind === 'water'),
  };
}

export const HOME_FEED_LIMIT = 3;
