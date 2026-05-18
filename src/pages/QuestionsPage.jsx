import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createQuiz,
  deleteQuizQuestion,
  fetchQuiz,
  toggleQuizStatus,
  updateQuiz,
  uploadExcel,
} from "../features/victorina/victorinaApi";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, Chip, Typography, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Pagination, Switch,
} from "@mui/material";
import { Edit, Delete, Add, Upload } from "@mui/icons-material";

const emptyForm = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "",
};

const QuestionsPage = () => {
  const { questions, total } = useSelector((state) => state.victorina);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    dispatch(fetchQuiz({ page, limit }));
  }, [dispatch, page]);

  const handleAdd = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm({
      question: row.question,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      correct_answer: row.correct_answer,
    });
    setSelectedId(row.id);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDeleteOpen = (id) => {
    setSelectedId(id);
    setDeleteOpen(true);
  };

  const handleSave = () => {
    if (isEdit) {
      dispatch(updateQuiz({ id: selectedId, ...form }));
    } else {
      dispatch(createQuiz(form));
    }
    setOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteQuizQuestion(selectedId));
    setDeleteOpen(false);
  };

  const handleExcelUpload = () => {
    if (!excelFile) return;
    dispatch(uploadExcel(excelFile));
    setExcelOpen(false);
    setExcelFile(null);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Вопросы</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => setExcelOpen(true)}>
            Загрузить Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Добавить
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell>№</TableCell>
              <TableCell>Вопрос</TableCell>
              <TableCell>A</TableCell>
              <TableCell>B</TableCell>
              <TableCell>C</TableCell>
              <TableCell>D</TableCell>
              <TableCell>Ответ</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(questions) && questions.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell sx={{ maxWidth: 250 }}>{row.question}</TableCell>
                <TableCell>{row.option_a}</TableCell>
                <TableCell>{row.option_b}</TableCell>
                <TableCell>{row.option_c}</TableCell>
                <TableCell>{row.option_d}</TableCell>
                <TableCell>
                  <Chip label={row.correct_answer} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.is_active ? "Активен" : "Неактивен"}
                    size="small"
                    color={row.is_active ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={row.is_active}
                    size="small"
                    color="success"
                    onChange={() => dispatch(toggleQuizStatus({ id: row.id, is_active: !row.is_active }))}
                  />
                  <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteOpen(row.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={Math.ceil((total || 0) / limit)}
          page={page}
          onChange={(_, val) => setPage(val)}
          color="primary"
        />
      </Box>

      {/* Модалка добавить/редактировать */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? "Редактировать вопрос" : "Добавить вопрос"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Вопрос"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              fullWidth multiline rows={2}
            />
            <TextField label="Вариант A" value={form.option_a} onChange={(e) => setForm({ ...form, option_a: e.target.value })} fullWidth />
            <TextField label="Вариант B" value={form.option_b} onChange={(e) => setForm({ ...form, option_b: e.target.value })} fullWidth />
            <TextField label="Вариант C" value={form.option_c} onChange={(e) => setForm({ ...form, option_c: e.target.value })} fullWidth />
            <TextField label="Вариант D" value={form.option_d} onChange={(e) => setForm({ ...form, option_d: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Правильный ответ</InputLabel>
              <Select
                value={form.correct_answer}
                label="Правильный ответ"
                onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
              >
                {["A", "B", "C", "D"].map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка удаления */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Удалить вопрос?</DialogTitle>
        <DialogContent>
          <Typography>Это действие нельзя отменить.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Удалить</Button>
        </DialogActions>
      </Dialog>

      {/* Модалка Excel */}
      <Dialog open={excelOpen} onClose={() => setExcelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Загрузить вопросы из Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, border: '2px dashed #e0e0e0', borderRadius: 2, p: 4, textAlign: 'center' }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              id="excel-upload"
              style={{ display: 'none' }}
              onChange={e => setExcelFile(e.target.files[0])}
            />
            <label htmlFor="excel-upload">
              <Button variant="outlined" component="span" startIcon={<Upload />}>
                Выбрать файл
              </Button>
            </label>
            {excelFile && (
              <Typography sx={{ mt: 2, color: 'success.main', fontSize: 14 }}>
                ✔ {excelFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setExcelOpen(false); setExcelFile(null); }}>Отмена</Button>
          <Button variant="contained" disabled={!excelFile} onClick={handleExcelUpload}>
            Загрузить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionsPage;