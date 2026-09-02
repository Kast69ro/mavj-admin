import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPeriods,
  createPeriod,
  deletePeriod,
  togglePeriodStatus,
  extendPeriod,
} from "../features/poriods/periodsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
} from "@mui/material";
import { Delete, Add, EventRepeat } from "@mui/icons-material";

const emptyForm = {
  name: "",
  start_date: "",
  end_date: "",
  prize_budget: "",
};

const PeriodsPage = () => {
  const { periods } = useSelector((state) => state.periods);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [extendId, setExtendId] = useState(null);
  const [newEndDate, setNewEndDate] = useState("");

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchPeriods());
  }, [dispatch]);

  const handleAdd = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const handleSave = () => {
    dispatch(
      createPeriod({
        name: form.name,
        start_date: form.start_date,
        end_date: form.end_date,
        prize_budget: form.prize_budget ? Number(form.prize_budget) : null,
      })
    );
    setOpen(false);
  };

  const handleDelete = () => {
    dispatch(deletePeriod(selectedId));
    setDeleteOpen(false);
  };

  const handleToggle = (row) => {
    dispatch(togglePeriodStatus({ id: row.id, is_active: !row.is_active }));
  };

  const handleOpenExtend = (row) => {
    setExtendId(row.id);
    setNewEndDate(row.end_date);
    setExtendOpen(true);
  };

  const handleExtend = () => {
    dispatch(extendPeriod({ id: extendId, end_date: newEndDate }));
    setExtendOpen(false);
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("ru-RU") : "—";

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Периоды викторины
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Добавить период
        </Button>
      </Box>

      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e5e7f0" }}
      >
        <TableContainer sx={{ maxHeight: 650, overflow: "auto" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {[
                  "#",
                  "Название",
                  "Начало",
                  "Окончание",
                  "Бюджет",
                  "Создан",
                  "Статус",
                  "Действия",
                ].map((h) => (
                  <TableCell
                    key={h}
                    align={h === "Действия" ? "right" : "left"}
                    sx={{
                      backgroundColor: "#f8f9fc",
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #e5e7f0",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(periods) &&
                periods.map((row) => (
                  <TableRow key={row.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ color: "#9ca3af", fontSize: 12, fontWeight: 600 }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#111827" }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280", fontSize: 13 }}>
                      {formatDate(row.start_date)}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280", fontSize: 13 }}>
                      {formatDate(row.end_date)}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280", fontSize: 13 }}>
                      {row.prize_budget != null
                        ? row.prize_budget.toLocaleString("ru-RU")
                        : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "#9ca3af", fontSize: 12 }}>
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.is_active ? "Активен" : "Неактивен"}
                        size="small"
                        color={row.is_active ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Switch
                          checked={row.is_active}
                          size="small"
                          color="success"
                          onChange={() => handleToggle(row)}
                        />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenExtend(row)}
                        >
                          <EventRepeat fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedId(row.id);
                            setDeleteOpen(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог добавления периода */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить период</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Название"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />

            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 0.5, color: "#6b7280", fontWeight: 500 }}
              >
                Дата начала
              </Typography>
              <TextField
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                fullWidth
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 0.5, color: "#6b7280", fontWeight: 500 }}
              >
                Дата окончания
              </Typography>
              <TextField
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                fullWidth
              />
            </Box>

            <TextField
              label="Призовой бюджет"
              type="number"
              value={form.prize_budget}
              onChange={(e) => setForm({ ...form, prize_budget: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог продления периода */}
      <Dialog
        open={extendOpen}
        onClose={() => setExtendOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Продлить период</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, color: "#6b7280", fontWeight: 500 }}
            >
              Новая дата окончания
            </Typography>
            <TextField
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleExtend}>
            Продлить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Удалить период?</DialogTitle>
        <DialogContent>
          <Typography>Это действие нельзя отменить.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeriodsPage;