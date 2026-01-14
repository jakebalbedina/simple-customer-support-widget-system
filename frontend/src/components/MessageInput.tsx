import { Box, Button, TextField, CircularProgress, IconButton, Tooltip, Alert } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import { useState, useRef } from 'react';
import { ticketAPI, handleApiError } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

interface MessageInputProps {
  ticketId: string;
  customerId: string;
  onMessageSent: () => void;
  isAdmin?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  ticketId,
  customerId,
  onMessageSent,
  isAdmin = false,
}) => {
  const { user: authUser } = useAuth();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine sender info based on context
  const senderId = isAdmin ? authUser?.id : customerId;
  const senderType = isAdmin ? 'admin' : 'customer';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    if (!senderId) {
      setError('Unable to determine sender. Please login again.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Send message first to get the message ID
      const messageResponse = await ticketAPI.addMessage({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: senderType,
        content: message.trim() || '(Attachment)',
      });

      // Get the message ID from the response
      // The response structure is { success: true, message: { id, ... } }
      const messageId = messageResponse.message?.id;

      if (!messageId) {
        throw new Error('Failed to get message ID');
      }

      // Upload attachments if any and link them to the message
      for (const file of attachments) {
        try {
          // Get signed URL for upload
          const signedUrlResponse = await ticketAPI.getSignedUrl({
            action: 'upload',
            file_name: file.name,
            file_type: file.type,
          });

          const filePath = signedUrlResponse.file_path;

          // Upload file to storage using the signed upload URL
          const uploadResponse = await fetch(signedUrlResponse.signed_url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
              'x-upsert': 'true',
            },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
          }

          // Create attachment record in database
          await ticketAPI.createAttachment({
            message_id: messageId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
          });
        } catch (err) {
          // Continue with other files even if one fails
        }
      }

      setMessage('');
      setAttachments([]);
      onMessageSent();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {attachments.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          {attachments.map((file, index) => (
            <Tooltip key={index} title="Click to remove">
              <Box
                onClick={() => handleRemoveAttachment(index)}
                sx={{
                  p: 0.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  '&:hover': { bgcolor: 'error.light', color: 'error.main' },
                }}
              >
                {file.name}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          fullWidth
          multiline
          maxRows={4}
          disabled={loading}
          size="small"
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />

        <Tooltip title="Attach file">
          <span>
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              size="small"
            >
              <AttachFileIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Send message">
          <span>
            <IconButton
              type="submit"
              disabled={loading || (!message.trim() && attachments.length === 0)}
              size="small"
              color="primary"
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};
