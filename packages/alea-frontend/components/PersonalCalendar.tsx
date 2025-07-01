import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export function PersonalCalendarSection({
  userId,
  hintGoogle,
  hintApple,
}: {
  userId: string;
  hintGoogle: string;
  hintApple: string;
}) {
  if (!userId) return null;

  const calendarURL = `https://courses.voll-ki.fau.de/api/calendar/create-calendar?userId=${userId}`;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #fff3e0, #e8f4fd)',
        border: '1px solid #ffcc02',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Copy calendar link">
            <CalendarMonthIcon
              sx={{
                fontSize: 20,
                cursor: 'pointer',
                color: '#1976d2',
                '&:hover': { color: '#1565c0' },
              }}
              onClick={(event) => {
                navigator.clipboard.writeText(calendarURL);
                const icon = event.currentTarget as unknown as HTMLElement;
                icon.style.color = '#4caf50';
                setTimeout(() => (icon.style.color = '#1976d2'), 1200);
              }}
            />
          </Tooltip>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '1rem' }}>
            Personal Calendar -
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={hintGoogle}>
            <IconButton
              component="a"
              href="https://calendar.google.com/calendar/u/0/r"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                backgroundColor: '#fff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                width: 32,
                height: 32,
                '&:hover': { backgroundColor: '#f8f9fa' },
              }}
            >
              <Box
                component="img"
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
                alt="Google Calendar"
                sx={{ width: 18, height: 18 }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title={hintApple}>
            <IconButton
              onClick={() => {
                window.open(`webcal://${calendarURL.replace('https://', '')}`, '_blank');
              }}
              sx={{
                backgroundColor: '#fff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                width: 32,
                height: 32,
                '&:hover': { backgroundColor: '#f8f9fa' },
              }}
            >
              <Box
                component="img"
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apple/apple-original.svg"
                alt="Apple Calendar"
                sx={{ width: 18, height: 18 }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
