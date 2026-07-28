import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  KeyboardArrowDown,
  Check as CheckIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchSMS, createSMS, updateSMS } from "../features/SMS/sendSMS";
import { fetchOperators } from "../features/operators/operators";
import { OPERATOR_COLORS } from "../utils/operatorColors";
import { formatDate, LANGUAGE_LABELS, LANGUAGE_OPTIONS } from "../utils/utils";
import SmsTemplateModal from "../components/SmsTemplateModal";

const LanguageBadge = ({ lang }) => {
  const normalizedLang = lang?.toUpperCase();
  const isRussian = normalizedLang === "RU";
  const isTajik = normalizedLang === "TJ";

  return (
    <Chip
      label={LANGUAGE_LABELS[normalizedLang] ?? lang}
      size="small"
      sx={{
        bgcolor: isRussian ? "#dbeafe" : isTajik ? "#fee2e2" : "#f1f5f9",
        color: isRussian ? "#2563eb" : isTajik ? "#dc2626" : "#475569",
        fontWeight: 600,
        border: isRussian
          ? "1px solid #93c5fd"
          : isTajik
            ? "1px solid #fda4af"
            : "none",
      }}
    />
  );
};

const OperatorBadge = ({ code, operatorsByCode }) => {
  const colors = OPERATOR_COLORS[code] ?? OPERATOR_COLORS.default;
  const label =
    code === "all" ? "Все операторы" : (operatorsByCode[code]?.name ?? code);
  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: colors.bg, color: "#fff", fontWeight: 500 }}
    />
  );
};

const FilterableHeader = ({ label, options, value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isFiltered = Boolean(value);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setAnchorEl(null);
  };

  return (
    <TableCell
      sx={{
        fontWeight: 600,
        fontSize: 12,
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      <Box
        component="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          border: "none",
          background: "none",
          cursor: "pointer",
          p: 0,
          color: isFiltered ? "primary.main" : "inherit",
          font: "inherit",
        }}
      >
        {label}
        <KeyboardArrowDown
          fontSize="small"
          sx={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
        {isFiltered && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
        )}
      </Box>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            sx={{ minWidth: 180 }}
          >
            {opt.color && (
              <ListItemIcon sx={{ minWidth: 20 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: opt.color,
                  }}
                />
              </ListItemIcon>
            )}
            <ListItemText inset={!opt.color}>{opt.label}</ListItemText>
            {value === opt.value && (
              <CheckIcon fontSize="small" color="primary" sx={{ ml: 2 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </TableCell>
  );
};

const SmsPage = () => {
  const [operatorFilter, setOperatorFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null); 

  const dispatch = useDispatch();
  const { templates, total, status, error } = useSelector((state) => state.sms);
  const { info: operatorsInfo } = useSelector((state) => state.operators);

  const operatorsByCode = (operatorsInfo?.operators ?? []).reduce((acc, op) => {
    acc[op.code] = op;
    return acc;
  }, {});

  const operatorFilterOptions = [
    { value: "", label: "Все операторы" },
    ...(operatorsInfo?.operators ?? []).map((op) => ({
      value: op.code,
      label: op.name,
      color: (OPERATOR_COLORS[op.code] ?? OPERATOR_COLORS.default).bg,
    })),
  ];

  const operatorFormOptions = [
    { value: "all", label: "Все операторы" },
    ...(operatorsInfo?.operators ?? []).map((op) => ({
      value: op.code,
      label: op.name,
    })),
  ];

  useEffect(() => {
    if (!operatorsInfo) {
      dispatch(fetchOperators());
    }
  }, [dispatch, operatorsInfo]);

  useEffect(() => {
    dispatch(fetchSMS({ operator: operatorFilter, language: languageFilter }));
  }, [dispatch, operatorFilter, languageFilter]);

  const isLoading = status === "loading";

  const openCreateModal = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const openEditModal = (tpl) => {
    setEditingTemplate(tpl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async (data) => {
    if (data.id) {
      await dispatch(updateSMS(data));
    } else {
      await dispatch(createSMS(data));
    }
    closeModal();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            SMS-шаблоны
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Всего:{" "}
            <Box component="span" fontWeight={500} color="text.primary">
              {total}
            </Box>
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
        >
          Добавить
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <FilterableHeader
                label="Оператор"
                options={operatorFilterOptions}
                value={operatorFilter}
                onChange={setOperatorFilter}
              />
              <FilterableHeader
                label="Язык"
                options={LANGUAGE_OPTIONS}
                value={languageFilter}
                onChange={setLanguageFilter}
              />
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                Текст
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                Описание
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                Обновлён
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && error && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "error.main" }}
                >
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && templates.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "text.disabled" }}
                >
                  Шаблоны не найдены
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !error &&
              templates.map((tpl) => (
                <TableRow key={tpl.id} hover>
                  <TableCell>
                    <OperatorBadge
                      code={tpl.operator}
                      operatorsByCode={operatorsByCode}
                    />
                  </TableCell>
                  <TableCell>
                    <LanguageBadge lang={tpl.language} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400, color: "text.secondary" }}>
                    {tpl.text}
                  </TableCell>
                  <TableCell
                    sx={{ whiteSpace: "nowrap", color: "text.secondary" }}
                  >
                    {tpl.description}
                  </TableCell>
                  <TableCell
                    sx={{ whiteSpace: "nowrap", color: "text.secondary" }}
                  >
                    {formatDate(tpl.updated_at)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => openEditModal(tpl)}
                      title="Редактировать"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {modalOpen && (
        <SmsTemplateModal
          template={editingTemplate}
          operatorOptions={operatorFormOptions}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
};

export default SmsPage;