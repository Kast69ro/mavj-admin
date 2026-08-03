import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  CircularProgress,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { X, HelpCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriberQuiz } from '../features/subscribers/subscribers';
import { clearSelectedSubscriber } from '../features/subscribers/subscribersSlice';
import { formatDate } from '../utils/utils';

const formatMsisdn = (msisdn) => {
  if (!msisdn || msisdn.length < 12) return msisdn;
  return `+${msisdn.slice(0, 3)} ${msisdn.slice(3, 5)} ${msisdn.slice(5, 8)} ${msisdn.slice(8)}`;
};

const StatCard = ({ label, value, color }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      textAlign: 'center',
      borderRadius: 2,
    }}
  >
    <Typography variant="h5" fontWeight={700} color={color || 'text.primary'}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

const AnswerStatusChip = ({ isTimeout, isCorrect }) => {
  if (isTimeout) {
    return <Chip size="small" label="Не отвечено" sx={{ bgcolor: '#f1f5f9', color: '#64748b' }} />;
  }
  if (isCorrect) {
    return <Chip size="small" label="Верно" sx={{ bgcolor: '#dcfce7', color: '#16a34a' }} />;
  }
  return <Chip size="small" label="Неверно" sx={{ bgcolor: '#fee2e2', color: '#dc2626' }} />;
};

const SubscriberDetailsModal = ({ open, onClose, msisdn }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error } = useSelector(
    (state) => state.subscribers.selectedSubscriber
  );

  useEffect(() => {
    if (open && msisdn) {
      dispatch(fetchSubscriberQuiz({ msisdn, page, limit }));
    }
  }, [open, msisdn, page, limit, dispatch]);

  useEffect(() => {
    if (!open) {
      setPage(1);
    }
  }, [open]);

  const handleClose = () => {
    dispatch(clearSelectedSubscriber());
    onClose();
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const todayHistory =
    data?.history?.filter(
      (item) => item.answered_at?.slice(0, 10) === data.state?.session_date
    ) ?? [];
  const todayAnswered = todayHistory.filter((item) => !item.is_timeout).length;
  const todayTimeouts = todayHistory.filter((item) => item.is_timeout).length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {formatMsisdn(msisdn)}
          </Typography>
          {data?.state?.language && (
            <Typography variant="caption" color="text.secondary">
              Язык сессии: {data.state.language}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && !data && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!isLoading && error && (
          <Typography color="error" textAlign="center" py={4}>
            {error}
          </Typography>
        )}

        {data && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <StatCard label="Отвечено" value={data.stats.answered} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="Правильно" value={data.stats.correct} color="success.main" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="Таймауты" value={data.stats.timeouts} color="text.secondary" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="Очки" value={data.stats.points} color="primary.main" />
              </Grid>
            </Grid>

            {data.state && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Сегодняшняя сессия ({data.state.session_date})
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Тип пакета</Typography>
                    <Typography variant="body2">{data.state.batch_type}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Basic обработано</Typography>
                    <Typography variant="body2">{data.state.basic_answered}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Extra обработано</Typography>
                    <Typography variant="body2">{data.state.extra_batch_answered}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Реально отвечено</Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={todayAnswered > 0 ? 'success.main' : 'text.secondary'}
                    >
                      {todayAnswered} из {todayHistory.length}
                      {todayTimeouts > 0 && ` (${todayTimeouts} таймаут${todayTimeouts > 1 ? 'ов' : ''})`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Divider sx={{ mb: 2 }} />

            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                История вопросов ({data.total})
              </Typography>
              <Select
                size="small"
                value={limit}
                onChange={(e) => {
                  setLimit(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value={20}>20 / стр.</MenuItem>
                <MenuItem value={50}>50 / стр.</MenuItem>
                <MenuItem value={100}>100 / стр.</MenuItem>
              </Select>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Вопрос</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Ответ</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Очки</TableCell>
                  <TableCell>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.history.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ maxWidth: 260 }}>
                      {item.question ? (
                        <Typography variant="body2">{item.question}</Typography>
                      ) : (
                        <Box display="flex" alignItems="center" gap={0.5} color="text.disabled">
                          <HelpCircle size={14} />
                          <Typography variant="body2" fontStyle="italic">
                            Вопрос недоступен
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.batch_type}
                        sx={{
                          bgcolor: item.batch_type === 'extra' ? '#fef3c7' : '#e0e7ff',
                          color: item.batch_type === 'extra' ? '#b45309' : '#4338ca',
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.answer_given ?? '—'}</TableCell>
                    <TableCell>
                      <AnswerStatusChip isTimeout={item.is_timeout} isCorrect={item.is_correct} />
                    </TableCell>
                    <TableCell align="right">{item.points}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.answered_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  size="small"
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriberDetailsModal;