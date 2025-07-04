import { Box, Typography } from '@mui/material';
import { FTML } from '@kwarc/ftml-viewer';
import { getSlideTitle } from './SlideSelector';
import { Slide } from '@stex-react/api';
interface AutoDetectedTooltipContentProps {
  autoDetected?: {
    clipId?: string;
    sectionUri?: FTML.DocumentURI;
    slideUri?: string;
  };
  getSectionName: (uri: FTML.DocumentURI) => string;
  showResolvedSectionName?: boolean;
}

export function getSlideTitleFromUri(uri: string): string {
  return getSlideTitle({ slide: { uri } } as Slide, 0);
}

export function AutoDetectedTooltipContent({
  autoDetected,
  getSectionName,
}: AutoDetectedTooltipContentProps) {
  if (!autoDetected) {
    return <Typography variant="body2">No auto-detected data available</Typography>;
  }

  const sectionName = getSectionName(autoDetected.sectionUri || '') || <i>None</i>;
  return (
    <Box>
      <Typography>
        <strong>Clip ID:</strong> {autoDetected.clipId || <i>None</i>}
      </Typography>
      <Typography>
        <strong>Section:</strong> {sectionName}
      </Typography>
      <Typography>
        <strong>Slide:</strong> {getSlideTitleFromUri(autoDetected.slideUri)}
      </Typography>
    </Box>
  );
}
