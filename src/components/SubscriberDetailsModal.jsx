import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriberQuiz, fetchSubscriberFull } from '../features/subscribers/subscribers';
import { clearSelectedSubscriber } from '../features/subscribers/subscribersSlice';
import { formatDate } from '../utils/utils';
import SubscriberDays from './SubscriberDays';

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

const SubscriberDetailsModal = ({ open, onClose, msisdn }) => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useSelector(
    (state) => state.subscribers.selectedSubscriber
  );
  const { data: fullData, isLoading: fullLoading } = useSelector(
    (state) => state.subscribers.selectedSubscriberFull
  );

  // Из /quiz здесь нужны только общие цифры (stats), вопросы показываются по дням
  useEffect(() => {
    if (open && msisdn) {
      dispatch(fetchSubscriberQuiz({ msisdn, page: 1, limit: 1 }));
      dispatch(fetchSubscriberFull(msisdn));
    }
  }, [open, msisdn, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedSubscriber());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
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

        {fullData && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Карточка абонента
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Первая подписка</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {fullData.first_subscribed_at ? formatDate(fullData.first_subscribed_at) : '—'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Срок жизни</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {fullData.lifetime_days != null ? `${fullData.lifetime_days} дн.` : '—'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Списаний по подписке (1.6)</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {fullData.billing_breakdown?.subscription_charges ?? 0} шт. ·{' '}
                  {Number(fullData.billing_breakdown?.subscription_amount ?? 0).toFixed(2)} TJS
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Списаний по доп.вопросам (0.9)</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {fullData.billing_breakdown?.extra_charges ?? 0} шт. ·{' '}
                  {Number(fullData.billing_breakdown?.extra_amount ?? 0).toFixed(2)} TJS
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary">Всего списано</Typography>
                <Typography variant="body2" fontWeight={700} color="success.main">
                  {Number(fullData.total_spent ?? 0).toFixed(2)} TJS
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
        {fullLoading && !fullData && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={20} />
          </Box>
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

          </>
        )}

        {open && msisdn && <SubscriberDays key={msisdn} msisdn={msisdn} />}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriberDetailsModal;