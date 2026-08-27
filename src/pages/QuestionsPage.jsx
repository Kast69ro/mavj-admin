import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createQuiz,
  deleteQuizQuestion,
  deleteQuestions,
  fetchQuiz,
  toggleQuizStatus,
  updateQuiz,
  uploadExcel,
  fetchQuizStats,
} from "../features/victorina/victorinaApi";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Switch,
} from "@mui/material";
import { Edit, Delete, Add, Upload, DeleteSweep } from "@mui/icons-material";
import { LANGUAGES } from "../utils/utils";

const emptyForm = {
  question: "",
  option_1: "",
  option_2: "",
  option_3: "",
  option_4: "",
  correct_answer: "",
  language: "ru",
};

const QuestionsPage = () => {
  const { questions, total, stats } = useSelector((state) => state.victorina);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    dispatch(fetchQuiz({ page, limit }));
    dispatch(fetchQuizStats());
  }, [dispatch, page, stats]);

  const handleAdd = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setForm({
      question: row.question,
      option_1: row.option_1,
      option_2: row.option_2,
      option_3: row.option_3,
      option_4: row.option_4,
      correct_answer: row.correct_answer,
      language: row.language || "ru",
    });
    setSelectedId(row.id);
    setIsEdit(true);
    setOpen(true);
  };

  const handleSave = () => {
    if (isEdit) dispatch(updateQuiz({ id: selectedId, ...form }));
    else dispatch(createQuiz(form));
    setOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteQuizQuestion(selectedId));
    setDeleteOpen(false);
  };

  const handleDeleteAll = async () => {
    dispatch(deleteQuestions());
    setDeleteAllOpen(false);
  };

  const handleExcelUpload = () => {
    if (!excelFile) return;
    dispatch(uploadExcel(excelFile));
    setExcelOpen(false);
    setExcelFile(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: stats ? 2.5 : 0,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Вопросы
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweep />}
              onClick={() => setDeleteAllOpen(true)}
              disabled={!questions?.length}
            >
              Удалить все
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setExcelOpen(true)}
            >
              Загрузить Excel
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
              Добавить
            </Button>
          </Box>
        </Box>

        {stats && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box
              sx={{
                flex: "1 1 180px",
                borderRadius: 3,
                border: "1px solid #e5e7f0",
                p: 2,
                background: "#f8f9fc",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#6b7280",
                }}
              >
                Всего вопросов
              </Typography>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#111827",
                  mt: 0.5,
                }}
              >
                {stats.total.toLocaleString("ru-RU")}
              </Typography>
            </Box>

            {Object.entries(stats.by_language).map(([lang, count]) => (
              <Box
                key={lang}
                sx={{
                  flex: "1 1 180px",
                  borderRadius: 3,
                  border: "1px solid #e5e7f0",
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Chip
                    label={lang}
                    size="small"
                    sx={{
                      background: "#fef3c7",
                      color: "#92400e",
                      fontWeight: 600,
                      fontSize: 11,
                      height: 20,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "#6b7280",
                    }}
                  >
                    вопросов
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography
                    sx={{ fontSize: 24, fontWeight: 700, color: "#6366f1" }}
                  >
                    {count.toLocaleString("ru-RU")}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                    ({((count / stats.total) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e5e7f0",
        }}
      >
        <TableContainer sx={{ maxHeight: 650, overflow: "auto" }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                {[
                  "#",
                  "Вопрос",
                  "Вариант 1",
                  "Вариант 2",
                  "Вариант 3",
                  "Вариант 4",
                  "Ответ",
                  "Язык",
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
              {Array.isArray(questions) &&
                questions.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell
                      sx={{ color: "#9ca3af", fontSize: 12, fontWeight: 600 }}
                    >
                      {row.id}
                    </TableCell>
                    <TableCell
                      sx={{ maxWidth: 240, fontWeight: 500, color: "#111827" }}
                    >
                      {row.question}
                    </TableCell>
                    {[
                      row.option_1,
                      row.option_2,
                      row.option_3,
                      row.option_4,
                    ].map((opt, i) => (
                      <TableCell
                        key={i}
                        sx={{
                          maxWidth: 130,
                          color: "#6b7280",
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {opt}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: 1.5,
                          background: "#ede9fe",
                          color: "#6366f1",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {row.correct_answer}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          LANGUAGES.find((l) => l.value === row.language)
                            ?.label || row.language
                        }
                        size="small"
                        sx={{
                          background: "#fef3c7",
                          color: "#92400e",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
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
                          onChange={() =>
                            dispatch(
                              toggleQuizStatus({
                                id: row.id,
                                is_active: !row.is_active,
                              }),
                            )
                          }
                        />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit fontSize="small" />
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 2,
            borderTop: "1px solid #f3f4f8",
          }}
        >
          <Pagination
            count={Math.ceil((total || 0) / limit)}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
            size="small"
          />
        </Box>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEdit ? "Редактировать вопрос" : "Добавить вопрос"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Язык</InputLabel>
              <Select
                value={form.language}
                label="Язык"
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Вопрос"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            {[1, 2, 3, 4].map((n) => (
              <TextField
                key={n}
                label={`Вариант ${n}`}
                value={form[`option_${n}`]}
                onChange={(e) =>
                  setForm({ ...form, [`option_${n}`]: e.target.value })
                }
                fullWidth
              />
            ))}
            <FormControl fullWidth>
              <InputLabel>Правильный ответ</InputLabel>
              <Select
                value={form.correct_answer}
                label="Правильный ответ"
                onChange={(e) =>
                  setForm({ ...form, correct_answer: e.target.value })
                }
              >
                {["1", "2", "3", "4"].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
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

      {/* Удаление одного вопроса */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Удалить вопрос?</DialogTitle>
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

      <Dialog open={deleteAllOpen} onClose={() => setDeleteAllOpen(false)}>
        <DialogTitle>Удалить все вопросы?</DialogTitle>
        <DialogContent>
          <Typography>
            Будут удалены <b>все {total ?? questions?.length ?? 0}</b> вопросов
            викторины. Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllOpen(false)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleDeleteAll}>
            Удалить всё
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={excelOpen}
        onClose={() => setExcelOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Загрузить вопросы из Excel</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 2,
              border: "2px dashed #e0e0e0",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
            }}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              id="excel-upload"
              style={{ display: "none" }}
              onChange={(e) => setExcelFile(e.target.files[0])}
            />
            <label htmlFor="excel-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
              >
                Выбрать файл
              </Button>
            </label>
            {excelFile && (
              <Typography sx={{ mt: 2, color: "success.main", fontSize: 14 }}>
                ✔ {excelFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setExcelOpen(false);
              setExcelFile(null);
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            disabled={!excelFile}
            onClick={handleExcelUpload}
          >
            Загрузить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionsPage;
