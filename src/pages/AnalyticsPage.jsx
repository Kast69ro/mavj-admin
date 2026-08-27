import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Typography, Chip, LinearProgress } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  People,
  CheckCircle,
  Cancel,
  QuestionAnswer,
  TaskAlt,
  Send,
} from "@mui/icons-material";
import { fetchAnalytics } from "../features/analytics/analytics";

const statCardStyle = {
  flex: "1 1 200px",
  borderRadius: 3,
  border: "1px solid #e5e7f0",
  p: 2.5,
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <Box sx={statCardStyle}>
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
        {value.toLocaleString("ru-RU")}
      </Typography>
    </Box>
  </Box>
);

const SectionPaper = ({ title, children }) => (
  <Paper
    variant="outlined"
    sx={{ borderRadius: 3, border: "1px solid #e5e7f0", p: 3, flex: 1, minWidth: 320 }}
  >
    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827", mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Paper>
);

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (isLoading || !data) return null;

  const { overview, by_operator, subscriptions_by_day, activity_by_action } = data;

  const maxOperatorTotal = Math.max(...by_operator.map((o) => o.total));
  const maxActionTotal = Math.max(...activity_by_action.map((a) => a.total));
  const sortedActions = [...activity_by_action].sort((a, b) => b.total - a.total);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Аналитика
      </Typography>

      {/* Overview */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <StatCard
          icon={<People fontSize="small" />}
          label="Всего подписчиков"
          value={overview.total_subscribers}
          color="#6366f1"
          bg="#ede9fe"
        />
        <StatCard
          icon={<CheckCircle fontSize="small" />}
          label="Активные подписчики"
          value={overview.active_subscribers}
          color="#16a34a"
          bg="#dcfce7"
        />
        <StatCard
          icon={<Cancel fontSize="small" />}
          label="Неактивные подписчики"
          value={overview.inactive_subscribers}
          color="#dc2626"
          bg="#fee2e2"
        />
        <StatCard
          icon={<QuestionAnswer fontSize="small" />}
          label="Всего вопросов"
          value={overview.total_questions}
          color="#92400e"
          bg="#fef3c7"
        />
        <StatCard
          icon={<TaskAlt fontSize="small" />}
          label="Активные вопросы"
          value={overview.active_questions}
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatCard
          icon={<Send fontSize="small" />}
          label="Всего запросов"
          value={overview.total_requests}
          color="#6b7280"
          bg="#f3f4f6"
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        {/* Subscriptions by day */}
        <SectionPaper title="Подписки по дням">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={subscriptions_by_day}>
              <defs>
                <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5)}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={{ stroke: "#e5e7f0" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7f0" }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7f0", fontSize: 12 }}
                labelFormatter={(d) => `Дата: ${d}`}
                formatter={(value) => [value, "Подписок"]}
              />
              <Area
                type="monotone"
                dataKey="subscriptions"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorSub)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionPaper>

        {/* By operator */}
        <SectionPaper title="По операторам">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {by_operator.map((op) => (
              <Box key={op.operator}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Chip
                    label={op.operator}
                    size="small"
                    sx={{ background: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: 11, textTransform: "capitalize" }}
                  />
                  <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                    <b style={{ color: "#111827" }}>{op.active}</b> активных из {op.total}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(op.total / maxOperatorTotal) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#f3f4f6",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#6366f1", borderRadius: 4 },
                  }}
                />
              </Box>
            ))}
          </Box>
        </SectionPaper>
      </Box>

      {/* Activity by action */}
      <SectionPaper title="Активность по действиям">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {sortedActions.map((action) => (
            <Box key={action.action} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontSize: 13, color: "#6b7280", width: 140, flexShrink: 0 }}>
                {action.action}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(action.total / maxActionTotal) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#f3f4f6",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#0ea5e9", borderRadius: 4 },
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827", width: 50, textAlign: "right" }}>
                {action.total}
              </Typography>
            </Box>
          ))}
        </Box>
      </SectionPaper>
    </Box>
  );
};

export default AnalyticsPage;