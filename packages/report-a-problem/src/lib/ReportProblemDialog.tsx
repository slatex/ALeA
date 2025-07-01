import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormHelperText,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getSourceUrl, getUserInfo } from '@stex-react/api';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { createNewIssue, IssueCategory, IssueType, SelectionContext } from './issueCreator';
import { getLocaleObject } from './lang/utils';

export function ReportProblemDialog({
  open,
  setOpen,
  selectedText,
  context,
  onCreateIssue,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  selectedText: string;
  context: SelectionContext[];
  onCreateIssue: (issueUrl: string) => void;
}) {
  const t = getLocaleObject(useRouter());
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userName, setUserName] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(false);

  const descriptionError = !description?.length;
  const anyError = descriptionError;

  useEffect(() => {
    getUserInfo().then((userInfo) => {
      if (!userInfo) return;
      setUserName(userInfo.fullName);
    });
  }, []);

  const handleViewSource = (uri: string) => {
    getSourceUrl(uri).then((sourceLink) => {
      if (sourceLink) window.open(sourceLink, '_blank');
    });
  };

  return (
    <Dialog
      id="report-a-problem-dialog"
      onClose={() => setOpen(false)}
      open={open}
      sx={{ zIndex: 20000 }}
    >
      <Box sx={{ borderBottom: '1px solid #eee', justifyContent: 'center', display: 'flex' }}>
        <h2>{t.reportProblem}</h2>
      </Box>
      <DialogContent>
        <span style={{ display: 'block', color: '#00000099', margin: '5px 0 0' }}>
          {t.selectedContent}
        </span>
        <IconButton
          onClick={() => handleViewSource(context[0].fragmentUri)}
          sx={{ float: 'right' }}
        >
          <Tooltip title="view source">
            <OpenInNewIcon />
          </Tooltip>
        </IconButton>
        <Box
          sx={{
            padding: '5px',
            border: '1px solid #777',
            color: '#777',
            borderRadius: '5px',
            maxHeight: '100px',
            overflowY: 'auto',
          }}
        >
          {selectedText}
        </Box>
        <FormHelperText sx={{ margin: '0 5px 15px 0' }}>*{t.helperText}</FormHelperText>

        <TextField
          error={descriptionError}
          fullWidth
          label={t.issueDescription}
          style={{ textAlign: 'left' }}
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {!!userName && (
          <FormControlLabel
            control={
              <Checkbox
                checked={postAnonymously}
                onChange={(e) => setPostAnonymously(e.target.checked)}
              />
            }
            label={t.postAnonymously}
          />
        )}
        <i style={{ display: 'block' }}>
          {!postAnonymously && !!userName && t.nameShared.replace('$1', userName)}
          {postAnonymously && !!userName && t.anonymousRegret}
        </i>
      </DialogContent>
      <DialogActions>
        <Button disabled={isCreating} onClick={() => setOpen(false)}>
          {t.cancel}
        </Button>
        <Button
          disabled={anyError || isCreating}
          onClick={async () => {
            setIsCreating(true);
            try {
              let generatedTitle = undefined;
              let issueCategory: IssueCategory = IssueCategory.CONTENT;

              if (description.length > 10) {
                const res = await fetch('/api/generate-issue-title', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ description, selectedText, context }),
                });

                const data = await res.json();

                generatedTitle = data.title || 'Untitled Issue';
                if (data.category === 'CONTENT' || data.category === 'DISPLAY') {
                  issueCategory = data.category as IssueCategory;
                }
              }

              const issueLink = await createNewIssue(
                issueCategory,
                description,
                selectedText,
                context,
                postAnonymously ? '' : userName,
                generatedTitle?.trim().length > 0 ? generatedTitle.trim() : undefined
              );
              onCreateIssue(issueLink);
            } catch (e) {
              console.error(e);
              alert('We encountered an error: ' + e);
              onCreateIssue('');
            } finally {
              setIsCreating(false);
              setOpen(false);
            }
          }}
          autoFocus
        >
          {t.createIssue}
        </Button>
        {isCreating ? <CircularProgress size={20} sx={{ ml: '5px' }} /> : <Box width={25}></Box>}
      </DialogActions>
    </Dialog>
  );
}
