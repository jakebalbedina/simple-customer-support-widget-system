import { Box, Avatar, Paper, Typography, Chip } from '@mui/material';
import { format } from 'date-fns';
import { useState, useCallback, useMemo } from 'react';

interface Attachment {
  id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  file_size: number;
}

interface MessageProps {
  id: string;
  content: string;
  senderType: 'customer' | 'admin';
  senderName?: string;
  createdAt: string;
  attachments?: Attachment[];
  onAttachmentDownload?: (path: string, name: string) => void;
}

export const Message: React.FC<MessageProps> = ({
  content,
  senderType,
  senderName,
  createdAt,
  attachments,
  onAttachmentDownload,
}) => {
  const isAdmin = senderType === 'admin';
  const [showAttachments, setShowAttachments] = useState<boolean>(false);

  const toggleAttachments = useCallback((): void => {
    setShowAttachments((prev) => !prev);
  }, []);

  const handleAttachmentClick = useCallback(
    (storagePath: string, fileName: string): void => {
      onAttachmentDownload?.(storagePath, fileName);
    },
    [onAttachmentDownload]
  );

  const formattedDate = useMemo(
    () => format(new Date(createdAt), 'MMM d, yyyy h:mm a'),
    [createdAt]
  );

  const attachmentCount = attachments?.length || 0;
  const hasAttachments = attachmentCount > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isAdmin ? 'flex-start' : 'flex-end',
        mb: 2,
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {isAdmin && (
        <Avatar
          sx={{
            bgcolor: '#2196F3',
            width: 32,
            height: 32,
            fontSize: '0.75rem',
          }}
        >
          AD
        </Avatar>
      )}

      <Paper
        sx={{
          p: 2,
          maxWidth: '70%',
          bgcolor: isAdmin ? '#E3F2FD' : '#F5F5F5',
          borderRadius: 2,
        }}
      >
        {isAdmin && (
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976D2' }}>
            {senderName || 'Support Team'}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: isAdmin ? 0.5 : 0, wordBreak: 'break-word' }}>
          {content}
        </Typography>

        {hasAttachments && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography
              variant="caption"
              sx={{
                cursor: 'pointer',
                color: '#1976D2',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={toggleAttachments}
            >
              📎 {attachmentCount} attachment{attachmentCount > 1 ? 's' : ''}
            </Typography>

            {showAttachments && attachments && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {attachments.map((attachment) => (
                  <Chip
                    key={attachment.id}
                    label={attachment.file_name}
                    size="small"
                    onClick={() => handleAttachmentClick(attachment.storage_path, attachment.file_name)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          {formattedDate}
        </Typography>
      </Paper>

      {!isAdmin && (
        <Avatar
          sx={{
            bgcolor: '#4CAF50',
            width: 32,
            height: 32,
            fontSize: '0.75rem',
          }}
        >
          US
        </Avatar>
      )}
    </Box>
  );
};
