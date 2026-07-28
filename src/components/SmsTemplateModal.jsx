import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { LANGUAGE_OPTIONS } from "../utils/utils"; // поправь путь под свой проект


const TemplateModal = ({ template, operatorOptions, onClose, onSubmit }) => {
  const isEdit = Boolean(template);
  const [form, setForm] = useState({
    code: template?.code ?? "",
    operator: template?.operator ?? "",
    language: template?.language?.toLowerCase() ?? "",
    text: template?.text ?? "",
    description: template?.description ?? "",
  });

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(isEdit ? { id: template.id, ...form } : form);
  };


  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isEdit ? "Редактировать шаблон" : "Добавить шаблон"}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="Код"
            value={form.code}
            onChange={handleChange("code")}
            required
            fullWidth
            size="small"
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label="Оператор"
              value={form.operator}
              onChange={handleChange("operator")}
              required
              fullWidth
              size="small"
            >
              {operatorOptions
                .filter((o) => o.value)
                .map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              select
              label="Язык"
              value={form.language}
              onChange={handleChange("language")}
              required
              fullWidth
              size="small"
            >
              {LANGUAGE_OPTIONS.filter((o) => o.value).map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Текст"
            value={form.text}
            onChange={handleChange("text")}
            required
            fullWidth
            multiline
            rows={4}
            size="small"
          />

          <TextField
            label="Описание"
            value={form.description}
            onChange={handleChange("description")}
            fullWidth
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Отмена
          </Button>
          <Button type="submit" variant="contained">
            {isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TemplateModal;
